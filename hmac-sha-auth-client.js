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
 * @version 1.0.0
 *
 * (c) 2015 Angel Fernández a.k.a afibanez <angelfernandezibanez@gmail.com>
 */

(function(window)
{
	'use strict';
	function define_hmacshaauthcli()
	{
		var HMACShaAuthCli = {};
		HMACShaAuthCli.version = "1.0.0";

		// Has to the same with https://github.com/philipbrown/signature-php
		var server_version = "3.0.2"; 

		// Main function, return your params with Auth Params included
		HMACShaAuthCli.inludeAuthParams = function(user,passwd,url,method,params)
		{
			// Auth Params
			var auth = {
				auth_version : server_version,
				auth_key : user,
				auth_timestamp : Date.now() / 1000 | 0 // timestamp in seconds
			};

			var payload = makePayload(params);
			auth['auth_signature'] = makeSignature(payload, method, url, passwd);
			deepExtend(params,auth);
		}

		// Util function, convert JS Object of params to URL GET format for GET petitions
		HMACShaAuthCli.addParamsToUrl = function(url,params)
		{
			return url+"?"+serialize(params);
		}

		var makePayload = function(params)
		{
			// To Lowercase
			var payload = objectToLowerCase(params);

			// Sort object keys
			payload = sortObjectByKey(payload);

			return payload;
		}


		var makeSignature = function(payload, method, uri, secret){
			payload = urldecode(build_query(payload));
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
						if (typeof obj[key] === 'object')
							deepExtend(out[key], obj[key]);
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

		// https://gist.github.com/luk-/2722097
		var build_query = function (obj, num_prefix, temp_key) {

			var output_string = [];
			Object.keys(obj).forEach(function (val) {
				var key = val;
				num_prefix && !isNaN(key) ? key = num_prefix + key : '';

				var key = encodeURIComponent(key.replace(/[!'()*]/g, escape));
				temp_key ? key = temp_key + '[' + key + ']' : '';

				if (typeof obj[val] === 'object') {
					var query = build_query(obj[val], null, key);
					output_string.push(query);
				}

				else {
					var value = encodeURIComponent(obj[val].toString().replace(/[!'()*]/g, escape));

					if (value === "true") {
						value = "1";
					} else if (value === "false") {
						value = "0";
					}

					output_string.push(key + '=' + value);
				}
			})

			return output_string.join('&');
		}

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
