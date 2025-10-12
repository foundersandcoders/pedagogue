import { b as private_env, e as error, j as json } from './index-bd665938.js';
import { ChatAnthropic } from '@langchain/anthropic';
import 'fs';
import 'path';
import { DOMParser } from '@xmldom/xmldom';

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var decamelize;
var hasRequiredDecamelize;

function requireDecamelize () {
	if (hasRequiredDecamelize) return decamelize;
	hasRequiredDecamelize = 1;
	decamelize = function (str, sep) {
		if (typeof str !== 'string') {
			throw new TypeError('Expected a string');
		}

		sep = typeof sep === 'undefined' ? '_' : sep;

		return str
			.replace(/([a-z\d])([A-Z])/g, '$1' + sep + '$2')
			.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + sep + '$2')
			.toLowerCase();
	};
	return decamelize;
}

var decamelizeExports = requireDecamelize();
var snakeCase = /*@__PURE__*/getDefaultExportFromCjs(decamelizeExports);

var camelcase = {exports: {}};

var hasRequiredCamelcase;

function requireCamelcase () {
	if (hasRequiredCamelcase) return camelcase.exports;
	hasRequiredCamelcase = 1;

	const UPPERCASE = /[\p{Lu}]/u;
	const LOWERCASE = /[\p{Ll}]/u;
	const LEADING_CAPITAL = /^[\p{Lu}](?![\p{Lu}])/gu;
	const IDENTIFIER = /([\p{Alpha}\p{N}_]|$)/u;
	const SEPARATORS = /[_.\- ]+/;

	const LEADING_SEPARATORS = new RegExp('^' + SEPARATORS.source);
	const SEPARATORS_AND_IDENTIFIER = new RegExp(SEPARATORS.source + IDENTIFIER.source, 'gu');
	const NUMBERS_AND_IDENTIFIER = new RegExp('\\d+' + IDENTIFIER.source, 'gu');

	const preserveCamelCase = (string, toLowerCase, toUpperCase) => {
		let isLastCharLower = false;
		let isLastCharUpper = false;
		let isLastLastCharUpper = false;

		for (let i = 0; i < string.length; i++) {
			const character = string[i];

			if (isLastCharLower && UPPERCASE.test(character)) {
				string = string.slice(0, i) + '-' + string.slice(i);
				isLastCharLower = false;
				isLastLastCharUpper = isLastCharUpper;
				isLastCharUpper = true;
				i++;
			} else if (isLastCharUpper && isLastLastCharUpper && LOWERCASE.test(character)) {
				string = string.slice(0, i - 1) + '-' + string.slice(i - 1);
				isLastLastCharUpper = isLastCharUpper;
				isLastCharUpper = false;
				isLastCharLower = true;
			} else {
				isLastCharLower = toLowerCase(character) === character && toUpperCase(character) !== character;
				isLastLastCharUpper = isLastCharUpper;
				isLastCharUpper = toUpperCase(character) === character && toLowerCase(character) !== character;
			}
		}

		return string;
	};

	const preserveConsecutiveUppercase = (input, toLowerCase) => {
		LEADING_CAPITAL.lastIndex = 0;

		return input.replace(LEADING_CAPITAL, m1 => toLowerCase(m1));
	};

	const postProcess = (input, toUpperCase) => {
		SEPARATORS_AND_IDENTIFIER.lastIndex = 0;
		NUMBERS_AND_IDENTIFIER.lastIndex = 0;

		return input.replace(SEPARATORS_AND_IDENTIFIER, (_, identifier) => toUpperCase(identifier))
			.replace(NUMBERS_AND_IDENTIFIER, m => toUpperCase(m));
	};

	const camelCase = (input, options) => {
		if (!(typeof input === 'string' || Array.isArray(input))) {
			throw new TypeError('Expected the input to be `string | string[]`');
		}

		options = {
			pascalCase: false,
			preserveConsecutiveUppercase: false,
			...options
		};

		if (Array.isArray(input)) {
			input = input.map(x => x.trim())
				.filter(x => x.length)
				.join('-');
		} else {
			input = input.trim();
		}

		if (input.length === 0) {
			return '';
		}

		const toLowerCase = options.locale === false ?
			string => string.toLowerCase() :
			string => string.toLocaleLowerCase(options.locale);
		const toUpperCase = options.locale === false ?
			string => string.toUpperCase() :
			string => string.toLocaleUpperCase(options.locale);

		if (input.length === 1) {
			return options.pascalCase ? toUpperCase(input) : toLowerCase(input);
		}

		const hasUpperCase = input !== toLowerCase(input);

		if (hasUpperCase) {
			input = preserveCamelCase(input, toLowerCase, toUpperCase);
		}

		input = input.replace(LEADING_SEPARATORS, '');

		if (options.preserveConsecutiveUppercase) {
			input = preserveConsecutiveUppercase(input, toLowerCase);
		} else {
			input = toLowerCase(input);
		}

		if (options.pascalCase) {
			input = toUpperCase(input.charAt(0)) + input.slice(1);
		}

		return postProcess(input, toUpperCase);
	};

	camelcase.exports = camelCase;
	// TODO: Remove this for the next major release
	camelcase.exports.default = camelCase;
	return camelcase.exports;
}

requireCamelcase();

function keyToJson(key, map) {
    return map?.[key] || snakeCase(key);
}
function mapKeys(fields, mapper, map) {
    const mapped = {};
    for (const key in fields) {
        if (Object.hasOwn(fields, key)) {
            mapped[mapper(key, map)] = fields[key];
        }
    }
    return mapped;
}

function shallowCopy(obj) {
    return Array.isArray(obj) ? [...obj] : { ...obj };
}
function replaceSecrets(root, secretsMap) {
    const result = shallowCopy(root);
    for (const [path, secretId] of Object.entries(secretsMap)) {
        const [last, ...partsReverse] = path.split(".").reverse();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current = result;
        for (const part of partsReverse.reverse()) {
            if (current[part] === undefined) {
                break;
            }
            current[part] = shallowCopy(current[part]);
            current = current[part];
        }
        if (current[last] !== undefined) {
            current[last] = {
                lc: 1,
                type: "secret",
                id: [secretId],
            };
        }
    }
    return result;
}
/**
 * Get a unique name for the module, rather than parent class implementations.
 * Should not be subclassed, subclass lc_name above instead.
 */
function get_lc_unique_name(
// eslint-disable-next-line @typescript-eslint/no-use-before-define
serializableClass) {
    // "super" here would refer to the parent class of Serializable,
    // when we want the parent class of the module actually calling this method.
    const parentClass = Object.getPrototypeOf(serializableClass);
    const lcNameIsSubclassed = typeof serializableClass.lc_name === "function" &&
        (typeof parentClass.lc_name !== "function" ||
            serializableClass.lc_name() !== parentClass.lc_name());
    if (lcNameIsSubclassed) {
        return serializableClass.lc_name();
    }
    else {
        return serializableClass.name;
    }
}
class Serializable {
    /**
     * The name of the serializable. Override to provide an alias or
     * to preserve the serialized module name in minified environments.
     *
     * Implemented as a static method to support loading logic.
     */
    static lc_name() {
        return this.name;
    }
    /**
     * The final serialized identifier for the module.
     */
    get lc_id() {
        return [
            ...this.lc_namespace,
            get_lc_unique_name(this.constructor),
        ];
    }
    /**
     * A map of secrets, which will be omitted from serialization.
     * Keys are paths to the secret in constructor args, e.g. "foo.bar.baz".
     * Values are the secret ids, which will be used when deserializing.
     */
    get lc_secrets() {
        return undefined;
    }
    /**
     * A map of additional attributes to merge with constructor args.
     * Keys are the attribute names, e.g. "foo".
     * Values are the attribute values, which will be serialized.
     * These attributes need to be accepted by the constructor as arguments.
     */
    get lc_attributes() {
        return undefined;
    }
    /**
     * A map of aliases for constructor args.
     * Keys are the attribute names, e.g. "foo".
     * Values are the alias that will replace the key in serialization.
     * This is used to eg. make argument names match Python.
     */
    get lc_aliases() {
        return undefined;
    }
    /**
     * A manual list of keys that should be serialized.
     * If not overridden, all fields passed into the constructor will be serialized.
     */
    get lc_serializable_keys() {
        return undefined;
    }
    constructor(kwargs, ..._args) {
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "lc_kwargs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (this.lc_serializable_keys !== undefined) {
            this.lc_kwargs = Object.fromEntries(Object.entries(kwargs || {}).filter(([key]) => this.lc_serializable_keys?.includes(key)));
        }
        else {
            this.lc_kwargs = kwargs ?? {};
        }
    }
    toJSON() {
        if (!this.lc_serializable) {
            return this.toJSONNotImplemented();
        }
        if (
        // eslint-disable-next-line no-instanceof/no-instanceof
        this.lc_kwargs instanceof Serializable ||
            typeof this.lc_kwargs !== "object" ||
            Array.isArray(this.lc_kwargs)) {
            // We do not support serialization of classes with arg not a POJO
            // I'm aware the check above isn't as strict as it could be
            return this.toJSONNotImplemented();
        }
        const aliases = {};
        const secrets = {};
        const kwargs = Object.keys(this.lc_kwargs).reduce((acc, key) => {
            acc[key] = key in this ? this[key] : this.lc_kwargs[key];
            return acc;
        }, {});
        // get secrets, attributes and aliases from all superclasses
        for (
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current = Object.getPrototypeOf(this); current; current = Object.getPrototypeOf(current)) {
            Object.assign(aliases, Reflect.get(current, "lc_aliases", this));
            Object.assign(secrets, Reflect.get(current, "lc_secrets", this));
            Object.assign(kwargs, Reflect.get(current, "lc_attributes", this));
        }
        // include all secrets used, even if not in kwargs,
        // will be replaced with sentinel value in replaceSecrets
        Object.keys(secrets).forEach((keyPath) => {
            // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-explicit-any
            let read = this;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let write = kwargs;
            const [last, ...partsReverse] = keyPath.split(".").reverse();
            for (const key of partsReverse.reverse()) {
                if (!(key in read) || read[key] === undefined)
                    return;
                if (!(key in write) || write[key] === undefined) {
                    if (typeof read[key] === "object" && read[key] != null) {
                        write[key] = {};
                    }
                    else if (Array.isArray(read[key])) {
                        write[key] = [];
                    }
                }
                read = read[key];
                write = write[key];
            }
            if (last in read && read[last] !== undefined) {
                write[last] = write[last] || read[last];
            }
        });
        return {
            lc: 1,
            type: "constructor",
            id: this.lc_id,
            kwargs: mapKeys(Object.keys(secrets).length ? replaceSecrets(kwargs, secrets) : kwargs, keyToJson, aliases),
        };
    }
    toJSONNotImplemented() {
        return {
            lc: 1,
            type: "not_implemented",
            id: this.lc_id,
        };
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stringifyWithDepthLimit(obj, depthLimit) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function helper(obj, currentDepth) {
        if (typeof obj !== "object" || obj === null || obj === undefined) {
            return obj;
        }
        if (currentDepth >= depthLimit) {
            if (Array.isArray(obj)) {
                return "[Array]";
            }
            return "[Object]";
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => helper(item, currentDepth + 1));
        }
        const result = {};
        for (const key of Object.keys(obj)) {
            result[key] = helper(obj[key], currentDepth + 1);
        }
        return result;
    }
    return JSON.stringify(helper(obj, 0), null, 2);
}
/**
 * Base class for all types of messages in a conversation. It includes
 * properties like `content`, `name`, and `additional_kwargs`. It also
 * includes methods like `toDict()` and `_getType()`.
 */
