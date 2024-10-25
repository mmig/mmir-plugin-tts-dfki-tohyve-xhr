# mmir-plugin-tts-dfki-tohyve-xhr

Cordova plugin for the MMIR framework that adds Text To Speech (TTS) synthesis via [DFKI-NLP ToHyVe TTS web services][1]
(based on [Nvidia NeMo 2.0][2])


## configure CSP

(e.g. index.html): allow access to the URL of the TTS service, e.g. `https://dfki-3109.dfki.de`
```
  <meta http-equiv="Content-Security-Policy"
        content="default-src https://dfki-3109.dfki.de ...
```


## configuration.json:
```
{

	...

	"mediaManager": {
    	"plugins": {
    		"browser": [
    			...
                {"mod": "webAudioTextToSpeech", "config": "ttsDFKIToHyVeXhr"},
                ...
    		],
    		"cordova": [
    			...
                {"mod": "webAudioTextToSpeech", "config": "ttsDFKIToHyVeXhr"},
                ...
    		]
    	}
    },
...

}
```

supported options for recognize() / startRecord():
 * `language`: String

supported custom options for recognize() / startRecord():  
 _no custom options supported_


[1]: https://github.com/DFKI-NLP/tohyve-services/tree/master/text_to_speech_conversion
[2]: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/tts/intro.html
