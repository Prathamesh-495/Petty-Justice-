
import React from 'react';
import { VerdictResponse } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ResultViewProps {
  data: VerdictResponse;
  onReset: () => void;
  onAppeal: () => void;
  canAppeal: boolean;
}

export const ResultView: React.FC<ResultViewProps> = ({ data, onReset, onAppeal, canAppeal }) => {
  const chartData = [
    { name: 'Insanity', value: data.dramaLevel },
    { name: 'Guilt', value: data.guiltMeter },
  ];
  const COLORS = ['#ca8a04', '#ef4444'];

  const handleShare = () => {
    alert("In a real app, this would generate a 'WANTED' poster for WhatsApp/Instagram! \n\n" + 
          "Title: " + data.caseTitle + "\n" +
          "Sentence: " + data.sentence);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-700 max-w-4xl mx-auto pb-24">
      <div className="text-center border-b-2 border-yellow-600 pb-10">
        <h2 className="font-judge text-5xl md:text-7xl text-yellow-500 mb-4 gold-glow uppercase tracking-tighter">
          {data.caseTitle}
        </h2>
        <div className="flex justify-center gap-4">
          <span className="bg-red-600 text-white px-3 py-1 text-[10px] font-bold rounded animate-pulse uppercase">Found Guilty</span>
          <span className="bg-slate-800 text-slate-400 px-3 py-1 text-[10px] font-bold rounded uppercase">Case #{data.caseId.slice(-4)}</span>
        </div>
      </div>

      {data.corruptionNote && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl text-yellow-500 text-xs text-center italic font-medium">
          ⚖️ Judge's Private Chamber Note: {data.corruptionNote}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900/80 p-8 rounded-2xl border-l-8 border-yellow-500 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-9xl opacity-5 font-serif select-none">"</div>
            <h3 className="font-judge text-xl text-yellow-500 mb-4 uppercase tracking-widest">The Official Judgment</h3>
            <p className="text-xl leading-relaxed italic text-slate-200 font-light">"{data.judgment}"</p>
          </div>

          <div className="bg-slate-900/40 p-6 rounded-2xl border-l-4 border-blue-500/50">
            <h3 className="font-judge text-sm text-blue-400 mb-2 uppercase tracking-widest">Historical Precedent</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-serif uppercase opacity-60">{data.legalPrecedent}</p>
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-yellow-900/20 flex flex-col items-center justify-center shadow-inner relative">
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
          <h3 className="font-judge text-xs text-yellow-500 mb-6 tracking-[0.3em]">ANALYSIS REPORT</h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #ca8a04', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 mt-6 text-[10px] uppercase font-black tracking-widest">
            <span className="text-yellow-500">Drama: {data.dramaLevel}%</span>
            <span className="text-red-500">Guilt: {data.guiltMeter}%</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-red-950/40 p-8 rounded-3xl border-2 border-red-900/30 group hover:border-red-500/50 transition-all cursor-help">
          <h3 className="font-judge text-2xl text-red-500 mb-4 uppercase tracking-tighter">Sazaa (The Sentence)</h3>
          <p className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{data.sentence}</p>
        </div>

        <div className="bg-green-950/40 p-8 rounded-3xl border-2 border-green-900/30 group hover:border-green-500/50 transition-all cursor-help">
          <h3 className="font-judge text-2xl text-green-500 mb-4 uppercase tracking-tighter">Muaavza (The Damages)</h3>
          <p className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{data.moralDamages}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-10">
        {canAppeal && (
          <button
            onClick={onAppeal}
            className="bg-red-900/20 hover:bg-red-600 border-2 border-red-900 text-red-500 hover:text-white font-bold py-5 rounded-2xl transition-all uppercase tracking-widest text-sm font-judge"
          >
            ✋ APPEAL VERDICT
          </button>
        )}
        <button
          onClick={handleShare}
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-5 rounded-2xl transition-all uppercase tracking-widest text-sm font-judge flex items-center justify-center gap-2"
        >
          🤳 SHAME THE GUILTY
        </button>
        <button
          onClick={onReset}
          className={`${canAppeal ? '' : 'md:col-span-2'} bg-yellow-600 hover:bg-yellow-500 text-black font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-xl font-judge shadow-xl active:scale-95`}
        >
          NEXT CASE PLEASE
        </button>
      </div>
    </div>
  );
};
