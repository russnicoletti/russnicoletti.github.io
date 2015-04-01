;(function(define){'use strict';define(function(require,exports,module){

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

module.exports = MediaControlsImpl;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('./lib/media-controls-impl',this));
