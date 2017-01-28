/******/ (function(modules) { // webpackBootstrap
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

	const Task = __webpack_require__(1)

	const URL = 'https://andruxnet-random-famous-quotes.p.mashape.com/?cat=famous'
	const headers = new Headers({
	  'X-Mashape-Key': 'NvBtBmdtSImshF8Ul6PZVcHM8rPtp1HIevIjsnu6b1nua1d11M',
	  'Content-Type': 'application/x-www-form-urlencoded',
	  'Accept': 'application/json'
	})

	/**
	* A function that takes a URL and returns a Task
	* @param {string} URL
	*/
	const getQuotes = () =>
	  new Task((rej, res) => {
	    fetch(URL, { method: 'POST', headers: headers, cache: 'default' })
	      .then(r => r.json())
	      .then(res)
	      .catch(rej)
	  })

	const fetchQuotes = () => {
	  getQuotes()
	    .fork(error => {
	      const errorMessage = document.querySelector('.error')
	      errorMessage.textContent = error
	    }, data => {
	      const quote = document.querySelector('.quote')
	      const credit = document.querySelector('.credit')
	      const tweet = document.querySelector('.tweet')
	      quote.textContent = data.quote
	      credit.textContent = `— ${data.author} —`
	      tweet.href = `https://twitter.com/intent/tweet?text=${data.quote} -- ${data.author}`

	    })
	}

	window.onload = () => {
	  fetchQuotes()
	  const button = document.querySelector('.button')
	  button.addEventListener('click', fetchQuotes)
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2);


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, process) {'use strict';


	/**
	 * A helper for delaying the execution of a function.
	 * @private
	 * @summary (Any... -> Any) -> Void
	 */
	var delayed = typeof setImmediate !== 'undefined'?  setImmediate
	            : typeof process !== 'undefined'?       process.nextTick
	            : /* otherwise */                       setTimeout

	/**
	 * @module lib/task
	 */
	module.exports = Task;

	// -- Implementation ---------------------------------------------------

	/**
	 * The `Task[α, β]` structure represents values that depend on time. This
	 * allows one to model time-based effects explicitly, such that one can have
	 * full knowledge of when they're dealing with delayed computations, latency,
	 * or anything that can not be computed immediately.
	 *
	 * A common use for this structure is to replace the usual Continuation-Passing
	 * Style form of programming, in order to be able to compose and sequence
	 * time-dependent effects using the generic and powerful monadic operations.
	 *
	 * @class
	 * @summary
	 * ((α → Void), (β → Void) → Void), (Void → Void) → Task[α, β]
	 *
	 * Task[α, β] <: Chain[β]
	 *               , Monad[β]
	 *               , Functor[β]
	 *               , Applicative[β]
	 *               , Semigroup[β]
	 *               , Monoid[β]
	 *               , Show
	 */
	function Task(computation, cleanup) {
	  this.fork = computation;

	  this.cleanup = cleanup || function() {};
	}

	/**
	 * Constructs a new `Task[α, β]` containing the single value `β`.
	 *
	 * `β` can be any value, including `null`, `undefined`, or another
	 * `Task[α, β]` structure.
	 *
	 * @summary β → Task[α, β]
	 */
	Task.prototype.of = function _of(b) {
	  return new Task(function(_, resolve) {
	    return resolve(b);
	  });
	};

	Task.of = Task.prototype.of;

	/**
	 * Constructs a new `Task[α, β]` containing the single value `α`.
	 *
	 * `α` can be any value, including `null`, `undefined`, or another
	 * `Task[α, β]` structure.
	 *
	 * @summary α → Task[α, β]
	 */
	Task.prototype.rejected = function _rejected(a) {
	  return new Task(function(reject) {
	    return reject(a);
	  });
	};

	Task.rejected = Task.prototype.rejected;

	// -- Functor ----------------------------------------------------------

	/**
	 * Transforms the successful value of the `Task[α, β]` using a regular unary
	 * function.
	 *
	 * @summary @Task[α, β] => (β → γ) → Task[α, γ]
	 */
	Task.prototype.map = function _map(f) {
	  var fork = this.fork;
	  var cleanup = this.cleanup;

	  return new Task(function(reject, resolve) {
	    return fork(function(a) {
	      return reject(a);
	    }, function(b) {
	      return resolve(f(b));
	    });
	  }, cleanup);
	};

	// -- Chain ------------------------------------------------------------

	/**
	 * Transforms the succesful value of the `Task[α, β]` using a function to a
	 * monad.
	 *
	 * @summary @Task[α, β] => (β → Task[α, γ]) → Task[α, γ]
	 */
	Task.prototype.chain = function _chain(f) {
	  var fork = this.fork;
	  var cleanup = this.cleanup;

	  return new Task(function(reject, resolve) {
	    return fork(function(a) {
	      return reject(a);
	    }, function(b) {
	      return f(b).fork(reject, resolve);
	    });
	  }, cleanup);
	};

	// -- Apply ------------------------------------------------------------

	/**
	 * Applys the successful value of the `Task[α, (β → γ)]` to the successful
	 * value of the `Task[α, β]`
	 *
	 * @summary @Task[α, (β → γ)] => Task[α, β] → Task[α, γ]
	 */

	Task.prototype.ap = function _ap(that) {
	  var forkThis = this.fork;
	  var forkThat = that.fork;
	  var cleanupThis = this.cleanup;
	  var cleanupThat = that.cleanup;

	  function cleanupBoth(state) {
	    cleanupThis(state[0]);
	    cleanupThat(state[1]);
	  }

	  return new Task(function(reject, resolve) {
	    var func, funcLoaded = false;
	    var val, valLoaded = false;
	    var rejected = false;
	    var allState;

	    var thisState = forkThis(guardReject, guardResolve(function(x) {
	      funcLoaded = true;
	      func = x;
	    }));

	    var thatState = forkThat(guardReject, guardResolve(function(x) {
	      valLoaded = true;
	      val = x;
	    }));

	    function guardResolve(setter) {
	      return function(x) {
	        if (rejected) {
	          return;
	        }

	        setter(x);
	        if (funcLoaded && valLoaded) {
	          delayed(function(){ cleanupBoth(allState) });
	          return resolve(func(val));
	        } else {
	          return x;
	        }
	      }
	    }

	    function guardReject(x) {
	      if (!rejected) {
	        rejected = true;
	        return reject(x);
	      }
	    }

	    return allState = [thisState, thatState];
	  }, cleanupBoth);
	};

	// -- Semigroup ------------------------------------------------------------

	/**
	 * Selects the earlier of the two tasks `Task[α, β]`
	 *
	 * @summary @Task[α, β] => Task[α, β] → Task[α, β]
	 */

	Task.prototype.concat = function _concat(that) {
	  var forkThis = this.fork;
	  var forkThat = that.fork;
	  var cleanupThis = this.cleanup;
	  var cleanupThat = that.cleanup;

	  function cleanupBoth(state) {
	    cleanupThis(state[0]);
	    cleanupThat(state[1]);
	  }

	  return new Task(function(reject, resolve) {
	    var done = false;
	    var allState;
	    var thisState = forkThis(guard(reject), guard(resolve));
	    var thatState = forkThat(guard(reject), guard(resolve));

	    return allState = [thisState, thatState];

	    function guard(f) {
	      return function(x) {
	        if (!done) {
	          done = true;
	          delayed(function(){ cleanupBoth(allState) })
	          return f(x);
	        }
	      };
	    }
	  }, cleanupBoth);

	};

	// -- Monoid ------------------------------------------------------------

	/**
	 * Returns a Task that will never resolve
	 *
	 * @summary Void → Task[α, _]
	 */
	Task.empty = function _empty() {
	  return new Task(function() {});
	};

	Task.prototype.empty = Task.empty;

	// -- Show -------------------------------------------------------------

	/**
	 * Returns a textual representation of the `Task[α, β]`
	 *
	 * @summary @Task[α, β] => Void → String
	 */
	Task.prototype.toString = function _toString() {
	  return 'Task';
	};

	// -- Extracting and recovering ----------------------------------------

	/**
	 * Transforms a failure value into a new `Task[α, β]`. Does nothing if the
	 * structure already contains a successful value.
	 *
	 * @summary @Task[α, β] => (α → Task[γ, β]) → Task[γ, β]
	 */
	Task.prototype.orElse = function _orElse(f) {
	  var fork = this.fork;
	  var cleanup = this.cleanup;

	  return new Task(function(reject, resolve) {
	    return fork(function(a) {
	      return f(a).fork(reject, resolve);
	    }, function(b) {
	      return resolve(b);
	    });
	  }, cleanup);
	};

	// -- Folds and extended transformations -------------------------------

	/**
	 * Catamorphism. Takes two functions, applies the leftmost one to the failure
	 * value, and the rightmost one to the successful value, depending on which one
	 * is present.
	 *
	 * @summary @Task[α, β] => (α → γ), (β → γ) → Task[δ, γ]
	 */
	Task.prototype.fold = function _fold(f, g) {
	  var fork = this.fork;
	  var cleanup = this.cleanup;

	  return new Task(function(reject, resolve) {
	    return fork(function(a) {
	      return resolve(f(a));
	    }, function(b) {
	      return resolve(g(b));
	    });
	  }, cleanup);
	};

	/**
	 * Catamorphism.
	 *
	 * @summary @Task[α, β] => { Rejected: α → γ, Resolved: β → γ } → Task[δ, γ]
	 */
	Task.prototype.cata = function _cata(pattern) {
	  return this.fold(pattern.Rejected, pattern.Resolved);
	};

	/**
	 * Swaps the disjunction values.
	 *
	 * @summary @Task[α, β] => Void → Task[β, α]
	 */
	Task.prototype.swap = function _swap() {
	  var fork = this.fork;
	  var cleanup = this.cleanup;

	  return new Task(function(reject, resolve) {
	    return fork(function(a) {
	      return resolve(a);
	    }, function(b) {
	      return reject(b);
	    });
	  }, cleanup);
	};

	/**
	 * Maps both sides of the disjunction.
	 *
	 * @summary @Task[α, β] => (α → γ), (β → δ) → Task[γ, δ]
	 */
	Task.prototype.bimap = function _bimap(f, g) {
	  var fork = this.fork;
	  var cleanup = this.cleanup;

	  return new Task(function(reject, resolve) {
	    return fork(function(a) {
	      return reject(f(a));
	    }, function(b) {
	      return resolve(g(b));
	    });
	  }, cleanup);
	};

	/**
	 * Maps the left side of the disjunction (failure).
	 *
	 * @summary @Task[α, β] => (α → γ) → Task[γ, β]
	 */
	Task.prototype.rejectedMap = function _rejectedMap(f) {
	  var fork = this.fork;
	  var cleanup = this.cleanup;

	  return new Task(function(reject, resolve) {
	    return fork(function(a) {
	      return reject(f(a));
	    }, function(b) {
	      return resolve(b);
	    });
	  }, cleanup);
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3).setImmediate, __webpack_require__(5)))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var apply = Function.prototype.apply;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// setimmediate attaches itself to the global object
	__webpack_require__(4);
	exports.setImmediate = setImmediate;
	exports.clearImmediate = clearImmediate;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";

	    if (global.setImmediate) {
	        return;
	    }

	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;

	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }

	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }

	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }

	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }

	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }

	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }

	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };

	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }

	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }

	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };

	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }

	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }

	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }

	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();

	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();

	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();

	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();

	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }

	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(5)))

/***/ },
/* 5 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }
/******/ ]);