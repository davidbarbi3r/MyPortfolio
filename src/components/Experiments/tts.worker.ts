import { KokoroTTS } from 'kokoro-js';

let tts: KokoroTTS | null = null;

console.log('Worker initialized');

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;
  console.log('Worker received message:', { type, payload });

  switch (type) {
    case 'init':
      try {
        tts = await KokoroTTS.from_pretrained(payload.modelId, {
          dtype: payload.dtype,
        });
        self.postMessage({ type: 'init_complete' });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        self.postMessage({ type: 'error', error: errorMessage });
      }
      break;

    case 'generate':
      if (!tts) {
        self.postMessage({ type: 'error', error: 'TTS not initialized' });
        return;
      }
      try {
        const audio = await tts.generate(payload.text, {
          voice: payload.voice,
        });
        self.postMessage({
          type: 'generate_complete',
          audio: audio.toWav()
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        self.postMessage({ type: 'error', error: errorMessage });
      }
      break;
  }
}; 
