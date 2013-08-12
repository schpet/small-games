(function() {
  "use strict";
  var AnimatableThing, Background, GameOne, IMPATIENT, LEFT, RIGHT, Skeleton,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LEFT = 37;

  RIGHT = 39;

  IMPATIENT = false;

  AnimatableThing = (function(_super) {
    __extends(AnimatableThing, _super);

    function AnimatableThing(options) {
      this.exitFinal = __bind(this.exitFinal, this);
      this.enterFinal = __bind(this.enterFinal, this);
      this.setState = __bind(this.setState, this);
      this.step = __bind(this.step, this);
      this.step = __bind(this.step, this);
      this.el = document.getElementById(options.elementId);
      this.bgPosition = 0;
      this.state = 'stopped';
      this.gameFps = options.gameFps;
      this.fps = options.fps;
      this.frame = 0;
      this.final = false;
      this.stepActions = [];
      this.stepActionsFullFps = [];
    }

    AnimatableThing.prototype.applyTransform = function(transform) {
      var option, options, _i, _len;
      options = ['transform', 'webkitTransform', 'MozTransform', 'msTransform', 'OTransform'];
      for (_i = 0, _len = options.length; _i < _len; _i++) {
        option = options[_i];
        if (this.el.style[option] != null) {
          this.el.style[option] = transform;
        }
      }
    };

    AnimatableThing.prototype.step = function() {
      return "stepping";
    };

    AnimatableThing.prototype.removeStepAction = function(func, fullFps) {
      var actions, index;
      if (fullFps == null) {
        fullFps = false;
      }
      actions = fullFps ? this.stepActionsFullFps : this.stepActions;
      if ((index = actions.indexOf(func)) !== -1) {
        return actions.splice(index, 1);
      }
    };

    AnimatableThing.prototype.addStepAction = function(func, fullFps) {
      var actions;
      if (fullFps == null) {
        fullFps = false;
      }
      actions = fullFps ? this.stepActionsFullFps : this.stepActions;
      return actions.push(func);
    };

    AnimatableThing.prototype.step = function() {
      var action, _i, _j, _len, _len1, _ref, _ref1;
      this.frame++;
      if (this.frame % (this.gameFps / this.fps) === 0) {
        _ref = this.stepActions;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          action = _ref[_i];
          action();
        }
      }
      _ref1 = this.stepActionsFullFps;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        action = _ref1[_j];
        action();
      }
    };

    AnimatableThing.prototype.setState = function(state) {
      return this.state = state;
    };

    AnimatableThing.prototype.enterFinal = function() {
      return this.final = true;
    };

    AnimatableThing.prototype.exitFinal = function() {
      return this.final = false;
    };

    return AnimatableThing;

  })(EventEmitter);

  Skeleton = (function(_super) {
    __extends(Skeleton, _super);

    function Skeleton(options) {
      this.stopMoving = __bind(this.stopMoving, this);
      this.startMoving = __bind(this.startMoving, this);
      this.setState = __bind(this.setState, this);
      this.enterFinal = __bind(this.enterFinal, this);
      this.stepMoveThisFella = __bind(this.stepMoveThisFella, this);
      this.adjustedHorizontalPosition = __bind(this.adjustedHorizontalPosition, this);
      this.stepFallingAnimation = __bind(this.stepFallingAnimation, this);
      this.stepWalkingAnimation = __bind(this.stepWalkingAnimation, this);
      Skeleton.__super__.constructor.apply(this, arguments);
      this.stoppedPosition = 0;
      this.frameSize = 60;
      this.animationStartPosition = this.frameSize * 1;
      this.animationEndPosition = this.frameSize * 5;
      this.fallingPosition = 0;
      this.animationFallingPositions = [
        {
          backgroundPositionX: this.frameSize * 6,
          translateX: 5,
          translateY: 0
        }, {
          backgroundPositionX: this.frameSize * 7,
          translateX: 16,
          translateY: 10
        }, {
          backgroundPositionX: this.frameSize * 7,
          translateX: 16,
          translateY: 20
        }, {
          backgroundPositionX: this.frameSize * 7,
          translateX: 18,
          translateY: 25
        }, {
          backgroundPositionX: this.frameSize * 7,
          translateX: 18,
          translateY: 32
        }, {
          backgroundPositionX: this.frameSize * 7,
          translateX: 18,
          translateY: 35
        }
      ];
      this.speed = 0.4;
      if (IMPATIENT) {
        this.speed = 5;
      }
      this.position = 0;
      this.addStepAction(this.stepWalkingAnimation);
    }

    Skeleton.prototype.stepWalkingAnimation = function() {
      switch (this.state) {
        case 'right':
        case 'left':
          if (this.bgPosition >= this.animationEndPosition) {
            this.bgPosition = this.animationStartPosition;
          } else {
            this.bgPosition += this.frameSize;
          }
          return this.el.style.backgroundPosition = "-" + this.bgPosition + "px 0";
        case 'stopped':
          if (this.bgPosition !== 0 && this.frame % (this.gameFps / 2) === 0) {
            this.bgPosition = 0;
            return this.el.style.backgroundPosition = "-" + this.bgPosition + "px 0";
          }
      }
    };

    Skeleton.prototype.stepFallingAnimation = function() {
      var translateX, translateY;
      this.el.style.backgroundPosition = "-" + this.animationFallingPositions[this.fallingPosition]['backgroundPositionX'] + "px 0";
      translateX = this.animationFallingPositions[this.fallingPosition]['translateX'] + this.adjustedHorizontalPosition();
      translateY = this.animationFallingPositions[this.fallingPosition]['translateY'];
      this.applyTransform("translate(" + translateX + "px, " + translateY + "px)");
      if (++this.fallingPosition >= this.animationFallingPositions.length) {
        this.removeStepAction(this.stepFallingAnimation);
        return document.getElementById('final-message').classList.add('visible');
      }
    };

    Skeleton.prototype.adjustedHorizontalPosition = function() {
      return this.horizontalPosition * this.speed;
    };

    Skeleton.prototype.stepMoveThisFella = function() {
      var magic;
      magic = 210;
      switch (this.state) {
        case 'right':
          this.horizontalPosition++;
          this.applyTransform("translateX(" + (this.adjustedHorizontalPosition()) + "px)");
          break;
        case 'left':
          this.horizontalPosition--;
          this.applyTransform("translateX(" + (this.adjustedHorizontalPosition()) + "px) scaleX(-1)");
      }
      if (this.adjustedHorizontalPosition() >= magic) {
        this.emitEvent('ihavefoundmyplacethankyou');
        this.removeStepAction(this.stepMoveThisFella, true);
        this.removeStepAction(this.stepWalkingAnimation);
        return this.addStepAction(this.stepFallingAnimation);
      }
    };

    Skeleton.prototype.enterFinal = function() {
      Skeleton.__super__.enterFinal.apply(this, arguments);
      return this.left = parseInt(this.el.style.left);
    };

    Skeleton.prototype.setState = function(state) {
      Skeleton.__super__.setState.apply(this, arguments);
      switch (state) {
        case 'left':
          return this.el.classList.add('look-left');
        case 'right':
          return this.el.classList.remove('look-left');
      }
    };

    Skeleton.prototype.startMoving = function() {
      this.horizontalPosition = 0;
      return this.addStepAction(this.stepMoveThisFella, true);
    };

    Skeleton.prototype.stopMoving = function() {
      this.removeStepAction(this.stepMoveThisFella, true);
      return this.applyTransform('');
    };

    return Skeleton;

  })(AnimatableThing);

  Background = (function(_super) {
    __extends(Background, _super);

    function Background() {
      this.itsOver = __bind(this.itsOver, this);
      this.exitFinal = __bind(this.exitFinal, this);
      this.enterFinal = __bind(this.enterFinal, this);
      this.calculateBgPositionX = __bind(this.calculateBgPositionX, this);
      this.stepAction = __bind(this.stepAction, this);
      Background.__super__.constructor.apply(this, arguments);
      this.animationStartPosition = 0;
      this.animationEndPosition = 1027 / 2;
      this.increment = 0.5;
      if (IMPATIENT) {
        this.increment = 10;
      }
      this.bgPositionY = 0;
      this.addStepAction(this.stepAction);
    }

    Background.prototype.stepAction = function() {
      switch (this.state) {
        case 'right':
          if (this.bgPosition >= this.animationEndPosition && !this.final) {
            this.bgPosition = this.animationStartPosition;
          } else {
            this.bgPosition += this.increment;
          }
          return this.el.style.backgroundPosition = "-" + (this.calculateBgPositionX()) + "px -" + this.bgPositionY + "px";
        case 'left':
          if (this.bgPosition <= this.animationStartPosition && !this.final) {
            this.bgPosition = this.animationEndPosition;
          } else {
            this.bgPosition -= this.increment;
          }
          return this.el.style.backgroundPosition = "-" + (this.calculateBgPositionX()) + "px -" + this.bgPositionY + "px";
      }
    };

    Background.prototype.calculateBgPositionX = function() {
      var magicBGPosition;
      if (!this.final) {
        return this.bgPosition;
      }
      magicBGPosition = 470;
      if (this.bgPosition === magicBGPosition) {
        switch (this.state) {
          case 'right':
            this.emitEvent('backgroundIsStatic');
            break;
          case 'left':
            this.emitEvent('backgroundIsMoving');
        }
      }
      return Math.min(this.bgPosition, magicBGPosition);
    };

    Background.prototype.enterFinal = function() {
      Background.__super__.enterFinal.apply(this, arguments);
      this.bgPositionY = 380 / 2;
      return console.log('entered final');
    };

    Background.prototype.exitFinal = function() {
      Background.__super__.exitFinal.apply(this, arguments);
      this.bgPositionY = 0;
      return console.log('exit final');
    };

    Background.prototype.itsOver = function() {
      this.removeStepAction(this.stepAction);
      return console.log('fin');
    };

    return Background;

  })(AnimatableThing);

  GameOne = (function(_super) {
    __extends(GameOne, _super);

    function GameOne(options) {
      this.hideUnknown = __bind(this.hideUnknown, this);
      this.showUnknown = __bind(this.showUnknown, this);
      this.setState = __bind(this.setState, this);
      this.setup = __bind(this.setup, this);
      this.step = __bind(this.step, this);
      this.toggleFinal = __bind(this.toggleFinal, this);
      this.el = document.getElementById(options.gameCanvasId);
      this.fps = options.fps;
      this.unknown = {
        el: document.getElementById(options.unknownId),
        visible: false
      };
      this.skeleton = new Skeleton({
        elementId: options.skeletonId,
        gameFps: this.fps,
        fps: 10
      });
      this.background = new Background({
        elementId: options.backgroundId,
        gameFps: this.fps,
        fps: 60
      });
      this.state = 'stopped';
      this.position = 0;
      this.final = false;
      this.addListeners('state', [this.skeleton.setState, this.background.setState]);
      this.addListeners('step', [this.skeleton.step, this.background.step]);
      this.addListeners('enterFinal', [this.skeleton.enterFinal, this.background.enterFinal]);
      this.addListeners('exitFinal', [this.skeleton.exitFinal, this.background.exitFinal]);
      this.background.addListener('backgroundIsStatic', this.skeleton.startMoving);
      this.background.addListener('backgroundIsMoving', this.skeleton.stopMoving);
      this.skeleton.addListener('ihavefoundmyplacethankyou', this.background.itsOver);
      this.skeleton.addListener('ihavefoundmyplacethankyou', function() {
        var _ref;
        return (_ref = document.getElementById('next')) != null ? _ref.classList.add('fade-in') : void 0;
      });
      this.setup();
      requestAnimationFrame(this.step);
    }

    GameOne.prototype.toggleFinal = function() {
      console.log('toggled');
      if (this.final) {
        this.final = false;
        return this.emitEvent('exitFinal');
      } else {
        this.final = true;
        return this.emitEvent('enterFinal');
      }
    };

    GameOne.prototype.step = function() {
      var _this = this;
      return setTimeout(function() {
        requestAnimationFrame(_this.step);
        switch (_this.state) {
          case 'left':
            _this.position--;
            break;
          case 'right':
            _this.position++;
        }
        _this.emitEvent('step');
        if (_this.position === 150) {
          return _this.toggleFinal();
        }
      }, 1000 / this.fps);
    };

    GameOne.prototype.setup = function() {
      var context,
        _this = this;
      context = this.el.getContext('2d');
      context.fillStyle = '#FFF';
      context.fillRect(0, 0, game.width, game.height);
      document.onkeydown = function(e) {
        switch (e.keyCode) {
          case LEFT:
            return _this.setState('left');
          case RIGHT:
            return _this.setState('right');
          default:
            if ([17, 18, 91].indexOf(e.keyCode) === -1) {
              return _this.showUnknown();
            }
        }
      };
      return document.onkeyup = function(e) {
        _this.hideUnknown();
        switch (e.keyCode) {
          case LEFT:
            return _this.setState('stopped');
          case RIGHT:
            return _this.setState('stopped');
        }
      };
    };

    GameOne.prototype.setState = function(state) {
      this.state = state;
      return this.emitEvent('state', [state]);
    };

    GameOne.prototype.showUnknown = function() {
      if (!this.unknown.visible) {
        this.unknown.el.classList.add('visible');
        return this.unknown.visible = true;
      }
    };

    GameOne.prototype.hideUnknown = function() {
      if (this.unknown.visible) {
        this.unknown.el.classList.remove('visible');
        return this.unknown.visible = false;
      }
    };

    return GameOne;

  })(EventEmitter);

  window.onload = function() {
    return new GameOne({
      gameCanvasId: 'game',
      skeletonId: 'skeleton',
      unknownId: 'unknown',
      backgroundId: 'background',
      fps: 60
    });
  };

}).call(this);
