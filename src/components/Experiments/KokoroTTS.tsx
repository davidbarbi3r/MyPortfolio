import { useCallback, useEffect, useState, useRef } from 'react'

const model_id = "onnx-community/Kokoro-82M-ONNX";
const voices = ["af", "af_bella", "af_nicole", "af_sarah", "af_sky", "am_adam", "am_michael", "bf_emma", "bf_isabella", "bm_george", "bm_lewis"]

function KokoroTTS() {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [text, setText] = useState("Hello Beauty, je suis une IA text-to-speech, entre du texte et je te le dicte.")
  const [voice, setVoice] = useState("af")

  const workerRef = useRef<Worker | null>(null)

  const handleClick = useCallback(async () => {
    if (!workerRef.current) return
    setGenerating(true)
    workerRef.current.postMessage({
      type: 'generate',
      payload: {
        text,
        voice
      }
    });
  }, [text, voice])

  useEffect(() => {

    try {
      const worker = new Worker(new URL('./tts.worker.ts', import.meta.url), {
        type: 'module'
      });

      worker.onerror = (error) => {
        console.error('Worker error:', error);
      };

      worker.onmessage = async (e) => {
        console.log('Message received from worker:', e.data);
        // ... rest of your onmessage code ...
      };

      setLoading(true);
      worker.postMessage({
        type: 'init',
        payload: {
          modelId: model_id,
          dtype: "q8"
        }
      });

      workerRef.current = worker;
    } catch (error) {
      console.error('Error creating worker:', error);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);
  
  useEffect(() => {
    const worker = new Worker(new URL('./tts.worker.ts', import.meta.url), {
      type: 'module'
    });
    
    worker.onmessage = async (e) => {
      const { type, audio, error } = e.data;
      let audioContext: AudioContext;
      let source: AudioBufferSourceNode;

      switch (type) {
        case 'init_complete':
          setLoading(false);
          break;
        case 'generate_complete':
          audioContext = new AudioContext();
          source = audioContext.createBufferSource();
          source.buffer = await audioContext.decodeAudioData(audio);
          source.connect(audioContext.destination);
          source.start();
          setGenerating(false);
          break;
        case 'error':
          setLoading(false);
          setGenerating(false);
          break;
      }
    };

    setLoading(true);
    worker.postMessage({
      type: 'init',
      payload: {
        modelId: model_id,
        dtype: "q8"
      }
    });

    worker.onerror = (error) => {  // Add error handler
      console.error('Worker error:', error);
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  return (
    <div className='flex items-center justify-center h-screen p-4'>
      <div className='rounded-xl border bg-card text-card-foreground shadow container'>
        {loading && <div className='p-6 pb-0'>Le modèle est en cours de chargement, ça peut prendre un peu de temps ...</div>}
        <div className="grid w-full gap-2 p-6">
          <textarea
            placeholder="Votre message ici..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading || generating}
          />
          <p className="text-sm text-muted-foreground opacity-50">
            Il vaut mieux écrire en anglais pour une meilleure prononciation.
          </p>
          <div className='flex flex-row gap-2'>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              disabled={loading || generating}
            >
              {voices.map((voice) => (
                <option key={voice} value={voice} className="capitalize">{voice}</option>
              ))}
            </select>
            <button onClick={handleClick} className='ml-auto' disabled={loading || generating}>
              {generating ? 'Chargement...' : 'Générer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KokoroTTS;
