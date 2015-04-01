(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
;(function(define){define(function(require,exports,module){
'use strict';

/**
 * Locals
 */

var textContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
var innerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
var removeAttribute = Element.prototype.removeAttribute;
var setAttribute = Element.prototype.setAttribute;
var noop  = function() {};

/**
 * Register a new component.
 *
 * @param  {String} name
 * @param  {Object} props
 * @return {constructor}
 * @public
 */
exports.register = function(name, props) {
  var baseProto = getBaseProto(props.extends);

  // Clean up
  delete props.extends;

  // Pull out CSS that needs to be in the light-dom
  if (props.template) {
    var output = processCss(props.template, name);

    props.template = document.createElement('template');
    props.template.innerHTML = output.template;
    props.lightCss = output.lightCss;

    props.globalCss = props.globalCss || '';
    props.globalCss += output.globalCss;
  }

  // Inject global CSS into the document,
  // and delete as no longer needed
  injectGlobalCss(props.globalCss);
  delete props.globalCss;

  // Merge base getter/setter attributes with the user's,
  // then define the property descriptors on the prototype.
  var descriptors = Object.assign(props.attrs || {}, base.descriptors);

  // Store the orginal descriptors somewhere
  // a little more private and delete the original
  props._attrs = props.attrs;
  delete props.attrs;

  // Create the prototype, extended from base and
  // define the descriptors directly on the prototype
  var proto = createProto(baseProto, props);
  Object.defineProperties(proto, descriptors);

  // Register the custom-element and return the constructor
  return document.registerElement(name, { prototype: proto });
};

var base = {
  properties: {
    GaiaComponent: true,
    attributeChanged: noop,
    attached: noop,
    detached: noop,
    created: noop,

    createdCallback: function() {
      if (this.rtl) { addDirObserver(); }
      injectLightCss(this);
      this.created();
    },

    /**
     * It is very common to want to keep object
     * properties in-sync with attributes,
     * for example:
     *
     *   el.value = 'foo';
     *   el.setAttribute('value', 'foo');
     *
     * So we support an object on the prototype
     * named 'attrs' to provide a consistent
     * way for component authors to define
     * these properties. When an attribute
     * changes we keep the attr[name]
     * up-to-date.
     *
     * @param  {String} name
     * @param  {String||null} from
     * @param  {String||null} to
     */
    attributeChangedCallback: function(name, from, to) {
      var prop = toCamelCase(name);
      if (this._attrs && this._attrs[prop]) { this[prop] = to; }
      this.attributeChanged(name, from, to);
    },

    attachedCallback: function() { this.attached(); },
    detachedCallback: function() { this.detached(); },

    /**
     * A convenient method for setting up
     * a shadow-root using the defined template.
     *
     * @return {ShadowRoot}
     */
    setupShadowRoot: function() {
      if (!this.template) { return; }
      var node = document.importNode(this.template.content, true);
      this.createShadowRoot().appendChild(node);
      return this.shadowRoot;
    },

    /**
     * Sets an attribute internally
     * and externally. This is so that
     * we can style internal shadow-dom
     * content.
     *
     * @param {String} name
     * @param {String} value
     */
    setAttr: function(name, value) {
      var internal = this.shadowRoot.firstElementChild;
      setAttribute.call(internal, name, value);
      setAttribute.call(this, name, value);
    },

    /**
     * Removes an attribute internally
     * and externally. This is so that
     * we can style internal shadow-dom
     * content.
     *
     * @param {String} name
     * @param {String} value
     */
    removeAttr: function(name) {
      var internal = this.shadowRoot.firstElementChild;
      removeAttribute.call(internal, name);
      removeAttribute.call(this, name);
    }
  },

  descriptors: {
    textContent: {
      set: function(value) {
        textContent.set.call(this, value);
        if (this.lightStyle) { this.appendChild(this.lightStyle); }
      },

      get: textContent.get
    },

    innerHTML: {
      set: function(value) {
        innerHTML.set.call(this, value);
        if (this.lightStyle) { this.appendChild(this.lightStyle); }
      },

      get: innerHTML.get
    }
  }
};

/**
 * The default base prototype to use
 * when `extends` is undefined.
 *
 * @type {Object}
 */
var defaultPrototype = createProto(HTMLElement.prototype, base.properties);

/**
 * Returns a suitable prototype based
 * on the object passed.
 *
 * @param  {HTMLElementPrototype|undefined} proto
 * @return {HTMLElementPrototype}
 * @private
 */
function getBaseProto(proto) {
  if (!proto) { return defaultPrototype; }
  proto = proto.prototype || proto;
  return !proto.GaiaComponent
    ? createProto(proto, base.properties)
    : proto;
}

/**
 * Extends the given proto and mixes
 * in the given properties.
 *
 * @param  {Object} proto
 * @param  {Object} props
 * @return {Object}
 */
function createProto(proto, props) {
  return Object.assign(Object.create(proto), props);
}

/**
 * Detects presence of shadow-dom
 * CSS selectors.
 *
 * @return {Boolean}
 */
var hasShadowCSS = (function() {
  var div = document.createElement('div');
  try { div.querySelector(':host'); return true; }
  catch (e) { return false; }
})();

/**
 * Regexs used to extract shadow-css
 *
 * @type {Object}
 */
var regex = {
  shadowCss: /(?:\:host|\:\:content)[^{]*\{[^}]*\}/g,
  ':host': /(?:\:host)/g,
  ':host()': /\:host\((.+)\)(?: \:\:content)?/g,
  ':host-context': /\:host-context\((.+)\)([^{,]+)?/g,
  '::content': /(?:\:\:content)/g
};

/**
 * Extracts the :host and ::content rules
 * from the shadow-dom CSS and rewrites
 * them to work from the <style scoped>
 * injected at the root of the component.
 *
 * @return {String}
 */
function processCss(template, name) {
  var globalCss = '';
  var lightCss = '';

  if (!hasShadowCSS) {
    template = template.replace(regex.shadowCss, function(match) {
      var hostContext = regex[':host-context'].exec(match);

      if (hostContext) {
        globalCss += match
          .replace(regex['::content'], '')
          .replace(regex[':host-context'], '$1 ' + name + '$2')
          .replace(/ +/g, ' '); // excess whitespace
      } else {
        lightCss += match
          .replace(regex[':host()'], name + '$1')
          .replace(regex[':host'], name)
          .replace(regex['::content'], name);
      }

      return '';
    });
  }

  return {
    template: template,
    lightCss: lightCss,
    globalCss: globalCss
  };
}

/**
 * Some CSS rules, such as @keyframes
 * and @font-face don't work inside
 * scoped or shadow <style>. So we
 * have to put them into 'global'
 * <style> in the head of the
 * document.
 *
 * @param  {String} css
 */
function injectGlobalCss(css) {
  if (!css) return;
  var style = document.createElement('style');
  style.innerHTML = css.trim();
  headReady().then(() => {
    document.head.appendChild(style)
  });
}


/**
 * Resolves a promise once document.head is ready.
 *
 * @private
 */
function headReady() {
  return new Promise(resolve => {
    if (document.head) { return resolve(); }
    window.addEventListener('load', function fn() {
      window.removeEventListener('load', fn);
      resolve();
    });
  });
}


/**
 * The Gecko platform doesn't yet have
 * `::content` or `:host`, selectors,
 * without these we are unable to style
 * user-content in the light-dom from
 * within our shadow-dom style-sheet.
 *
 * To workaround this, we clone the <style>
 * node into the root of the component,
 * so our selectors are able to target
 * light-dom content.
 *
 * @private
 */
function injectLightCss(el) {
  if (hasShadowCSS) { return; }
  el.lightStyle = document.createElement('style');
  el.lightStyle.setAttribute('scoped', '');
  el.lightStyle.innerHTML = el.lightCss;
  el.appendChild(el.lightStyle);
}

/**
 * Convert hyphen separated
 * string to camel-case.
 *
 * Example:
 *
 *   toCamelCase('foo-bar'); //=> 'fooBar'
 *
 * @param  {Sring} string
 * @return {String}
 */
function toCamelCase(string) {
  return string.replace(/-(.)/g, function replacer(string, p1) {
    return p1.toUpperCase();
  });
}

/**
 * Observer (singleton)
 *
 * @type {MutationObserver|undefined}
 */
var dirObserver;

/**
 * Observes the document `dir` (direction)
 * attribute and dispatches a global event
 * when it changes.
 *
 * Components can listen to this event and
 * make internal changes if need be.
 *
 * @private
 */
function addDirObserver() {
  if (dirObserver) { return; }

  dirObserver = new MutationObserver(onChanged);
  dirObserver.observe(document.documentElement, {
    attributeFilter: ['dir'],
    attributes: true
  });

  function onChanged(mutations) {
    document.dispatchEvent(new Event('dirchanged'));
  }
}

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('gaia-component',this));
},{}],2:[function(require,module,exports){
/*
 * This wrapping is necessary for the running the tests
 */
;(function(define){'use strict';define(function(require,exports,module){

/**
 * Dependencies
 */
var Component = require('gaia-component');

/*
** MediaControlsImpl object
*/
function MediaControlsImpl(mediaControlsElement, shadowRoot, player) {
  this.mediaControlsElement = mediaControlsElement;
  this.shadowRoot = shadowRoot;
  this.touchStartID = null;
  this.isPausedWhileDragging = null;
  this.dragging = false;
  this.sliderRect = null;
  this.playedUntilEnd = false;
  this.intervalId = null;
  this.pausedAtEndWhilePlaying = false;
  this.mediaPlayer = player;
  this.seekIncrement = 10; // Seek forward/backward in 10 second increments
  this.mouseEventHandlerRegistered = false;

  this.els = {
    durationText: this.shadowRoot.querySelector('.duration-text'),
    elapsedText: this.shadowRoot.querySelector('.elapsed-text'),
    elapsedTime: this.shadowRoot.querySelector('.elapsed-time'),
    play: this.shadowRoot.querySelector('.play'),
    playHead: this.shadowRoot.querySelector('.play-head'),
    seekForward: this.shadowRoot.querySelector('.seek-forward'),
    seekBackward: this.shadowRoot.querySelector('.seek-backward'),
    sliderWrapper: this.shadowRoot.querySelector('.slider-wrapper')
  };

  this.addEventListeners();
}

MediaControlsImpl.prototype.addEventListeners = function() {
  this.shadowRoot.addEventListener('touchstart', this);
  this.shadowRoot.addEventListener('touchmove', this);
  this.shadowRoot.addEventListener('touchend', this);
  this.shadowRoot.addEventListener('mousedown', this);

  this.mediaPlayer.addEventListener('loadedmetadata', this);
  this.mediaPlayer.addEventListener('play', this);
  this.mediaPlayer.addEventListener('pause', this);
  this.mediaPlayer.addEventListener('timeupdate', this)
  this.mediaPlayer.addEventListener('seeked', this);
  this.mediaPlayer.addEventListener('ended', this);
};

MediaControlsImpl.prototype.removeEventListeners = function() {
  this.shadowRoot.removeEventListener('touchstart', this);
  this.shadowRoot.removeEventListener('touchmove', this);
  this.shadowRoot.removeEventListener('touchend', this);
  this.shadowRoot.removeEventListener('mousedown', this);

  this.mediaPlayer.removeEventListener('loadedmetadata', this);
  this.mediaPlayer.removeEventListener('play', this);
  this.mediaPlayer.removeEventListener('pause', this);
  this.mediaPlayer.removeEventListener('timeupdate', this)
  this.mediaPlayer.removeEventListener('seeked', this);
  this.mediaPlayer.removeEventListener('ended', this);

  if (this.mouseEventHandlerRegistered) {
    this.shadowRoot.removeEventListener('mousemove', this, true);
    this.shadowRoot.removeEventListener('mouseup', this, true);
  }

  this.mouseEventHandlerRegistered = false;
};

MediaControlsImpl.prototype.handleEvent = function(e) {

  // If we get a touchstart, don't process mouse events
  if (e.type === 'touchstart') {
    this.shadowRoot.removeEventListener('mousedown', this);
    this.shadowRoot.removeEventListener('mousemove', this);
    this.shadowRoot.removeEventListener('mouseup', this);
  }

  switch(e.type) {

    case 'mousedown':
      //
      // The component is listening to window 'mousemove' events so
      // that the slider movement will function even when the mouse
      // moves off the play head. However, if the component is always
      // listening to the window events, it would receive very many
      // spurious 'mousemove' events. To prevent this, the component
      // only listens to 'mousemove' events after receiving a 'mousedown'
      // event.
      //
      if (!this.mouseEventHandlerRegistered) {
        window.addEventListener('mousemove', this, true);
        window.addEventListener('mouseup', this, true);
        this.mouseEventHandlerRegistered = true;
      }

      // fall through to touchstart...

    case 'touchstart':
      switch(e.target) {
        case this.els.play:
          //
          // Let the 'play' and 'pause' handlers take care of changing
          // the icon and setting the l10n-id (for the screen reader).
          //
          if (this.mediaPlayer.paused) {
            this.mediaPlayer.play();
          }
          else {
            this.mediaPlayer.pause();
          }
          break;

        case this.els.seekForward:
        case this.els.seekBackward:

          var direction = null;
          if (e.target === this.els.seekForward) {
            direction = 1;
          } else if (e.target === this.els.seekBackward) {
            direction = -1;
          } else {
            return;
          }

          var offset = direction * 10;
          this.seekBy(this.mediaPlayer.currentTime + offset);

          // Begin the "longpress" movement after a one second delay.
          var self = this;
          this.intervalId = window.setInterval(function() {
              self.seekBy(self.mediaPlayer.currentTime + offset);
            }, 1000);
          break;
      }
      break;

      case 'touchend':
      case 'mouseup':
        //
        // If ending a long-press forward or backward, clear timer
        //
        if (this.intervalId) {
           window.clearInterval(this.intervalId);
           this.intervalId = null;
        }
        else if (this.dragging) {
          // If ending a movement of the slider, end slider movement
          this.handleSliderMoveEnd();
        }

        if (e.type === 'mouseup') {
          // Don't listen for mousemove and mouseup until we get a mousedown
          window.removeEventListener('mousemove', this, true);
          window.removeEventListener('mouseup', this, true);
          this.mouseEventHandlerRegistered = false;
        }
        break;

    case 'loadedmetadata':
      //
      // Metadata has been loaded, now we can set the duration of the media
      //
      this.els.durationText.textContent = this.formatTime(this.mediaPlayer.duration);
      break;

    case 'play':
      //
      // Media is playing, display 'paused' icon
      //
      this.els.play.classList.remove('paused');

      // Update l10n-id for the benefit of the screen reader
      this.els.play.setAttribute('data-l10n-id', 'playbackPlay');
      break;

    case 'pause':
      //
      // Media is paused, display 'play' icon
      //
      this.els.play.classList.add('paused');

      // Update l10n-id for the benefit of the screen reader
      this.els.play.setAttribute('data-l10n-id', 'playbackPause');

      // If the paused event comes when the media is at the end,
      // set our 'played-till-end' flag. The one exception is when
      // the paused event comes from pausing the media when the
      // forward button was used to seek to the end while the media
      // was playing. In this case, we don't consider the media being
      // played until the end.
      if (this.mediaPlayer.currentTime === this.mediaPlayer.duration) {
        if (this.pausedAtEndWhilePlaying) {
          this.pausedAtEndWhilePlaying = false;
        }
        else {
          this.playedUntilEnd = true;
        }
      }
      break;

    case 'timeupdate':
      //
      // Update the progress bar and play head as the video plays
      //
      if (!this.mediaControlsElement.hidden) {
        // We can't update a progress bar if we don't know how long
        // the video is.
        if (this.mediaPlayer.duration === Infinity || this.mediaPlayer.duration === 0) {
          return;
        }

        this.updateMediaControlSlider();
      }
      break;

    case 'seeked':
      //
      // Update the position of the slider when the video position has been
      // moved.
      //
      this.updateMediaControlSlider();
      break;

    case 'ended':
      //
      // Ignore ended events that occur while the user is dragging the slider
      //
      if (this.dragging) {
        return;
      }

      // If the media was played until the end (as opposed to being forwarded
      // to the end, position the player at the beginning of the video.
      if (this.playedUntilEnd) {
        this.mediaPlayer.currentTime = 0;
        this.playedUntilEnd = false;
      }
      break;
  }

  if (e.target === this.els.sliderWrapper && (e.type === 'touchstart' || e.type === 'mousedown' ||
           e.type === 'touchmove') ||
           e.type === 'mousemove') {

    var clientX =
      (/mouse/.test(e.type)) ? e.clientX : e.changedTouches[0].clientX;

    switch(e.type) {
      case 'touchstart':
      case 'mousedown':
        if (e.type === 'mousedown') {
          window.addEventListener('mousemove', this, true);
          window.addEventListener('mouseup', this, true);
        }

        this.handleSliderMoveStart(clientX);
        break;

      case 'touchmove':
      case 'mousemove':
        this.handleSliderMove(clientX);
        break;
    }
  }
};

MediaControlsImpl.prototype.updateMediaControlSlider = function() {

  var percent = (this.mediaPlayer.currentTime / this.mediaPlayer.duration) * 100;
  if (isNaN(percent)) {
    return;
  }

  percent += '%';
  this.els.elapsedText.textContent = this.formatTime(this.mediaPlayer.currentTime);
  this.els.elapsedTime.style.width = percent;

  // Don't move the play head if the user is dragging it.
  if (!this.dragging) {
    this.movePlayHead(percent);
  }
};

MediaControlsImpl.prototype.movePlayHead = function(percent) {
  if (!navigator.mozL10n || navigator.mozL10n.language.direction === 'ltr') {
    this.els.playHead.style.left = percent;
  }
  else {
    this.els.playHead.style.right = percent;
  }
};

MediaControlsImpl.prototype.handleSliderMoveStart = function(clientX) {

  // If we already have a touch start event, we don't need others.
  if (this.dragging) {
    return false;
  }

  this.dragging = true;

  // We can't do anything if we don't know our duration
  if (this.mediaPlayer.duration === Infinity) {
    return false;
  }

  // Save the state of whether the media element is paused or not.
  // If it is not paused, pause it.
  if (this.mediaPlayer.paused) {
    this.isPausedWhileDragging = true;
  }
  else {
    this.isPausedWhileDragging = false;
    this.mediaPlayer.pause();
  }

  // calculate the slider wrapper size for slider dragging.
  this.sliderRect = this.els.sliderWrapper.getBoundingClientRect();
  this.handleSliderMove(clientX);
};

MediaControlsImpl.prototype.handleSliderMove = function(clientX) {

  // If the user is not dragging the slider, noop
  if (!this.dragging) {
    return false;
  }

  var self = this;
  function getTouchPos() {
    return (!navigator.mozL10n ||
             navigator.mozL10n.language.direction === 'ltr') ?
       (clientX - self.sliderRect.left) :
       (self.sliderRect.right - clientX);
  }

  var touchPos = getTouchPos();
  var pos = touchPos / this.sliderRect.width;

  pos = Math.max(pos, 0);
  pos = Math.min(pos, 1);

  // Update the slider to match the position of the user's finger.
  // Note, however, that we don't update the displayed time until
  // we actually get a 'seeked' event.
  var percent = pos * 100 + '%';
  this.els.playHead.classList.add('active');
  this.movePlayHead(percent);
  this.els.elapsedTime.style.width = percent;

  this.mediaPlayer.fastSeek(this.mediaPlayer.duration * pos);
};

MediaControlsImpl.prototype.handleSliderMoveEnd = function() {

  // If the user is not dragging the slider, noop
  if (!this.dragging) {
    return false;
  }

  this.dragging = false;
  this.sliderRect = null;

  this.els.playHead.classList.remove('active');

  // If the media was playing when the user began dragging the slider
  // (and the slider was not dragged to the end), begin playing the
  // media.
  if (!this.isPausedWhileDragging &&
      this.mediaPlayer.currentTime !== this.mediaPlayer.duration) {
    this.mediaPlayer.play();
  }
};

MediaControlsImpl.prototype.formatTime = function(duration) {
  function padLeft(num, length) {
    var r = String(num);
    while (r.length < length) {
      r = '0' + r;
    }
    return r;
  }

  duration = Math.round(duration);
  var minutes = Math.floor(duration / 60);
  var seconds = duration % 60;
  if (minutes < 60) {
    return padLeft(minutes, 2) + ':' + padLeft(seconds, 2);
  }
  var hours = Math.floor(minutes / 60);
  minutes = Math.floor(minutes % 60);
  return hours + ':' + padLeft(minutes, 2) + ':' + padLeft(seconds, 2);
};

MediaControlsImpl.prototype.seekBy = function(seekTime) {
  //
  // If seeking will move the media position before the beginning or past
  // the end, stop the auto-seeking (if in progress) and position the media
  // accordingly.
  //
  if (seekTime >= this.mediaPlayer.duration || seekTime < 0) {
    if (this.intervalId) {
       window.clearInterval(this.intervalId);
       this.intervalId = null;
    }

    if (seekTime >= this.mediaPlayer.duration) {
      seekTime = this.mediaPlayer.duration;
      // If the user tries to seek past the end of the media while the media
      // is playing, pause the playback.
      //
      // Also, set a flag so the media controls will know the media wasn't
      // played until the end and therefore does not skip back to the
      // beginning.
      if (!this.mediaPlayer.paused) {
        this.mediaPlayer.pause();
        this.pausedAtEndWhilePlaying = true;
      }
    }
    else {
      seekTime = 0;
    }
  }

  this.mediaPlayer.fastSeek(seekTime);
};

MediaControlsImpl.prototype.seekTo = function(pos) {
  if (this.mediaControlsElement.getAttribute('demo')) {
    console.log('using currentTime');
    this.mediaPlayer.currentTime = pos;
  }
  else {
    console.log('using fastSeek');
    this.mediaPlayer.fastSeek(pos);
  }
};

MediaControlsImpl.prototype.unload = function(e) {
  this.removeEventListeners();
};

MediaControlsImpl.prototype.enableComponentTesting = function() {
  //
  // Define the buttons used by the component that will emit events
  //
  this.buttons = {
    'play': 'play',
    'seek-forward': 'seekForward',
    'seek-backward': 'seekBackward',
    'slider-wrapper': 'sliderWrapper'
  };

  // All elements need listeners for 'mousedown' and 'touchstart'
  for (var button in this.buttons) {
    this.els[this.buttons[button]].addEventListener('mousedown', this);
    this.els[this.buttons[button]].addEventListener('touchstart', this);
  }

  // These elements need listeners for ending a touch
  // (long-press and slider movement)
  //
  // We don't need to explicitly add a 'mouseup' listener as
  // handleEvent adds a 'mouseup' listener when it processes
  // 'mousedown' events.
  this.els.seekForward.addEventListener('touchend', this);
  this.els.seekBackward.addEventListener('touchend', this);
  this.els.sliderWrapper.addEventListener('touchend', this);

  // Support for moving the slider.
  // We don't need to explicitly add a 'mousemove' listener as
  // handleEvent adds a 'mousemove' listener when it processes
  // 'mousedown' events.
  this.els.sliderWrapper.addEventListener('touchmove', this);
};

MediaControlsImpl.prototype.disableComponentTesting = function() {

  for (var button in this.buttons) {
    this.els[this.buttons[button]].removeEventListener('mousedown', this);
    this.els[this.buttons[button]].removeEventListener('touchstart', this);
  }

  this.els.seekForward.removeEventListener('touchend', this);
  this.els.seekBackward.removeEventListener('touchend', this);

  this.buttons = null;

  if (this.intervalId) {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
};

MediaControlsImpl.prototype.triggerEvent = function(e) {

  // mousedown and mousemove events on the slider-wrapper need a
  // 'clientX' property indicating where on the slider the mouse
  // was clicked.
  var clientX = 0;
  if ( e.target === 'slider-wrapper' &&
      (e.type === 'mousedown' || e.type === 'mousemove') ) {
    clientX = e.detail.clientX;
  }

  var event = new MouseEvent(e.type, {clientX: clientX});

  // touchstart and touchmove events on the slider-wrapper neeed a
  // 'changedTouches' object containing a 'clientX' property
  // indicating where on the slider the *touch* occurred.
  if ( e.target === 'slider-wrapper' &&
      (e.type === 'touchstart' || e.type === 'touchmove') ) {
    event.changedTouches = [{ clientX: e.detail.clientX }];
  }

  console.log('dispatching ' + event.type + ' on ' + this.els[this.buttons[e.target]]);
  this.els[this.buttons[e.target]].dispatchEvent(event);
};

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

},{"gaia-component":1}]},{},[2]);