class BaseMessage extends Serializable {
    get lc_aliases() {
        // exclude snake case conversion to pascal case
        return {
            additional_kwargs: "additional_kwargs",
            response_metadata: "response_metadata",
        };
    }
    /**
     * Get text content of the message.
     */
    get text() {
        if (typeof this.content === "string") {
            return this.content;
        }
        if (!Array.isArray(this.content))
            return "";
        return this.content
            .map((c) => {
            if (typeof c === "string")
                return c;
            if (c.type === "text")
                return c.text;
            return "";
        })
            .join("");
    }
    /** The type of the message. */
    getType() {
        return this._getType();
    }
    constructor(fields, 
    /** @deprecated */
    kwargs) {
        if (typeof fields === "string") {
            // eslint-disable-next-line no-param-reassign
            fields = {
                content: fields,
                additional_kwargs: kwargs,
                response_metadata: {},
            };
        }
        // Make sure the default value for additional_kwargs is passed into super() for serialization
        if (!fields.additional_kwargs) {
            // eslint-disable-next-line no-param-reassign
            fields.additional_kwargs = {};
        }
        if (!fields.response_metadata) {
            // eslint-disable-next-line no-param-reassign
            fields.response_metadata = {};
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "messages"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        /** The content of the message. */
        Object.defineProperty(this, "content", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** The name of the message sender in a multi-user chat. */
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Additional keyword arguments */
        Object.defineProperty(this, "additional_kwargs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Response metadata. For example: response headers, logprobs, token counts, model name. */
        Object.defineProperty(this, "response_metadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * An optional unique identifier for the message. This should ideally be
         * provided by the provider/model which created the message.
         */
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = fields.name;
        this.content = fields.content;
        this.additional_kwargs = fields.additional_kwargs;
        this.response_metadata = fields.response_metadata;
        this.id = fields.id;
    }
    toDict() {
        return {
            type: this._getType(),
            data: this.toJSON()
                .kwargs,
        };
    }
    static lc_name() {
        return "BaseMessage";
    }
    // Can't be protected for silly reasons
    get _printableFields() {
        return {
            id: this.id,
            content: this.content,
            name: this.name,
            additional_kwargs: this.additional_kwargs,
            response_metadata: this.response_metadata,
        };
    }
    // this private method is used to update the ID for the runtime
    // value as well as in lc_kwargs for serialisation
    _updateId(value) {
        this.id = value;
        // lc_attributes wouldn't work here, because jest compares the
        // whole object
        this.lc_kwargs.id = value;
    }
    get [Symbol.toStringTag]() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.constructor.lc_name();
    }
    // Override the default behavior of console.log
    [Symbol.for("nodejs.util.inspect.custom")](depth) {
        if (depth === null) {
            return this;
        }
        const printable = stringifyWithDepthLimit(this._printableFields, Math.max(4, depth));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return `${this.constructor.lc_name()} ${printable}`;
    }
}

/**
 * Represents a human message in a conversation.
 */
class HumanMessage extends BaseMessage {
    static lc_name() {
        return "HumanMessage";
    }
    _getType() {
        return "human";
    }
    constructor(fields, 
    /** @deprecated */
    kwargs) {
        super(fields, kwargs);
    }
}

/**
 * Represents a system message in a conversation.
 */
class SystemMessage extends BaseMessage {
    static lc_name() {
        return "SystemMessage";
    }
    _getType() {
        return "system";
    }
    constructor(fields, 
    /** @deprecated */
    kwargs) {
        super(fields, kwargs);
    }
}

var pRetry = {exports: {}};

var retry$1 = {};

var retry_operation;
var hasRequiredRetry_operation;

function requireRetry_operation () {
	if (hasRequiredRetry_operation) return retry_operation;
	hasRequiredRetry_operation = 1;
	function RetryOperation(timeouts, options) {
	  // Compatibility for the old (timeouts, retryForever) signature
	  if (typeof options === 'boolean') {
	    options = { forever: options };
	  }

	  this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
	  this._timeouts = timeouts;
	  this._options = options || {};
	  this._maxRetryTime = options && options.maxRetryTime || Infinity;
	  this._fn = null;
	  this._errors = [];
	  this._attempts = 1;
	  this._operationTimeout = null;
	  this._operationTimeoutCb = null;
	  this._timeout = null;
	  this._operationStart = null;
	  this._timer = null;

	  if (this._options.forever) {
	    this._cachedTimeouts = this._timeouts.slice(0);
	  }
	}
	retry_operation = RetryOperation;

	RetryOperation.prototype.reset = function() {
	  this._attempts = 1;
	  this._timeouts = this._originalTimeouts.slice(0);
	};

	RetryOperation.prototype.stop = function() {
	  if (this._timeout) {
	    clearTimeout(this._timeout);
	  }
	  if (this._timer) {
	    clearTimeout(this._timer);
	  }

	  this._timeouts       = [];
	  this._cachedTimeouts = null;
	};

	RetryOperation.prototype.retry = function(err) {
	  if (this._timeout) {
	    clearTimeout(this._timeout);
	  }

	  if (!err) {
	    return false;
	  }
	  var currentTime = new Date().getTime();
	  if (err && currentTime - this._operationStart >= this._maxRetryTime) {
	    this._errors.push(err);
	    this._errors.unshift(new Error('RetryOperation timeout occurred'));
	    return false;
	  }

	  this._errors.push(err);

	  var timeout = this._timeouts.shift();
	  if (timeout === undefined) {
	    if (this._cachedTimeouts) {
	      // retry forever, only keep last error
	      this._errors.splice(0, this._errors.length - 1);
	      timeout = this._cachedTimeouts.slice(-1);
	    } else {
	      return false;
	    }
	  }

	  var self = this;
	  this._timer = setTimeout(function() {
	    self._attempts++;

	    if (self._operationTimeoutCb) {
	      self._timeout = setTimeout(function() {
	        self._operationTimeoutCb(self._attempts);
	      }, self._operationTimeout);

	      if (self._options.unref) {
	          self._timeout.unref();
	      }
	    }

	    self._fn(self._attempts);
	  }, timeout);

	  if (this._options.unref) {
	      this._timer.unref();
	  }

	  return true;
	};

	RetryOperation.prototype.attempt = function(fn, timeoutOps) {
	  this._fn = fn;

	  if (timeoutOps) {
	    if (timeoutOps.timeout) {
	      this._operationTimeout = timeoutOps.timeout;
	    }
	    if (timeoutOps.cb) {
	      this._operationTimeoutCb = timeoutOps.cb;
	    }
	  }

	  var self = this;
	  if (this._operationTimeoutCb) {
	    this._timeout = setTimeout(function() {
	      self._operationTimeoutCb();
	    }, self._operationTimeout);
	  }

	  this._operationStart = new Date().getTime();

	  this._fn(this._attempts);
	};

	RetryOperation.prototype.try = function(fn) {
	  console.log('Using RetryOperation.try() is deprecated');
	  this.attempt(fn);
	};

	RetryOperation.prototype.start = function(fn) {
	  console.log('Using RetryOperation.start() is deprecated');
	  this.attempt(fn);
	};

	RetryOperation.prototype.start = RetryOperation.prototype.try;

	RetryOperation.prototype.errors = function() {
	  return this._errors;
	};

	RetryOperation.prototype.attempts = function() {
	  return this._attempts;
	};

	RetryOperation.prototype.mainError = function() {
	  if (this._errors.length === 0) {
	    return null;
	  }

	  var counts = {};
	  var mainError = null;
	  var mainErrorCount = 0;

	  for (var i = 0; i < this._errors.length; i++) {
	    var error = this._errors[i];
	    var message = error.message;
	    var count = (counts[message] || 0) + 1;

	    counts[message] = count;

	    if (count >= mainErrorCount) {
	      mainError = error;
	      mainErrorCount = count;
	    }
	  }

	  return mainError;
	};
	return retry_operation;
}

var hasRequiredRetry$1;

function requireRetry$1 () {
	if (hasRequiredRetry$1) return retry$1;
	hasRequiredRetry$1 = 1;
	(function (exports) {
		var RetryOperation = requireRetry_operation();

		exports.operation = function(options) {
		  var timeouts = exports.timeouts(options);
		  return new RetryOperation(timeouts, {
		      forever: options && (options.forever || options.retries === Infinity),
		      unref: options && options.unref,
		      maxRetryTime: options && options.maxRetryTime
		  });
		};

		exports.timeouts = function(options) {
		  if (options instanceof Array) {
		    return [].concat(options);
		  }

		  var opts = {
		    retries: 10,
		    factor: 2,
		    minTimeout: 1 * 1000,
		    maxTimeout: Infinity,
		    randomize: false
		  };
		  for (var key in options) {
		    opts[key] = options[key];
		  }

		  if (opts.minTimeout > opts.maxTimeout) {
		    throw new Error('minTimeout is greater than maxTimeout');
		  }

		  var timeouts = [];
		  for (var i = 0; i < opts.retries; i++) {
		    timeouts.push(this.createTimeout(i, opts));
		  }

		  if (options && options.forever && !timeouts.length) {
		    timeouts.push(this.createTimeout(i, opts));
		  }

		  // sort the array numerically ascending
		  timeouts.sort(function(a,b) {
		    return a - b;
		  });

		  return timeouts;
		};

		exports.createTimeout = function(attempt, opts) {
		  var random = (opts.randomize)
		    ? (Math.random() + 1)
		    : 1;

		  var timeout = Math.round(random * Math.max(opts.minTimeout, 1) * Math.pow(opts.factor, attempt));
		  timeout = Math.min(timeout, opts.maxTimeout);

		  return timeout;
		};

		exports.wrap = function(obj, options, methods) {
		  if (options instanceof Array) {
		    methods = options;
		    options = null;
		  }

		  if (!methods) {
		    methods = [];
		    for (var key in obj) {
		      if (typeof obj[key] === 'function') {
		        methods.push(key);
		      }
		    }
		  }

		  for (var i = 0; i < methods.length; i++) {
		    var method   = methods[i];
		    var original = obj[method];

		    obj[method] = function retryWrapper(original) {
		      var op       = exports.operation(options);
		      var args     = Array.prototype.slice.call(arguments, 1);
		      var callback = args.pop();

		      args.push(function(err) {
		        if (op.retry(err)) {
		          return;
		        }
		        if (err) {
		          arguments[0] = op.mainError();
		        }
		        callback.apply(this, arguments);
		      });

		      op.attempt(function() {
		        original.apply(obj, args);
		      });
		    }.bind(obj, original);
		    obj[method].options = options;
		  }
		}; 
	} (retry$1));
	return retry$1;
}

var retry;
var hasRequiredRetry;

function requireRetry () {
	if (hasRequiredRetry) return retry;
	hasRequiredRetry = 1;
	retry = requireRetry$1();
	return retry;
}

var hasRequiredPRetry;

function requirePRetry () {
	if (hasRequiredPRetry) return pRetry.exports;
	hasRequiredPRetry = 1;
	const retry = requireRetry();

	const networkErrorMsgs = [
		'Failed to fetch', // Chrome
		'NetworkError when attempting to fetch resource.', // Firefox
		'The Internet connection appears to be offline.', // Safari
		'Network request failed' // `cross-fetch`
	];

	class AbortError extends Error {
		constructor(message) {
			super();

			if (message instanceof Error) {
				this.originalError = message;
				({message} = message);
			} else {
				this.originalError = new Error(message);
				this.originalError.stack = this.stack;
			}

			this.name = 'AbortError';
			this.message = message;
		}
	}

	const decorateErrorWithCounts = (error, attemptNumber, options) => {
		// Minus 1 from attemptNumber because the first attempt does not count as a retry
		const retriesLeft = options.retries - (attemptNumber - 1);

		error.attemptNumber = attemptNumber;
		error.retriesLeft = retriesLeft;
		return error;
	};

	const isNetworkError = errorMessage => networkErrorMsgs.includes(errorMessage);

	const pRetry$1 = (input, options) => new Promise((resolve, reject) => {
		options = {
			onFailedAttempt: () => {},
			retries: 10,
			...options
		};

		const operation = retry.operation(options);

		operation.attempt(async attemptNumber => {
			try {
				resolve(await input(attemptNumber));
			} catch (error) {
				if (!(error instanceof Error)) {
					reject(new TypeError(`Non-error was thrown: "${error}". You should only throw errors.`));
					return;
				}

				if (error instanceof AbortError) {
					operation.stop();
					reject(error.originalError);
				} else if (error instanceof TypeError && !isNetworkError(error.message)) {
					operation.stop();
					reject(error);
				} else {
					decorateErrorWithCounts(error, attemptNumber, options);

					try {
						await options.onFailedAttempt(error);
					} catch (error) {
						reject(error);
						return;
					}

					if (!operation.retry(error)) {
						reject(operation.mainError());
					}
				}
			}
		});
	});

	pRetry.exports = pRetry$1;
	// TODO: remove this in the next major version
	pRetry.exports.default = pRetry$1;

	pRetry.exports.AbortError = AbortError;
	return pRetry.exports;
}

requirePRetry();

var dist = {};

var eventemitter3 = {exports: {}};

var hasRequiredEventemitter3;

function requireEventemitter3 () {
	if (hasRequiredEventemitter3) return eventemitter3.exports;
	hasRequiredEventemitter3 = 1;
	(function (module) {

		var has = Object.prototype.hasOwnProperty
		  , prefix = '~';

		/**
		 * Constructor to create a storage for our `EE` objects.
		 * An `Events` instance is a plain object whose properties are event names.
		 *
		 * @constructor
		 * @private
		 */
		function Events() {}

		//
		// We try to not inherit from `Object.prototype`. In some engines creating an
		// instance in this way is faster than calling `Object.create(null)` directly.
		// If `Object.create(null)` is not supported we prefix the event names with a
		// character to make sure that the built-in object properties are not
		// overridden or used as an attack vector.
		//
		if (Object.create) {
		  Events.prototype = Object.create(null);

		  //
		  // This hack is needed because the `__proto__` property is still inherited in
		  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
		  //
		  if (!new Events().__proto__) prefix = false;
		}

		/**
		 * Representation of a single event listener.
		 *
		 * @param {Function} fn The listener function.
		 * @param {*} context The context to invoke the listener with.
		 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
		 * @constructor
		 * @private
		 */
		function EE(fn, context, once) {
		  this.fn = fn;
		  this.context = context;
		  this.once = once || false;
		}

		/**
		 * Add a listener for a given event.
		 *
		 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn The listener function.
		 * @param {*} context The context to invoke the listener with.
		 * @param {Boolean} once Specify if the listener is a one-time listener.
		 * @returns {EventEmitter}
		 * @private
		 */
		function addListener(emitter, event, fn, context, once) {
		  if (typeof fn !== 'function') {
		    throw new TypeError('The listener must be a function');
		  }

		  var listener = new EE(fn, context || emitter, once)
		    , evt = prefix ? prefix + event : event;

		  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
		  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
		  else emitter._events[evt] = [emitter._events[evt], listener];

		  return emitter;
		}

		/**
		 * Clear event by name.
		 *
		 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
		 * @param {(String|Symbol)} evt The Event name.
		 * @private
		 */
		function clearEvent(emitter, evt) {
		  if (--emitter._eventsCount === 0) emitter._events = new Events();
		  else delete emitter._events[evt];
		}

		/**
		 * Minimal `EventEmitter` interface that is molded against the Node.js
		 * `EventEmitter` interface.
		 *
		 * @constructor
		 * @public
		 */
		function EventEmitter() {
		  this._events = new Events();
		  this._eventsCount = 0;
		}

		/**
		 * Return an array listing the events for which the emitter has registered
		 * listeners.
		 *
		 * @returns {Array}
		 * @public
		 */
		EventEmitter.prototype.eventNames = function eventNames() {
		  var names = []
		    , events
		    , name;

		  if (this._eventsCount === 0) return names;

		  for (name in (events = this._events)) {
		    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
		  }

		  if (Object.getOwnPropertySymbols) {
		    return names.concat(Object.getOwnPropertySymbols(events));
		  }

		  return names;
		};

		/**
		 * Return the listeners registered for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @returns {Array} The registered listeners.
		 * @public
		 */
		EventEmitter.prototype.listeners = function listeners(event) {
		  var evt = prefix ? prefix + event : event
		    , handlers = this._events[evt];

		  if (!handlers) return [];
		  if (handlers.fn) return [handlers.fn];

		  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
		    ee[i] = handlers[i].fn;
		  }

		  return ee;
		};

		/**
		 * Return the number of listeners listening to a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @returns {Number} The number of listeners.
		 * @public
		 */
		EventEmitter.prototype.listenerCount = function listenerCount(event) {
		  var evt = prefix ? prefix + event : event
		    , listeners = this._events[evt];

		  if (!listeners) return 0;
		  if (listeners.fn) return 1;
		  return listeners.length;
		};

		/**
		 * Calls each of the listeners registered for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @returns {Boolean} `true` if the event had listeners, else `false`.
		 * @public
		 */
		EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
		  var evt = prefix ? prefix + event : event;

		  if (!this._events[evt]) return false;

		  var listeners = this._events[evt]
		    , len = arguments.length
		    , args
		    , i;

		  if (listeners.fn) {
		    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

		    switch (len) {
		      case 1: return listeners.fn.call(listeners.context), true;
		      case 2: return listeners.fn.call(listeners.context, a1), true;
		      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
		      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
		      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
		      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
		    }

		    for (i = 1, args = new Array(len -1); i < len; i++) {
		      args[i - 1] = arguments[i];
		    }

		    listeners.fn.apply(listeners.context, args);
		  } else {
		    var length = listeners.length
		      , j;

		    for (i = 0; i < length; i++) {
		      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

		      switch (len) {
		        case 1: listeners[i].fn.call(listeners[i].context); break;
		        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
		        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
		        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
		        default:
		          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
		            args[j - 1] = arguments[j];
		          }

		          listeners[i].fn.apply(listeners[i].context, args);
		      }
		    }
		  }

		  return true;
		};

		/**
		 * Add a listener for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn The listener function.
		 * @param {*} [context=this] The context to invoke the listener with.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.on = function on(event, fn, context) {
		  return addListener(this, event, fn, context, false);
		};

		/**
		 * Add a one-time listener for a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn The listener function.
		 * @param {*} [context=this] The context to invoke the listener with.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.once = function once(event, fn, context) {
		  return addListener(this, event, fn, context, true);
		};

		/**
		 * Remove the listeners of a given event.
		 *
		 * @param {(String|Symbol)} event The event name.
		 * @param {Function} fn Only remove the listeners that match this function.
		 * @param {*} context Only remove the listeners that have this context.
		 * @param {Boolean} once Only remove one-time listeners.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
		  var evt = prefix ? prefix + event : event;

		  if (!this._events[evt]) return this;
		  if (!fn) {
		    clearEvent(this, evt);
		    return this;
		  }

		  var listeners = this._events[evt];

		  if (listeners.fn) {
		    if (
		      listeners.fn === fn &&
		      (!once || listeners.once) &&
		      (!context || listeners.context === context)
		    ) {
		      clearEvent(this, evt);
		    }
		  } else {
		    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
		      if (
		        listeners[i].fn !== fn ||
		        (once && !listeners[i].once) ||
		        (context && listeners[i].context !== context)
		      ) {
		        events.push(listeners[i]);
		      }
		    }

		    //
		    // Reset the array, or remove it completely if we have no more listeners.
		    //
		    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
		    else clearEvent(this, evt);
		  }

		  return this;
		};

		/**
		 * Remove all listeners, or those of the specified event.
		 *
		 * @param {(String|Symbol)} [event] The event name.
		 * @returns {EventEmitter} `this`.
		 * @public
		 */
		EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
		  var evt;

		  if (event) {
		    evt = prefix ? prefix + event : event;
		    if (this._events[evt]) clearEvent(this, evt);
		  } else {
		    this._events = new Events();
		    this._eventsCount = 0;
		  }

		  return this;
		};

		//
		// Alias methods names because people roll like that.
		//
		EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
		EventEmitter.prototype.addListener = EventEmitter.prototype.on;

		//
		// Expose the prefix.
		//
		EventEmitter.prefixed = prefix;

		//
		// Allow `EventEmitter` to be imported as module namespace.
		//
		EventEmitter.EventEmitter = EventEmitter;

		//
		// Expose the module.
		//
		{
		  module.exports = EventEmitter;
		} 
	} (eventemitter3));
	return eventemitter3.exports;
}

var pTimeout = {exports: {}};

var pFinally;
var hasRequiredPFinally;

function requirePFinally () {
	if (hasRequiredPFinally) return pFinally;
	hasRequiredPFinally = 1;
	pFinally = (promise, onFinally) => {
		onFinally = onFinally || (() => {});

		return promise.then(
			val => new Promise(resolve => {
				resolve(onFinally());
			}).then(() => val),
			err => new Promise(resolve => {
				resolve(onFinally());
			}).then(() => {
				throw err;
			})
		);
	};
	return pFinally;
}

var hasRequiredPTimeout;

function requirePTimeout () {
	if (hasRequiredPTimeout) return pTimeout.exports;
	hasRequiredPTimeout = 1;

	const pFinally = requirePFinally();

	class TimeoutError extends Error {
		constructor(message) {
			super(message);
			this.name = 'TimeoutError';
		}
	}

	const pTimeout$1 = (promise, milliseconds, fallback) => new Promise((resolve, reject) => {
		if (typeof milliseconds !== 'number' || milliseconds < 0) {
			throw new TypeError('Expected `milliseconds` to be a positive number');
		}

		if (milliseconds === Infinity) {
			resolve(promise);
			return;
		}

		const timer = setTimeout(() => {
			if (typeof fallback === 'function') {
				try {
					resolve(fallback());
				} catch (error) {
					reject(error);
				}

				return;
			}

			const message = typeof fallback === 'string' ? fallback : `Promise timed out after ${milliseconds} milliseconds`;
			const timeoutError = fallback instanceof Error ? fallback : new TimeoutError(message);

			if (typeof promise.cancel === 'function') {
				promise.cancel();
			}

			reject(timeoutError);
		}, milliseconds);

		// TODO: Use native `finally` keyword when targeting Node.js 10
		pFinally(
			// eslint-disable-next-line promise/prefer-await-to-then
			promise.then(resolve, reject),
			() => {
				clearTimeout(timer);
			}
		);
	});

	pTimeout.exports = pTimeout$1;
	// TODO: Remove this for the next major release
	pTimeout.exports.default = pTimeout$1;

	pTimeout.exports.TimeoutError = TimeoutError;
	return pTimeout.exports;
}

var priorityQueue = {};

var lowerBound = {};

var hasRequiredLowerBound;

function requireLowerBound () {
	if (hasRequiredLowerBound) return lowerBound;
	hasRequiredLowerBound = 1;
	Object.defineProperty(lowerBound, "__esModule", { value: true });
	// Port of lower_bound from https://en.cppreference.com/w/cpp/algorithm/lower_bound
	// Used to compute insertion index to keep queue sorted after insertion
	function lowerBound$1(array, value, comparator) {
	    let first = 0;
	    let count = array.length;
	    while (count > 0) {
	        const step = (count / 2) | 0;
	        let it = first + step;
	        if (comparator(array[it], value) <= 0) {
	            first = ++it;
	            count -= step + 1;
	        }
	        else {
	            count = step;
	        }
	    }
	    return first;
	}
	lowerBound.default = lowerBound$1;
	return lowerBound;
}

var hasRequiredPriorityQueue;

function requirePriorityQueue () {
	if (hasRequiredPriorityQueue) return priorityQueue;
	hasRequiredPriorityQueue = 1;
	Object.defineProperty(priorityQueue, "__esModule", { value: true });
	const lower_bound_1 = requireLowerBound();
	class PriorityQueue {
	    constructor() {
	        this._queue = [];
	    }
	    enqueue(run, options) {
	        options = Object.assign({ priority: 0 }, options);
	        const element = {
	            priority: options.priority,
	            run
	        };
	        if (this.size && this._queue[this.size - 1].priority >= options.priority) {
	            this._queue.push(element);
	            return;
	        }
	        const index = lower_bound_1.default(this._queue, element, (a, b) => b.priority - a.priority);
	        this._queue.splice(index, 0, element);
	    }
	    dequeue() {
	        const item = this._queue.shift();
	        return item === null || item === void 0 ? void 0 : item.run;
	    }
	    filter(options) {
	        return this._queue.filter((element) => element.priority === options.priority).map((element) => element.run);
	    }
	    get size() {
	        return this._queue.length;
	    }
	}
	priorityQueue.default = PriorityQueue;
	return priorityQueue;
}

var hasRequiredDist;

