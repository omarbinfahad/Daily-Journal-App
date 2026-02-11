// This function generates TTS audio URLs using a free TTS service
export const generateTTSUrl = (text: string, language: string = 'en'): string => {
  const encodedText = encodeURIComponent(text);
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${language}&client=tw-ob`;
};

// Language code mapping
export const getLanguageCode = (_word: string): string => {
  // For now, default to English.
  return 'en';
};

// Alternative: Using VoiceRSS (requires free API key)
export const generateVoiceRSSUrl = (text: string, apiKey: string): string => {
  const params = new URLSearchParams({
    key: apiKey,
    src: text,
    hl: 'en-us',
    c: 'MP3',
    f: '44khz_16bit_stereo',
  });
  return `https://api.voicerss.org/?${params.toString()}`;
};
