
/* plugin config definition: used by mmir-plugin-exports to generate module-config.gen.js */

import { MediaManagerPluginEntry, SpeechConfigPluginEntry } from 'mmir-lib';

/**
 * (optional) entry "ttsDFKIToHyVeXhr" in main configuration.json
 * for settings of ttsDFKIToHyVeXhr module.
 *
 * Some of these settings can also be specified by using the options argument
 * in the TTS functions of {@link MediaManagerWebInput}, e.g.
 * {@link MediaManagerWebInput#recognize} or {@link MediaManagerWebInput#startRecord}
 * (if specified via the options, values will override configuration settings).
 */
export interface PluginConfig {
  ttsDFKIToHyVeXhr?: PluginConfigEntry | PluginSpeechConfigEntry;
}

/**
 * Speech config entry for the plugin: per language (code) configuration e.g. for
 * adjusting the language-code or setting a specific voice for the language
 */
export interface PluginSpeechConfigEntry extends SpeechConfigPluginEntry {
  /** OPTIONAL
   * the language/country for TTS
   * @type string
   */
  language?: string;
}

export interface PluginConfigEntry extends MediaManagerPluginEntry {

  /** the plugin/module which which will load/use this specific TTS implementation
   * @default mmir-plugin-tts-core-xhr.js
   */
  mod: 'mmir-plugin-tts-core-xhr.js';
  /**
   * the plugin type
   * @default "tts"
   */
  type: 'tts';
}

export enum RemoteUrls {
  baseUrl = 'https://dfki-3109.dfki.de/tts/run/predict'
}
