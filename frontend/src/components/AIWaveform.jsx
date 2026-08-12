import { Volume2, Mic } from 'lucide-react';

export default function AIWaveform({ active = true, label = 'AI INTERVIEWER ACTIVE' }) {
  const bars = [40, 70, 50, 85, 60, 35, 80, 90, 65, 45, 75, 55, 35, 65, 85, 40];

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/20 bg-black/90 p-3.5 text-xs text-white font-mono">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black font-bold">
          {active ? <Volume2 size={16} className="animate-pulse" /> : <Mic size={16} />}
        </div>
        <div>
          <div className="text-[10px] text-white/60 uppercase tracking-wider font-mono">{label}</div>
          <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
            {active ? 'Evaluating & Listening' : 'AI Active'}
          </div>
        </div>
      </div>

      {/* Equalizer Bars */}
      <div className="flex items-center gap-1 h-5">
        {bars.map((height, idx) => (
          <div
            key={idx}
            className="w-1 rounded-full bg-white transition-all duration-300"
            style={{
              height: active ? `${Math.max(25, (height * (idx % 2 === 0 ? 1 : 0.75)))}%` : '20%',
              opacity: active ? 0.9 : 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
