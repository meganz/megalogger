/**
 * MegaLogger
 */
;(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
        if(typeof(window) !== 'undefined') {
            window.MegaLogger = module.exports;
        }
    } else {
        root.MegaLogger = factory();
        if(typeof(window) !== 'undefined') {
            window.MegaLogger = root.MegaLogger;
        }
    }
}(this, /** @lends MegaLogger */ function () {
    var extend = require("extend");
    var isfunction = require("isfunction");
    var clone = require("clone");

    var isBrowser = typeof(window) !== 'undefined';

    /**
     * Simple .toArray method to be used to convert `arguments` to a normal JavaScript Array
     *
     * @private
     * @param val {Arguments}
     * @returns {Array}
     */
    function toArray(val) {
        return Array.prototype.slice.call(val, val);
    };


    /**
     * Mega Logger
     *
     * @param name {string}
     *     Name of the database (a-zA-Z0-9_-).
     * @param options {Object}
     *     See {MegaLogger.DEFAULT_OPTIONS}.
     * @param parentLogger {string|object}
     *     Name of or reference to a parent logger.
     * @returns {MegaLogger}
     * @constructor
     */
    function MegaLogger(name, options, parentLogger) {
        this.name = name;
        if(typeof(parentLogger) === 'object') {
            parentLogger = parentLogger.name;
        }
        if(typeof(MegaLogger.rootLogger) == "undefined" && parentLogger !== false) {
            MegaLogger.rootLogger = new MegaLogger("", {
                isEnabled: true
            }, false);
        }
        this.parentLogger = parentLogger ? parentLogger : "";
        this.options = extend({}, clone(MegaLogger.DEFAULT_OPTIONS), options);

        return this;
    };

    //makeObservable(MegaLogger);

    /**
     * Static, log levels
     *
     * @public
     * @enum {number}
     * @static
     */
    MegaLogger.LEVELS = {
        'ERROR': 40,
        'WARN': 30,
        'INFO': 20,
        'LOG': 10,
        'DEBUG': 0
    };

    /**
     * Static, global log registry
     *
     * @private
     * @static
     */
    MegaLogger._logRegistry = {};

    /**
     * Static, default options
     *
     * @public
     * @static
     */
    MegaLogger.DEFAULT_OPTIONS = {
        'colorsEnabled': isBrowser, /* use this only in browsers */
        'levelColors': {
            'ERROR': '#ff0000',
            'DEBUG': '#0000ff',
            'WARN': '#C25700',
            'INFO': '#00899E',
            'LOG': '#000000'
        },
        'dateFormatter': function(d) {
            return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
        },
        'transport': function() {
            var level = Array.prototype.slice.call(arguments, 0);
            var args = level.splice(1);
            var fn = "log";

            if(level == MegaLogger.LEVELS.DEBUG) {
                fn = "debug"
            } else if(level == MegaLogger.LEVELS.LOG) {
                fn = "log"
            } else if(level == MegaLogger.LEVELS.INFO) {
                fn = "info"
            } else if(level == MegaLogger.LEVELS.WARN) {
                fn = "warn"
            } else if(level == MegaLogger.LEVELS.ERROR) {
                fn = "error"
            }

            console[fn].apply(console, args);
        },
        'isEnabled': function() {
            return MegaLogger.rootLogger.isEnabled(); // alias
        },
        'muteList': function() {
            if(typeof(sessionStorage) !== 'undefined' && sessionStorage.muteList) {
                return JSON.parse(sessionStorage.muteList);
            } else if(typeof(localStorage) !== 'undefined' && localStorage.muteList) {
                return JSON.parse(localStorage.muteList)
            } else {
                return [];
            }
        },
        'minLogLevel': function() {
            if(typeof(sessionStorage) !== 'undefined' && sessionStorage.minLogLevel) {
                return JSON.parse(sessionStorage.minLogLevel);
            } else if(typeof(sessionStorage) !== 'undefined' && localStorage.minLogLevel) {
                return JSON.parse(localStorage.minLogLevel)
            } else {
                return MegaLogger.LEVELS.INFO;
            }
        },
        /**
         * Warning: This will use tons of CPU because of the trick of
         * JSON.serialize/.stringify we are using for dereferencing
         */
        'dereferenceObjects': false
    };

    /**
     * Factory function to return a {@link MegaLogger} instance.
     *
     * @param name {string}
     *     Name of the database (a-zA-Z0-9_-).
     * @param options {Object}
     *     See {@link MegaLogger.DEFAULT_OPTIONS}.
     * @param parentLogger {string|object}
     *     Name of or reference to a parent logger.
     * @returns {MegaLogger}
     * @static
     */
    MegaLogger.getLogger = function(name, options, parentLogger) {
        if(typeof(parentLogger) === 'object') {
            parentLogger = parentLogger.name;
        }

        if(typeof(MegaLogger._logRegistry[name]) == "undefined") {
            MegaLogger._logRegistry[name] = new MegaLogger(name, options, parentLogger);
        }
        return MegaLogger._logRegistry[name];
    };


    /**
     * Converts enum to text/label
     *
     * @param intVal {number} enum to text converter helper
     * @returns {string} the text representation of the `intVal`
     * @private
     * @static
     */
    MegaLogger._intToLevel = function(intVal) {
        var levelName = "unknown";

        Object.keys(MegaLogger.LEVELS).forEach(function(k) {
            var v = MegaLogger.LEVELS[k];
            if(intVal === v) {
                levelName = k;
                return false;
            }
        });

        return levelName;
    };

    /**
     * Formats a breadcrumb/path for a logger (e.g. pkg:subpkg:subsubpkg)
     * @returns {string}
     * @private
     */
    MegaLogger.prototype._getLoggerPath = function() {
        var path = this.name;

        var parent = MegaLogger._logRegistry[this.parentLogger];
        while(parent) {
            if(parent.name && parent.name.length > 0) {
                path = parent.name + ":" + path;
            }
            parent = MegaLogger._logRegistry[parent.parentLogger];
        }
        return path;
    };

    /**
     * Send the passed `arguments` to the specific `level` logger
     *
     * @param level {number}
     * @param arguments {*}
     * @private
     */
    MegaLogger.prototype._log = function(level, arguments) {
        var self = this;

        var levelName = MegaLogger._intToLevel(level);
        var clr = self.options.levelColors[levelName];
        var logStyle = "color: " + "white" + "; background-color: " +  clr + "; padding-left: 1px; padding-right: 1px;";


        var args = [
            (self.options.colorsEnabled ? "%c" : "") + self.options.dateFormatter(new Date()) + " - " + self._getLoggerPath() + " - " + levelName,
            (self.options.colorsEnabled ? logStyle : "")
        ];

        args = args.concat(arguments);
        if(self.options.dereferenceObjects) {
            args = JSON.parse(JSON.stringify(args));
        }

        if(self.options.isEnabled === true || (isfunction(self.options.isEnabled) && self.options.isEnabled())) {


            var txtMsg = args.join(" ");
            var muted = false;
            self.options.muteList().forEach(function(v) {
                var r = new RegExp(v);
                if(r.test(txtMsg)) {
                    muted = true;
                    return false; // break;
                }
            });

            if(muted) {
                return;
            }

            if(level < self.options.minLogLevel()) { // check min log level
                return;
            }

            self.options.transport.apply(this, [level].concat(args));

            if(level == MegaLogger.LEVELS.ERROR && typeof(mocha) == "undefined") {
                var text;
                //var noColorMsg = clone(args); // convert back to plain text before sending to the server
                var noColorMsg = extend(true, {}, {'r': args})['r']; // convert back to plain text before sending to the server
                if(noColorMsg[0].substr(0, 2) == "%c") {
                    noColorMsg[0] = noColorMsg[0].replace("%c", "");
                    delete noColorMsg[1];
                    noColorMsg.splice(1, 1);
                }
                // remove date
                noColorMsg[0] = noColorMsg[0].split(":")[2];
                noColorMsg[0] = noColorMsg[0].substr(noColorMsg[0].indexOf(" - ") + 3, noColorMsg[0].length);

                try {
                    text = JSON.stringify(noColorMsg);
                } catch(e) {
                    text = noColorMsg.join(' ');
                }

                var fn = "log";
                if(level == MegaLogger.LEVELS.DEBUG) {
                    fn = "debug"
                } else if(level == MegaLogger.LEVELS.LOG) {
                    fn = "log"
                } else if(level == MegaLogger.LEVELS.INFO) {
                    fn = "info"
                } else if(level == MegaLogger.LEVELS.WARN) {
                    fn = "warn"
                } else if(level == MegaLogger.LEVELS.ERROR) {
                    fn = "error"
                }

                var callbackName = "on" + fn.substr(0, 1).toUpperCase() + fn.substr(1);
                if(this.options[callbackName]) {
                    this.options[callbackName].apply(this, [text]);
                }

                if(MegaLogger.rootLogger.options[callbackName]) {
                    MegaLogger.rootLogger.options[callbackName].apply(this, [text]);
                }
            }
        }

    };

    /**
     * Returns `.options.isEnabled` and converts it to a boolean (if it is a dynamic function)
     *
     * @public
     * @returns {boolean}
     */
    MegaLogger.prototype.isEnabled = function() {
        var isEnabled = this.options.isEnabled;
        if(isfunction(isEnabled)) {
            return isEnabled();
        } else {
            return isEnabled;
        }
    };


    /**
     * Logs a message with a log level ERROR
     *
     * @param {...*}
     * @public
     */
    MegaLogger.prototype.error = function() {
        this._log(MegaLogger.LEVELS.ERROR, toArray(arguments));
    };

    /**
     * Logs a message with a log level WARN
     *
     * @param {...*}
     * @public
     */
    MegaLogger.prototype.warn = function() {
        this._log(MegaLogger.LEVELS.WARN, toArray(arguments));
    };

    /**
     * Logs a message with a log level INFO
     *
     * @param {...*}
     * @public
     */
    MegaLogger.prototype.info = function() {
        this._log(MegaLogger.LEVELS.INFO, toArray(arguments));
    };

    /**
     * Logs a message with a log level LOG
     *
     * @param {...*}
     * @public
     */
    MegaLogger.prototype.log = function() {
        this._log(MegaLogger.LEVELS.LOG, toArray(arguments));
    };

    /**
     * Logs a message with a log level DEBUG
     *
     * @param {...*}
     * @public
     */
    MegaLogger.prototype.debug = function() {
        this._log(MegaLogger.LEVELS.DEBUG, toArray(arguments));
    };


    /**
     * @function MegaLogger#error
     * @param {*} the message parts to be logged (any number of arguments are allowed, as in the native console.log)
     * @public
     */



    return MegaLogger;
}));
