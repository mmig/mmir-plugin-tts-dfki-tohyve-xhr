
/*********************************************************************
 * This file is automatically generated by mmir-plugins-export tools *
 *        Do not modify: ANY CHANGES WILL GET DISCARDED              *
 *********************************************************************/

module.exports = {
  pluginName: "ttsDFKIToHyVeXhr",
  config: [
    /**
     * the plugin type
     * @default "tts"
     */
    "type",
    /** the plugin/module which which will load/use this specific TTS implementation
     * @default mmir-plugin-tts-core-xhr.js
     */
    "mod"
  ],
  defaultValues: {
    type: "tts",
    mod: "mmir-plugin-tts-core-xhr.js"
  },
  speechConfig: [
    /** OPTIONAL
     * the language/country for TTS
     * @type string
     */
    "language"
  ],
  remoteUrls: {
    baseUrl: "https://dfki-3109.dfki.de/tts/run/predict"
  }
};
