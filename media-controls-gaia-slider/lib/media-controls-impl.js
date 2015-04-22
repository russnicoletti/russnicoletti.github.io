;(function(define){'use strict';define(function(require,exports,module){

/*
** MediaControlsImpl object
*/
function MediaControlsImpl(mediaControlsElement, shadowRoot, player) {
  this.mediaControlsElement = mediaControlsElement;
  this.slider = mediaControlsElement.slider;
  document.body.classList.add('theme-media');

  this.shadowRoot = shadowRoot;
  this.touchStartID = null;
  this.isPausedWhileDragging = null;
  this.playedUntilEnd = false;
  this.intervalId = null;
  this.pausedAtEndWhilePlaying = false;
  this.mediaPlayer = player;
  this.seekIncrement = 10; // Seek forward/backward in 10 second increments
  this.mouseEventHandlerRegistered = false;

  this.els = {
    durationText: this.shadowRoot.querySelector('.duration-text'),
    elapsedText: this.shadowRoot.querySelector('.elapsed-text'),
    play: this.shadowRoot.querySelector('.play'),
    seekForward: this.shadowRoot.querySelector('.seek-forward'),
    seekBackward: this.shadowRoot.querySelector('.seek-backward')
  };

  this.addEventListeners();
}

MediaControlsImpl.prototype.addEventListeners = function() {
  this.shadowRoot.addEventListener('touchstart', this);
  this.shadowRoot.addEventListener('touchend', this);
  this.shadowRoot.addEventListener('mousedown', this);

  this.mediaPlayer.addEventListener('loadedmetadata', this);
  this.mediaPlayer.addEventListener('play', this);
  this.mediaPlayer.addEventListener('pause', this);
  this.mediaPlayer.addEventListener('timeupdate', this)
  this.mediaPlayer.addEventListener('seeked', this);
  this.mediaPlayer.addEventListener('ended', this);

  window.addEventListener('slider-moving', this, true);
  window.addEventListener('slider-moved', this, true);
};

MediaControlsImpl.prototype.removeEventListeners = function() {
  this.shadowRoot.removeEventListener('touchstart', this);
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
      this.slider.max(this.mediaPlayer.duration);
      this.slider.value(0);
/*
      this.slider.registerMovementCallbacks(this.sliderMoving.bind(this),
                                            this.sliderMoved.bind(this));
*/
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

      // If the media was played until the end (as opposed to being forwarded
      // to the end), position the player at the beginning of the video.
      if (this.playedUntilEnd) {
        this.mediaPlayer.currentTime = 0;
        this.playedUntilEnd = false;
      }
      break;

    case 'slider-moving':
      console.log('got slider-moving');
      /*
      this.sliderMoving(e.detail);
      */
      break;

    case 'slider-moved':
      console.log('got slider-moved');
/*
      this.sliderMoved(e.detail);
*/
      break;
  }
};

MediaControlsImpl.prototype.sliderMoving = function(value) {
   console.log('sliderMoving, value: ' + value);
   // Pause media if not paused and record whether media is paused.
   if (!this.dragging) {
     console.log('dragging: ' + this.dragging);
     console.log('pausedWhileDragging: ' + this.pausedWhileDragging);
     console.log('paused: ' + this.mediaPlayer.paused);
     if (!this.mediaPlayer.paused) {
       console.log('media not paused, PAUSING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
       this.mediaPlayer.pause();
       console.log('paused while dragging is FALSE');
       this.pausedWhileDragging = false;
     }
     else {
       console.log('paused while dragging is TRUE');
       this.pausedWhileDragging = true;
     }
     this.dragging = true;
   }

   this.seekBy(value);
   this.els.elapsedText.textContent = this.formatTime(value);
};

MediaControlsImpl.prototype.sliderMoved = function(value) {
   console.log('sliderMoved, value: ' + value);
   this.seekBy(value);
   this.els.elapsedText.textContent = this.formatTime(this.mediaPlayer.currentTime);

   if (!this.pausedWhileDragging) {
     console.log('media was NOT paused, PLAYING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
     this.mediaPlayer.play();
   }
   else {
     console.log('media WAS paused, NOT PLAYING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
   }
   this.dragging = false;
};

MediaControlsImpl.prototype.updateMediaControlSlider = function() {

  // Sanity check: we can't update a progress bar if we don't know how long
  // the video is.
  if (this.mediaPlayer.duration === Infinity || this.mediaPlayer.duration === 0) {
    return;
  }

  this.els.elapsedText.textContent = this.formatTime(this.mediaPlayer.currentTime);
  this.movePlayHead();
};

MediaControlsImpl.prototype.movePlayHead = function() {
  this.slider.value(this.mediaPlayer.currentTime);
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

MediaControlsImpl.prototype.unload = function(e) {
  this.removeEventListeners();
};

MediaControlsImpl.prototype.enableComponentTesting = function() {
  //
  // Define the buttons used by the component that will emit events
  //
  this.elementsMap = {
    'play': 'play',
    'seek-forward': 'seekForward',
    'seek-backward': 'seekBackward',
    'duration-text': 'durationText',
    'elapsed-time': 'elapsedTime',
    'elapsed-text': 'elapsedText',
    'play-head': 'playHead'
  };

  // All elements need listeners for 'mousedown' and 'touchstart'
  for (var elName in this.elementsMap) {
    this.els[this.elementsMap[elName]].addEventListener('mousedown', this);
    this.els[this.elementsMap[elName]].addEventListener('touchstart', this);
  }

  // These elements need listeners for ending a touch
  // (long-press and slider movement)
  //
  // We don't need to explicitly add a 'mouseup' listener as
  // handleEvent adds a 'mouseup' listener when it processes
  // 'mousedown' events.
  this.els.seekForward.addEventListener('touchend', this);
  this.els.seekBackward.addEventListener('touchend', this);
};

MediaControlsImpl.prototype.disableComponentTesting = function() {

  for (var elName in this.elementsMap) {
    this.els[this.elementsMap[elName]].removeEventListener('mousedown', this);
    this.els[this.elementsMap[elName]].removeEventListener('touchstart', this);
  }

  this.els.seekForward.removeEventListener('touchend', this);
  this.els.seekBackward.removeEventListener('touchend', this);

  this.elementsMap = null;

  if (this.intervalId) {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
};

MediaControlsImpl.prototype.triggerEvent = function(e) {

  // Use a MouseEvent for mouse and touch events because
  // TouchEvents are only available on a device and the
  // tests are run in a browser.
  var event;
  if (/mouse/.test(e.type) || /touch/.test(e.type)) {

    var clientX = e.detail ? e.detail.clientX : 0;
    event = new MouseEvent(e.type, {clientX: clientX});

    // Touch events need a 'changedTouches' object that specify
    // the clientX value.
    if (/touch/.test(e.type)) {
      event.changedTouches = [{ clientX: clientX }];
    }
  }
  else {
    // Otherwise use a generic event
    event = new Event(e.type);
  }

  var target = /player/.test(e.target) ? this.mediaPlayer :
    this.els[this.elementsMap[e.target]];
  console.log('dispatching ' + event.type + ' event on ' + target)
  target.dispatchEvent(event);
};

MediaControlsImpl.prototype.getElement = function(name) {
  return this.els[this.elementsMap[name]];
};

module.exports = MediaControlsImpl;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('./lib/media-controls-impl',this));
