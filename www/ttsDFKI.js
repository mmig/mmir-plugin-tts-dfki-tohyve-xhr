
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

define(['mmirf/mediaManager', 'mmirf/configurationManager', 'mmirf/languageManager', 'mmirf/util/loadFile'], function(mediaManager, config, lang, load){

	/**
	 * @readonly
	 * @inner
	 * @default "ttsMary"
	 * @memberOf mmir.env.media.MaryWebAudioTTSImpl#
	 */
	var _pluginName = 'ttsDFKI';

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

});
