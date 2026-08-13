import { DollarSign, TrendingUp, Zap, Building2, ShieldCheck, Sparkles } from 'lucide-react';

export default function OfferPredictorCard({ averageScore = 80, atsScore = 85, targetRole = 'SDE' }) {
  // Calculate predicted salary range based on ATS & Interview scores
  const combined = Math.round((averageScore * 0.5) + (atsScore * 0.5));

  let lpaLow = 8;
  let lpaHigh = 16;
  let tierName = 'Mid-Tier Product / High-Growth Startups';
  let badgeColor = 'text-amber-500 border-amber-500/30 bg-amber-500/10';

  if (combined >= 85) {
    lpaLow = 18;
    lpaHigh = 32;
    tierName = 'Tier-1 Unicorns & Global Tech Giants (FAANG / Razorpay)';
    badgeColor = 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
  } else if (combined >= 75) {
    lpaLow = 12;
    lpaHigh = 22;
    tierName = 'Top Product Startups & High-Growth Scale-ups (Swiggy / Uber)';
    badgeColor = 'text-cyan-500 border-cyan-500/30 bg-cyan-500/10';
  }

  return (
    <div className="calm-card rounded-2xl p-6 font-mono relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-inherit pb-4 mb-4">
        <div>
          <div className="text-xs font-bold uppercase opacity-80 flex items-center gap-1.5">
            <DollarSign size={14} className="text-emerald-500" />
            <span>AI COMPENSATION & OFFER PACKAGE PREDICTOR</span>
          </div>
          <div className="text-sm font-black text-glow-white mt-0.5">
            Market Value Estimate for {targetRole}
          </div>
        </div>

        <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold ${badgeColor}`}>
          <Sparkles size={13} className="animate-pulse" />
          <span>{combined >= 85 ? 'High Tier Candidate' : 'Solid Market Match'}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_1.5fr] items-center">
        {/* Salary Number Box */}
        <div className="rounded-xl border border-inherit bg-current/5 p-6 text-center">
          <div className="text-[11px] opacity-70 uppercase font-mono">ESTIMATED CTC PACKAGE</div>
          <div className="text-3xl sm:text-4xl font-black text-glow-white mt-1">
            ₹{lpaLow} - ₹{lpaHigh} <span className="text-sm font-bold opacity-70">LPA</span>
          </div>
          <div className="text-[10px] opacity-60 mt-2 font-sans">
            Based on {combined}% combined ATS & AI Mock Score
          </div>
        </div>

        {/* Breakdown Details */}
        <div className="space-y-3 text-xs font-sans">
          <div>
            <div className="font-bold opacity-80 uppercase font-mono text-[11px] mb-1">Target Company Bracket</div>
            <div className="flex items-center gap-2 font-semibold">
              <Building2 size={15} className="shrink-0" />
              <span>{tierName}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="rounded-lg border border-inherit bg-current/5 p-2.5">
              <div className="opacity-70">ATS Score Impact</div>
              <div className="font-black text-glow-white text-sm mt-0.5">{atsScore}%</div>
            </div>
            <div className="rounded-lg border border-inherit bg-current/5 p-2.5">
              <div className="opacity-70">Interview Readiness</div>
              <div className="font-black text-glow-white text-sm mt-0.5">{averageScore}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
