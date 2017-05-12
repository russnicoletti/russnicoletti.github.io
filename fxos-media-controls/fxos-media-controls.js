(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("fxos-component"));
	else if(typeof define === 'function' && define.amd)
		define(["fxos-component"], factory);
	else if(typeof exports === 'object')
		exports["FXOSMediaControls"] = factory(require("fxos-component"));
	else
		root["FXOSMediaControls"] = factory(root["fxosComponent"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Dependencies
	 */

	var component = __webpack_require__(1);

	/**
	 * Load 'fxos-icons' font-family
	 */
	__webpack_require__(2);

	/**
	 * Locals
	 */

	var isTouch = 'ontouchstart' in window;

	/**
	 * Exports
	 */

	module.exports = component.register('fxos-media-controls', {
	  created: function() {
	    this.setupShadowRoot();

	    var $id = this.shadowRoot.getElementById.bind(this.shadowRoot);

	    this.els = {
	      container: $id('container'),
	      previous:  $id('previous'),
	      toggle:    $id('toggle'),
	      next:      $id('next')
	    };

	    var seeking = false;

	    this.els.container.addEventListener('contextmenu', (evt) => {
	      evt.preventDefault();

	      if (seeking) {
	        return;
	      }

	      var button = evt.target.closest('button');
	      if (button.id === 'previous' || button.id === 'next') {
	        seeking = true;

	        this.dispatchEvent(new CustomEvent('startseek', {
	          detail: { reverse: button.id === 'previous' }
	        }));
	      }
	    });

	    this.els.container.addEventListener(isTouch ? 'touchend' : 'mouseup',
	      (evt) => {
	        if (seeking) {
	          evt.preventDefault();

	          this.dispatchEvent(new CustomEvent('stopseek'));
	          seeking = false;
	        }
	      }
	    );

	    this.els.container.addEventListener('click', (evt) => {
	      var button = evt.target.closest('button');
	      switch (button.id) {
	        case 'previous':
	        case 'next':
	          this.dispatchEvent(new CustomEvent(button.id));
	          break;
	        case 'toggle':
	          this.paused = !this.paused;
	          this.dispatchEvent(new CustomEvent(this.paused ? 'pause' : 'play'));
	          break;
	      }
	    });
	  },

	  attached: function() {
	    this.setupShadowL10n();
	  },

	  attrs: {
	    paused: {
	      get() {
	        return this.els.toggle.dataset.icon !== 'pause';
	      },

	      set(value) {
	        var paused = !!value;
	        if (paused === this.paused) {
	          return;
	        }

	        this.els.toggle.dataset.icon   = paused ? 'play' : 'pause';
	        this.els.toggle.dataset.l10nId = paused ? 'playbackPlay' : 'playbackPause';
	      }
	    }
	  },

	  template:
	`<div id="container">
	  <button type="button" id="previous"
	      data-icon="skip-back"
	      data-l10n-id="playbackPrevious">
	  </button>
	  <button type="button" id="toggle"
	      data-icon="play"
	      data-l10n-id="playbackPlay">
	  </button>
	  <button type="button" id="next"
	      data-icon="skip-forward"
	      data-l10n-id="playbackNext">
	  </button>
	</div>
	<style>
	  [data-icon]:before { /* Copied from fxos-icons/fxos-icons.css */
	    font-family: "fxos-icons";
	    content: attr(data-icon);
	    display: inline-block;
	    width: 1em; /* stop overflow in chrome */
	    font-size: 30px;
	    font-weight: 500;
	    font-style: normal;
	    white-space: nowrap; /* stop wrapping in chrome */
	    text-align: center;
	    overflow: hidden;
	    text-decoration: inherit;
	    text-transform: none;
	    text-rendering: optimizeLegibility;
	    -webkit-font-smoothing: antialiased;
	    -moz-osx-font-smoothing: grayscale;
	  }
	  #container {
	    background: var(--background-minus-minus);
	    border-top: 1px solid var(--background);
	    direction: ltr;
	    display: flex;
	    flex-flow: row nowrap;
	    position: relative;
	    width: 100%;
	    height: 48px;
	    -moz-user-select: none;
	  }
	  #container > button {
	    background: transparent;
	    border: none;
	    border-radius: 0;
	    color: var(--text-color);
	    flex: 1 0 auto;
	    position: relative;
	    padding: 0;
	    height: 100%;
	    transition: background 0.2s ease;
	  }
	  #container > button:hover {
	    background: transparent;
	  }
	  #container > button:active {
	    background: var(--highlight-color);
	    transition-duration: 0s;
	  }
	  #container > button:disabled {
	    opacity: 0.3;
	  }
	  #container > button:disabled:active {
	    background: transparent;
	  }
	</style>`
	});



/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;(function(define){'use strict';!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require,exports,module){

	/**
	 * Exports
	 */

	var base = window.FXOS_ICONS_BASE_URL
	  || window.COMPONENTS_BASE_URL
	  || 'node_modules/';

	// Load it!
	if (!document.documentElement) addEventListener('load', load);
	else load();

	function load() {
	  if (isLoaded()) return;
	  var link = document.createElement('link');
	  link.rel = 'stylesheet';
	  link.type = 'text/css';
	  link.href = base + 'fxos-icons/fxos-icons.css';
	  document.head.appendChild(link);
	  exports.loaded = true;
	}

	function isLoaded() {
	  return exports.loaded
	    || document.querySelector('link[href*=fxos-icons]')
	    || document.documentElement.classList.contains('fxos-icons-loaded');
	}

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));})(__webpack_require__(3));/*jshint ignore:line*/


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ }
/******/ ])
});
;