function requireDist () {
	if (hasRequiredDist) return dist;
	hasRequiredDist = 1;
	Object.defineProperty(dist, "__esModule", { value: true });
	const EventEmitter = requireEventemitter3();
	const p_timeout_1 = requirePTimeout();
	const priority_queue_1 = requirePriorityQueue();
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const empty = () => { };
	const timeoutError = new p_timeout_1.TimeoutError();
	/**
	Promise queue with concurrency control.
	*/
	class PQueue extends EventEmitter {
	    constructor(options) {
	        var _a, _b, _c, _d;
	        super();
	        this._intervalCount = 0;
	        this._intervalEnd = 0;
	        this._pendingCount = 0;
	        this._resolveEmpty = empty;
	        this._resolveIdle = empty;
	        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	        options = Object.assign({ carryoverConcurrencyCount: false, intervalCap: Infinity, interval: 0, concurrency: Infinity, autoStart: true, queueClass: priority_queue_1.default }, options);
	        if (!(typeof options.intervalCap === 'number' && options.intervalCap >= 1)) {
	            throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${(_b = (_a = options.intervalCap) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ''}\` (${typeof options.intervalCap})`);
	        }
	        if (options.interval === undefined || !(Number.isFinite(options.interval) && options.interval >= 0)) {
	            throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${(_d = (_c = options.interval) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ''}\` (${typeof options.interval})`);
	        }
	        this._carryoverConcurrencyCount = options.carryoverConcurrencyCount;
	        this._isIntervalIgnored = options.intervalCap === Infinity || options.interval === 0;
	        this._intervalCap = options.intervalCap;
	        this._interval = options.interval;
	        this._queue = new options.queueClass();
	        this._queueClass = options.queueClass;
	        this.concurrency = options.concurrency;
	        this._timeout = options.timeout;
	        this._throwOnTimeout = options.throwOnTimeout === true;
	        this._isPaused = options.autoStart === false;
	    }
	    get _doesIntervalAllowAnother() {
	        return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
	    }
	    get _doesConcurrentAllowAnother() {
	        return this._pendingCount < this._concurrency;
	    }
	    _next() {
	        this._pendingCount--;
	        this._tryToStartAnother();
	        this.emit('next');
	    }
	    _resolvePromises() {
	        this._resolveEmpty();
	        this._resolveEmpty = empty;
	        if (this._pendingCount === 0) {
	            this._resolveIdle();
	            this._resolveIdle = empty;
	            this.emit('idle');
	        }
	    }
	    _onResumeInterval() {
	        this._onInterval();
	        this._initializeIntervalIfNeeded();
	        this._timeoutId = undefined;
	    }
	    _isIntervalPaused() {
	        const now = Date.now();
	        if (this._intervalId === undefined) {
	            const delay = this._intervalEnd - now;
	            if (delay < 0) {
	                // Act as the interval was done
	                // We don't need to resume it here because it will be resumed on line 160
	                this._intervalCount = (this._carryoverConcurrencyCount) ? this._pendingCount : 0;
	            }
	            else {
	                // Act as the interval is pending
	                if (this._timeoutId === undefined) {
	                    this._timeoutId = setTimeout(() => {
	                        this._onResumeInterval();
	                    }, delay);
	                }
	                return true;
	            }
	        }
	        return false;
	    }
	    _tryToStartAnother() {
	        if (this._queue.size === 0) {
	            // We can clear the interval ("pause")
	            // Because we can redo it later ("resume")
	            if (this._intervalId) {
	                clearInterval(this._intervalId);
	            }
	            this._intervalId = undefined;
	            this._resolvePromises();
	            return false;
	        }
	        if (!this._isPaused) {
	            const canInitializeInterval = !this._isIntervalPaused();
	            if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
	                const job = this._queue.dequeue();
	                if (!job) {
	                    return false;
	                }
	                this.emit('active');
	                job();
	                if (canInitializeInterval) {
	                    this._initializeIntervalIfNeeded();
	                }
	                return true;
	            }
	        }
	        return false;
	    }
	    _initializeIntervalIfNeeded() {
	        if (this._isIntervalIgnored || this._intervalId !== undefined) {
	            return;
	        }
	        this._intervalId = setInterval(() => {
	            this._onInterval();
	        }, this._interval);
	        this._intervalEnd = Date.now() + this._interval;
	    }
	    _onInterval() {
	        if (this._intervalCount === 0 && this._pendingCount === 0 && this._intervalId) {
	            clearInterval(this._intervalId);
	            this._intervalId = undefined;
	        }
	        this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
	        this._processQueue();
	    }
	    /**
	    Executes all queued functions until it reaches the limit.
	    */
	    _processQueue() {
	        // eslint-disable-next-line no-empty
	        while (this._tryToStartAnother()) { }
	    }
	    get concurrency() {
	        return this._concurrency;
	    }
	    set concurrency(newConcurrency) {
	        if (!(typeof newConcurrency === 'number' && newConcurrency >= 1)) {
	            throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${newConcurrency}\` (${typeof newConcurrency})`);
	        }
	        this._concurrency = newConcurrency;
	        this._processQueue();
	    }
	    /**
	    Adds a sync or async task to the queue. Always returns a promise.
	    */
	    async add(fn, options = {}) {
	        return new Promise((resolve, reject) => {
	            const run = async () => {
	                this._pendingCount++;
	                this._intervalCount++;
	                try {
	                    const operation = (this._timeout === undefined && options.timeout === undefined) ? fn() : p_timeout_1.default(Promise.resolve(fn()), (options.timeout === undefined ? this._timeout : options.timeout), () => {
	                        if (options.throwOnTimeout === undefined ? this._throwOnTimeout : options.throwOnTimeout) {
	                            reject(timeoutError);
	                        }
	                        return undefined;
	                    });
	                    resolve(await operation);
	                }
	                catch (error) {
	                    reject(error);
	                }
	                this._next();
	            };
	            this._queue.enqueue(run, options);
	            this._tryToStartAnother();
	            this.emit('add');
	        });
	    }
	    /**
	    Same as `.add()`, but accepts an array of sync or async functions.

	    @returns A promise that resolves when all functions are resolved.
	    */
	    async addAll(functions, options) {
	        return Promise.all(functions.map(async (function_) => this.add(function_, options)));
	    }
	    /**
	    Start (or resume) executing enqueued tasks within concurrency limit. No need to call this if queue is not paused (via `options.autoStart = false` or by `.pause()` method.)
	    */
	    start() {
	        if (!this._isPaused) {
	            return this;
	        }
	        this._isPaused = false;
	        this._processQueue();
	        return this;
	    }
	    /**
	    Put queue execution on hold.
	    */
	    pause() {
	        this._isPaused = true;
	    }
	    /**
	    Clear the queue.
	    */
	    clear() {
	        this._queue = new this._queueClass();
	    }
	    /**
	    Can be called multiple times. Useful if you for example add additional items at a later time.

	    @returns A promise that settles when the queue becomes empty.
	    */
	    async onEmpty() {
	        // Instantly resolve if the queue is empty
	        if (this._queue.size === 0) {
	            return;
	        }
	        return new Promise(resolve => {
	            const existingResolve = this._resolveEmpty;
	            this._resolveEmpty = () => {
	                existingResolve();
	                resolve();
	            };
	        });
	    }
	    /**
	    The difference with `.onEmpty` is that `.onIdle` guarantees that all work from the queue has finished. `.onEmpty` merely signals that the queue is empty, but it could mean that some promises haven't completed yet.

	    @returns A promise that settles when the queue becomes empty, and all promises have completed; `queue.size === 0 && queue.pending === 0`.
	    */
	    async onIdle() {
	        // Instantly resolve if none pending and if nothing else is queued
	        if (this._pendingCount === 0 && this._queue.size === 0) {
	            return;
	        }
	        return new Promise(resolve => {
	            const existingResolve = this._resolveIdle;
	            this._resolveIdle = () => {
	                existingResolve();
	                resolve();
	            };
	        });
	    }
	    /**
	    Size of the queue.
	    */
	    get size() {
	        return this._queue.size;
	    }
	    /**
	    Size of the queue, filtered by the given options.

	    For example, this can be used to find the number of items remaining in the queue with a specific priority level.
	    */
	    sizeBy(options) {
	        // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
	        return this._queue.filter(options).length;
	    }
	    /**
	    Number of pending promises.
	    */
	    get pending() {
	        return this._pendingCount;
	    }
	    /**
	    Whether the queue is currently paused.
	    */
	    get isPaused() {
	        return this._isPaused;
	    }
	    get timeout() {
	        return this._timeout;
	    }
	    /**
	    Set the timeout for future operations.
	    */
	    set timeout(milliseconds) {
	        this._timeout = milliseconds;
	    }
	}
	dist.default = PQueue;
	return dist;
}

requireDist();

var re = {exports: {}};

var constants;
var hasRequiredConstants;

function requireConstants () {
	if (hasRequiredConstants) return constants;
	hasRequiredConstants = 1;

	// Note: this is the semver.org version of the spec that it implements
	// Not necessarily the package version of this code.
	const SEMVER_SPEC_VERSION = '2.0.0';

	const MAX_LENGTH = 256;
	const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
	/* istanbul ignore next */ 9007199254740991;

	// Max safe segment length for coercion.
	const MAX_SAFE_COMPONENT_LENGTH = 16;

	// Max safe length for a build identifier. The max length minus 6 characters for
	// the shortest version with a build 0.0.0+BUILD.
	const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;

	const RELEASE_TYPES = [
	  'major',
	  'premajor',
	  'minor',
	  'preminor',
	  'patch',
	  'prepatch',
	  'prerelease',
	];

	constants = {
	  MAX_LENGTH,
	  MAX_SAFE_COMPONENT_LENGTH,
	  MAX_SAFE_BUILD_LENGTH,
	  MAX_SAFE_INTEGER,
	  RELEASE_TYPES,
	  SEMVER_SPEC_VERSION,
	  FLAG_INCLUDE_PRERELEASE: 0b001,
	  FLAG_LOOSE: 0b010,
	};
	return constants;
}

var debug_1;
var hasRequiredDebug;

function requireDebug () {
	if (hasRequiredDebug) return debug_1;
	hasRequiredDebug = 1;

	const debug = (
	  typeof process === 'object' &&
	  process.env &&
	  process.env.NODE_DEBUG &&
	  /\bsemver\b/i.test(process.env.NODE_DEBUG)
	) ? (...args) => console.error('SEMVER', ...args)
	  : () => {};

	debug_1 = debug;
	return debug_1;
}

var hasRequiredRe;

function requireRe () {
	if (hasRequiredRe) return re.exports;
	hasRequiredRe = 1;
	(function (module, exports) {

		const {
		  MAX_SAFE_COMPONENT_LENGTH,
		  MAX_SAFE_BUILD_LENGTH,
		  MAX_LENGTH,
		} = requireConstants();
		const debug = requireDebug();
		exports = module.exports = {};

		// The actual regexps go on exports.re
		const re = exports.re = [];
		const safeRe = exports.safeRe = [];
		const src = exports.src = [];
		const safeSrc = exports.safeSrc = [];
		const t = exports.t = {};
		let R = 0;

		const LETTERDASHNUMBER = '[a-zA-Z0-9-]';

		// Replace some greedy regex tokens to prevent regex dos issues. These regex are
		// used internally via the safeRe object since all inputs in this library get
		// normalized first to trim and collapse all extra whitespace. The original
		// regexes are exported for userland consumption and lower level usage. A
		// future breaking change could export the safer regex only with a note that
		// all input should have extra whitespace removed.
		const safeRegexReplacements = [
		  ['\\s', 1],
		  ['\\d', MAX_LENGTH],
		  [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH],
		];

		const makeSafeRegex = (value) => {
		  for (const [token, max] of safeRegexReplacements) {
		    value = value
		      .split(`${token}*`).join(`${token}{0,${max}}`)
		      .split(`${token}+`).join(`${token}{1,${max}}`);
		  }
		  return value
		};

		const createToken = (name, value, isGlobal) => {
		  const safe = makeSafeRegex(value);
		  const index = R++;
		  debug(name, index, value);
		  t[name] = index;
		  src[index] = value;
		  safeSrc[index] = safe;
		  re[index] = new RegExp(value, isGlobal ? 'g' : undefined);
		  safeRe[index] = new RegExp(safe, isGlobal ? 'g' : undefined);
		};

		// The following Regular Expressions can be used for tokenizing,
		// validating, and parsing SemVer version strings.

		// ## Numeric Identifier
		// A single `0`, or a non-zero digit followed by zero or more digits.

		createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*');
		createToken('NUMERICIDENTIFIERLOOSE', '\\d+');

		// ## Non-numeric Identifier
		// Zero or more digits, followed by a letter or hyphen, and then zero or
		// more letters, digits, or hyphens.

		createToken('NONNUMERICIDENTIFIER', `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);

		// ## Main Version
		// Three dot-separated numeric identifiers.

		createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
		                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
		                   `(${src[t.NUMERICIDENTIFIER]})`);

		createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
		                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
		                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`);

		// ## Pre-release Version Identifier
		// A numeric identifier, or a non-numeric identifier.
		// Non-numberic identifiers include numberic identifiers but can be longer.
		// Therefore non-numberic identifiers must go first.

		createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NONNUMERICIDENTIFIER]
		}|${src[t.NUMERICIDENTIFIER]})`);

		createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NONNUMERICIDENTIFIER]
		}|${src[t.NUMERICIDENTIFIERLOOSE]})`);

		// ## Pre-release Version
		// Hyphen, followed by one or more dot-separated pre-release version
		// identifiers.

		createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
		}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);

		createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
		}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);

		// ## Build Metadata Identifier
		// Any combination of digits, letters, or hyphens.

		createToken('BUILDIDENTIFIER', `${LETTERDASHNUMBER}+`);

		// ## Build Metadata
		// Plus sign, followed by one or more period-separated build metadata
		// identifiers.

		createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
		}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);

		// ## Full Version String
		// A main version, followed optionally by a pre-release version and
		// build metadata.

		// Note that the only major, minor, patch, and pre-release sections of
		// the version string are capturing groups.  The build metadata is not a
		// capturing group, because it should not ever be used in version
		// comparison.

		createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
		}${src[t.PRERELEASE]}?${
		  src[t.BUILD]}?`);

		createToken('FULL', `^${src[t.FULLPLAIN]}$`);

		// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
		// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
		// common in the npm registry.
		createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
		}${src[t.PRERELEASELOOSE]}?${
		  src[t.BUILD]}?`);

		createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`);

		createToken('GTLT', '((?:<|>)?=?)');

		// Something like "2.*" or "1.2.x".
		// Note that "x.x" is a valid xRange identifer, meaning "any version"
		// Only the first item is strictly required.
		createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
		createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);

		createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
		                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
		                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
		                   `(?:${src[t.PRERELEASE]})?${
		                     src[t.BUILD]}?` +
		                   `)?)?`);

		createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
		                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
		                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
		                        `(?:${src[t.PRERELEASELOOSE]})?${
		                          src[t.BUILD]}?` +
		                        `)?)?`);

		createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
		createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);

		// Coercion.
		// Extract anything that could conceivably be a part of a valid semver
		createToken('COERCEPLAIN', `${'(^|[^\\d])' +
		              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
		              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
		              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
		createToken('COERCE', `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
		createToken('COERCEFULL', src[t.COERCEPLAIN] +
		              `(?:${src[t.PRERELEASE]})?` +
		              `(?:${src[t.BUILD]})?` +
		              `(?:$|[^\\d])`);
		createToken('COERCERTL', src[t.COERCE], true);
		createToken('COERCERTLFULL', src[t.COERCEFULL], true);

		// Tilde ranges.
		// Meaning is "reasonably at or greater than"
		createToken('LONETILDE', '(?:~>?)');

		createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true);
		exports.tildeTrimReplace = '$1~';

		createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
		createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);

		// Caret ranges.
		// Meaning is "at least and backwards compatible with"
		createToken('LONECARET', '(?:\\^)');

		createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true);
		exports.caretTrimReplace = '$1^';

		createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
		createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);

		// A simple gt/lt/eq thing, or just "" to indicate "any version"
		createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
		createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);

		// An expression to strip any whitespace between the gtlt and the thing
		// it modifies, so that `> 1.2.3` ==> `>1.2.3`
		createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
		}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
		exports.comparatorTrimReplace = '$1$2$3';

		// Something like `1.2.3 - 1.2.4`
		// Note that these all use the loose form, because they'll be
		// checked against either the strict or loose comparator form
		// later.
		createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
		                   `\\s+-\\s+` +
		                   `(${src[t.XRANGEPLAIN]})` +
		                   `\\s*$`);

		createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
		                        `\\s+-\\s+` +
		                        `(${src[t.XRANGEPLAINLOOSE]})` +
		                        `\\s*$`);

		// Star ranges basically just allow anything at all.
		createToken('STAR', '(<|>)?=?\\s*\\*');
		// >=0.0.0 is like a star
		createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$');
		createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$'); 
	} (re, re.exports));
	return re.exports;
}

var parseOptions_1;
var hasRequiredParseOptions;

function requireParseOptions () {
	if (hasRequiredParseOptions) return parseOptions_1;
	hasRequiredParseOptions = 1;

	// parse out just the options we care about
	const looseOption = Object.freeze({ loose: true });
	const emptyOpts = Object.freeze({ });
	const parseOptions = options => {
	  if (!options) {
	    return emptyOpts
	  }

	  if (typeof options !== 'object') {
	    return looseOption
	  }

	  return options
	};
	parseOptions_1 = parseOptions;
	return parseOptions_1;
}

var identifiers;
var hasRequiredIdentifiers;

function requireIdentifiers () {
	if (hasRequiredIdentifiers) return identifiers;
	hasRequiredIdentifiers = 1;

	const numeric = /^[0-9]+$/;
	const compareIdentifiers = (a, b) => {
	  const anum = numeric.test(a);
	  const bnum = numeric.test(b);

	  if (anum && bnum) {
	    a = +a;
	    b = +b;
	  }

	  return a === b ? 0
	    : (anum && !bnum) ? -1
	    : (bnum && !anum) ? 1
	    : a < b ? -1
	    : 1
	};

	const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);

	identifiers = {
	  compareIdentifiers,
	  rcompareIdentifiers,
	};
	return identifiers;
}

var semver$1;
var hasRequiredSemver$1;

function requireSemver$1 () {
	if (hasRequiredSemver$1) return semver$1;
	hasRequiredSemver$1 = 1;

	const debug = requireDebug();
	const { MAX_LENGTH, MAX_SAFE_INTEGER } = requireConstants();
	const { safeRe: re, t } = requireRe();

	const parseOptions = requireParseOptions();
	const { compareIdentifiers } = requireIdentifiers();
	class SemVer {
	  constructor (version, options) {
	    options = parseOptions(options);

	    if (version instanceof SemVer) {
	      if (version.loose === !!options.loose &&
	        version.includePrerelease === !!options.includePrerelease) {
	        return version
	      } else {
	        version = version.version;
	      }
	    } else if (typeof version !== 'string') {
	      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`)
	    }

	    if (version.length > MAX_LENGTH) {
	      throw new TypeError(
	        `version is longer than ${MAX_LENGTH} characters`
	      )
	    }

	    debug('SemVer', version, options);
	    this.options = options;
	    this.loose = !!options.loose;
	    // this isn't actually relevant for versions, but keep it so that we
	    // don't run into trouble passing this.options around.
	    this.includePrerelease = !!options.includePrerelease;

	    const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);

	    if (!m) {
	      throw new TypeError(`Invalid Version: ${version}`)
	    }

	    this.raw = version;

	    // these are actually numbers
	    this.major = +m[1];
	    this.minor = +m[2];
	    this.patch = +m[3];

	    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
	      throw new TypeError('Invalid major version')
	    }

	    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
	      throw new TypeError('Invalid minor version')
	    }

	    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
	      throw new TypeError('Invalid patch version')
	    }

	    // numberify any prerelease numeric ids
	    if (!m[4]) {
	      this.prerelease = [];
	    } else {
	      this.prerelease = m[4].split('.').map((id) => {
	        if (/^[0-9]+$/.test(id)) {
	          const num = +id;
	          if (num >= 0 && num < MAX_SAFE_INTEGER) {
	            return num
	          }
	        }
	        return id
	      });
	    }

	    this.build = m[5] ? m[5].split('.') : [];
	    this.format();
	  }

	  format () {
	    this.version = `${this.major}.${this.minor}.${this.patch}`;
	    if (this.prerelease.length) {
	      this.version += `-${this.prerelease.join('.')}`;
	    }
	    return this.version
	  }

	  toString () {
	    return this.version
	  }

	  compare (other) {
	    debug('SemVer.compare', this.version, this.options, other);
	    if (!(other instanceof SemVer)) {
	      if (typeof other === 'string' && other === this.version) {
	        return 0
	      }
	      other = new SemVer(other, this.options);
	    }

	    if (other.version === this.version) {
	      return 0
	    }

	    return this.compareMain(other) || this.comparePre(other)
	  }

	  compareMain (other) {
	    if (!(other instanceof SemVer)) {
	      other = new SemVer(other, this.options);
	    }

	    return (
	      compareIdentifiers(this.major, other.major) ||
	      compareIdentifiers(this.minor, other.minor) ||
	      compareIdentifiers(this.patch, other.patch)
	    )
	  }

	  comparePre (other) {
	    if (!(other instanceof SemVer)) {
	      other = new SemVer(other, this.options);
	    }

	    // NOT having a prerelease is > having one
	    if (this.prerelease.length && !other.prerelease.length) {
	      return -1
	    } else if (!this.prerelease.length && other.prerelease.length) {
	      return 1
	    } else if (!this.prerelease.length && !other.prerelease.length) {
	      return 0
	    }

	    let i = 0;
	    do {
	      const a = this.prerelease[i];
	      const b = other.prerelease[i];
	      debug('prerelease compare', i, a, b);
	      if (a === undefined && b === undefined) {
	        return 0
	      } else if (b === undefined) {
	        return 1
	      } else if (a === undefined) {
	        return -1
	      } else if (a === b) {
	        continue
	      } else {
	        return compareIdentifiers(a, b)
	      }
	    } while (++i)
	  }

	  compareBuild (other) {
	    if (!(other instanceof SemVer)) {
	      other = new SemVer(other, this.options);
	    }

	    let i = 0;
	    do {
	      const a = this.build[i];
	      const b = other.build[i];
	      debug('build compare', i, a, b);
	      if (a === undefined && b === undefined) {
	        return 0
	      } else if (b === undefined) {
	        return 1
	      } else if (a === undefined) {
	        return -1
	      } else if (a === b) {
	        continue
	      } else {
	        return compareIdentifiers(a, b)
	      }
	    } while (++i)
	  }

	  // preminor will bump the version up to the next minor release, and immediately
	  // down to pre-release. premajor and prepatch work the same way.
	  inc (release, identifier, identifierBase) {
	    if (release.startsWith('pre')) {
	      if (!identifier && identifierBase === false) {
	        throw new Error('invalid increment argument: identifier is empty')
	      }
	      // Avoid an invalid semver results
	      if (identifier) {
	        const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
	        if (!match || match[1] !== identifier) {
	          throw new Error(`invalid identifier: ${identifier}`)
	        }
	      }
	    }

	    switch (release) {
	      case 'premajor':
	        this.prerelease.length = 0;
	        this.patch = 0;
	        this.minor = 0;
	        this.major++;
	        this.inc('pre', identifier, identifierBase);
	        break
	      case 'preminor':
	        this.prerelease.length = 0;
	        this.patch = 0;
	        this.minor++;
	        this.inc('pre', identifier, identifierBase);
	        break
	      case 'prepatch':
	        // If this is already a prerelease, it will bump to the next version
	        // drop any prereleases that might already exist, since they are not
	        // relevant at this point.
	        this.prerelease.length = 0;
	        this.inc('patch', identifier, identifierBase);
	        this.inc('pre', identifier, identifierBase);
	        break
	      // If the input is a non-prerelease version, this acts the same as
	      // prepatch.
	      case 'prerelease':
	        if (this.prerelease.length === 0) {
	          this.inc('patch', identifier, identifierBase);
	        }
	        this.inc('pre', identifier, identifierBase);
	        break
	      case 'release':
	        if (this.prerelease.length === 0) {
	          throw new Error(`version ${this.raw} is not a prerelease`)
	        }
	        this.prerelease.length = 0;
	        break

	      case 'major':
	        // If this is a pre-major version, bump up to the same major version.
	        // Otherwise increment major.
	        // 1.0.0-5 bumps to 1.0.0
	        // 1.1.0 bumps to 2.0.0
	        if (
	          this.minor !== 0 ||
	          this.patch !== 0 ||
	          this.prerelease.length === 0
	        ) {
	          this.major++;
	        }
	        this.minor = 0;
	        this.patch = 0;
	        this.prerelease = [];
	        break
	      case 'minor':
	        // If this is a pre-minor version, bump up to the same minor version.
	        // Otherwise increment minor.
	        // 1.2.0-5 bumps to 1.2.0
	        // 1.2.1 bumps to 1.3.0
	        if (this.patch !== 0 || this.prerelease.length === 0) {
	          this.minor++;
	        }
	        this.patch = 0;
	        this.prerelease = [];
	        break
	      case 'patch':
	        // If this is not a pre-release version, it will increment the patch.
	        // If it is a pre-release it will bump up to the same patch version.
	        // 1.2.0-5 patches to 1.2.0
	        // 1.2.0 patches to 1.2.1
	        if (this.prerelease.length === 0) {
	          this.patch++;
	        }
	        this.prerelease = [];
	        break
	      // This probably shouldn't be used publicly.
	      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
	      case 'pre': {
	        const base = Number(identifierBase) ? 1 : 0;

	        if (this.prerelease.length === 0) {
	          this.prerelease = [base];
	        } else {
	          let i = this.prerelease.length;
	          while (--i >= 0) {
	            if (typeof this.prerelease[i] === 'number') {
	              this.prerelease[i]++;
	              i = -2;
	            }
	          }
	          if (i === -1) {
	            // didn't increment anything
	            if (identifier === this.prerelease.join('.') && identifierBase === false) {
	              throw new Error('invalid increment argument: identifier already exists')
	            }
	            this.prerelease.push(base);
	          }
	        }
	        if (identifier) {
	          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
	          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
	          let prerelease = [identifier, base];
	          if (identifierBase === false) {
	            prerelease = [identifier];
	          }
	          if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
	            if (isNaN(this.prerelease[1])) {
	              this.prerelease = prerelease;
	            }
	          } else {
	            this.prerelease = prerelease;
	          }
	        }
	        break
	      }
	      default:
	        throw new Error(`invalid increment argument: ${release}`)
	    }
	    this.raw = this.format();
	    if (this.build.length) {
	      this.raw += `+${this.build.join('.')}`;
	    }
	    return this
	  }
	}

	semver$1 = SemVer;
	return semver$1;
}

