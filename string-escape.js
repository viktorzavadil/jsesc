/*! http://mths.be/stringescape v0.2.1 by @mathias */
;(function(root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var object = {};
	var hasOwnProperty = object.hasOwnProperty;
	var forOwn = function(object, callback) {
		var key;
		for (key in object) {
			if (hasOwnProperty.call(object, key)) {
				callback(key, object[key]);
			}
		}
	};

	var extend = function(destination, source) {
		if (!source) {
			return destination;
		}
		forOwn(source, function(key, value) {
			destination[key] = value;
		});
		return destination;
	};

	var forEach = function(array, callback) {
		var length = array.length;
		var index = -1;
		while (++index < length) {
			callback(array[index]);
		}
	};

	var toString = object.toString;
	var isArray = function(value) {
		return toString.call(value) == '[object Array]';
	};
	var isString = function(value) {
		return typeof value == 'string' ||
			toString.call(value) == '[object String]';
	};

	/*--------------------------------------------------------------------------*/

	// http://mathiasbynens.be/notes/javascript-escapes#single
	var singleEscapes = {
		'"': '\\"',
		'\'': '\\\'',
		'\\': '\\\\',
		'\b': '\\b',
		'\f': '\\f',
		'\n': '\\n',
		'\r': '\\r',
		'\t': '\\t'
		// `\v` is omitted intentionally, because in IE < 9, '\v' == 'v'
		// '\v': '\\x0B'
	};
	var regexSingleEscape = /["'\\\b\f\n\r\t]/;

	var regexDigit = /[0-9]/;
	var regexWhitelist = /[\x20\x21\x23-\x26\x28-\x5B\x5D-\x7E]/;

	var stringEscape = function(argument, options) {
		// Handle options
		var defaults = {
			'escapeEverything': false,
			'quotes': 'single',
			'wrap': false,
			'compact': true,
			'indent': '\t'
		};
		options = extend(defaults, options);
		if (options.quotes != 'single' && options.quotes != 'double') {
			options.quotes = 'single';
		}
		var json = options.json;
		if (json) {
			options.quotes = 'double';
			options.wrap = true;
		}
		var quote = options.quotes == 'double' ? '"' : '\'';
		var compact = options.compact;
		var indent = options.indent;
		var newLine = compact ? '' : '\n';
		var result;

		if (!isString(argument)) {
			if (isArray(argument)) {
				// assume it’s a flat array with only string values
				result = [];
				options.wrap = true;
				forEach(argument, function(value) {
					result.push(
						(compact ? '' : indent) +
						stringEscape(value, options)
					);
				});
				return '[' + newLine + result.join(',' + newLine) + newLine + ']';
			} else {
				// assume it’s a flat object with only string values
				result = [];
				options.wrap = true;
				forOwn(argument, function(key, value) {
					result.push(
						(compact ? '' : indent) +
						stringEscape(key, options) + ':' +
						(compact ? '' : ' ') +
						stringEscape(value, options)
					);
				});
				return '{' + newLine + result.join(',' + newLine) + newLine + '}';
			}
		}

		var string = argument;
		// Loop over each code unit in the string and escape it
		var index = -1;
		var length = string.length;
		result = '';
		while (++index < length) {
			var character = string.charAt(index);
			if (!options.escapeEverything) {
				if (regexWhitelist.test(character)) {
					// It’s a printable ASCII character that is not `"`, `'` or `\`,
					// so don’t escape it.
					result += character;
					continue;
				}
				if (character == '"') {
					result += quote == character ? '\\"' : character;
					continue;
				}
				if (character == '\'') {
					result += quote == character ? '\\\'' : character;
					continue;
				}
			}
			if (
				character == '\0' &&
				!json &&
				!regexDigit.test(string.charAt(index + 1))
			) {
				result += '\\0';
				continue;
			}
			if (regexSingleEscape.test(character)) {
				// no need for a `hasOwnProperty` check here
				result += singleEscapes[character];
				continue;
			}
			var charCode = character.charCodeAt(0);
			var hexadecimal = charCode.toString(16).toUpperCase();
			var longhand = hexadecimal.length > 2 || json;
			var escaped = '\\' + (longhand ? 'u' : 'x') +
				('0000' + hexadecimal).slice(longhand ? -4 : -2);
			result += escaped;
			continue;
		}
		if (options.wrap) {
			result = quote + result + quote;
		}
		return result;
	};

	stringEscape.version = '0.2.1';

	/*--------------------------------------------------------------------------*/

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return stringEscape;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = stringEscape;
		} else { // in Narwhal or RingoJS v0.7.0-
			freeExports.stringEscape = stringEscape;
		}
	} else { // in Rhino or a web browser
		root.stringEscape = stringEscape;
	}

}(this));
