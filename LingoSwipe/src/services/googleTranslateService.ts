const DEEPL_API_KEY = process.env.EXPO_PUBLIC_DEEPL_API_KEY || '';
const DEEPL_API_URL = process.env.EXPO_PUBLIC_DEEPL_API_URL || 'https://api-free.deepl.com/v2/translate';
const GOOGLE_TTS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_TTS_API_KEY || '';

class GoogleTranslateService {
  async translateText(text: string, targetLanguage: string, sourceLanguage: string = 'en'): Promise<string> {
    if (!DEEPL_API_KEY) {
      return text;
    }

    try {
      const source = this.toDeepLLanguageCode(sourceLanguage);
      const target = this.toDeepLLanguageCode(targetLanguage);
      const params = new URLSearchParams({
        text,
        source_lang: source,
        target_lang: target,
      });

      const response = await fetch(DEEPL_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();
      if (data?.translations?.[0]?.text) {
        return data.translations[0].text as string;
      }

      throw new Error(data?.message || 'Translation failed');
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  generateTTSUrl(text: string, languageCode: string): string {
    const encodedText = encodeURIComponent(text);
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${languageCode}&client=tw-ob`;
  }

  async getAudioUrl(text: string, languageCode: string): Promise<string> {
    if (!GOOGLE_TTS_API_KEY) {
      return this.generateTTSUrl(text, languageCode);
    }

    try {
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode,
            name: this.getVoiceName(languageCode),
          },
          audioConfig: {
            audioEncoding: 'MP3',
          },
        }),
      });

      const data = await response.json();
      if (data?.audioContent) {
        return `data:audio/mp3;base64,${data.audioContent as string}`;
      }

      return this.generateTTSUrl(text, languageCode);
    } catch (error) {
      console.error('TTS error:', error);
      return this.generateTTSUrl(text, languageCode);
    }
  }

  private getVoiceName(languageCode: string): string {
    const voices: Record<string, string> = {
      es: 'es-ES-Standard-A',
      fr: 'fr-FR-Standard-A',
      de: 'de-DE-Standard-A',
      it: 'it-IT-Standard-A',
      pt: 'pt-BR-Standard-A',
      ja: 'ja-JP-Standard-A',
      en: 'en-US-Standard-A',
    };

    return voices[languageCode] || 'en-US-Standard-A';
  }

  private toDeepLLanguageCode(language: string): string {
    const normalized = language.toLowerCase();
    const map: Record<string, string> = {
      en: 'EN',
      english: 'EN',
      es: 'ES',
      spanish: 'ES',
      fr: 'FR',
      french: 'FR',
      de: 'DE',
      german: 'DE',
      it: 'IT',
      italian: 'IT',
      pt: 'PT-BR',
      portuguese: 'PT-BR',
      ja: 'JA',
      japanese: 'JA',
    };

    return map[normalized] || normalized.toUpperCase();
  }
}

export const googleTranslateService = new GoogleTranslateService();