var parse_1;
var hasRequiredParse;

function requireParse () {
	if (hasRequiredParse) return parse_1;
	hasRequiredParse = 1;

	const SemVer = requireSemver$1();
	const parse = (version, options, throwErrors = false) => {
	  if (version instanceof SemVer) {
	    return version
	  }
	  try {
	    return new SemVer(version, options)
	  } catch (er) {
	    if (!throwErrors) {
	      return null
	    }
	    throw er
	  }
	};

	parse_1 = parse;
	return parse_1;
}

var valid_1;
var hasRequiredValid$1;

function requireValid$1 () {
	if (hasRequiredValid$1) return valid_1;
	hasRequiredValid$1 = 1;

	const parse = requireParse();
	const valid = (version, options) => {
	  const v = parse(version, options);
	  return v ? v.version : null
	};
	valid_1 = valid;
	return valid_1;
}

var clean_1;
var hasRequiredClean;

function requireClean () {
	if (hasRequiredClean) return clean_1;
	hasRequiredClean = 1;

	const parse = requireParse();
	const clean = (version, options) => {
	  const s = parse(version.trim().replace(/^[=v]+/, ''), options);
	  return s ? s.version : null
	};
	clean_1 = clean;
	return clean_1;
}

var inc_1;
var hasRequiredInc;

function requireInc () {
	if (hasRequiredInc) return inc_1;
	hasRequiredInc = 1;

	const SemVer = requireSemver$1();

	const inc = (version, release, options, identifier, identifierBase) => {
	  if (typeof (options) === 'string') {
	    identifierBase = identifier;
	    identifier = options;
	    options = undefined;
	  }

	  try {
	    return new SemVer(
	      version instanceof SemVer ? version.version : version,
	      options
	    ).inc(release, identifier, identifierBase).version
	  } catch (er) {
	    return null
	  }
	};
	inc_1 = inc;
	return inc_1;
}

var diff_1;
var hasRequiredDiff;

function requireDiff () {
	if (hasRequiredDiff) return diff_1;
	hasRequiredDiff = 1;

	const parse = requireParse();

	const diff = (version1, version2) => {
	  const v1 = parse(version1, null, true);
	  const v2 = parse(version2, null, true);
	  const comparison = v1.compare(v2);

	  if (comparison === 0) {
	    return null
	  }

	  const v1Higher = comparison > 0;
	  const highVersion = v1Higher ? v1 : v2;
	  const lowVersion = v1Higher ? v2 : v1;
	  const highHasPre = !!highVersion.prerelease.length;
	  const lowHasPre = !!lowVersion.prerelease.length;

	  if (lowHasPre && !highHasPre) {
	    // Going from prerelease -> no prerelease requires some special casing

	    // If the low version has only a major, then it will always be a major
	    // Some examples:
	    // 1.0.0-1 -> 1.0.0
	    // 1.0.0-1 -> 1.1.1
	    // 1.0.0-1 -> 2.0.0
	    if (!lowVersion.patch && !lowVersion.minor) {
	      return 'major'
	    }

	    // If the main part has no difference
	    if (lowVersion.compareMain(highVersion) === 0) {
	      if (lowVersion.minor && !lowVersion.patch) {
	        return 'minor'
	      }
	      return 'patch'
	    }
	  }

	  // add the `pre` prefix if we are going to a prerelease version
	  const prefix = highHasPre ? 'pre' : '';

	  if (v1.major !== v2.major) {
	    return prefix + 'major'
	  }

	  if (v1.minor !== v2.minor) {
	    return prefix + 'minor'
	  }

	  if (v1.patch !== v2.patch) {
	    return prefix + 'patch'
	  }

	  // high and low are preleases
	  return 'prerelease'
	};

	diff_1 = diff;
	return diff_1;
}

var major_1;
var hasRequiredMajor;

function requireMajor () {
	if (hasRequiredMajor) return major_1;
	hasRequiredMajor = 1;

	const SemVer = requireSemver$1();
	const major = (a, loose) => new SemVer(a, loose).major;
	major_1 = major;
	return major_1;
}

var minor_1;
var hasRequiredMinor;

function requireMinor () {
	if (hasRequiredMinor) return minor_1;
	hasRequiredMinor = 1;

	const SemVer = requireSemver$1();
	const minor = (a, loose) => new SemVer(a, loose).minor;
	minor_1 = minor;
	return minor_1;
}

var patch_1;
var hasRequiredPatch;

function requirePatch () {
	if (hasRequiredPatch) return patch_1;
	hasRequiredPatch = 1;

	const SemVer = requireSemver$1();
	const patch = (a, loose) => new SemVer(a, loose).patch;
	patch_1 = patch;
	return patch_1;
}

var prerelease_1;
var hasRequiredPrerelease;

function requirePrerelease () {
	if (hasRequiredPrerelease) return prerelease_1;
	hasRequiredPrerelease = 1;

	const parse = requireParse();
	const prerelease = (version, options) => {
	  const parsed = parse(version, options);
	  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
	};
	prerelease_1 = prerelease;
	return prerelease_1;
}

var compare_1;
var hasRequiredCompare;

function requireCompare () {
	if (hasRequiredCompare) return compare_1;
	hasRequiredCompare = 1;

	const SemVer = requireSemver$1();
	const compare = (a, b, loose) =>
	  new SemVer(a, loose).compare(new SemVer(b, loose));

	compare_1 = compare;
	return compare_1;
}

var rcompare_1;
var hasRequiredRcompare;

function requireRcompare () {
	if (hasRequiredRcompare) return rcompare_1;
	hasRequiredRcompare = 1;

	const compare = requireCompare();
	const rcompare = (a, b, loose) => compare(b, a, loose);
	rcompare_1 = rcompare;
	return rcompare_1;
}

var compareLoose_1;
var hasRequiredCompareLoose;

function requireCompareLoose () {
	if (hasRequiredCompareLoose) return compareLoose_1;
	hasRequiredCompareLoose = 1;

	const compare = requireCompare();
	const compareLoose = (a, b) => compare(a, b, true);
	compareLoose_1 = compareLoose;
	return compareLoose_1;
}

var compareBuild_1;
var hasRequiredCompareBuild;

function requireCompareBuild () {
	if (hasRequiredCompareBuild) return compareBuild_1;
	hasRequiredCompareBuild = 1;

	const SemVer = requireSemver$1();
	const compareBuild = (a, b, loose) => {
	  const versionA = new SemVer(a, loose);
	  const versionB = new SemVer(b, loose);
	  return versionA.compare(versionB) || versionA.compareBuild(versionB)
	};
	compareBuild_1 = compareBuild;
	return compareBuild_1;
}

var sort_1;
var hasRequiredSort;

function requireSort () {
	if (hasRequiredSort) return sort_1;
	hasRequiredSort = 1;

	const compareBuild = requireCompareBuild();
	const sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
	sort_1 = sort;
	return sort_1;
}

var rsort_1;
var hasRequiredRsort;

function requireRsort () {
	if (hasRequiredRsort) return rsort_1;
	hasRequiredRsort = 1;

	const compareBuild = requireCompareBuild();
	const rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
	rsort_1 = rsort;
	return rsort_1;
}

var gt_1;
var hasRequiredGt;

function requireGt () {
	if (hasRequiredGt) return gt_1;
	hasRequiredGt = 1;

	const compare = requireCompare();
	const gt = (a, b, loose) => compare(a, b, loose) > 0;
	gt_1 = gt;
	return gt_1;
}

var lt_1;
var hasRequiredLt;

function requireLt () {
	if (hasRequiredLt) return lt_1;
	hasRequiredLt = 1;

	const compare = requireCompare();
	const lt = (a, b, loose) => compare(a, b, loose) < 0;
	lt_1 = lt;
	return lt_1;
}

var eq_1;
var hasRequiredEq;

function requireEq () {
	if (hasRequiredEq) return eq_1;
	hasRequiredEq = 1;

	const compare = requireCompare();
	const eq = (a, b, loose) => compare(a, b, loose) === 0;
	eq_1 = eq;
	return eq_1;
}

var neq_1;
var hasRequiredNeq;

function requireNeq () {
	if (hasRequiredNeq) return neq_1;
	hasRequiredNeq = 1;

	const compare = requireCompare();
	const neq = (a, b, loose) => compare(a, b, loose) !== 0;
	neq_1 = neq;
	return neq_1;
}

var gte_1;
var hasRequiredGte;

function requireGte () {
	if (hasRequiredGte) return gte_1;
	hasRequiredGte = 1;

	const compare = requireCompare();
	const gte = (a, b, loose) => compare(a, b, loose) >= 0;
	gte_1 = gte;
	return gte_1;
}

var lte_1;
var hasRequiredLte;

function requireLte () {
	if (hasRequiredLte) return lte_1;
	hasRequiredLte = 1;

	const compare = requireCompare();
	const lte = (a, b, loose) => compare(a, b, loose) <= 0;
	lte_1 = lte;
	return lte_1;
}

var cmp_1;
var hasRequiredCmp;

function requireCmp () {
	if (hasRequiredCmp) return cmp_1;
	hasRequiredCmp = 1;

	const eq = requireEq();
	const neq = requireNeq();
	const gt = requireGt();
	const gte = requireGte();
	const lt = requireLt();
	const lte = requireLte();

	const cmp = (a, op, b, loose) => {
	  switch (op) {
	    case '===':
	      if (typeof a === 'object') {
	        a = a.version;
	      }
	      if (typeof b === 'object') {
	        b = b.version;
	      }
	      return a === b

	    case '!==':
	      if (typeof a === 'object') {
	        a = a.version;
	      }
	      if (typeof b === 'object') {
	        b = b.version;
	      }
	      return a !== b

	    case '':
	    case '=':
	    case '==':
	      return eq(a, b, loose)

	    case '!=':
	      return neq(a, b, loose)

	    case '>':
	      return gt(a, b, loose)

	    case '>=':
	      return gte(a, b, loose)

	    case '<':
	      return lt(a, b, loose)

	    case '<=':
	      return lte(a, b, loose)

	    default:
	      throw new TypeError(`Invalid operator: ${op}`)
	  }
	};
	cmp_1 = cmp;
	return cmp_1;
}

var coerce_1;
var hasRequiredCoerce;

function requireCoerce () {
	if (hasRequiredCoerce) return coerce_1;
	hasRequiredCoerce = 1;

	const SemVer = requireSemver$1();
	const parse = requireParse();
	const { safeRe: re, t } = requireRe();

	const coerce = (version, options) => {
	  if (version instanceof SemVer) {
	    return version
	  }

	  if (typeof version === 'number') {
	    version = String(version);
	  }

	  if (typeof version !== 'string') {
	    return null
	  }

	  options = options || {};

	  let match = null;
	  if (!options.rtl) {
	    match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
	  } else {
	    // Find the right-most coercible string that does not share
	    // a terminus with a more left-ward coercible string.
	    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
	    // With includePrerelease option set, '1.2.3.4-rc' wants to coerce '2.3.4-rc', not '2.3.4'
	    //
	    // Walk through the string checking with a /g regexp
	    // Manually set the index so as to pick up overlapping matches.
	    // Stop when we get a match that ends at the string end, since no
	    // coercible string can be more right-ward without the same terminus.
	    const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
	    let next;
	    while ((next = coerceRtlRegex.exec(version)) &&
	        (!match || match.index + match[0].length !== version.length)
	    ) {
	      if (!match ||
	            next.index + next[0].length !== match.index + match[0].length) {
	        match = next;
	      }
	      coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
	    }
	    // leave it in a clean state
	    coerceRtlRegex.lastIndex = -1;
	  }

	  if (match === null) {
	    return null
	  }

	  const major = match[2];
	  const minor = match[3] || '0';
	  const patch = match[4] || '0';
	  const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : '';
	  const build = options.includePrerelease && match[6] ? `+${match[6]}` : '';

	  return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options)
	};
	coerce_1 = coerce;
	return coerce_1;
}

var lrucache;
var hasRequiredLrucache;

function requireLrucache () {
	if (hasRequiredLrucache) return lrucache;
	hasRequiredLrucache = 1;

	class LRUCache {
	  constructor () {
	    this.max = 1000;
	    this.map = new Map();
	  }

	  get (key) {
	    const value = this.map.get(key);
	    if (value === undefined) {
	      return undefined
	    } else {
	      // Remove the key from the map and add it to the end
	      this.map.delete(key);
	      this.map.set(key, value);
	      return value
	    }
	  }

	  delete (key) {
	    return this.map.delete(key)
	  }

	  set (key, value) {
	    const deleted = this.delete(key);

	    if (!deleted && value !== undefined) {
	      // If cache is full, delete the least recently used item
	      if (this.map.size >= this.max) {
	        const firstKey = this.map.keys().next().value;
	        this.delete(firstKey);
	      }

	      this.map.set(key, value);
	    }

	    return this
	  }
	}

	lrucache = LRUCache;
	return lrucache;
}

var range;
var hasRequiredRange;

