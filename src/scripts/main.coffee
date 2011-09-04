animate = (on_next)->
  on_next()
  setTimeout (->animate(on_next)), 33

class game_piece
  constructor: (image_url)->
    @x = 0
    @y = 0
    @original_x = 0
    @original_y = 0
    @set_src(image_url)
    @zoom_factor = 1
  set_name: (@name)->
  set_src: (url_to_image_file)->
    self = @
    @image = new Image()
    @image.onload = ->
      self.width = self.original_width = self.image.width = self.image.width * .5
      self.height = self.original_height =self.image.height = self.image.height * .5
    @image.src = url_to_image_file
  last_clicked_x_offset: 0
  last_clicked_y_offset: 0
  start_dragging: (x,y)->
    @last_clicked_x_offset = x - @x
    @last_clicked_y_offset = y - @y
  drag_to: (x,y)->
    @x = x - @last_clicked_x_offset
    @y = y - @last_clicked_y_offset
  is_at: (x,y)->
    @x < x and x < (@x + @width) and
    @y < y and y < (@y + @height)
  zoom: (value)-> value * @zoom_factor
  dezoom: (value)-> value / @zoom_factor
  draw_tile: (context)->
    context.drawImage @image, @x, @y, @width, @height
  pan_up: -> @y += 20
  pan_down: -> @y -= 20
  pan_left: -> @x += 20
  pan_right: -> @x -= 20
  zoom_out: ->
    @dezoom_size_and_position()
    @zoom_factor -= .1
    @zoom_size_and_position()
  zoom_in: ->
    @dezoom_size_and_position()
    @zoom_factor += .1
    @zoom_size_and_position()
  dezoom_size_and_position: ->
    @x = @dezoom(@x)
    @y = @dezoom(@y)
    @width = @dezoom(@width)
    @height = @dezoom(@height)
  zoom_size_and_position: ->
    @x = @zoom(@x)
    @y = @zoom(@y)
    @width = @zoom(@width)
    @height = @zoom(@height)

class screen
  constructor: (canvas_element_id)->
    @canvas = document.getElementById canvas_element_id
    @context = @canvas.getContext("2d")
    @canvas_width = @canvas.width;
    @canvas_height = @canvas.height;
    @canvas_left_offset = @canvas.offsetLeft;
    @canvas_top_offset = @canvas.offsetTop;
  mouse_moved: (event)->
    screen_x = event.pageX - @canvas_left_offset
    screen_y = event.pageY - @canvas_top_offset
    @moved(screen_x, screen_y)
  mouse_clicked: (event)->
    screen_x = event.pageX - @canvas_left_offset
    screen_y = event.pageY - @canvas_top_offset
    @clicked(screen_x, screen_y)
  draw_image: (image, x, y)->
    @context.drawImage image, x - @canvas_left_offset, y - @canvas_top_offset
  when_clicked: (action)->
    @clicked = action
  when_mouse_is_moved: (action)->
    @moved = action
  refresh: (tiles)->
    @context.clearRect(0, 0, @canvas_width, @canvas_height)
    for tile_to_draw in tiles
      tile_to_draw.draw_tile @context

class hand
  constructor: ->
    @held_item = null
  interact_at: (x,y)->
    if @held_item != null
      @drop_tile_if_over_it(x, y)
    else
      @pick_up_tile_if_over_it(x, y)
  move_to: (x,y)->
    if @held_item != null
      @held_item.drag_to(x, y)
  can_interact_with: (touchable_game_pieces)->
    @game_pieces = touchable_game_pieces
  drop_tile_if_over_it: (x,y)->
    for game_piece in @game_pieces
      if game_piece.is_at x, y
        @held_item = null
        break;
  pick_up_tile_if_over_it: (x,y)->
    for game_piece in @game_pieces
      if game_piece.is_at x, y
        @held_item = game_piece
        @held_item.start_dragging x, y
        break;

$(document).ready(()->
  the_screen = new screen("main_window")
  player_hand = new hand()
  game_pieces = [
    new game_piece("media/gas_station.png"),
    new game_piece("media/soldier.png"),
    new game_piece("media/card.png")
  ]
  game_pieces.push new game_piece("media/card.png") for _ in [0..100]

  player_hand.can_interact_with(game_pieces);
  the_screen.when_clicked((x,y) -> player_hand.interact_at(x,y))
  the_screen.when_mouse_is_moved((x,y) -> player_hand.move_to(x,y))

  animate((->the_screen.refresh(game_pieces)), 50)

  $("#main_window")
    .mousemove(->the_screen.mouse_moved(event))
    .click(->the_screen.mouse_clicked(event))
  document.onkeydown = (event)->
    switch event.keyCode
      when 37 then game_piece.pan_left() for game_piece in game_pieces
      when 38 then game_piece.pan_up() for game_piece in game_pieces
      when 39 then game_piece.pan_right() for game_piece in game_pieces
      when 40 then game_piece.pan_down() for game_piece in game_pieces
      when 189 then game_piece.zoom_out() for game_piece in game_pieces
      when 187 then game_piece.zoom_in() for game_piece in game_pieces
    the_screen.refresh(game_pieces)
  this
)