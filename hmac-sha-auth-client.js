/**
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

/**
 * Javascript HMAC SHA Auth client for Signature-PHP by Philip Brown (https://github.com/philipbrown/signature-php)
 * 
 * Depends on CryptoJS (hmac-md5.js and hmac-sha256.js)
 *
 * See it at: https://github.com/afibanez/hmac-sha-auth-cli
 *
 * @version 2.0.4
 *
 * (c) 2015 Angel Fernández a.k.a afibanez <angelfernandezibanez@gmail.com>
 */

(function(window)
{
	'use strict';
	function define_hmacshaauthcli()
	{
		var HMACShaAuthCli = {};
		HMACShaAuthCli.version = "2.0.4";

		// Has to be the same with https://github.com/philipbrown/signature-php
		var server_version = "5.1.2";

		// Main function, return your params with Auth Params included
		HMACShaAuthCli.includeAuthParams = function(user,passwd,url,method,params)
		{
			// Auth Params
			var auth = {
				auth_version : server_version,
				auth_key : user,
				auth_timestamp : Date.now() / 1000 | 0 // timestamp in seconds
			};

			var payload = makePayload(params,auth);
			auth['auth_signature'] = makeSignature(payload, method, url, passwd);
			deepExtend(params,auth);
		}

		// In 1.0.0 i done a typo error. For dont lose compatibility
		HMACShaAuthCli.inludeAuthParams = function(user,passwd,url,method,params)
		{
			return HMACShaAuthCli.includeAuthParams(user,passwd,url,method,params);
		}

		// Util function, convert JS Object of params to URL GET format for GET petitions
		HMACShaAuthCli.addParamsToUrl = function(url,params)
		{
			return url+"?"+serialize(params);
		}

		var makePayload = function(params,auth)
		{
			var payload = {};

			// Merge params<->auth
			deepExtend(payload,params,auth);

			// To Lowercase
			payload = objectToLowerCase(payload);

			// Sort object keys
			payload = sortObjectByKey(payload);

			return payload;
		}


		var makeSignature = function(payload, method, uri, secret){
			payload = urldecode(http_build_query(payload));
			payload = method+"\n"+uri+"\n"+payload;
			var hmacbin = CryptoJS.HmacSHA256(payload, secret);
			return CryptoJS.enc.Hex.stringify(hmacbin);
		}

		// From http://youmightnotneedjquery.com/
		var deepExtend = function(out) {
			out = out || {};

			for (var i = 1; i < arguments.length; i++) {
				var obj = arguments[i];

				if (!obj)
					continue;

				for (var key in obj) {
					if (obj.hasOwnProperty(key)) {
						if (typeof obj[key] === 'object'){
							if (Object.keys(obj[key]).length > 0){ // Empty objects are not sent, so don't copy them #byAngel
								out[key] = deepExtend(out[key], obj[key]);
							}
						}
						else
							out[key] = obj[key];
					}
				}
			}

			return out;
		};

		var objectToLowerCase = function(myObj)
		{
			var newObj = {};
			for (var attrname in myObj) { newObj[attrname.toLowerCase()] = myObj[attrname]; }
			return newObj;
		}

		var sortObjectByKey = function(myObj)
		{
			var newObj = {};
			var keys = [];
			var k;
			for (k in myObj){
				if (myObj.hasOwnProperty(k)){
					keys.push(k);
				}
			}
			keys.sort();

			for (var i = 0; i < keys.length; i++){
				k = keys[i];
				newObj[k] = myObj[k];
			}

			return newObj;
		}


		// https://gist.github.com/lukelove/674274
		var http_build_query = function (formdata, numeric_prefix, arg_separator){
			var value, key, tmp = [], that = this;

			var urlencode = function (str) {
				str = (str+'').toString();
				return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
			};

			var _http_build_query_helper = function (key, val, arg_separator) {
				var k, tmp = [];
				if (val === true) {
					val = "true"; // On GET/POST/PUT/DELETE, PHP converts boolean to string #byAngel
				} else if (val === false) {
					val = "false";
				}
				if (val !== null && typeof(val) === "object") {
					for (k in val) {
						if (val[k] !== null) {
							tmp.push(_http_build_query_helper(key + "[" + k + "]", val[k], arg_separator));
						}
					}
					return tmp.join(arg_separator);
				} else if (typeof(val) !== "function") {
					return urlencode(key) + "=" + urlencode(val);
				} else if (typeof(val) == "function") {
								return '';
				} else {
					throw new Error('There was an error processing for http_build_query().');
				}
			};
		 
			if (!arg_separator) {
				arg_separator = "&";
			}
			for (key in formdata) {
				value = formdata[key];
				if (numeric_prefix && !isNaN(key)) {
					key = String(numeric_prefix) + key;
				}
				tmp.push(_http_build_query_helper(key, value, arg_separator));
			}
		 
			return tmp.join(arg_separator);
		};

		var urldecode = function(str) {
			//       discuss at: http://phpjs.org/functions/urldecode/
			//      original by: Philip Peterson
			//      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			//      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			//      improved by: Brett Zamir (http://brett-zamir.me)
			//      improved by: Lars Fischer
			//      improved by: Orlando
			//      improved by: Brett Zamir (http://brett-zamir.me)
			//      improved by: Brett Zamir (http://brett-zamir.me)
			//         input by: AJ
			//         input by: travc
			//         input by: Brett Zamir (http://brett-zamir.me)
			//         input by: Ratheous
			//         input by: e-mike
			//         input by: lovio
			//      bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			//      bugfixed by: Rob
			// reimplemented by: Brett Zamir (http://brett-zamir.me)
			//             note: info on what encoding functions to use from: http://xkr.us/articles/javascript/encode-compare/
			//             note: Please be aware that this function expects to decode from UTF-8 encoded strings, as found on
			//             note: pages served as UTF-8
			//        example 1: urldecode('Kevin+van+Zonneveld%21');
			//        returns 1: 'Kevin van Zonneveld!'
			//        example 2: urldecode('http%3A%2F%2Fkevin.vanzonneveld.net%2F');
			//        returns 2: 'http://kevin.vanzonneveld.net/'
			//        example 3: urldecode('http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a');
			//        returns 3: 'http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a'
			//        example 4: urldecode('%E5%A5%BD%3_4');
			//        returns 4: '\u597d%3_4'

			return decodeURIComponent((str + '')
				.replace(/%(?![\da-f]{2})/gi, function() {
					// PHP tolerates poorly formed escape sequences
					return '%25';
				})
				.replace(/\+/g, '%20'));
		}

		var serialize = function(obj, prefix) {
			var str = [];
			for(var p in obj) {
				if (obj.hasOwnProperty(p)) {
					var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
					str.push(typeof v == "object" ?
						serialize(v, k) :
						encodeURIComponent(k) + "=" + encodeURIComponent(v));
				}
			}
			return str.join("&");
		}

		return HMACShaAuthCli;
	}

	// define globally if it doesn't already exist
	if(typeof(HMACShaAuthCli) === 'undefined'){
		window.HMACShaAuthCli = define_hmacshaauthcli();
	}
	else{
		console.log("HMACShaAuthCli already defined.");
	}

})(window);