function requireRange () {
	if (hasRequiredRange) return range;
	hasRequiredRange = 1;

	const SPACE_CHARACTERS = /\s+/g;

	// hoisted class for cyclic dependency
	class Range {
	  constructor (range, options) {
	    options = parseOptions(options);

	    if (range instanceof Range) {
	      if (
	        range.loose === !!options.loose &&
	        range.includePrerelease === !!options.includePrerelease
	      ) {
	        return range
	      } else {
	        return new Range(range.raw, options)
	      }
	    }

	    if (range instanceof Comparator) {
	      // just put it in the set and return
	      this.raw = range.value;
	      this.set = [[range]];
	      this.formatted = undefined;
	      return this
	    }

	    this.options = options;
	    this.loose = !!options.loose;
	    this.includePrerelease = !!options.includePrerelease;

	    // First reduce all whitespace as much as possible so we do not have to rely
	    // on potentially slow regexes like \s*. This is then stored and used for
	    // future error messages as well.
	    this.raw = range.trim().replace(SPACE_CHARACTERS, ' ');

	    // First, split on ||
	    this.set = this.raw
	      .split('||')
	      // map the range to a 2d array of comparators
	      .map(r => this.parseRange(r.trim()))
	      // throw out any comparator lists that are empty
	      // this generally means that it was not a valid range, which is allowed
	      // in loose mode, but will still throw if the WHOLE range is invalid.
	      .filter(c => c.length);

	    if (!this.set.length) {
	      throw new TypeError(`Invalid SemVer Range: ${this.raw}`)
	    }

	    // if we have any that are not the null set, throw out null sets.
	    if (this.set.length > 1) {
	      // keep the first one, in case they're all null sets
	      const first = this.set[0];
	      this.set = this.set.filter(c => !isNullSet(c[0]));
	      if (this.set.length === 0) {
	        this.set = [first];
	      } else if (this.set.length > 1) {
	        // if we have any that are *, then the range is just *
	        for (const c of this.set) {
	          if (c.length === 1 && isAny(c[0])) {
	            this.set = [c];
	            break
	          }
	        }
	      }
	    }

	    this.formatted = undefined;
	  }

	  get range () {
	    if (this.formatted === undefined) {
	      this.formatted = '';
	      for (let i = 0; i < this.set.length; i++) {
	        if (i > 0) {
	          this.formatted += '||';
	        }
	        const comps = this.set[i];
	        for (let k = 0; k < comps.length; k++) {
	          if (k > 0) {
	            this.formatted += ' ';
	          }
	          this.formatted += comps[k].toString().trim();
	        }
	      }
	    }
	    return this.formatted
	  }

	  format () {
	    return this.range
	  }

	  toString () {
	    return this.range
	  }

	  parseRange (range) {
	    // memoize range parsing for performance.
	    // this is a very hot path, and fully deterministic.
	    const memoOpts =
	      (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) |
	      (this.options.loose && FLAG_LOOSE);
	    const memoKey = memoOpts + ':' + range;
	    const cached = cache.get(memoKey);
	    if (cached) {
	      return cached
	    }

	    const loose = this.options.loose;
	    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
	    const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
	    range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
	    debug('hyphen replace', range);

	    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
	    range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
	    debug('comparator trim', range);

	    // `~ 1.2.3` => `~1.2.3`
	    range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
	    debug('tilde trim', range);

	    // `^ 1.2.3` => `^1.2.3`
	    range = range.replace(re[t.CARETTRIM], caretTrimReplace);
	    debug('caret trim', range);

	    // At this point, the range is completely trimmed and
	    // ready to be split into comparators.

	    let rangeList = range
	      .split(' ')
	      .map(comp => parseComparator(comp, this.options))
	      .join(' ')
	      .split(/\s+/)
	      // >=0.0.0 is equivalent to *
	      .map(comp => replaceGTE0(comp, this.options));

	    if (loose) {
	      // in loose mode, throw out any that are not valid comparators
	      rangeList = rangeList.filter(comp => {
	        debug('loose invalid filter', comp, this.options);
	        return !!comp.match(re[t.COMPARATORLOOSE])
	      });
	    }
	    debug('range list', rangeList);

	    // if any comparators are the null set, then replace with JUST null set
	    // if more than one comparator, remove any * comparators
	    // also, don't include the same comparator more than once
	    const rangeMap = new Map();
	    const comparators = rangeList.map(comp => new Comparator(comp, this.options));
	    for (const comp of comparators) {
	      if (isNullSet(comp)) {
	        return [comp]
	      }
	      rangeMap.set(comp.value, comp);
	    }
	    if (rangeMap.size > 1 && rangeMap.has('')) {
	      rangeMap.delete('');
	    }

	    const result = [...rangeMap.values()];
	    cache.set(memoKey, result);
	    return result
	  }

	  intersects (range, options) {
	    if (!(range instanceof Range)) {
	      throw new TypeError('a Range is required')
	    }

	    return this.set.some((thisComparators) => {
	      return (
	        isSatisfiable(thisComparators, options) &&
	        range.set.some((rangeComparators) => {
	          return (
	            isSatisfiable(rangeComparators, options) &&
	            thisComparators.every((thisComparator) => {
	              return rangeComparators.every((rangeComparator) => {
	                return thisComparator.intersects(rangeComparator, options)
	              })
	            })
	          )
	        })
	      )
	    })
	  }

	  // if ANY of the sets match ALL of its comparators, then pass
	  test (version) {
	    if (!version) {
	      return false
	    }

	    if (typeof version === 'string') {
	      try {
	        version = new SemVer(version, this.options);
	      } catch (er) {
	        return false
	      }
	    }

	    for (let i = 0; i < this.set.length; i++) {
	      if (testSet(this.set[i], version, this.options)) {
	        return true
	      }
	    }
	    return false
	  }
	}

	range = Range;

	const LRU = requireLrucache();
	const cache = new LRU();

	const parseOptions = requireParseOptions();
	const Comparator = requireComparator();
	const debug = requireDebug();
	const SemVer = requireSemver$1();
	const {
	  safeRe: re,
	  t,
	  comparatorTrimReplace,
	  tildeTrimReplace,
	  caretTrimReplace,
	} = requireRe();
	const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = requireConstants();

	const isNullSet = c => c.value === '<0.0.0-0';
	const isAny = c => c.value === '';

	// take a set of comparators and determine whether there
	// exists a version which can satisfy it
	const isSatisfiable = (comparators, options) => {
	  let result = true;
	  const remainingComparators = comparators.slice();
	  let testComparator = remainingComparators.pop();

	  while (result && remainingComparators.length) {
	    result = remainingComparators.every((otherComparator) => {
	      return testComparator.intersects(otherComparator, options)
	    });

	    testComparator = remainingComparators.pop();
	  }

	  return result
	};

	// comprised of xranges, tildes, stars, and gtlt's at this point.
	// already replaced the hyphen ranges
	// turn into a set of JUST comparators.
	const parseComparator = (comp, options) => {
	  debug('comp', comp, options);
	  comp = replaceCarets(comp, options);
	  debug('caret', comp);
	  comp = replaceTildes(comp, options);
	  debug('tildes', comp);
	  comp = replaceXRanges(comp, options);
	  debug('xrange', comp);
	  comp = replaceStars(comp, options);
	  debug('stars', comp);
	  return comp
	};

	const isX = id => !id || id.toLowerCase() === 'x' || id === '*';

	// ~, ~> --> * (any, kinda silly)
	// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
	// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
	// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
	// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
	// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
	// ~0.0.1 --> >=0.0.1 <0.1.0-0
	const replaceTildes = (comp, options) => {
	  return comp
	    .trim()
	    .split(/\s+/)
	    .map((c) => replaceTilde(c, options))
	    .join(' ')
	};

	const replaceTilde = (comp, options) => {
	  const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
	  return comp.replace(r, (_, M, m, p, pr) => {
	    debug('tilde', comp, _, M, m, p, pr);
	    let ret;

	    if (isX(M)) {
	      ret = '';
	    } else if (isX(m)) {
	      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
	    } else if (isX(p)) {
	      // ~1.2 == >=1.2.0 <1.3.0-0
	      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
	    } else if (pr) {
	      debug('replaceTilde pr', pr);
	      ret = `>=${M}.${m}.${p}-${pr
	      } <${M}.${+m + 1}.0-0`;
	    } else {
	      // ~1.2.3 == >=1.2.3 <1.3.0-0
	      ret = `>=${M}.${m}.${p
	      } <${M}.${+m + 1}.0-0`;
	    }

	    debug('tilde return', ret);
	    return ret
	  })
	};

	// ^ --> * (any, kinda silly)
	// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
	// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
	// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
	// ^1.2.3 --> >=1.2.3 <2.0.0-0
	// ^1.2.0 --> >=1.2.0 <2.0.0-0
	// ^0.0.1 --> >=0.0.1 <0.0.2-0
	// ^0.1.0 --> >=0.1.0 <0.2.0-0
	const replaceCarets = (comp, options) => {
	  return comp
	    .trim()
	    .split(/\s+/)
	    .map((c) => replaceCaret(c, options))
	    .join(' ')
	};

	const replaceCaret = (comp, options) => {
	  debug('caret', comp, options);
	  const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
	  const z = options.includePrerelease ? '-0' : '';
	  return comp.replace(r, (_, M, m, p, pr) => {
	    debug('caret', comp, _, M, m, p, pr);
	    let ret;

	    if (isX(M)) {
	      ret = '';
	    } else if (isX(m)) {
	      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
	    } else if (isX(p)) {
	      if (M === '0') {
	        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
	      } else {
	        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
	      }
	    } else if (pr) {
	      debug('replaceCaret pr', pr);
	      if (M === '0') {
	        if (m === '0') {
	          ret = `>=${M}.${m}.${p}-${pr
	          } <${M}.${m}.${+p + 1}-0`;
	        } else {
	          ret = `>=${M}.${m}.${p}-${pr
	          } <${M}.${+m + 1}.0-0`;
	        }
	      } else {
	        ret = `>=${M}.${m}.${p}-${pr
	        } <${+M + 1}.0.0-0`;
	      }
	    } else {
	      debug('no pr');
	      if (M === '0') {
	        if (m === '0') {
	          ret = `>=${M}.${m}.${p
	          }${z} <${M}.${m}.${+p + 1}-0`;
	        } else {
	          ret = `>=${M}.${m}.${p
	          }${z} <${M}.${+m + 1}.0-0`;
	        }
	      } else {
	        ret = `>=${M}.${m}.${p
	        } <${+M + 1}.0.0-0`;
	      }
	    }

	    debug('caret return', ret);
	    return ret
	  })
	};

	const replaceXRanges = (comp, options) => {
	  debug('replaceXRanges', comp, options);
	  return comp
	    .split(/\s+/)
	    .map((c) => replaceXRange(c, options))
	    .join(' ')
	};

	const replaceXRange = (comp, options) => {
	  comp = comp.trim();
	  const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
	  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
	    debug('xRange', comp, ret, gtlt, M, m, p, pr);
	    const xM = isX(M);
	    const xm = xM || isX(m);
	    const xp = xm || isX(p);
	    const anyX = xp;

	    if (gtlt === '=' && anyX) {
	      gtlt = '';
	    }

	    // if we're including prereleases in the match, then we need
	    // to fix this to -0, the lowest possible prerelease value
	    pr = options.includePrerelease ? '-0' : '';

	    if (xM) {
	      if (gtlt === '>' || gtlt === '<') {
	        // nothing is allowed
	        ret = '<0.0.0-0';
	      } else {
	        // nothing is forbidden
	        ret = '*';
	      }
	    } else if (gtlt && anyX) {
	      // we know patch is an x, because we have any x at all.
	      // replace X with 0
	      if (xm) {
	        m = 0;
	      }
	      p = 0;

	      if (gtlt === '>') {
	        // >1 => >=2.0.0
	        // >1.2 => >=1.3.0
	        gtlt = '>=';
	        if (xm) {
	          M = +M + 1;
	          m = 0;
	          p = 0;
	        } else {
	          m = +m + 1;
	          p = 0;
	        }
	      } else if (gtlt === '<=') {
	        // <=0.7.x is actually <0.8.0, since any 0.7.x should
	        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
	        gtlt = '<';
	        if (xm) {
	          M = +M + 1;
	        } else {
	          m = +m + 1;
	        }
	      }

	      if (gtlt === '<') {
	        pr = '-0';
	      }

	      ret = `${gtlt + M}.${m}.${p}${pr}`;
	    } else if (xm) {
	      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
	    } else if (xp) {
	      ret = `>=${M}.${m}.0${pr
	      } <${M}.${+m + 1}.0-0`;
	    }

	    debug('xRange return', ret);

	    return ret
	  })
	};

	// Because * is AND-ed with everything else in the comparator,
	// and '' means "any version", just remove the *s entirely.
	const replaceStars = (comp, options) => {
	  debug('replaceStars', comp, options);
	  // Looseness is ignored here.  star is always as loose as it gets!
	  return comp
	    .trim()
	    .replace(re[t.STAR], '')
	};

	const replaceGTE0 = (comp, options) => {
	  debug('replaceGTE0', comp, options);
	  return comp
	    .trim()
	    .replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '')
	};

	// This function is passed to string.replace(re[t.HYPHENRANGE])
	// M, m, patch, prerelease, build
	// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
	// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
	// 1.2 - 3.4 => >=1.2.0 <3.5.0-0
	// TODO build?
	const hyphenReplace = incPr => ($0,
	  from, fM, fm, fp, fpr, fb,
	  to, tM, tm, tp, tpr) => {
	  if (isX(fM)) {
	    from = '';
	  } else if (isX(fm)) {
	    from = `>=${fM}.0.0${incPr ? '-0' : ''}`;
	  } else if (isX(fp)) {
	    from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`;
	  } else if (fpr) {
	    from = `>=${from}`;
	  } else {
	    from = `>=${from}${incPr ? '-0' : ''}`;
	  }

	  if (isX(tM)) {
	    to = '';
	  } else if (isX(tm)) {
	    to = `<${+tM + 1}.0.0-0`;
	  } else if (isX(tp)) {
	    to = `<${tM}.${+tm + 1}.0-0`;
	  } else if (tpr) {
	    to = `<=${tM}.${tm}.${tp}-${tpr}`;
	  } else if (incPr) {
	    to = `<${tM}.${tm}.${+tp + 1}-0`;
	  } else {
	    to = `<=${to}`;
	  }

	  return `${from} ${to}`.trim()
	};

	const testSet = (set, version, options) => {
	  for (let i = 0; i < set.length; i++) {
	    if (!set[i].test(version)) {
	      return false
	    }
	  }

	  if (version.prerelease.length && !options.includePrerelease) {
	    // Find the set of versions that are allowed to have prereleases
	    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
	    // That should allow `1.2.3-pr.2` to pass.
	    // However, `1.2.4-alpha.notready` should NOT be allowed,
	    // even though it's within the range set by the comparators.
	    for (let i = 0; i < set.length; i++) {
	      debug(set[i].semver);
	      if (set[i].semver === Comparator.ANY) {
	        continue
	      }

	      if (set[i].semver.prerelease.length > 0) {
	        const allowed = set[i].semver;
	        if (allowed.major === version.major &&
	            allowed.minor === version.minor &&
	            allowed.patch === version.patch) {
	          return true
	        }
	      }
	    }

	    // Version has a -pre, but it's not one of the ones we like.
	    return false
	  }

	  return true
	};
	return range;
}

var comparator;
var hasRequiredComparator;

function requireComparator () {
	if (hasRequiredComparator) return comparator;
	hasRequiredComparator = 1;

	const ANY = Symbol('SemVer ANY');
	// hoisted class for cyclic dependency
	class Comparator {
	  static get ANY () {
	    return ANY
	  }

	  constructor (comp, options) {
	    options = parseOptions(options);

	    if (comp instanceof Comparator) {
	      if (comp.loose === !!options.loose) {
	        return comp
	      } else {
	        comp = comp.value;
	      }
	    }

	    comp = comp.trim().split(/\s+/).join(' ');
	    debug('comparator', comp, options);
	    this.options = options;
	    this.loose = !!options.loose;
	    this.parse(comp);

	    if (this.semver === ANY) {
	      this.value = '';
	    } else {
	      this.value = this.operator + this.semver.version;
	    }

	    debug('comp', this);
	  }

	  parse (comp) {
	    const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
	    const m = comp.match(r);

	    if (!m) {
	      throw new TypeError(`Invalid comparator: ${comp}`)
	    }

	    this.operator = m[1] !== undefined ? m[1] : '';
	    if (this.operator === '=') {
	      this.operator = '';
	    }

	    // if it literally is just '>' or '' then allow anything.
	    if (!m[2]) {
	      this.semver = ANY;
	    } else {
	      this.semver = new SemVer(m[2], this.options.loose);
	    }
	  }

	  toString () {
	    return this.value
	  }

	  test (version) {
	    debug('Comparator.test', version, this.options.loose);

	    if (this.semver === ANY || version === ANY) {
	      return true
	    }

	    if (typeof version === 'string') {
	      try {
	        version = new SemVer(version, this.options);
	      } catch (er) {
	        return false
	      }
	    }

	    return cmp(version, this.operator, this.semver, this.options)
	  }

	  intersects (comp, options) {
	    if (!(comp instanceof Comparator)) {
	      throw new TypeError('a Comparator is required')
	    }

	    if (this.operator === '') {
	      if (this.value === '') {
	        return true
	      }
	      return new Range(comp.value, options).test(this.value)
	    } else if (comp.operator === '') {
	      if (comp.value === '') {
	        return true
	      }
	      return new Range(this.value, options).test(comp.semver)
	    }

	    options = parseOptions(options);

	    // Special cases where nothing can possibly be lower
	    if (options.includePrerelease &&
	      (this.value === '<0.0.0-0' || comp.value === '<0.0.0-0')) {
	      return false
	    }
	    if (!options.includePrerelease &&
	      (this.value.startsWith('<0.0.0') || comp.value.startsWith('<0.0.0'))) {
	      return false
	    }

	    // Same direction increasing (> or >=)
	    if (this.operator.startsWith('>') && comp.operator.startsWith('>')) {
	      return true
	    }
	    // Same direction decreasing (< or <=)
	    if (this.operator.startsWith('<') && comp.operator.startsWith('<')) {
	      return true
	    }
	    // same SemVer and both sides are inclusive (<= or >=)
	    if (
	      (this.semver.version === comp.semver.version) &&
	      this.operator.includes('=') && comp.operator.includes('=')) {
	      return true
	    }
	    // opposite directions less than
	    if (cmp(this.semver, '<', comp.semver, options) &&
	      this.operator.startsWith('>') && comp.operator.startsWith('<')) {
	      return true
	    }
	    // opposite directions greater than
	    if (cmp(this.semver, '>', comp.semver, options) &&
	      this.operator.startsWith('<') && comp.operator.startsWith('>')) {
	      return true
	    }
	    return false
	  }
	}

	comparator = Comparator;

	const parseOptions = requireParseOptions();
	const { safeRe: re, t } = requireRe();
	const cmp = requireCmp();
	const debug = requireDebug();
	const SemVer = requireSemver$1();
	const Range = requireRange();
	return comparator;
}

var satisfies_1;
var hasRequiredSatisfies;

function requireSatisfies () {
	if (hasRequiredSatisfies) return satisfies_1;
	hasRequiredSatisfies = 1;

	const Range = requireRange();
	const satisfies = (version, range, options) => {
	  try {
	    range = new Range(range, options);
	  } catch (er) {
	    return false
	  }
	  return range.test(version)
	};
	satisfies_1 = satisfies;
	return satisfies_1;
}

var toComparators_1;
var hasRequiredToComparators;

function requireToComparators () {
	if (hasRequiredToComparators) return toComparators_1;
	hasRequiredToComparators = 1;

	const Range = requireRange();

	// Mostly just for testing and legacy API reasons
	const toComparators = (range, options) =>
	  new Range(range, options).set
	    .map(comp => comp.map(c => c.value).join(' ').trim().split(' '));

	toComparators_1 = toComparators;
	return toComparators_1;
}

var maxSatisfying_1;
var hasRequiredMaxSatisfying;

function requireMaxSatisfying () {
	if (hasRequiredMaxSatisfying) return maxSatisfying_1;
	hasRequiredMaxSatisfying = 1;

	const SemVer = requireSemver$1();
	const Range = requireRange();

	const maxSatisfying = (versions, range, options) => {
	  let max = null;
	  let maxSV = null;
	  let rangeObj = null;
	  try {
	    rangeObj = new Range(range, options);
	  } catch (er) {
	    return null
	  }
	  versions.forEach((v) => {
	    if (rangeObj.test(v)) {
	      // satisfies(v, range, options)
	      if (!max || maxSV.compare(v) === -1) {
	        // compare(max, v, true)
	        max = v;
	        maxSV = new SemVer(max, options);
	      }
	    }
	  });
	  return max
	};
	maxSatisfying_1 = maxSatisfying;
	return maxSatisfying_1;
}

var minSatisfying_1;
var hasRequiredMinSatisfying;

function requireMinSatisfying () {
	if (hasRequiredMinSatisfying) return minSatisfying_1;
	hasRequiredMinSatisfying = 1;

	const SemVer = requireSemver$1();
	const Range = requireRange();
	const minSatisfying = (versions, range, options) => {
	  let min = null;
	  let minSV = null;
	  let rangeObj = null;
	  try {
	    rangeObj = new Range(range, options);
	  } catch (er) {
	    return null
	  }
	  versions.forEach((v) => {
	    if (rangeObj.test(v)) {
	      // satisfies(v, range, options)
	      if (!min || minSV.compare(v) === 1) {
	        // compare(min, v, true)
	        min = v;
	        minSV = new SemVer(min, options);
	      }
	    }
	  });
	  return min
	};
	minSatisfying_1 = minSatisfying;
	return minSatisfying_1;
}

var minVersion_1;
var hasRequiredMinVersion;

function requireMinVersion () {
	if (hasRequiredMinVersion) return minVersion_1;
	hasRequiredMinVersion = 1;

	const SemVer = requireSemver$1();
	const Range = requireRange();
	const gt = requireGt();

	const minVersion = (range, loose) => {
	  range = new Range(range, loose);

	  let minver = new SemVer('0.0.0');
	  if (range.test(minver)) {
	    return minver
	  }

	  minver = new SemVer('0.0.0-0');
	  if (range.test(minver)) {
	    return minver
	  }

	  minver = null;
	  for (let i = 0; i < range.set.length; ++i) {
	    const comparators = range.set[i];

	    let setMin = null;
	    comparators.forEach((comparator) => {
	      // Clone to avoid manipulating the comparator's semver object.
	      const compver = new SemVer(comparator.semver.version);
	      switch (comparator.operator) {
	        case '>':
	          if (compver.prerelease.length === 0) {
	            compver.patch++;
	          } else {
	            compver.prerelease.push(0);
	          }
	          compver.raw = compver.format();
	          /* fallthrough */
	        case '':
	        case '>=':
	          if (!setMin || gt(compver, setMin)) {
	            setMin = compver;
	          }
	          break
	        case '<':
	        case '<=':
	          /* Ignore maximum versions */
	          break
	        /* istanbul ignore next */
	        default:
	          throw new Error(`Unexpected operation: ${comparator.operator}`)
	      }
	    });
	    if (setMin && (!minver || gt(minver, setMin))) {
	      minver = setMin;
	    }
	  }

	  if (minver && range.test(minver)) {
	    return minver
	  }

	  return null
	};
	minVersion_1 = minVersion;
	return minVersion_1;
}

var valid;
var hasRequiredValid;

function requireValid () {
	if (hasRequiredValid) return valid;
	hasRequiredValid = 1;

	const Range = requireRange();
	const validRange = (range, options) => {
	  try {
	    // Return '*' instead of '' so that truthiness works.
	    // This will throw if it's invalid anyway
	    return new Range(range, options).range || '*'
	  } catch (er) {
	    return null
	  }
	};
	valid = validRange;
	return valid;
}

var outside_1;
var hasRequiredOutside;

function requireOutside () {
	if (hasRequiredOutside) return outside_1;
	hasRequiredOutside = 1;

	const SemVer = requireSemver$1();
	const Comparator = requireComparator();
	const { ANY } = Comparator;
	const Range = requireRange();
	const satisfies = requireSatisfies();
	const gt = requireGt();
	const lt = requireLt();
	const lte = requireLte();
	const gte = requireGte();

	const outside = (version, range, hilo, options) => {
	  version = new SemVer(version, options);
	  range = new Range(range, options);

	  let gtfn, ltefn, ltfn, comp, ecomp;
	  switch (hilo) {
	    case '>':
	      gtfn = gt;
	      ltefn = lte;
	      ltfn = lt;
	      comp = '>';
	      ecomp = '>=';
	      break
	    case '<':
	      gtfn = lt;
	      ltefn = gte;
	      ltfn = gt;
	      comp = '<';
	      ecomp = '<=';
	      break
	    default:
	      throw new TypeError('Must provide a hilo val of "<" or ">"')
	  }

	  // If it satisfies the range it is not outside
	  if (satisfies(version, range, options)) {
	    return false
	  }

	  // From now on, variable terms are as if we're in "gtr" mode.
	  // but note that everything is flipped for the "ltr" function.

	  for (let i = 0; i < range.set.length; ++i) {
	    const comparators = range.set[i];

	    let high = null;
	    let low = null;

	    comparators.forEach((comparator) => {
	      if (comparator.semver === ANY) {
	        comparator = new Comparator('>=0.0.0');
	      }
	      high = high || comparator;
	      low = low || comparator;
	      if (gtfn(comparator.semver, high.semver, options)) {
	        high = comparator;
	      } else if (ltfn(comparator.semver, low.semver, options)) {
	        low = comparator;
	      }
	    });

	    // If the edge version comparator has a operator then our version
	    // isn't outside it
	    if (high.operator === comp || high.operator === ecomp) {
	      return false
	    }

	    // If the lowest version comparator has an operator and our version
	    // is less than it then it isn't higher than the range
	    if ((!low.operator || low.operator === comp) &&
	        ltefn(version, low.semver)) {
	      return false
	    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
	      return false
	    }
	  }
	  return true
	};

	outside_1 = outside;
	return outside_1;
}

var gtr_1;
var hasRequiredGtr;

function requireGtr () {
	if (hasRequiredGtr) return gtr_1;
	hasRequiredGtr = 1;

	// Determine if version is greater than all the versions possible in the range.
	const outside = requireOutside();
	const gtr = (version, range, options) => outside(version, range, '>', options);
	gtr_1 = gtr;
	return gtr_1;
}

var ltr_1;
var hasRequiredLtr;

function requireLtr () {
	if (hasRequiredLtr) return ltr_1;
	hasRequiredLtr = 1;

	const outside = requireOutside();
	// Determine if version is less than all the versions possible in the range
	const ltr = (version, range, options) => outside(version, range, '<', options);
	ltr_1 = ltr;
	return ltr_1;
}

var intersects_1;
var hasRequiredIntersects;

function requireIntersects () {
	if (hasRequiredIntersects) return intersects_1;
	hasRequiredIntersects = 1;

	const Range = requireRange();
	const intersects = (r1, r2, options) => {
	  r1 = new Range(r1, options);
	  r2 = new Range(r2, options);
	  return r1.intersects(r2, options)
	};
	intersects_1 = intersects;
	return intersects_1;
}

var simplify;
var hasRequiredSimplify;

function requireSimplify () {
	if (hasRequiredSimplify) return simplify;
	hasRequiredSimplify = 1;

	// given a set of versions and a range, create a "simplified" range
	// that includes the same versions that the original range does
	// If the original range is shorter than the simplified one, return that.
	const satisfies = requireSatisfies();
	const compare = requireCompare();
	simplify = (versions, range, options) => {
	  const set = [];
	  let first = null;
	  let prev = null;
	  const v = versions.sort((a, b) => compare(a, b, options));
	  for (const version of v) {
	    const included = satisfies(version, range, options);
	    if (included) {
	      prev = version;
	      if (!first) {
	        first = version;
	      }
	    } else {
	      if (prev) {
	        set.push([first, prev]);
	      }
	      prev = null;
	      first = null;
	    }
	  }
	  if (first) {
	    set.push([first, null]);
	  }

	  const ranges = [];
	  for (const [min, max] of set) {
	    if (min === max) {
	      ranges.push(min);
	    } else if (!max && min === v[0]) {
	      ranges.push('*');
	    } else if (!max) {
	      ranges.push(`>=${min}`);
	    } else if (min === v[0]) {
	      ranges.push(`<=${max}`);
	    } else {
	      ranges.push(`${min} - ${max}`);
	    }
	  }
	  const simplified = ranges.join(' || ');
	  const original = typeof range.raw === 'string' ? range.raw : String(range);
	  return simplified.length < original.length ? simplified : range
	};
	return simplify;
}

var subset_1;
var hasRequiredSubset;

function requireSubset () {
	if (hasRequiredSubset) return subset_1;
	hasRequiredSubset = 1;

	const Range = requireRange();
	const Comparator = requireComparator();
	const { ANY } = Comparator;
	const satisfies = requireSatisfies();
	const compare = requireCompare();

	// Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
	// - Every simple range `r1, r2, ...` is a null set, OR
	// - Every simple range `r1, r2, ...` which is not a null set is a subset of
	//   some `R1, R2, ...`
	//
	// Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
	// - If c is only the ANY comparator
	//   - If C is only the ANY comparator, return true
	//   - Else if in prerelease mode, return false
	//   - else replace c with `[>=0.0.0]`
	// - If C is only the ANY comparator
	//   - if in prerelease mode, return true
	//   - else replace C with `[>=0.0.0]`
	// - Let EQ be the set of = comparators in c
	// - If EQ is more than one, return true (null set)
	// - Let GT be the highest > or >= comparator in c
	// - Let LT be the lowest < or <= comparator in c
	// - If GT and LT, and GT.semver > LT.semver, return true (null set)
	// - If any C is a = range, and GT or LT are set, return false
	// - If EQ
	//   - If GT, and EQ does not satisfy GT, return true (null set)
	//   - If LT, and EQ does not satisfy LT, return true (null set)
	//   - If EQ satisfies every C, return true
	//   - Else return false
	// - If GT
	//   - If GT.semver is lower than any > or >= comp in C, return false
	//   - If GT is >=, and GT.semver does not satisfy every C, return false
	//   - If GT.semver has a prerelease, and not in prerelease mode
	//     - If no C has a prerelease and the GT.semver tuple, return false
	// - If LT
	//   - If LT.semver is greater than any < or <= comp in C, return false
	//   - If LT is <=, and LT.semver does not satisfy every C, return false
	//   - If GT.semver has a prerelease, and not in prerelease mode
	//     - If no C has a prerelease and the LT.semver tuple, return false
	// - Else return true

	const subset = (sub, dom, options = {}) => {
	  if (sub === dom) {
	    return true
	  }

	  sub = new Range(sub, options);
	  dom = new Range(dom, options);
	  let sawNonNull = false;

	  OUTER: for (const simpleSub of sub.set) {
	    for (const simpleDom of dom.set) {
	      const isSub = simpleSubset(simpleSub, simpleDom, options);
	      sawNonNull = sawNonNull || isSub !== null;
	      if (isSub) {
	        continue OUTER
	      }
	    }
	    // the null set is a subset of everything, but null simple ranges in
	    // a complex range should be ignored.  so if we saw a non-null range,
	    // then we know this isn't a subset, but if EVERY simple range was null,
	    // then it is a subset.
	    if (sawNonNull) {
	      return false
	    }
	  }
	  return true
	};

	const minimumVersionWithPreRelease = [new Comparator('>=0.0.0-0')];
	const minimumVersion = [new Comparator('>=0.0.0')];

	const simpleSubset = (sub, dom, options) => {
	  if (sub === dom) {
	    return true
	  }

	  if (sub.length === 1 && sub[0].semver === ANY) {
	    if (dom.length === 1 && dom[0].semver === ANY) {
	      return true
	    } else if (options.includePrerelease) {
	      sub = minimumVersionWithPreRelease;
	    } else {
	      sub = minimumVersion;
	    }
	  }

	  if (dom.length === 1 && dom[0].semver === ANY) {
	    if (options.includePrerelease) {
	      return true
	    } else {
	      dom = minimumVersion;
	    }
	  }

	  const eqSet = new Set();
	  let gt, lt;
	  for (const c of sub) {
	    if (c.operator === '>' || c.operator === '>=') {
	      gt = higherGT(gt, c, options);
	    } else if (c.operator === '<' || c.operator === '<=') {
	      lt = lowerLT(lt, c, options);
	    } else {
	      eqSet.add(c.semver);
	    }
	  }

	  if (eqSet.size > 1) {
	    return null
	  }

	  let gtltComp;
	  if (gt && lt) {
	    gtltComp = compare(gt.semver, lt.semver, options);
	    if (gtltComp > 0) {
	      return null
	    } else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) {
	      return null
	    }
	  }

	  // will iterate one or zero times
	  for (const eq of eqSet) {
	    if (gt && !satisfies(eq, String(gt), options)) {
	      return null
	    }

	    if (lt && !satisfies(eq, String(lt), options)) {
	      return null
	    }

	    for (const c of dom) {
	      if (!satisfies(eq, String(c), options)) {
	        return false
	      }
	    }

	    return true
	  }

	  let higher, lower;
	  let hasDomLT, hasDomGT;
	  // if the subset has a prerelease, we need a comparator in the superset
	  // with the same tuple and a prerelease, or it's not a subset
	  let needDomLTPre = lt &&
	    !options.includePrerelease &&
	    lt.semver.prerelease.length ? lt.semver : false;
	  let needDomGTPre = gt &&
	    !options.includePrerelease &&
	    gt.semver.prerelease.length ? gt.semver : false;
	  // exception: <1.2.3-0 is the same as <1.2.3
	  if (needDomLTPre && needDomLTPre.prerelease.length === 1 &&
	      lt.operator === '<' && needDomLTPre.prerelease[0] === 0) {
	    needDomLTPre = false;
	  }

	  for (const c of dom) {
	    hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>=';
	    hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<=';
	    if (gt) {
	      if (needDomGTPre) {
	        if (c.semver.prerelease && c.semver.prerelease.length &&
	            c.semver.major === needDomGTPre.major &&
	            c.semver.minor === needDomGTPre.minor &&
	            c.semver.patch === needDomGTPre.patch) {
	          needDomGTPre = false;
	        }
	      }
	      if (c.operator === '>' || c.operator === '>=') {
	        higher = higherGT(gt, c, options);
	        if (higher === c && higher !== gt) {
	          return false
	        }
	      } else if (gt.operator === '>=' && !satisfies(gt.semver, String(c), options)) {
	        return false
	      }
	    }
	    if (lt) {
	      if (needDomLTPre) {
	        if (c.semver.prerelease && c.semver.prerelease.length &&
	            c.semver.major === needDomLTPre.major &&
	            c.semver.minor === needDomLTPre.minor &&
	            c.semver.patch === needDomLTPre.patch) {
	          needDomLTPre = false;
	        }
	      }
	      if (c.operator === '<' || c.operator === '<=') {
	        lower = lowerLT(lt, c, options);
	        if (lower === c && lower !== lt) {
	          return false
	        }
	      } else if (lt.operator === '<=' && !satisfies(lt.semver, String(c), options)) {
	        return false
	      }
	    }
	    if (!c.operator && (lt || gt) && gtltComp !== 0) {
	      return false
	    }
	  }

	  // if there was a < or >, and nothing in the dom, then must be false
	  // UNLESS it was limited by another range in the other direction.
	  // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0
	  if (gt && hasDomLT && !lt && gtltComp !== 0) {
	    return false
	  }

	  if (lt && hasDomGT && !gt && gtltComp !== 0) {
	    return false
	  }

	  // we needed a prerelease range in a specific tuple, but didn't get one
	  // then this isn't a subset.  eg >=1.2.3-pre is not a subset of >=1.0.0,
	  // because it includes prereleases in the 1.2.3 tuple
	  if (needDomGTPre || needDomLTPre) {
	    return false
	  }

	  return true
	};

	// >=1.2.3 is lower than >1.2.3
	const higherGT = (a, b, options) => {
	  if (!a) {
	    return b
	  }
	  const comp = compare(a.semver, b.semver, options);
	  return comp > 0 ? a
	    : comp < 0 ? b
	    : b.operator === '>' && a.operator === '>=' ? b
	    : a
	};

	// <=1.2.3 is higher than <1.2.3
	const lowerLT = (a, b, options) => {
	  if (!a) {
	    return b
	  }
	  const comp = compare(a.semver, b.semver, options);
	  return comp < 0 ? a
	    : comp > 0 ? b
	    : b.operator === '<' && a.operator === '<=' ? b
	    : a
	};

	subset_1 = subset;
	return subset_1;
}

var semver;
var hasRequiredSemver;

function requireSemver () {
	if (hasRequiredSemver) return semver;
	hasRequiredSemver = 1;

	// just pre-load all the stuff that index.js lazily exports
	const internalRe = requireRe();
	const constants = requireConstants();
	const SemVer = requireSemver$1();
	const identifiers = requireIdentifiers();
	const parse = requireParse();
	const valid = requireValid$1();
	const clean = requireClean();
	const inc = requireInc();
	const diff = requireDiff();
	const major = requireMajor();
	const minor = requireMinor();
	const patch = requirePatch();
	const prerelease = requirePrerelease();
	const compare = requireCompare();
	const rcompare = requireRcompare();
	const compareLoose = requireCompareLoose();
	const compareBuild = requireCompareBuild();
	const sort = requireSort();
	const rsort = requireRsort();
	const gt = requireGt();
	const lt = requireLt();
	const eq = requireEq();
	const neq = requireNeq();
	const gte = requireGte();
	const lte = requireLte();
	const cmp = requireCmp();
	const coerce = requireCoerce();
	const Comparator = requireComparator();
	const Range = requireRange();
	const satisfies = requireSatisfies();
	const toComparators = requireToComparators();
	const maxSatisfying = requireMaxSatisfying();
	const minSatisfying = requireMinSatisfying();
	const minVersion = requireMinVersion();
	const validRange = requireValid();
	const outside = requireOutside();
	const gtr = requireGtr();
	const ltr = requireLtr();
	const intersects = requireIntersects();
	const simplifyRange = requireSimplify();
	const subset = requireSubset();
	semver = {
	  parse,
	  valid,
	  clean,
	  inc,
	  diff,
	  major,
	  minor,
	  patch,
	  prerelease,
	  compare,
	  rcompare,
	  compareLoose,
	  compareBuild,
	  sort,
	  rsort,
	  gt,
	  lt,
	  eq,
	  neq,
	  gte,
	  lte,
	  cmp,
	  coerce,
	  Comparator,
	  Range,
	  satisfies,
	  toComparators,
	  maxSatisfying,
	  minSatisfying,
	  minVersion,
	  validRange,
	  outside,
	  gtr,
	  ltr,
	  intersects,
	  simplifyRange,
	  subset,
	  SemVer,
	  re: internalRe.re,
	  src: internalRe.src,
	  tokens: internalRe.t,
	  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
	  RELEASE_TYPES: constants.RELEASE_TYPES,
	  compareIdentifiers: identifiers.compareIdentifiers,
	  rcompareIdentifiers: identifiers.rcompareIdentifiers,
	};
	return semver;
}

requireSemver();

/* eslint-disable */
// @ts-nocheck
new TextEncoder();

var ansiStyles = {exports: {}};

ansiStyles.exports;

var hasRequiredAnsiStyles;

function requireAnsiStyles () {
	if (hasRequiredAnsiStyles) return ansiStyles.exports;
	hasRequiredAnsiStyles = 1;
	(function (module) {

		const ANSI_BACKGROUND_OFFSET = 10;

		const wrapAnsi256 = (offset = 0) => code => `\u001B[${38 + offset};5;${code}m`;

		const wrapAnsi16m = (offset = 0) => (red, green, blue) => `\u001B[${38 + offset};2;${red};${green};${blue}m`;

		function assembleStyles() {
			const codes = new Map();
			const styles = {
				modifier: {
					reset: [0, 0],
					// 21 isn't widely supported and 22 does the same thing
					bold: [1, 22],
					dim: [2, 22],
					italic: [3, 23],
					underline: [4, 24],
					overline: [53, 55],
					inverse: [7, 27],
					hidden: [8, 28],
					strikethrough: [9, 29]
				},
				color: {
					black: [30, 39],
					red: [31, 39],
					green: [32, 39],
					yellow: [33, 39],
					blue: [34, 39],
					magenta: [35, 39],
					cyan: [36, 39],
					white: [37, 39],

					// Bright color
					blackBright: [90, 39],
					redBright: [91, 39],
					greenBright: [92, 39],
					yellowBright: [93, 39],
					blueBright: [94, 39],
					magentaBright: [95, 39],
					cyanBright: [96, 39],
					whiteBright: [97, 39]
				},
				bgColor: {
					bgBlack: [40, 49],
					bgRed: [41, 49],
					bgGreen: [42, 49],
					bgYellow: [43, 49],
					bgBlue: [44, 49],
					bgMagenta: [45, 49],
					bgCyan: [46, 49],
					bgWhite: [47, 49],

					// Bright color
					bgBlackBright: [100, 49],
					bgRedBright: [101, 49],
					bgGreenBright: [102, 49],
					bgYellowBright: [103, 49],
					bgBlueBright: [104, 49],
					bgMagentaBright: [105, 49],
					bgCyanBright: [106, 49],
					bgWhiteBright: [107, 49]
				}
			};

			// Alias bright black as gray (and grey)
			styles.color.gray = styles.color.blackBright;
			styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
			styles.color.grey = styles.color.blackBright;
			styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

			for (const [groupName, group] of Object.entries(styles)) {
				for (const [styleName, style] of Object.entries(group)) {
					styles[styleName] = {
						open: `\u001B[${style[0]}m`,
						close: `\u001B[${style[1]}m`
					};

					group[styleName] = styles[styleName];

					codes.set(style[0], style[1]);
				}

				Object.defineProperty(styles, groupName, {
					value: group,
					enumerable: false
				});
			}

			Object.defineProperty(styles, 'codes', {
				value: codes,
				enumerable: false
			});

			styles.color.close = '\u001B[39m';
			styles.bgColor.close = '\u001B[49m';

			styles.color.ansi256 = wrapAnsi256();
			styles.color.ansi16m = wrapAnsi16m();
			styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
			styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);

			// From https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js
			Object.defineProperties(styles, {
				rgbToAnsi256: {
					value: (red, green, blue) => {
						// We use the extended greyscale palette here, with the exception of
						// black and white. normal palette only has 4 greyscale shades.
						if (red === green && green === blue) {
							if (red < 8) {
								return 16;
							}

							if (red > 248) {
								return 231;
							}

							return Math.round(((red - 8) / 247) * 24) + 232;
						}

						return 16 +
							(36 * Math.round(red / 255 * 5)) +
							(6 * Math.round(green / 255 * 5)) +
							Math.round(blue / 255 * 5);
					},
					enumerable: false
				},
				hexToRgb: {
					value: hex => {
						const matches = /(?<colorString>[a-f\d]{6}|[a-f\d]{3})/i.exec(hex.toString(16));
						if (!matches) {
							return [0, 0, 0];
						}

						let {colorString} = matches.groups;

						if (colorString.length === 3) {
							colorString = colorString.split('').map(character => character + character).join('');
						}

						const integer = Number.parseInt(colorString, 16);

						return [
							(integer >> 16) & 0xFF,
							(integer >> 8) & 0xFF,
							integer & 0xFF
						];
					},
					enumerable: false
				},
				hexToAnsi256: {
					value: hex => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
					enumerable: false
				}
			});

			return styles;
		}

		// Make the export immutable
		Object.defineProperty(module, 'exports', {
			enumerable: true,
			get: assembleStyles
		}); 
	} (ansiStyles));
	return ansiStyles.exports;
}

requireAnsiStyles();

new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");

function stripXMLComments(xmlString) {
  return xmlString.replace(/<!--[\s\S]*?-->/g, "");
}
function cleanXML(xmlString) {
  let cleaned = stripXMLComments(xmlString);
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  cleaned = cleaned.trim();
  return cleaned;
}
function getSchemaRequirements() {
  return `
REQUIRED OUTPUT STRUCTURE:

Your output must be valid XML matching this EXACT structure:

<Module>
  <Metadata>
    <!-- REQUIRED: Document what changed, why, and with what confidence -->
    <GenerationInfo>
      <Timestamp>ISO 8601 datetime (e.g. 2025-10-11T14:30:00Z)</Timestamp>
      <Source>AI-Generated</Source>
      <Model>claude-sonnet-4-5-20250929</Model>
      <InputSources>
        <InputFile type="projects">projects.xml</InputFile>
        <InputFile type="skills">skills.xml</InputFile>
        <InputFile type="research">research.xml</InputFile>
      </InputSources>
    </GenerationInfo>

    <Changelog>
      <!-- Document EVERY significant change you make to the input materials -->
      <!-- Be specific about what changed and WHY -->
      <Change>
        <Section>XPath identifier (e.g. ModuleObjectives/Objective[1])</Section>
        <Type>content_update | examples_expanded | new_content | removed | reordered</Type>
        <Confidence>high | medium | low</Confidence>
        <Summary>One sentence: what changed</Summary>
        <Rationale>
          1-3 sentences explaining WHY this change was made.
          Reference research findings, industry changes, or pedagogical decisions.
        </Rationale>
        <ResearchSources>
          <Source url="https://...">Title/description of research source</Source>
          <!-- Include multiple sources if applicable -->
        </ResearchSources>
      </Change>
      <!-- Repeat <Change> for each significant modification -->
    </Changelog>

    <ProvenanceTracking>
      <AIUpdateCount>1</AIUpdateCount>
      <SectionsNeedingReview>
        <!-- List any low-confidence changes that need human review -->
        <Section confidence="low">Section identifier if applicable</Section>
      </SectionsNeedingReview>
    </ProvenanceTracking>
  </Metadata>

  <ModuleOverview>
    <ModuleDescription>
      What topics this module covers and what we'll build
    </ModuleDescription>

    <ModuleObjectives>
      <!-- REQUIRED: At least 3 ModuleObjective elements -->
      <ModuleObjective>
        <Name>Quick memorable name for the objective</Name>
        <Details>
          An explanation of the practical skills & theoretical knowledge learners will have
        </Details>
      </ModuleObjective>
      <!-- Repeat ModuleObjective for each objective -->
    </ModuleObjectives>
  </ModuleOverview>

  <ResearchTopics>
    <PrimaryTopics>
      <!-- REQUIRED: At least 5 PrimaryTopic elements -->
      <PrimaryTopic>
        <TopicName>Name of topic</TopicName>

        <TopicDescription>
          Description of topic to research, including:
          1. guidance for how to start researching it
          2. suggestion for subdividing the topic if multiple learners tackle it
        </TopicDescription>
      </PrimaryTopic>
      <!-- Repeat PrimaryTopic for each primary topic -->
    </PrimaryTopics>

    <StretchTopics>
      <!-- OPTIONAL: Stretch topics as natural extensions -->
      <StretchTopic>
        One sentence description of topic
      </StretchTopic>
    </StretchTopics>
  </ResearchTopics>

  <Projects>
    <ProjectBriefs>
      <!-- REQUIRED: At least 2 ProjectBrief elements -->
      <ProjectBrief>
        <Overview>
          <Name>Name of Project</Name>
          <Task>One sentence description of successful outcome</Task>
          <Focus>Techniques & technologies that will help achieve the task</Focus>
        </Overview>

        <Criteria>Bullet point list of success criteria</Criteria>

        <Skills>
          <!-- REQUIRED: At least 3 Skill elements per ProjectBrief -->
          <Skill>
            <Name>Memorable name of skill, technology or technique</Name>
            <Details>Bullet point list of criteria, guidance and explanation</Details>
          </Skill>
        </Skills>

        <Examples>
          <!-- REQUIRED: At least 3 Example elements per ProjectBrief -->
          <Example>
            <Name>Memorable name of example</Name>
            <Description>Brief description of example</Description>
          </Example>
        </Examples>
      </ProjectBrief>
    </ProjectBriefs>

    <ProjectTwists>
      <!-- REQUIRED: At least 2 ProjectTwist elements -->
      <ProjectTwist>
        <Name>Memorable name of twist</Name>
        <Task>Challenge that the twist poses</Task>
        <ExampleUses>
          <!-- REQUIRED: At least 2 Example elements per ProjectTwist -->
          <Example>
            Brief description of example
          </Example>
        </ExampleUses>
      </ProjectTwist>
    </ProjectTwists>
  </Projects>

  <AdditionalSkills>
    <!-- REQUIRED: At least 1 SkillsCategory -->
    <SkillsCategory>
      <Name>Name of Category (e.g. "Python")</Name>

      <Skill>
        <SkillName>Memorable name of skill</SkillName>
        <SkillDescription>2 sentences maximum</SkillDescription>
      </Skill>
    </SkillsCategory>
  </AdditionalSkills>

  <Notes>
    Any content that doesn't fit within the schema. Use rarely.
  </Notes>
</Module>

CRITICAL CARDINALITY REQUIREMENTS:
- ModuleObjectives: minimum 3 ModuleObjective elements
- PrimaryTopics: minimum 5 PrimaryTopic elements
- ProjectBriefs: minimum 2 ProjectBrief elements
- Skills (per ProjectBrief): minimum 3 Skill elements
- Examples (per ProjectBrief): minimum 3 Example elements
- ProjectTwists: minimum 2 ProjectTwist elements
- ExampleUses (per ProjectTwist): minimum 2 Example elements
- SkillsCategory: minimum 1 category
- StretchTopics: optional section
- Notes: optional section

CONFIDENCE LEVEL GUIDANCE:
- HIGH: Factual updates (API changes, deprecated features, version bumps, documentation updates)
- MEDIUM: Framework/library updates that may evolve rapidly, industry trend adaptations
- LOW: Pedagogical decisions, new content additions, subjective improvements, structural changes

CHANGELOG REQUIREMENTS:
- Document EVERY significant change you make (updates, additions, removals)
- Be specific in <Section> identifiers (use XPath notation)
- Explain WHY in <Rationale> - reference research, industry changes, or pedagogical reasoning
- Include <ResearchSources> when you used web search to inform a decision
- Set appropriate <Confidence> levels to help human reviewers prioritize
- If you add/modify examples, note it as "examples_expanded"
- If you update existing content for currency, note it as "content_update"
- If you create entirely new sections, note it as "new_content"

IMPORTANT RULES:
1. Output ONLY valid XML - no explanatory text before or after
2. Do NOT include any XML comments (<!-- ... -->) in your output
3. Use proper XML entities (&amp; for &, &lt; for <, etc.)
4. All tag names are case-sensitive and must match exactly
5. Ensure all opening tags have matching closing tags
6. All required sections must be present and populated
7. Meet all minimum cardinality requirements
8. ALWAYS include <Metadata> section with complete <Changelog>
9. Document your reasoning in the changelog - this helps human reviewers
`.trim();
}
function validateModuleXML(xmlString) {
  const errors = [];
  const warnings = [];
  try {
    const ParserClass = typeof window !== "undefined" ? window.DOMParser : DOMParser;
    const parser = new ParserClass();
    const doc = parser.parseFromString(xmlString, "text/xml");
    const parserErrors = doc.getElementsByTagName("parsererror");
    if (parserErrors.length > 0) {
      errors.push(`XML parsing error: ${parserErrors[0].textContent}`);
      return { valid: false, errors, warnings };
    }
    const root = doc.documentElement;
    if (root.tagName !== "Module") {
      errors.push(`Root element must be <Module>, found <${root.tagName}>`);
      return { valid: false, errors, warnings };
    }
    validateMetadata(root, errors, warnings);
    validateModuleOverview(root, errors, warnings);
    validateResearchTopics(root, errors, warnings);
    validateProjects(root, errors, warnings);
    validateAdditionalSkills(root, errors, warnings);
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  } catch (err) {
    errors.push(`Validation error: ${err instanceof Error ? err.message : String(err)}`);
    return { valid: false, errors, warnings };
  }
}
function validateModuleOverview(root, errors, warnings) {
  const overviews = root.getElementsByTagName("ModuleOverview");
  if (overviews.length === 0) {
    errors.push("Missing required <ModuleOverview> section");
    return;
  }
  const overview = overviews[0];
  const descriptions = overview.getElementsByTagName("ModuleDescription");
  if (descriptions.length === 0 || !descriptions[0].textContent?.trim()) {
    errors.push("<ModuleOverview> must contain <ModuleDescription> with content");
  }
  const objectivesSections = overview.getElementsByTagName("ModuleObjectives");
  if (objectivesSections.length === 0) {
    errors.push("<ModuleOverview> must contain <ModuleObjectives>");
    return;
  }
  const objectives = objectivesSections[0];
  const objectiveList = objectives.getElementsByTagName("ModuleObjective");
  if (objectiveList.length < 3) {
    errors.push(`<ModuleObjectives> must contain at least 3 <ModuleObjective> elements (found ${objectiveList.length})`);
  }
  for (let i = 0; i < objectiveList.length; i++) {
    const obj = objectiveList[i];
    const names = obj.getElementsByTagName("Name");
    const details = obj.getElementsByTagName("Details");
    if (names.length === 0 || !names[0].textContent?.trim()) {
      errors.push(`<ModuleObjective> #${i + 1} missing <Name>`);
    }
    if (details.length === 0 || !details[0].textContent?.trim()) {
      errors.push(`<ModuleObjective> #${i + 1} missing <Details>`);
    }
  }
}
function validateResearchTopics(root, errors, warnings) {
  const researchTopicsSections = root.getElementsByTagName("ResearchTopics");
  if (researchTopicsSections.length === 0) {
    errors.push("Missing required <ResearchTopics> section");
    return;
  }
  const researchTopics = researchTopicsSections[0];
  const primaryTopicsSections = researchTopics.getElementsByTagName("PrimaryTopics");
  if (primaryTopicsSections.length === 0) {
    errors.push("<ResearchTopics> must contain <PrimaryTopics>");
    return;
  }
  const primaryTopics = primaryTopicsSections[0];
  const primaryTopicList = primaryTopics.getElementsByTagName("PrimaryTopic");
  if (primaryTopicList.length < 5) {
    errors.push(`<PrimaryTopics> must contain at least 5 <PrimaryTopic> elements (found ${primaryTopicList.length})`);
  }
  for (let i = 0; i < primaryTopicList.length; i++) {
    if (!primaryTopicList[i].textContent?.trim()) {
      errors.push(`<PrimaryTopic> #${i + 1} is empty`);
    }
  }
  const stretchTopicsSections = researchTopics.getElementsByTagName("StretchTopics");
  if (stretchTopicsSections.length > 0) {
    const stretchTopics = stretchTopicsSections[0];
    const stretchTopicList = stretchTopics.getElementsByTagName("StretchTopic");
    for (let i = 0; i < stretchTopicList.length; i++) {
      if (!stretchTopicList[i].textContent?.trim()) {
        warnings.push(`<StretchTopic> #${i + 1} is empty`);
      }
    }
  }
}
function validateProjects(root, errors, warnings) {
  const projectsSections = root.getElementsByTagName("Projects");
  if (projectsSections.length === 0) {
    errors.push("Missing required <Projects> section");
    return;
  }
  const projects = projectsSections[0];
  const projectBriefsSections = projects.getElementsByTagName("ProjectBriefs");
  if (projectBriefsSections.length === 0) {
    errors.push("<Projects> must contain <ProjectBriefs>");
    return;
  }
  const projectBriefs = projectBriefsSections[0];
  const briefList = projectBriefs.getElementsByTagName("ProjectBrief");
  if (briefList.length < 2) {
    errors.push(`<ProjectBriefs> must contain at least 2 <ProjectBrief> elements (found ${briefList.length})`);
  }
  for (let i = 0; i < briefList.length; i++) {
    const brief = briefList[i];
    const briefNum = i + 1;
    const overviews = brief.getElementsByTagName("Overview");
    if (overviews.length === 0) {
      errors.push(`<ProjectBrief> #${briefNum} missing <Overview>`);
    } else {
      const overview = overviews[0];
      const names = overview.getElementsByTagName("Name");
      const tasks = overview.getElementsByTagName("Task");
      const focuses = overview.getElementsByTagName("Focus");
      if (names.length === 0 || !names[0].textContent?.trim()) {
        errors.push(`<ProjectBrief> #${briefNum} <Overview> missing <Name>`);
      }
      if (tasks.length === 0 || !tasks[0].textContent?.trim()) {
        errors.push(`<ProjectBrief> #${briefNum} <Overview> missing <Task>`);
      }
      if (focuses.length === 0 || !focuses[0].textContent?.trim()) {
        errors.push(`<ProjectBrief> #${briefNum} <Overview> missing <Focus>`);
      }
    }
    const criterias = brief.getElementsByTagName("Criteria");
    if (criterias.length === 0 || !criterias[0].textContent?.trim()) {
      errors.push(`<ProjectBrief> #${briefNum} missing <Criteria>`);
    }
    const skillsSections = brief.getElementsByTagName("Skills");
    if (skillsSections.length === 0) {
      errors.push(`<ProjectBrief> #${briefNum} missing <Skills>`);
    } else {
      const skills = skillsSections[0];
      const skillList = skills.getElementsByTagName("Skill");
      if (skillList.length < 3) {
        errors.push(`<ProjectBrief> #${briefNum} <Skills> must contain at least 3 <Skill> elements (found ${skillList.length})`);
      }
      for (let j = 0; j < skillList.length; j++) {
        const skill = skillList[j];
        const names = skill.getElementsByTagName("Name");
        const details = skill.getElementsByTagName("Details");
        if (names.length === 0 || !names[0].textContent?.trim()) {
          errors.push(`<ProjectBrief> #${briefNum} <Skill> #${j + 1} missing <Name>`);
        }
        if (details.length === 0 || !details[0].textContent?.trim()) {
          errors.push(`<ProjectBrief> #${briefNum} <Skill> #${j + 1} missing <Details>`);
        }
      }
    }
    const examplesSections = brief.getElementsByTagName("Examples");
    if (examplesSections.length === 0) {
      errors.push(`<ProjectBrief> #${briefNum} missing <Examples>`);
    } else {
      const examples = examplesSections[0];
      const exampleList = examples.getElementsByTagName("Example");
      if (exampleList.length < 3) {
        errors.push(`<ProjectBrief> #${briefNum} <Examples> must contain at least 3 <Example> elements (found ${exampleList.length})`);
      }
      for (let j = 0; j < exampleList.length; j++) {
        const example = exampleList[j];
        const names = example.getElementsByTagName("Name");
        const descriptions = example.getElementsByTagName("Description");
        if (names.length === 0 || !names[0].textContent?.trim()) {
          errors.push(`<ProjectBrief> #${briefNum} <Example> #${j + 1} missing <Name>`);
        }
        if (descriptions.length === 0 || !descriptions[0].textContent?.trim()) {
          errors.push(`<ProjectBrief> #${briefNum} <Example> #${j + 1} missing <Description>`);
        }
      }
    }
  }
  const projectTwistsSections = projects.getElementsByTagName("ProjectTwists");
  if (projectTwistsSections.length === 0) {
    errors.push("<Projects> must contain <ProjectTwists>");
    return;
  }
  const projectTwists = projectTwistsSections[0];
  const twistList = projectTwists.getElementsByTagName("ProjectTwist");
  if (twistList.length < 2) {
    errors.push(`<ProjectTwists> must contain at least 2 <ProjectTwist> elements (found ${twistList.length})`);
  }
  for (let i = 0; i < twistList.length; i++) {
    const twist = twistList[i];
    const twistNum = i + 1;
    const names = twist.getElementsByTagName("Name");
    const tasks = twist.getElementsByTagName("Task");
    if (names.length === 0 || !names[0].textContent?.trim()) {
      errors.push(`<ProjectTwist> #${twistNum} missing <Name>`);
    }
    if (tasks.length === 0 || !tasks[0].textContent?.trim()) {
      errors.push(`<ProjectTwist> #${twistNum} missing <Task>`);
    }
    const exampleUsesSections = twist.getElementsByTagName("ExampleUses");
    if (exampleUsesSections.length === 0) {
      errors.push(`<ProjectTwist> #${twistNum} missing <ExampleUses>`);
    } else {
      const exampleUses = exampleUsesSections[0];
      const exampleList = exampleUses.getElementsByTagName("Example");
      if (exampleList.length < 2) {
        errors.push(`<ProjectTwist> #${twistNum} <ExampleUses> must contain at least 2 <Example> elements (found ${exampleList.length})`);
      }
    }
  }
}
function validateAdditionalSkills(root, errors, warnings) {
  const additionalSkillsSections = root.getElementsByTagName("AdditionalSkills");
  if (additionalSkillsSections.length === 0) {
    errors.push("Missing required <AdditionalSkills> section");
    return;
  }
  const additionalSkills = additionalSkillsSections[0];
  const categories = additionalSkills.getElementsByTagName("SkillsCategory");
  if (categories.length === 0) {
    errors.push("<AdditionalSkills> must contain at least one <SkillsCategory>");
    return;
  }
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const catNum = i + 1;
    const names = category.getElementsByTagName("Name");
    if (names.length === 0 || !names[0].textContent?.trim()) {
      errors.push(`<SkillsCategory> #${catNum} missing <Name>`);
    }
    const skills = category.getElementsByTagName("Skill");
    if (skills.length === 0) {
      errors.push(`<SkillsCategory> #${catNum} must contain at least one <Skill>`);
    }
    for (let j = 0; j < skills.length; j++) {
      const skill = skills[j];
      const skillNames = skill.getElementsByTagName("SkillName");
      const skillDescriptions = skill.getElementsByTagName("SkillDescription");
      if (skillNames.length === 0 || !skillNames[0].textContent?.trim()) {
        errors.push(`<SkillsCategory> #${catNum} <Skill> #${j + 1} missing <SkillName>`);
      }
      if (skillDescriptions.length === 0 || !skillDescriptions[0].textContent?.trim()) {
        errors.push(`<SkillsCategory> #${catNum} <Skill> #${j + 1} missing <SkillDescription>`);
      }
    }
  }
}
function validateMetadata(root, errors, warnings) {
  const metadataSections = root.getElementsByTagName("Metadata");
  if (metadataSections.length === 0) {
    warnings.push("Missing optional <Metadata> section - change tracking not available");
    return;
  }
  const metadata = metadataSections[0];
  const generationInfoSections = metadata.getElementsByTagName("GenerationInfo");
  if (generationInfoSections.length === 0) {
    warnings.push("<Metadata> section exists but missing <GenerationInfo>");
  } else {
    const genInfo = generationInfoSections[0];
    const timestamps = genInfo.getElementsByTagName("Timestamp");
    if (timestamps.length === 0 || !timestamps[0].textContent?.trim()) {
      warnings.push("<GenerationInfo> missing <Timestamp>");
    }
    const sources = genInfo.getElementsByTagName("Source");
    if (sources.length === 0 || !sources[0].textContent?.trim()) {
      warnings.push("<GenerationInfo> missing <Source>");
    }
    const models = genInfo.getElementsByTagName("Model");
    if (models.length === 0 || !models[0].textContent?.trim()) {
      warnings.push("<GenerationInfo> missing <Model>");
    }
  }
  const changelogSections = metadata.getElementsByTagName("Changelog");
  if (changelogSections.length > 0) {
    const changelog = changelogSections[0];
    const changes = changelog.getElementsByTagName("Change");
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const changeNum = i + 1;
      const sections = change.getElementsByTagName("Section");
      if (sections.length === 0 || !sections[0].textContent?.trim()) {
        warnings.push(`<Change> #${changeNum} missing <Section> identifier`);
      }
      const types = change.getElementsByTagName("Type");
      if (types.length === 0 || !types[0].textContent?.trim()) {
        warnings.push(`<Change> #${changeNum} missing <Type>`);
      }
      const confidences = change.getElementsByTagName("Confidence");
      if (confidences.length === 0 || !confidences[0].textContent?.trim()) {
        warnings.push(`<Change> #${changeNum} missing <Confidence> level`);
      } else {
        const confValue = confidences[0].textContent?.trim().toLowerCase();
        if (confValue && !["high", "medium", "low"].includes(confValue)) {
          warnings.push(`<Change> #${changeNum} <Confidence> must be 'high', 'medium', or 'low' (found '${confValue}')`);
        }
      }
      const summaries = change.getElementsByTagName("Summary");
      if (summaries.length === 0 || !summaries[0].textContent?.trim()) {
        warnings.push(`<Change> #${changeNum} missing <Summary>`);
      }
    }
  }
  const provenanceSections = metadata.getElementsByTagName("ProvenanceTracking");
  if (provenanceSections.length > 0) {
    const provenance = provenanceSections[0];
    const updateCounts = provenance.getElementsByTagName("AIUpdateCount");
    if (updateCounts.length > 0 && updateCounts[0].textContent?.trim()) {
      const count = parseInt(updateCounts[0].textContent.trim());
      if (isNaN(count) || count < 0) {
        warnings.push("<AIUpdateCount> must be a non-negative integer");
      }
    }
  }
}
function extractTextContent(content) {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content.filter((block) => block.type === "text").map((block) => block.text).join("");
  }
  return String(content);
}
function extractModuleXML(content) {
  const xmlMatch = content.match(/<Module>[\s\S]*?<\/Module>/i);
  if (xmlMatch) {
    const rawXML = xmlMatch[0];
    const cleanedXML = cleanXML(rawXML);
    return `<?xml version="1.0" encoding="UTF-8"?>
${cleanedXML}`;
  }
  const trimmed = content.trim();
  if (trimmed.match(/^<Module>/i) && trimmed.match(/<\/Module>$/i)) {
    const cleanedXML = cleanXML(trimmed);
    return `<?xml version="1.0" encoding="UTF-8"?>
${cleanedXML}`;
  }
  return null;
}
const POST = async ({ request }) => {
  const apiKey = private_env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw error(500, {
      message: "ANTHROPIC_API_KEY not configured. Set this in your environment variables."
    });
  }
  try {
    const body = await request.json();
    if (!body.projectsData || !body.skillsData || !body.researchData) {
      throw error(400, {
        message: "Missing required data. projectsData, skillsData, and researchData are all required."
      });
    }
    const acceptHeader = request.headers.get("accept");
    const supportsSSE = acceptHeader?.includes("text/event-stream");
    if (supportsSSE) {
      return createSSEStream(body, apiKey);
    } else {
      return await generateModule(body, apiKey);
    }
  } catch (err) {
    if (err && typeof err === "object" && "status" in err) {
      throw err;
    }
    console.error("Generation error:", err);
    throw error(500, {
      message: err instanceof Error ? err.message : "Unknown error during generation"
    });
  }
};
function buildGenerationPrompt(body, validationErrors) {
  const projectsInfo = JSON.stringify(body.projectsData, null, 2);
  const skillsInfo = JSON.stringify(body.skillsData, null, 2);
  const researchInfo = JSON.stringify(body.researchData, null, 2);
  const structuredInfo = body.structuredInput ? JSON.stringify(body.structuredInput, null, 2) : "None provided";
  const researchInstructions = body.enableResearch ? `RESEARCH INSTRUCTIONS:
      You have access to web search to find current, relevant information about:
      - Latest best practices and trends for the technologies mentioned
      - Current industry standards and tooling
      - Recent developments in AI and software development
      - Real-world examples and case studies

      Use web search to ensure the curriculum is up-to-date and reflects current industry practice.
      Focus on reputable sources: vendor documentation, established tech publications, and academic sources.` : "";
  const retrySection = validationErrors && validationErrors.length > 0 ? `⚠️ PREVIOUS ATTEMPT FAILED VALIDATION ⚠️
      Your previous response had these validation errors:
      ${validationErrors.map((err) => `- ${err}`).join("\n")}

      Please correct ALL of these issues in your next response. Pay special attention to:
      - Meeting minimum cardinality requirements (e.g., "at least 3 objectives")
      - Including all required sections and subsections
      - Using exact tag names (case-sensitive)
      - Ensuring proper XML structure with matching opening/closing tags` : "";
  const schemaRequirements = getSchemaRequirements();
  return `<Prompt>
	  <Overview>
			<RoleOverview>
			  You are an expert in (a) current AI engineering trends and (b) curriculum designer for peer-led AI Engineering courses.
			</RoleOverview>

      <TaskOverview>
        Go through <Task/TaskSteps> in order to generate a comprehensive module specification that:
        1. is based on the provided "<ModuleInput>"
        2. meets "<Task/TaskCriteria>"
        3. adheres to "<SchemaRequirements>"
      </TaskOverview>
    </Overview>

    <ModuleInput>
      <ProjectsInput>
        ${projectsInfo}
      </ProjectsInput>

      <SkillsInput>
        ${skillsInfo}
      </SkillsInput>

      <ResearchInput>
        ${researchInfo}
      </ResearchInput>

      <CohortInput>
        ${structuredInfo}
      </CohortInput>
    </ModuleInput>

    <Task>
      <TaskApproach>
        <ResearchEnabled>
          ${body.enableResearch ? "Yes - Use web search to find current information" : "No"}
        <ResearchEnabled>

        <ExtendedThinking>
          ${body.useExtendedThinking ? "Yes" : "No"}
        </ExtendedThinking>

        <ResearchInstructions>
          ${researchInstructions}
        </ResearchInstructions>

        <RetrySection>
          ${retrySection}
        </RetrySection>
      </TaskApproach>

      <TaskCriteria>
        Generate a detailed module specification that:
        1. Synthesizes the project requirements with additional skills and research topics
        2. Maintains the depth and detail level shown in the input examples
        3. Creates clear, actionable learning objectives
        4. Defines practical project briefs based on the provided examples
        5. Includes comprehensive research topics with guidance for learners
        6. Provides concrete examples for each project brief (minimum 3)
        7. Suggests interesting project twists to add challenge
        8. Maintains alignment with peer-led teaching philosophy
        ${body.enableResearch ? "9. Incorporates current best practices and trends discovered through web research" : ""}
      </TaskCriteria>

      <TaskSteps>
        <Step1>Think hard about what learning outcomes emerge when the content of "<ModuleInput>" is considered as a whole.</Step1>

        <Step2>
          ${body.enableResearch ? `
            1. Use web searches to check that these learning outcomes are not outdated compared to industry trends. Update the learning outcomes if appropriate, making sure they're appropriate to the cohort specified in "<ModuleInput/CohortInput>".
            2.` : `1.`} Keep the learning outcomes in mind when completing the next steps
        </Step2>

        <Step3>
          ${body.enableResearch ? `
            1. Use web searches to check that "<ModuleInput/ProjectsInput>" is not outdated compared to industry trends. Update the project briefs if appropriate, making sure they're appropriate to the cohort specified in "<ModuleInput/CohortInput>".
            2. Make sure that the projects are relevant to the learning outcomes
            3.` : `1.`} Keep the project briefs in mind when completing the next steps
        </Step3>

        <Step4>
          ${body.enableResearch ? `
            1. Use web searches to check that "<ModuleInput/ResearchInput>" is not outdated compared to industry trends. Update the research topics if appropriate, making sure they're appropriate to the cohort specified in "<ModuleInput/CohortInput>".
            2. Make sure the research topics are relevant to the learning outcomes
            3. Make sure the research topics are useful in completing the projects
            4.` : `1.`} Keep the research topics in mind when completing the next steps
        </Step4>

        <Step5>Generate the module</Step5>
      </TaskSteps>

      <TaskGuidelines>
        - Match the level of detail in the input examples
        - ProjectBriefs should include Overview, Criteria, Skills, and Examples
        - Research topics should include practical guidance for how to research them
        - Skills should be granular and specific (e.g., "Package management in Python" not "Coding in Python")
        - Examples should be diverse and substantially different from each other
        - Project twists should add interesting challenges without being essential
      </TaskGuidelines>
    </Task>

    <SchemaRequirements>
      ${schemaRequirements}
    </SchemaRequirements>
  </Prompt>`;
}
const AI_RESEARCH_DOMAINS = [
  // AI Platforms
  "anthropic.com",
  "claude.ai",
  "openai.com",
  "deepmind.google",
  "ai.google",
  "microsoft.com",
  "huggingface.co/blog",
  // Docs
  "js.langchain.com",
  "python.langchain.com",
  "modelcontextprotocol.io",
  "docs.python.org",
  // Resources (Software Dev)
  "dev.to",
  "github.com",
  "medium.com",
  "python.org",
  // News & Analysis
  "techcrunch.com",
  "thenextweb.com",
  "venturebeat.com",
  // Blogs & Newsletters
  "deepgains.substack.com",
  "newsletter.pragmaticengineer.com",
  "simonwillison.net",
  "sundeepteki.org/blog",
  // Communities
  "stackoverflow.com",
  "news.ycombinator.com",
  // Academic & Research
  "arxiv.org",
  "acm.org",
  "ieee.org"
];
function createSSEStream(body, apiKey) {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const MAX_RETRIES = 3;
      let lastError = [];
      try {
        controller.enqueue(
          encoder.encode('data: {"type":"connected","message":"Generation started"}\n\n')
        );
        let model = new ChatAnthropic({
          anthropicApiKey: apiKey,
          modelName: "claude-sonnet-4-5-20250929",
          // Claude Sonnet 4.5
          temperature: 0.7,
          maxTokens: 16384,
          // Sonnet 4.5 supports up to 64K output tokens
          // timeout: 120000,
          streaming: true
        });
        if (body.enableResearch) {
          controller.enqueue(
            encoder.encode('data: {"type":"progress","message":"Enabling deep research with web search..."}\n\n')
          );
          model = model.bindTools([{
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 5,
            allowed_domains: AI_RESEARCH_DOMAINS
          }]);
        }
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: "progress",
              message: attempt === 1 ? "Analyzing input files..." : `Retry attempt ${attempt}/${MAX_RETRIES} with refined instructions...`
            })}

