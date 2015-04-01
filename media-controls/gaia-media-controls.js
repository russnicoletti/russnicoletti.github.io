;(function(define){'use strict';define(function(require,exports,module){

/**
 * Dependencies
 */
var Component = require('gaia-component');
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
    this.mediaControlsImpl = new MediaControlsImpl(this, this.shadowRoot, player);
  },

  detachFrom: function() {
    if (this.mediaPlayerImpl) {
      this.mediaPlayerImpl.unload();
      this.mediaPlayerImpl = null;
    }
  },

  enableComponentTesting() {
    if (this.mediaControlsImpl) {
      this.mediaControlsImpl.enableComponentTesting();
    }
  },

  disableComponentTesting() {
    if (this.mediaControlsImpl) {
      this.mediaControlsImpl.disableComponentTesting();
    }
  },

  triggerEvent: function(event) {
    this.mediaControlsImpl.triggerEvent(event);
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

  /* 1. elapsed-text and duration-text have padding on left and right
        to support ltr and rtl locales */
  /* 2. The elapsed time and duration elements do not grow and shrink
        via the flexbox. They are fixed width */
  .elapsed-text, .duration-text {
    color: #ffffff;
    font-size: 1.4rem;
    padding: 0 1.5rem; /* 1 */
    flex-grow: 0;      /* 2 */
    text-align: center;
  }

  /* 1. The slider element grows and shrinks via the flexbox */
  .slider-wrapper {
    flex-grow: 1;   /* 1 */
    height: 4.2rem;
  }

  .progress {
    position: relative;
    pointer-events: none;
    width: 0;
  }

  /* 1. Center elements vertically within time-slider; 'top: 50%' centers the
   *    top of the element vertically; 'elapsed-time' is the first element
   *    to be layed out, it is 0.3rem in height, therefore 'top:50%' would
   *    position the center of the element 0.1rem below the middle: move
   *    it up 0.1rem to center the middle of the element vertically.
   *    'time-background' is layed out after 'elapsed-time' and is 0.1rem in
   *    height. With 'elapsed-time' being 0.3rem in height, 'top:50%' would
   *    position 'time-background' 0.3rem below the center vertically: move it
   *    up 0.3rem to center it vertically.
   *
   * 2. Ensure the layering order of time background,
        elapsed time, and play head.
   */

  .elapsed-time {
    height: 0.3rem;
    background-color: #00caf2;
    top: calc(50% - 0.1rem); /* 1 */
    z-index: 20; /* 2 */
  }

  .time-background {
    width: 100%;
    height: 0.1rem;
    top: calc(50% - 0.3rem); /* 1 */
    background-color: #a6b4b6;
    z-index: 10; /* 2 */
  }
  /*
   * 1. Center 'play-head' vertically. 'top' is relative to the other
   *    'slider-wrapper' elements which are 0.4rem in height; therefore,
   *    'top:50%' would position the top of the element 0.4rem below the
   *    the center of the 'sider-wrapper'. In order to position the center
   *    of the element vertically, move it up by half its height plus
   *    the height of the previously layed out elements.
   *
   * 2. Ensure the layering order of time background,
   *    elapsed time, and play head.
   */
  .play-head {
    top: calc(50% - (1.15rem + 0.4rem));
    position: relative;
    width: 2.3rem;
    height: 2.3rem;

    /* For LTR langauges, position the playhead 1.15 rems to the left
     * so that the center of the playhead aligns with the beginning of
     * the time slider.
     */
    margin-left: -1.15rem;

    /* For RTL langauges, position the playhead 1.15 rems to the right
     * so that the center of the playhead aligns with the end of
     * the time slider.
     */
    margin-right: -1.15rem;

    border: none;
    background: none;
    pointer-events: none;
    z-index: 30; /* 2 */
  }

  /*
   * Define the 'normal' play-head graphic. Using the 'after' pseudo-element
   * here specifies that the 'normal' (smaller, white) play-head will
   * appear on top of the larger, blue 'active' play-head (specified using
   * the 'before' pseudo-element).
   */
  .play-head:after {
    content: "";
    position: absolute;
    top: 0;
    left: calc(50% - 1.15rem);
    width: 2.3rem;
    height: 2.3rem;
    border-radius: 50%;
    background-color: #fff;
  }

  /* Define the 'active' play-head graphic (blue, larger than the 'normal'
   * play-head). Using the 'before' pseudo-element specifies that the 'active'
   * play-head will appear under the 'normal' play-head.
   */
  .play-head.active:before {
    content: "";
    position: absolute;
    top: calc(50% - 3.05rem);
    left: calc(50% - 3.05rem);
    width: 6.1rem;
    height: 6.1rem;
    border-radius: 50%;
    background-color: #00CAF2;
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
      <div class="slider-wrapper">
        <div class="elapsed-time progress"></div>
        <div class="time-background progress"></div>
        <button class="play-head"></button>
      </div>
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
