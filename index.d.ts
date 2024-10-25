
export * from './config';

/// <reference types="mmir-lib" />
import { TTSOnError, TTSOnComplete, TTSOnReady, MediaManager, TTSOptions } from 'mmir-lib';

declare interface PluginTTSOptions extends TTSOptions {
  /**
   * [supported option]
   * set language/country for TTS
   */
  language?: string;
}

declare interface PluginMediaManager extends MediaManager {
  tts: (options: string | string[] | PluginTTSOptions, successCallback?: TTSOnComplete, failureCallback?: TTSOnError, onInit?: TTSOnReady, ...args: any[]) => void;
}
