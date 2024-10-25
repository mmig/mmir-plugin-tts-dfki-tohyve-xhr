;(function (root, factory) {

	//mmir legacy mode: use pre-v4 API of mmir-lib
	var _isLegacyMode3 = true;// v3 or below
	var _isLegacyMode4 = true;// v4 or below
	var _isLegacyMode6 = true;// v6 or below
	var mmirName = typeof MMIR_CORE_NAME === 'string'? MMIR_CORE_NAME : 'mmir';
	var _mmir = root[mmirName];
	if(_mmir){
		//set legacy-mode if version is < v4, or < v5, or < v7 (isVersion() is available since v4)
		_isLegacyMode3 = _mmir.isVersion? _mmir.isVersion(4, '<') : true;
		_isLegacyMode4 = _mmir.isVersion? _mmir.isVersion(5, '<') : true;
		_isLegacyMode6 = _mmir.isVersion? _mmir.isVersion(7, '<') : true;
	}
	var _req = _mmir? _mmir.require : require;

	var isArray = _req((_isLegacyMode3? '': 'mmirf/') + 'util/isArray');
	var getId;
	if(_isLegacyMode4){
		// HELPER: backwards compatibility v4 for module IDs
		getId = function(ids){
			if(isArray(ids)){
				return ids.map(function(id){ return getId(id);});
			}
			return ids? ids.replace(/\bresources$/, 'constants') : ids;
		};
		var __req = _req;
		_req = function(deps, success, error, completed){
			var args = [getId(deps), success, error, completed];
			return __req.apply(null, args);
		};
	} else if(!_isLegacyMode3) {
		getId = function(ids){ return ids; };
	}

	if(_isLegacyMode3){
		// HELPER: backwards compatibility v3 for module IDs
		var __getId = getId;
		getId = function(ids){
			if(isArray(ids)) return __getId(ids);
			return ids? __getId(ids).replace(/^mmirf\//, '') : ids;
		};
	}

	var extend, replacedMod;
	if(_isLegacyMode6) {
		extend = _req('mmirf/util/extend');
		//upgrage mmir < v7:
		// proxy require calls from within the wrapped module to replaced
		// implementations if necessary (i.e. isolated changed modules)
		replacedMod = {};
		var ___req = _req;
		_req = function(deps, success, error, completed){
			if(typeof deps === 'string' && replacedMod[getId(deps)]) return replacedMod[getId(deps)];
			if(success){
				var _success = success;
				success = function(){
					deps = getId(deps);
					for(var i=deps.length-1; i >= 0; --i){
						if(deps[i]==='require') arguments[i] = _req;
						else if(replacedMod[deps[i]]) arguments[i] = replacedMod[deps[i]];
					}
					_success.apply(null, arguments);
				};
			}
			return ___req.apply(null, [deps, success, error, completed]);
		}
	}

	if(_isLegacyMode3){
		//HELPER: backwards compatibility v3 for configurationManager.get():
		var config = _req('mmirf/configurationManager');
		if(!config.__get){
			config = extend({}, config);
			replacedMod[getId('mmirf/configurationManager')] = config;
			config.__get = config.get;
			config.get = function(propertyName, useSafeAccess, defaultValue){
				return this.__get(propertyName, defaultValue, useSafeAccess);
			};
		}
	}

	if(_isLegacyMode6) {
		//upgrage mmir < v7: add impl. for mediaManager.loadPlugin()
		var mediaManager = _req('mmirf/mediaManager');
		if(!mediaManager.loadPlugin && mediaManager.loadFile){
			mediaManager.loadPlugin = mediaManager.loadFile;
		}
		//patch changed interpretation of 3rd parameter in mmir.config.get(paht, defaultValue, boolean):
		var config = _req('mmirf/configurationManager');
		if(!config.___get){
			config = extend({}, config);
			replacedMod[getId('mmirf/configurationManager')] = config;
			config.___get = config.get;
			config.get = function(name, defaultValue, setDefaultIfUnset){
				var res = this.___get(isArray(name) ? name.slice() : name);
				if(typeof res === 'undefined' && defaultValue !== 'undefined'){
					res = defaultValue;
					if(setDefaultIfUnset){
						this.set(isArray(name) ? name.slice() : name, defaultValue);
					}
				}
				return res;
			};
		}
	}

	if(_isLegacyMode4){

		//backwards compatibility v3 and v4:
		// plugin instance is "exported" to global var newMediaPlugin
		root['newWebAudioTtsImpl'] = factory(_req);

	} else {

		if (typeof define === 'function' && define.amd) {
			// AMD. Register as an anonymous module.
			define(['require'], function (require) {
				//replace with modified require if necessary;
				if(__req) __req = require;
				else if(___req) ___req = require;
				return factory(_req);
			});
		} else if (typeof module === 'object' && module.exports) {
			// Node. Does not work with strict CommonJS, but
			// only CommonJS-like environments that support module.exports,
			// like Node.
			module.exports = factory(_req);
		}
	}

}(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : this, function (require) {

	
/**
 * Media Module: Implementation for Text-To-Speech via MARY TTS
 *
 * @requires CSP for accessing the MARY TTS server, e.g. for default server URL "media-src http://mary.dfki.de:59125/" or "default-src http://mary.dfki.de:59125/"
 *           NOTE if you have configured a different server URL, then that one needs to be enabled via CSP
 *
 * @class MaryWebAudioTTSImpl
 * @memberOf mmir.env.media
 * @hideconstructor
 *
 */


	
  var mediaManager = require('mmirf/mediaManager');
  var config = require('mmirf/configurationManager');
  var lang = require('mmirf/languageManager');
  var load = require('mmirf/util/loadFile');

  
    var exported = (function(){
      {

	/**
	 * @readonly
	 * @inner
	 * @default "ttsMary"
	 * @memberOf mmir.env.media.MaryWebAudioTTSImpl#
	 */
	var _pluginName = 'ttsDFKIToHyVeXhr';

	/**
	 * @readonly
	 * @inner
	 * @default "https://dfki-3109.dfki.de/"
	 * @memberOf mmir.env.media.MaryWebAudioTTSImpl#
	 */
	var _defaultServerPath = 'https://dfki-3109.dfki.de/';

	return function createDfkiTTSImpl(_defaultLogger){

		/**
		 * separator char for language- / country-code (specific to TTS service)
		 *
		 * @memberOf mmir.env.media.MaryWebAudioTTSImpl#
		 * @private
		 */
		var _langSeparator = void(0);

		/** @memberOf mmir.env.media.MaryWebAudioTTSImpl#
		 * @private
		 */
		var _getLangParam;
		/**
		 * HELPER retrieve language setting and apply impl. specific corrections/adjustments
		 * (i.e. deal with MARY specific quirks for language/country codes)
		 *
		 * @memberOf mmir.env.media.MaryWebAudioTTSImpl#
		 * @private
		 */
		var _getFixedLang = function(options){

			var locale = _getLangParam(options, _langSeparator);

			return lang.fixLang('mary', locale);
		};

		var synchronousRequest = function(url, requestOptions){
			const xhr = new XMLHttpRequest();
			xhr.open(requestOptions.method, url, false);

			for (const header in requestOptions.headers) {
				xhr.setRequestHeader(header, requestOptions.headers[header]);
			}

			xhr.send(requestOptions.body);

			if (xhr.status === 200) {
				console.log("Response received:", xhr.responseText);
				return JSON.parse(xhr.responseText);
			} else {
				console.error("Error:", xhr.status);
				return null;
			}
		}

		/**  @memberOf mmir.env.media.MaryWebAudioTTSImpl#
		 * @private
		 */
		var generateTTSURL = function(text, options){

			getLanguageList(function(data){console.log(data)}, function(data){console.log("error:", + data)});

			console.log("TEXT: ", text);

			var lang = _getFixedLang(options);
			console.log("lang: ", lang);

			let payload = {
				"data": [
					lang,
					text	
				]
			};

			const headers = {
				"Content-Type": "application/json"
			}; 

			const url = "https://dfki-3109.dfki.de/tts/run/predict";
			
			const requestOptions = {
				method: "POST",
				headers: headers,
				body: JSON.stringify(payload)
			};

			let responseJSON = synchronousRequest(url, requestOptions);

			console.log(responseJSON);

			return "https://dfki-3109.dfki.de/tts/file=" + responseJSON["data"][0]["name"];
		};

		/**  @memberOf mmir.env.media.MaryWebAudioTTSImpl#
		 * @private
		 */
		var createAudio = function(sentence, options, onend, onerror, oninit){
			console.log("creating audio");
			let url = generateTTSURL(sentence, options);
			console.log("URL: ", url);
			return mediaManager.getURLAsAudio(
					url,
					onend, onerror, oninit
			);

		};

		/** @memberOf mmir.env.media.MaryWebAudioTTSImpl#
		 * @requires CrossDomain and CSP: allow access to baseUrl (default: "http://mary.dfki.de:59125/")
		 * @see mmir.MediaManager#getSpeechLanguages
		 * @private
		 */
		var getLanguageList = function(callback, onerror){
			callback(["de", "en"]);
		};


		/** @memberOf mmir.env.media.MaryWebAudioTTSImpl#
		 * @requires CrossDomain and CSP: allow access to baseUrl (default: "http://mary.dfki.de:59125/")
		 * @see mmir.MediaManager#getVoices
		 * @private
		 */
		var getVoiceList = function(options, callback, onerror){
			callback([]);	
		};

		/**  @memberOf mmir.env.media.MaryWebAudioTTSImpl# */
		return {
			/**
			 * @public
			 * @memberOf mmir.env.media.MaryWebAudioTTSImpl.prototype
			 */
			getPluginName: function(){
				return _pluginName;
			},
			/**
			 * @public
			 * @memberOf mmir.env.media.MaryWebAudioTTSImpl.prototype
			 */
			getCreateAudioFunc: function(){
				return createAudio;
			},
			/**
			 * @public
			 * @memberOf mmir.env.media.MaryWebAudioTTSImpl.prototype
			 */
			getLanguageListFunc: function(){
				return getLanguageList;
			},
			/**
			 * @public
			 * @memberOf mmir.env.media.MaryWebAudioTTSImpl.prototype
			 */
			getVoiceListFunc: function(){
				return getVoiceList;
			},
			/**
			 * @public
			 * @memberOf mmir.env.media.MaryWebAudioTTSImpl.prototype
			 */
			setLangParamFunc: function(getLangParamFunc){
				_getLangParam = getLangParamFunc;
			},
			/**
			 * @public
			 * @memberOf mmir.env.media.MaryWebAudioTTSImpl.prototype
			 */
			setVoiceParamFunc: function(getVoiceParamFunc){
				_getVoiceParam = getVoiceParamFunc;
			}
		};//END: return { ...

	};//END: createMaryTTSImpl(defaultLogger){...

}
    })();
    
    // already set var(s): exported
    if(typeof exported === 'function'){
      var expArgsLen = exported.length;
      if(expArgsLen > 0){

        if(expArgsLen > 1){
          console.warn('unknown plugin factory function parameters: expected 0 to 1 parameters, but got ' + expArgsLen);
        }
        exported = exported(require('mmirf/logger').create());

      } else {
        exported = exported();
      }
    }

    return exported;
;


	


}));
