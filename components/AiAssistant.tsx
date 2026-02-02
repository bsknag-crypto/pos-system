
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';

// Manual implementation of encode/decode as per guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Custom audio decoding function for raw PCM streams
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AiAssistant: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcriptions, setTranscriptions] = useState<string[]>([]);

  // Refs for audio processing and session management
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const toggleConnection = async () => {
    if (isConnected) {
      if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
      }
      setIsConnected(false);
      return;
    }

    setIsConnecting(true);
    try {
      // Create a new instance right before making an API call to ensure current credentials.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: 'You are FreshFlow, an intelligent grocery store assistant. Help staff with inventory queries, customer meal planning, and store operations. Keep responses helpful and concise.',
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    int16[i] = inputData[i] * 32768;
                }
                
                const pcmBlob: Blob = {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000',
                };

                // CRITICAL: Solely rely on sessionPromise resolves to send realtime input.
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Update transcriptions history
            if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                setTranscriptions(prev => [...prev.slice(-4), `Assistant: ${text}`]);
            } else if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                setTranscriptions(prev => [...prev.slice(-4), `You: ${text}`]);
            }

            // Handle interruption: stop all currently playing audio sources
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }

            // Decode and schedule the model's audio response
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
                nextStartTimeRef.current = Math.max(
                  nextStartTimeRef.current,
                  outputCtx.currentTime,
                );
                
                const audioBuffer = await decodeAudioData(
                  decode(base64EncodedAudioString),
                  outputCtx,
                  24000,
                  1,
                );

                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                
                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                });

                // Scheduling ensures gapless playback by tracking end times.
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
                sourcesRef.current.add(source);
            }
          },
          onclose: () => setIsConnected(false),
          onerror: (e) => {
            console.error('Session error:', e);
            setIsConnected(false);
          },
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (error) {
      console.error('Connection failed:', error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center">
      <div className="relative mb-12">
        <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
          isConnected ? 'bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)] scale-110' : 'bg-slate-200'
        }`}>
          {isConnected && (
            <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-20"></div>
          )}
          <span className="text-6xl">{isConnected ? '🗣️' : '🎙️'}</span>
        </div>
        
        {isConnected && (
           <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`w-1 bg-white rounded-full transition-all duration-300 animate-bounce`} style={{ height: `${Math.random() * 20 + 10}px`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
           </div>
        )}
      </div>

      <h2 className="text-3xl font-bold text-slate-800 mb-2">
        {isConnected ? 'FreshFlow Assistant Active' : 'Voice Operations'}
      </h2>
      <p className="text-slate-500 max-w-md mb-8">
        {isConnected 
          ? 'Ask about inventory, recipe ideas, or sales metrics. I am listening...' 
          : 'Connect to use voice commands for inventory tracking and customer assistance.'}
      </p>

      <button
        onClick={toggleConnection}
        disabled={isConnecting}
        className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-95 ${
          isConnected 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {isConnecting ? 'Initializing...' : isConnected ? 'End Session' : 'Start Voice Assistant'}
      </button>

      {transcriptions.length > 0 && (
        <div className="mt-12 w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden text-left">
           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Conversation History</h4>
           <div className="space-y-4">
              {transcriptions.map((t, i) => (
                <p key={i} className={`text-sm ${t.startsWith('You:') ? 'text-slate-900 font-semibold' : 'text-emerald-700'}`}>
                  {t}
                </p>
              ))}
           </div>
        </div>
      )}

      {!isConnected && !isConnecting && (
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
          {[
            { q: '"How many bananas in stock?"', icon: '🍌' },
            { q: '"What can I make with milk and eggs?"', icon: '🍳' },
            { q: '"Summarize today\'s sales revenue."', icon: '📈' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-500">
               <span className="text-lg block mb-1">{item.icon}</span>
               {item.q}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