`)
          );
          const prompt = buildGenerationPrompt(body, attempt > 1 ? lastError : void 0);
          const messages = [
            new SystemMessage("You are an expert in (a) current AI engineering trends and (b) curriculum designer for peer-led AI Engineering courses."),
            new HumanMessage(prompt)
          ];
          controller.enqueue(
            encoder.encode('data: {"type":"progress","message":"Generating module content with Claude..."}\n\n')
          );
          let fullContent = "";
          const responseStream = await model.stream(messages);
          for await (const chunk of responseStream) {
            const textChunk = extractTextContent(chunk.content);
            if (textChunk) {
              fullContent += textChunk;
              const progressData = {
                type: "content",
                chunk: textChunk,
                message: "Streaming content..."
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(progressData)}

`)
              );
            }
          }
          controller.enqueue(
            encoder.encode('data: {"type":"validation_started","message":"Validating generated content..."}\n\n')
          );
          const xmlContent = extractModuleXML(fullContent);
          if (!xmlContent) {
            lastError = ["Failed to extract valid XML from response. Ensure output is wrapped in <Module>...</Module> tags."];
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: "validation_failed",
                message: `XML extraction failed (attempt ${attempt}/${MAX_RETRIES})`,
                errors: lastError
              })}

`)
            );
            if (attempt < MAX_RETRIES) {
              continue;
            } else {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: "error",
                  message: "Failed to generate valid XML after all retry attempts",
                  errors: lastError,
                  content: fullContent
                })}

`)
              );
              controller.close();
              return;
            }
          }
          const validation = validateModuleXML(xmlContent);
          if (validation.valid) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: "validation_success",
                message: "Schema validation passed!"
              })}

