"use strict"

do ->
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame

LEFT = 37
RIGHT = 39
IMPATIENT = false

class AnimatableThing extends EventEmitter
  constructor: (options)->
    @el = document.getElementById options.elementId
    @bgPosition = 0
    @state = 'stopped'

    @gameFps = options.gameFps
    @fps = options.fps
    @frame = 0
    @final = false

    @stepActions = []
    @stepActionsFullFps = []

  step: =>
    "stepping"

  removeStepAction: (func, fullFps = false)->
    actions = if fullFps then @stepActionsFullFps else @stepActions
    if (index = actions.indexOf func) isnt -1
      actions.splice index, 1

  addStepAction: (func, fullFps = false)->
    actions = if fullFps then @stepActionsFullFps else @stepActions
    actions.push func

  step: =>
    @frame++
    if @frame % (@gameFps / @fps) == 0
      action() for action in @stepActions

    action() for action in @stepActionsFullFps
    return

  setState: (state)=>
    @state = state

  enterFinal: =>
    @final = true

  exitFinal: =>
    @final = false

class Skeleton extends AnimatableThing
  constructor: (options)->
    super
    @stoppedPosition = 0

    @frameSize = 60
    @animationStartPosition = @frameSize * 1
    @animationEndPosition = @frameSize * 5

    @fallingPosition = 0
    @animationFallingPositions = [
        {
          backgroundPositionX: @frameSize * 6,
          translateX: 5
          translateY: 0
        },
        {
          backgroundPositionX: @frameSize * 7
          translateX: 16
          translateY: 10
        },
        {
          backgroundPositionX: @frameSize * 7
          translateX: 16
          translateY: 20
        },
        {
          backgroundPositionX: @frameSize * 7
          translateX: 18
          translateY: 25
        },
        {
          backgroundPositionX: @frameSize * 7
          translateX: 18
          translateY: 32
        },
        {
          backgroundPositionX: @frameSize * 7
          translateX: 18
          translateY: 35
        }
      ]

    @speed = 0.4
    @speed = 5 if IMPATIENT

    @position = 0

    @addStepAction(@stepWalkingAnimation)

  stepWalkingAnimation: =>
    switch @state
      when 'right', 'left'
        if @bgPosition >= @animationEndPosition
          @bgPosition = @animationStartPosition
        else
          @bgPosition += @frameSize

        @el.style.backgroundPosition = "-#{@bgPosition}px 0"

      # get our skeleton to take a break after a moment
      when 'stopped'
        if @bgPosition != 0 && @frame % (@gameFps / 2) == 0
          @bgPosition = 0
          @el.style.backgroundPosition = "-#{@bgPosition}px 0"

  stepFallingAnimation: =>
    @el.style.backgroundPosition = "-#{@animationFallingPositions[@fallingPosition]['backgroundPositionX']}px 0"

    translateX = @animationFallingPositions[@fallingPosition]['translateX'] + @adjustedHorizontalPosition()
    translateY = @animationFallingPositions[@fallingPosition]['translateY']

    @el.style.webkitTransform = "translate(#{translateX}px, #{translateY}px)"

    if ++@fallingPosition >= @animationFallingPositions.length
      @removeStepAction(@stepFallingAnimation)
      document.getElementById('final-message').classList.add('visible')


  adjustedHorizontalPosition: =>
    @horizontalPosition * @speed

  stepMoveThisFella: =>
    magic = 210

    switch @state

      when 'right'
        @horizontalPosition++
        @el.style.webkitTransform = "translateX(#{@adjustedHorizontalPosition()}px)"

      when 'left'
        @horizontalPosition--
        @el.style.webkitTransform = "translateX(#{@adjustedHorizontalPosition()}px) scaleX(-1)"

    if @adjustedHorizontalPosition() >= magic
      @emitEvent 'ihavefoundmyplacethankyou'
      @removeStepAction(@stepMoveThisFella, true)
      @removeStepAction(@stepWalkingAnimation)
      @addStepAction(@stepFallingAnimation)


  enterFinal: =>
    super
    @left = parseInt(@el.style.left)

  setState: (state)=>
    super
    switch state
      when 'left' then @el.classList.add 'look-left'
      when 'right' then @el.classList.remove 'look-left'

  startMoving: =>
    @horizontalPosition = 0
    @addStepAction(@stepMoveThisFella, true)

  stopMoving: =>
    @removeStepAction(@stepMoveThisFella, true)
    @el.style.webkitTransform = ""

