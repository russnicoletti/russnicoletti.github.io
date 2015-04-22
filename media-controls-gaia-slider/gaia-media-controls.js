;(function(define){'use strict';define(function(require,exports,module){

/**
 * Dependencies
 */
var Component = require('gaia-component');
var slider = require('gaia-slider');
var MediaControlsImpl = require('./lib/media-controls-impl');

var MediaControls = Component.register('gaia-media-controls', {
  /**
   * 'createdCallback' is called when the element is first created.
   */
  created: function() {
    console.log('creating gaia-media-controls web component...');
  },

  attachTo: function(player) {

    if (this.mediaPlayerImpl) {
      throw new Error('A media player is already attached to the media controls component');
    }

    if (!this.shadowRoot) {
      this.setupShadowRoot();
    }
    this.slider = this.shadowRoot.querySelector('.slider-wrapper');
    this._impl = new MediaControlsImpl(this, this.shadowRoot, player);
  },

  detachFrom: function() {
    if (this.mediaPlayerImpl) {
      this.mediaPlayerImpl.unload();
      this.mediaPlayerImpl = null;
    }
  },

  /*
   * Expose testing helper functions
   */
  enableComponentTesting() {
    if (this._impl) {
      this._impl.enableComponentTesting();

      var componentTestingHelper = {
        triggerEvent:
          this._impl.triggerEvent.bind(this._impl),
        getElement:
          this._impl.getElement.bind(this._impl),
        disableComponentTesting:
          this._impl.disableComponentTesting.bind(this._impl)
      };
    }

    return componentTestingHelper;
  },

  template: `

  <style>

  @font-face {
  	font-family: "gaia-icons";
  	src: url("fonts/gaia-icons.ttf") format("truetype");
  	font-weight: 500;
  	font-style: normal;
  }

  [data-icon]:before {
  	font-family: "gaia-icons";
  	content: attr(data-icon);
  	display: inline-block;
  	font-weight: 500;
  	font-style: normal;
  	text-decoration: inherit;
  	text-transform: none;
  	text-rendering: optimizeLegibility;
  	font-size: 30px;
  	-webkit-font-smoothing: antialiased;
  }

  .media-controls-container {
    background-color: rgba(0,0,0, 0.85);
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: stretch;
    min-width: 30rem;
  }

  /* video bar -- duration, time slider, elapsed time */
  .time-slider-bar {
    display: flex;
    flex-flow: row;
    align-items: center;
    font-size: 0;
    border-bottom: 0.1rem solid rgba(255,255,255, 0.1);
  }

  /* 1. The elapsed time and duration elements do not grow and shrink
        via the flexbox. They are fixed width */
  .elapsed-text, .duration-text {
    color: #ffffff;
    font-size: 1.4rem;
    flex-grow: 0;      /* 1 */
    text-align: center;
  }
  
  /*
   * elapsed-text only has padding at the "beginning" to create space
   * between the far left of the screen (or right if locale is 'rtl')
   * and the element. The gaia-slider takes care of adding space between
   * the slider and the elapsed-text.
   */
  .elapsed-text {
    -moz-padding-start: 1.5rem;
  }

  /*
   * duration-text only has padding at the "end" to create space
   * between the far right of the screen (or left if locale is 'rtl')
   * and the element. The gaia-slider takes care of adding space between
   * the slider and the elapsed-text.
   */
  .duration-text {
    -moz-padding-end: 1.5rem;
  }

  /* 1. The slider element grows and shrinks via the flexbox */
  .slider-wrapper {
    flex-grow: 1;   /* 1 */
  }

  /* video control bar -- rewind, pause/play, forward
   *
   * 1. The buttons should always display left-to-right.
   */
  .video-control-bar {
    display: flex;
    flex-direction: row;
    flex-basis: 4.8rem;
    border-top: 0.1rem solid rgba(255,255,255, 0.1);
    background-color: rgba(0,0,0, 0.95);
    overflow: hidden;
    direction: ltr; /* 1 */
    /*z-index: 10*/;
  }

  .seek-backward,
  .seek-forward,
  .play {
    /* All three elements grow and shrink together by the same proportion */
    flex-grow: 1;
    padding: 0;
  }

  .play.paused:before {
    content: 'play';
    padding-left: 4px;
  }

  .player-controls-button {
    color: #FFFFFF;
    border: none;
    border-radius: 0;
    background: transparent;
  }

  .player-controls-button:hover {
    background: transparent;
  }

  .player-controls-button:active {
    background: #00caf2;
  }

  .player-controls-button:disabled {
    opacity: 0.3;
  }

  .player-controls-button:disabled:active {
    background: transparent;
  }

  </style>

  <div class="media-controls-container">
    <div class="time-slider-bar">
      <span class="elapsed-text"></span>
      <gaia-slider class="slider-wrapper"></gaia-slider>
      <span class="duration-text"></span>
    </div>
    <div class="video-control-bar">
      <button class="seek-backward player-controls-button" data-icon="skip-back"></button>
      <button class="play player-controls-button" data-icon="pause"></button>
      <button class="seek-forward player-controls-button" data-icon="skip-forward"></button>
    </div>
  </div>`
});

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('gaia-media-controls',this));
