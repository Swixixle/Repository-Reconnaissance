// STUB: Replit deployment integration — experimental surface, not the primary Debrief API.
// Planned: Optional Whisper/voice helpers when the app runs on Replit.
// Status: Not production-ready for standalone product SLAs. Do not expose to users without review.

export { registerAudioRoutes } from "./routes";
export {
  openai,
  detectAudioFormat,
  convertToWav,
  ensureCompatibleFormat,
  type AudioFormat,
  voiceChat,
  voiceChatStream,
  textToSpeech,
  textToSpeechStream,
  speechToText,
  speechToTextStream,
} from "./client";