`)
            );
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: "complete",
                message: "Generation complete",
                content: fullContent,
                xmlContent,
                attempts: attempt,
                warnings: validation.warnings
              })}

`)
            );
            controller.close();
            return;
          } else {
            lastError = validation.errors;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: "validation_failed",
                message: `Schema validation failed (attempt ${attempt}/${MAX_RETRIES})`,
                errors: validation.errors,
                warnings: validation.warnings
              })}

`)
            );
            if (attempt < MAX_RETRIES) {
              continue;
            } else {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: "error",
                  message: `Schema validation failed after ${MAX_RETRIES} attempts`,
                  errors: validation.errors,
                  warnings: validation.warnings,
                  content: fullContent,
                  xmlContent
                })}

`)
              );
              controller.close();
              return;
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Stream error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: "error",
            message: errorMessage
          })}

`)
        );
        controller.close();
      }
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
async function generateModule(body, apiKey) {
  const MAX_RETRIES = 3;
  let lastError = [];
  try {
    let model = new ChatAnthropic({
      anthropicApiKey: apiKey,
      modelName: "claude-sonnet-4-5-20250929",
      // Claude Sonnet 4.5
      temperature: 0.7,
      maxTokens: 16384,
      // Sonnet 4.5 supports up to 64K output tokens
      timeout: 12e4
      // 2 minute timeout
    });
    if (body.enableResearch) {
      model = model.bindTools([{
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5,
        allowed_domains: AI_RESEARCH_DOMAINS
      }]);
    }
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`Generation attempt ${attempt}/${MAX_RETRIES}`);
      const prompt = buildGenerationPrompt(body, attempt > 1 ? lastError : void 0);
      const messages = [
        new SystemMessage("You are an expert in (a) current AI engineering trends and (b) curriculum designer for peer-led AI Engineering courses."),
        new HumanMessage(prompt)
      ];
      const response = await model.invoke(messages);
      const textContent = extractTextContent(response.content);
      console.log(`Response length: ${textContent.length} characters`);
      console.log(`Response starts with: ${textContent.substring(0, 100)}`);
      console.log(`Response ends with: ${textContent.substring(textContent.length - 100)}`);
      const xmlContent = extractModuleXML(textContent);
      if (!xmlContent) {
        console.warn("Failed to extract valid XML from response.");
        console.warn("Response length:", textContent.length, "characters");
        console.warn("First 500 chars:", textContent.substring(0, 500));
        console.warn("Last 500 chars:", textContent.substring(Math.max(0, textContent.length - 500)));
        lastError = [
          "Failed to extract valid XML from response.",
          `Response length: ${textContent.length} characters`,
          "Ensure output is complete with closing </Module> tag."
        ];
        if (attempt < MAX_RETRIES) {
          continue;
        } else {
          return json({
            success: false,
            message: "Failed to generate valid XML after all retry attempts",
            content: textContent,
            xmlContent: null,
            hasValidXML: false,
            validationErrors: lastError,
            attempts: attempt,
            metadata: {
              modelUsed: "claude-sonnet-4-5-20250929",
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              enableResearch: body.enableResearch ?? false,
              useExtendedThinking: body.useExtendedThinking ?? false
            }
          });
        }
      }
      console.log("Validating XML against schema...");
      const validation = validateModuleXML(xmlContent);
      if (validation.valid) {
        console.log("Validation passed");
        return json({
          success: true,
          message: "Module generated successfully",
          content: textContent,
          // Full text response (citations filtered out)
          xmlContent,
          // Extracted and validated XML
          hasValidXML: true,
          validationErrors: [],
          validationWarnings: validation.warnings,
          attempts: attempt,
          metadata: {
            modelUsed: "claude-sonnet-4-5-20250929",
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            enableResearch: body.enableResearch ?? false,
            useExtendedThinking: body.useExtendedThinking ?? false
          }
        });
      } else {
        console.warn(`Validation failed on attempt ${attempt}:`, validation.errors);
        lastError = validation.errors;
        if (attempt < MAX_RETRIES) {
          continue;
        } else {
          return json({
            success: false,
            message: `Schema validation failed after ${MAX_RETRIES} attempts`,
            content: textContent,
            xmlContent,
            hasValidXML: false,
            validationErrors: validation.errors,
            validationWarnings: validation.warnings,
            attempts: attempt,
            metadata: {
              modelUsed: "claude-sonnet-4-5-20250929",
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              enableResearch: body.enableResearch ?? false,
              useExtendedThinking: body.useExtendedThinking ?? false
            }
          });
        }
      }
    }
    throw new Error("Unexpected end of retry loop");
  } catch (err) {
    console.error("Generation error:", err);
    throw error(500, {
      message: err instanceof Error ? err.message : "Failed to generate module"
    });
  }
}

export { POST };
//# sourceMappingURL=_server.ts-df2a67d9.js.map