class Background extends AnimatableThing
  constructor: ->
    super
    @animationStartPosition = 0
    @animationEndPosition = 1027 / 2
    @increment = 0.5
    @increment = 10 if IMPATIENT
    @bgPositionY = 0
    @addStepAction(@stepAction)

  stepAction: =>
    switch @state
      when 'right'
        if @bgPosition >= @animationEndPosition && !@final
          @bgPosition = @animationStartPosition
        else
          @bgPosition += @increment

        @el.style.backgroundPosition = "-#{@calculateBgPositionX()}px -#{@bgPositionY}px"

      when 'left'
        if @bgPosition <= @animationStartPosition && !@final
          @bgPosition = @animationEndPosition
        else
          @bgPosition -= @increment

        @el.style.backgroundPosition = "-#{@calculateBgPositionX()}px -#{@bgPositionY}px"

  calculateBgPositionX: =>
    return @bgPosition if !@final

    magicBGPosition = 470

    if @bgPosition == magicBGPosition
      switch @state
        when 'right' then @emitEvent 'backgroundIsStatic'
        when 'left' then @emitEvent 'backgroundIsMoving'

    Math.min(@bgPosition, magicBGPosition)


  enterFinal: =>
    super
    @bgPositionY = 380 / 2
    console.log 'entered final'

  exitFinal: =>
    super
    @bgPositionY = 0
    console.log 'exit final'

  itsOver: =>
    @removeStepAction @stepAction
    console.log 'fin'

class GameOne extends EventEmitter
  constructor: (options)->
    @el = document.getElementById options.gameCanvasId

    @fps = options.fps
    @skeleton = new Skeleton({ elementId: options.skeletonId, gameFps: @fps, fps: 10 })
    @background = new Background({ elementId: options.backgroundId, gameFps: @fps, fps: 60 })
    @state = 'stopped'
    @position = 0
    @final = false

    @addListeners('state', [ @skeleton.setState, @background.setState ])
    @addListeners('step', [ @skeleton.step, @background.step ])
    @addListeners('enterFinal', [ @skeleton.enterFinal, @background.enterFinal ])
    @addListeners('exitFinal', [ @skeleton.exitFinal, @background.exitFinal ])

    # kind of wacky glue but lets try it out
    @background.addListener('backgroundIsStatic', @skeleton.startMoving)
    @background.addListener('backgroundIsMoving', @skeleton.stopMoving)

    @skeleton.addListener('ihavefoundmyplacethankyou', @background.itsOver)

    @setup()

    requestAnimationFrame(@step)

  toggleFinal: =>
    console.log 'toggled'
    if @final
      @final = false
      @emitEvent('exitFinal')
    else
      @final = true
      @emitEvent('enterFinal')

  step: =>
    setTimeout(=>
      requestAnimationFrame(@step)
      switch @state
        when 'left' then @position--
        when 'right' then @position++

      @emitEvent 'step'

      @toggleFinal() if @position == 150

    , 1000 / @fps)

  setup: =>
    context =  @el.getContext '2d'
    context.fillStyle   = '#FFF'
    context.fillRect 0, 0, game.width, game.height

    document.onkeydown = (e)=>
      switch e.keyCode
        when LEFT then @setState('left')
        when RIGHT then @setState('right')

    document.onkeyup = (e)=>
      switch e.keyCode
        when LEFT then @setState('stopped')
        when RIGHT then @setState('stopped')

  setState: (state)=>
    @state = state
    @emitEvent 'state', [ state ]

window.onload = ->
  new GameOne(
    gameCanvasId: 'game'
    skeletonId: 'skeleton'
    backgroundId: 'background'
    fps: 60
  )

