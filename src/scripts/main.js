(function() {
  var animate, game_piece, hand, screen;
  animate = function(on_next) {
    on_next();
    return setTimeout((function() {
      return animate(on_next);
    }), 33);
  };
  game_piece = (function() {
    function game_piece(image_url) {
      this.x = 0;
      this.y = 0;
      this.original_x = 0;
      this.original_y = 0;
      this.set_src(image_url);
      this.zoom_factor = 1;
    }
    game_piece.prototype.set_name = function(name) {
      this.name = name;
    };
    game_piece.prototype.set_src = function(url_to_image_file) {
      var self;
      self = this;
      this.image = new Image();
      this.image.onload = function() {
        self.width = self.original_width = self.image.width = self.image.width * .5;
        return self.height = self.original_height = self.image.height = self.image.height * .5;
      };
      return this.image.src = url_to_image_file;
    };
    game_piece.prototype.last_clicked_x_offset = 0;
    game_piece.prototype.last_clicked_y_offset = 0;
    game_piece.prototype.start_dragging = function(x, y) {
      this.last_clicked_x_offset = x - this.x;
      return this.last_clicked_y_offset = y - this.y;
    };
    game_piece.prototype.drag_to = function(x, y) {
      this.x = x - this.last_clicked_x_offset;
      return this.y = y - this.last_clicked_y_offset;
    };
    game_piece.prototype.is_at = function(x, y) {
      return this.x < x && x < (this.x + this.width) && this.y < y && y < (this.y + this.height);
    };
    game_piece.prototype.zoom = function(value) {
      return value * this.zoom_factor;
    };
    game_piece.prototype.dezoom = function(value) {
      return value / this.zoom_factor;
    };
    game_piece.prototype.draw_tile = function(context) {
      return context.drawImage(this.image, this.x, this.y, this.width, this.height);
    };
    game_piece.prototype.pan_up = function() {
      return this.y += 20;
    };
    game_piece.prototype.pan_down = function() {
      return this.y -= 20;
    };
    game_piece.prototype.pan_left = function() {
      return this.x += 20;
    };
    game_piece.prototype.pan_right = function() {
      return this.x -= 20;
    };
    game_piece.prototype.zoom_out = function() {
      this.dezoom_size_and_position();
      this.zoom_factor -= .1;
      return this.zoom_size_and_position();
    };
    game_piece.prototype.zoom_in = function() {
      this.dezoom_size_and_position();
      this.zoom_factor += .1;
      return this.zoom_size_and_position();
    };
    game_piece.prototype.dezoom_size_and_position = function() {
      this.x = this.dezoom(this.x);
      this.y = this.dezoom(this.y);
      this.width = this.dezoom(this.width);
      return this.height = this.dezoom(this.height);
    };
    game_piece.prototype.zoom_size_and_position = function() {
      this.x = this.zoom(this.x);
      this.y = this.zoom(this.y);
      this.width = this.zoom(this.width);
      return this.height = this.zoom(this.height);
    };
    return game_piece;
  })();
  screen = (function() {
    function screen(canvas_element_id) {
      this.canvas = document.getElementById(canvas_element_id);
      this.context = this.canvas.getContext("2d");
      this.canvas_width = this.canvas.width;
      this.canvas_height = this.canvas.height;
      this.canvas_left_offset = this.canvas.offsetLeft;
      this.canvas_top_offset = this.canvas.offsetTop;
    }
    screen.prototype.mouse_moved = function(event) {
      var screen_x, screen_y;
      screen_x = event.pageX - this.canvas_left_offset;
      screen_y = event.pageY - this.canvas_top_offset;
      return this.moved(screen_x, screen_y);
    };
    screen.prototype.mouse_clicked = function(event) {
      var screen_x, screen_y;
      screen_x = event.pageX - this.canvas_left_offset;
      screen_y = event.pageY - this.canvas_top_offset;
      return this.clicked(screen_x, screen_y);
    };
    screen.prototype.draw_image = function(image, x, y) {
      return this.context.drawImage(image, x - this.canvas_left_offset, y - this.canvas_top_offset);
    };
    screen.prototype.when_clicked = function(action) {
      return this.clicked = action;
    };
    screen.prototype.when_mouse_is_moved = function(action) {
      return this.moved = action;
    };
    screen.prototype.refresh = function(tiles) {
      var tile_to_draw, _i, _len, _results;
      this.context.clearRect(0, 0, this.canvas_width, this.canvas_height);
      _results = [];
      for (_i = 0, _len = tiles.length; _i < _len; _i++) {
        tile_to_draw = tiles[_i];
        _results.push(tile_to_draw.draw_tile(this.context));
      }
      return _results;
    };
    return screen;
  })();
  hand = (function() {
    function hand() {
      this.held_item = null;
    }
    hand.prototype.interact_at = function(x, y) {
      if (this.held_item !== null) {
        return this.drop_tile_if_over_it(x, y);
      } else {
        return this.pick_up_tile_if_over_it(x, y);
      }
    };
    hand.prototype.move_to = function(x, y) {
      if (this.held_item !== null) {
        return this.held_item.drag_to(x, y);
      }
    };
    hand.prototype.can_interact_with = function(touchable_game_pieces) {
      return this.game_pieces = touchable_game_pieces;
    };
    hand.prototype.drop_tile_if_over_it = function(x, y) {
      var game_piece, _i, _len, _ref, _results;
      _ref = this.game_pieces;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        game_piece = _ref[_i];
        if (game_piece.is_at(x, y)) {
          this.held_item = null;
          break;
        }
      }
      return _results;
    };
    hand.prototype.pick_up_tile_if_over_it = function(x, y) {
      var game_piece, _i, _len, _ref, _results;
      _ref = this.game_pieces;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        game_piece = _ref[_i];
        if (game_piece.is_at(x, y)) {
          this.held_item = game_piece;
          this.held_item.start_dragging(x, y);
          break;
        }
      }
      return _results;
    };
    return hand;
  })();
  $(document).ready(function() {
    var game_pieces, player_hand, the_screen, _;
    the_screen = new screen("main_window");
    player_hand = new hand();
    game_pieces = [new game_piece("media/gas_station.png"), new game_piece("media/soldier.png"), new game_piece("media/card.png")];
    for (_ = 0; _ <= 100; _++) {
      game_pieces.push(new game_piece("media/card.png"));
    }
    player_hand.can_interact_with(game_pieces);
    the_screen.when_clicked(function(x, y) {
      return player_hand.interact_at(x, y);
    });
    the_screen.when_mouse_is_moved(function(x, y) {
      return player_hand.move_to(x, y);
    });
    animate((function() {
      return the_screen.refresh(game_pieces);
    }), 50);
    $("#main_window").mousemove(function() {
      return the_screen.mouse_moved(event);
    }).click(function() {
      return the_screen.mouse_clicked(event);
    });
    document.onkeydown = function(event) {
      var game_piece, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _m, _n;
      switch (event.keyCode) {
        case 37:
          for (_i = 0, _len = game_pieces.length; _i < _len; _i++) {
            game_piece = game_pieces[_i];
            game_piece.pan_left();
          }
          break;
        case 38:
          for (_j = 0, _len2 = game_pieces.length; _j < _len2; _j++) {
            game_piece = game_pieces[_j];
            game_piece.pan_up();
          }
          break;
        case 39:
          for (_k = 0, _len3 = game_pieces.length; _k < _len3; _k++) {
            game_piece = game_pieces[_k];
            game_piece.pan_right();
          }
          break;
        case 40:
          for (_l = 0, _len4 = game_pieces.length; _l < _len4; _l++) {
            game_piece = game_pieces[_l];
            game_piece.pan_down();
          }
          break;
        case 189:
          for (_m = 0, _len5 = game_pieces.length; _m < _len5; _m++) {
            game_piece = game_pieces[_m];
            game_piece.zoom_out();
          }
          break;
        case 187:
          for (_n = 0, _len6 = game_pieces.length; _n < _len6; _n++) {
            game_piece = game_pieces[_n];
            game_piece.zoom_in();
          }
      }
      return the_screen.refresh(game_pieces);
    };
    return this;
  });
}).call(this);
