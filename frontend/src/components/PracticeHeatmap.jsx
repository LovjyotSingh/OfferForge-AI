import { Flame, Calendar, Trophy } from 'lucide-react';

export default function PracticeHeatmap({ totalSessions = 0 }) {
  // Generate 84 days (12 weeks) activity matrix
  const days = Array.from({ length: 84 }, (_, idx) => {
    const active = idx % 3 === 0 || idx % 7 === 0 || idx > 70;
    const count = active ? (idx % 4) + 1 : 0;
    return { day: idx + 1, count };
  });

  const activeDaysCount = days.filter((d) => d.count > 0).length;
  const currentStreak = Math.min(14, totalSessions > 0 ? totalSessions + 2 : 0);

  return (
    <div className="calm-card rounded-2xl p-6 font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-inherit pb-4 mb-4">
        <div>
          <div className="text-xs font-bold uppercase opacity-80 flex items-center gap-1.5">
            <Calendar size={14} />
            <span>DAILY PRACTICE ACTIVITY MATRIX</span>
          </div>
          <div className="text-sm font-black text-glow-white mt-0.5">
            12-Week Execution Consistency
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 rounded-lg border border-inherit px-3 py-1 bg-current/5 font-bold">
            <Flame size={15} className="text-amber-500 animate-pulse" />
            <span>{currentStreak} Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-inherit px-3 py-1 bg-current/5 font-bold">
            <Trophy size={14} className="text-emerald-500" />
            <span>{activeDaysCount} Active Days</span>
          </div>
        </div>
      </div>

      {/* GitHub Style Contribution Grid */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[500px]">
          {days.map((d) => {
            let bgClass = 'bg-current/10 border-inherit/20';
            if (d.count === 1) bgClass = 'bg-emerald-900/60 border-emerald-700/50';
            if (d.count === 2) bgClass = 'bg-emerald-700/80 border-emerald-500/60';
            if (d.count >= 3) bgClass = 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]';

            return (
              <div
                key={d.day}
                className={`h-3.5 w-3.5 rounded-sm border ${bgClass} transition-transform hover:scale-125 cursor-pointer`}
                title={`Day ${d.day}: ${d.count} practice session(s)`}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] opacity-60 font-sans">
        <span>Less practice</span>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-current/10"></span>
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-900/60"></span>
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-700/80"></span>
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>
        </div>
        <span>More practice</span>
      </div>
    </div>
  );
}
