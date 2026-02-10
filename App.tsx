
import React, { useState, useRef, useEffect } from 'react';
import { ResultView } from './components/ResultView';
import { Grievance, VerdictResponse, AppStatus, GalleryComment } from './types';
import { getJudgeVerdict } from './services/geminiService';
import { LOADING_MESSAGES, BRIBES } from './constants';

const GALLERY_NAMES = ["Bunty", "Pinky", "Chintu", "Corporate Rishi", "Dadi Ma", "Technical Guruji", "Speedy Singh"];
const GALLERY_TEXTS = [
  "Insaaf hona chahiye!", "Judge Sahab, rishwat lo!", "Arrey yeh toh mere saath bhi hua tha!",
  "System faad denge!", "Bilkul sahi judgment!", "Yeh toh jail jayega!", "Samosa kidhar hai?"
];

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [grievance, setGrievance] = useState<string>('');
  const [witness, setWitness] = useState<string>('');
  const [bribe, setBribe] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<VerdictResponse | null>(null);
  const [history, setHistory] = useState<VerdictResponse[]>([]);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [canAppeal, setCanAppeal] = useState(true);
  const [showPitch, setShowPitch] = useState(false);
  const [gallery, setGallery] = useState<GalleryComment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('petty_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    let interval: any;
    if (status === 'deliberating') {
      interval = setInterval(() => {
        setLoadingMessageIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
        // Add random gallery comments
        const newComment: GalleryComment = {
          name: GALLERY_NAMES[Math.floor(Math.random() * GALLERY_NAMES.length)],
          comment: GALLERY_TEXTS[Math.floor(Math.random() * GALLERY_TEXTS.length)],
          stance: ['Pro-Accuser', 'Pro-Accused', 'Chaotic'][Math.floor(Math.random() * 3)] as any
        };
        setGallery(prev => [newComment, ...prev].slice(0, 5));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [status]);

  const playGavelSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) { console.log('Audio blocked'); }
  };

  // Fix: Implemented handleCapture to process selected images and store them as base64 strings
  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const deliverJustice = async (isAppeal = false) => {
    if (!grievance && !image) return;
    playGavelSound();
    setStatus('deliberating');
    setGallery([]);
    try {
      const response = await getJudgeVerdict({
        text: grievance || "Silence!",
        image: image || undefined,
        witness: witness || undefined,
        bribe: bribe || undefined,
        isAppeal
      });
      
      setResult(response);
      const newHistory = [response, ...history].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('petty_history', JSON.stringify(newHistory));
      
      setTimeout(() => {
        playGavelSound();
        setStatus('verdict');
      }, 3000);
      
      if (isAppeal) setCanAppeal(false);
    } catch (error) {
      console.error(error);
      setStatus('idle');
    }
  };

  const reset = () => {
    setStatus('idle');
    setGrievance('');
    setWitness('');
    setBribe('');
    setImage(null);
    setResult(null);
    setCanAppeal(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-[#020617] text-white overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      {/* Pitch Mode Toggle */}
      <button 
        onClick={() => setShowPitch(!showPitch)}
        className="fixed top-4 right-4 z-50 bg-yellow-600 text-black px-4 py-2 rounded-full font-bold text-xs hover:bg-yellow-500 transition-all shadow-lg"
      >
        {showPitch ? "CLOSE PITCH" : "VIEW PITCH DECK"}
      </button>

      {showPitch && (
        <div className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl p-8 flex items-center justify-center animate-in fade-in zoom-in duration-300">
          <div className="max-w-2xl text-center space-y-8">
            <h2 className="font-judge text-5xl text-yellow-500 gold-glow">PETTY JUSTICE: THE PITCH</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-slate-900 p-6 rounded-xl border border-yellow-900/50">
                <h3 className="text-yellow-500 font-bold mb-2 uppercase">The Problem</h3>
                <p className="text-sm text-slate-300 leading-relaxed">Social media creates echo chambers, but domestic life creates "Micro-Anger". People have nowhere to vent small grievances, leading to passive-aggressive wars.</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-yellow-900/50">
                <h3 className="text-yellow-500 font-bold mb-2 uppercase">The Solution</h3>
                <p className="text-sm text-slate-300 leading-relaxed">Gamified, AI-driven arbitration. We transform "You forgot to buy milk" into a high-stakes courtroom drama. Catharsis through comedy.</p>
              </div>
            </div>
            <div className="bg-yellow-600 text-black p-4 rounded-xl font-bold">
              Market Potential: 8 Billion Petty Humans.
            </div>
            <button onClick={() => setShowPitch(false)} className="text-slate-500 hover:text-white underline font-judge">BACK TO COURT</button>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full">
        <header className="text-center mb-10 animate-in slide-in-from-top duration-700">
          <div className="inline-block border-y-2 border-yellow-600/50 py-3 px-10 mb-2">
            <h1 className="font-judge text-5xl md:text-8xl tracking-tighter gold-glow">
              PETTY<span className="text-yellow-500">JUSTICE</span>
            </h1>
          </div>
          <div className="flex justify-center items-center gap-4 text-[10px] text-slate-500 font-judge uppercase tracking-[0.3em]">
            <span>10,432 Cases Resolved</span>
            <span className="text-yellow-900">|</span>
            <span>431 Samosas Accepted</span>
          </div>
        </header>

        {status === 'idle' && (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Left Sidebar: Judge Bio & History */}
            <div className="lg:col-span-1 hidden lg:block space-y-8">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-yellow-900/30">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Judge" className="w-16 h-16 rounded-full mb-3 border-2 border-yellow-600 p-1" alt="Judge"/>
                <h3 className="font-judge text-yellow-500 text-xs">HON. JUDGE GRUDGE</h3>
                <p className="text-[10px] text-slate-500 italic mt-1">PhD in passive-aggression. Ex-Principal of 'Shanti Niwas' Society.</p>
              </div>
              
              <div>
                <h3 className="font-judge text-yellow-500 text-sm mb-4 border-b border-yellow-900 pb-2">PREVIOUS CONVICTIONS</h3>
                <div className="space-y-3">
                  {history.length === 0 && <p className="text-slate-600 text-[10px] italic">The record is clean... for now.</p>}
                  {history.map((h, i) => (
                    <div key={i} className="p-3 bg-slate-900/50 border border-slate-800 rounded text-[10px] hover:border-yellow-600/50 transition-colors cursor-default group">
                      <p className="text-yellow-500 font-bold uppercase truncate">{h.caseTitle}</p>
                      <p className="text-slate-500 line-clamp-1 group-hover:text-slate-300 transition-colors">{h.sentence}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <main className="lg:col-span-3 bg-slate-900/40 backdrop-blur-2xl border-2 border-yellow-900/30 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <h2 className="font-judge text-9xl">⚖️</h2>
              </div>

              <div className="flex justify-between items-center mb-8">
                 <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 animate-pulse">
                        <span className="text-3xl">⚖️</span>
                    </div>
                    <div>
                        <h2 className="font-judge text-2xl text-white">File Case File #00{history.length + 1}</h2>
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Duniya Hila Deni Hai!</p>
                    </div>
                 </div>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold text-yellow-700 mb-2 block tracking-widest">The Crime (Karnaama)</label>
                  <textarea
                    value={grievance}
                    onChange={(e) => setGrievance(e.target.value)}
                    placeholder="Describe the crime in detail... don't hold back."
                    className="w-full bg-slate-950 border-2 border-slate-900 rounded-2xl p-6 text-white placeholder-slate-800 focus:border-yellow-600 outline-none transition-all h-40 shadow-inner"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-widest group-hover:text-yellow-600 transition-colors">Witness Testimonial</label>
                    <input
                      type="text"
                      value={witness}
                      onChange={(e) => setWitness(e.target.value)}
                      placeholder="Who else saw this tragedy?"
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-4 text-white focus:border-yellow-600 outline-none text-sm"
                    />
                  </div>
                  <div className="group">
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-widest group-hover:text-yellow-600 transition-colors">Bribe (Rishwat)</label>
                    <select
                      value={bribe}
                      onChange={(e) => setBribe(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-4 text-white focus:border-yellow-600 outline-none text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Imandaar (No Bribe)</option>
                      {BRIBES.map(b => <option key={b.id} value={b.label}>{b.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-6">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-slate-800 hover:border-yellow-600/50 text-slate-500 hover:text-yellow-500 py-4 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-[10px] font-black tracking-tighter"
                  >
                    {image ? "📸 SABOOT ATTACHED" : "📁 LOG EVIDENCE"}
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleCapture} className="hidden" accept="image/*" />

                  <button
                    onClick={() => deliverJustice()}
                    disabled={!grievance && !image}
                    className="flex-[2] bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-black font-judge text-2xl py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(202,138,4,0.3)] hover:shadow-[0_0_30px_rgba(202,138,4,0.5)] active:scale-95 flex items-center justify-center gap-3"
                  >
                    🔨 SLAM THE GAVEL
                  </button>
                </div>
              </div>
            </main>
          </div>
        )}

        {status === 'deliberating' && (
          <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
            <div className="text-9xl mb-12 animate-gavel cursor-pointer active:scale-110 transition-transform select-none" onClick={playGavelSound}>🔨</div>
            <p className="font-judge text-4xl text-center text-yellow-500 gold-glow px-4 h-20">
              {LOADING_MESSAGES[loadingMessageIdx]}
            </p>
            
            {/* Live Gallery Comments */}
            <div className="w-full max-w-lg mt-12 space-y-4">
               <h4 className="text-center text-[10px] uppercase text-slate-600 tracking-[0.4em] mb-6">Courtroom Reaction</h4>
               {gallery.map((msg, i) => (
                 <div key={i} className="flex gap-4 items-center bg-slate-900/50 p-3 rounded-lg border border-slate-800 animate-in slide-in-from-right duration-500">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${msg.stance === 'Pro-Accuser' ? 'bg-green-900 text-green-400' : msg.stance === 'Pro-Accused' ? 'bg-red-900 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                      {msg.name}
                    </span>
                    <p className="text-xs italic text-slate-300">"{msg.comment}"</p>
                 </div>
               ))}
            </div>
          </div>
        )}

        {status === 'verdict' && result && (
          <ResultView 
            data={result} 
            onReset={reset} 
            onAppeal={() => deliverJustice(true)} 
            canAppeal={canAppeal}
          />
        )}
      </div>

      <footer className="mt-20 text-slate-600 text-[9px] text-center uppercase tracking-[0.5em] opacity-30 pb-10">
        Justice delayed is justice... delayed? <br/> PettyJustice Protocol v3.0 Powered by Gemini-3
      </footer>
    </div>
  );
};

export default App;
