import { useState } from 'react';
import { Target, Check } from 'lucide-react';

const COMPANIES = [
  { name: 'Google', level: 'L4 / SDE-2' },
  { name: 'Amazon', level: 'L5 / SDE-2' },
  { name: 'Microsoft', level: 'SDE 61-62' },
  { name: 'Meta', level: 'E4 / Software' },
  { name: 'Flipkart', level: 'SDE-1/2' },
  { name: 'TCS Digital', level: 'Prime Track' },
];

export default function CompanyTargetSelector({ onSelect }) {
  const [selected, setSelected] = useState('Google');

  const handleSelect = (company) => {
    setSelected(company.name);
    if (onSelect) onSelect(company);
  };

  return (
    <div className="calm-card rounded-2xl p-5 border-white/20 bg-black/90">
      <div className="mb-4 flex items-center justify-between border-b border-white/20 pb-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-white" />
          <h2 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Target Company Track</h2>
        </div>
        <span className="text-xs text-white font-mono font-bold">Selected: {selected}</span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3 md:grid-cols-6 font-mono">
        {COMPANIES.map((company) => {
          const isSelected = selected === company.name;
          return (
            <button
              key={company.name}
              type="button"
              onClick={() => handleSelect(company)}
              className={`rounded-xl border p-3 text-left transition ${
                isSelected
                  ? 'border-white bg-white text-black font-bold shadow-lg shadow-white/30'
                  : 'border-white/20 bg-black text-white/80 hover:border-white hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">{company.name}</span>
                {isSelected && <Check size={13} className="text-black shrink-0 font-bold" />}
              </div>
              <div className={`mt-1 text-[11px] font-sans ${isSelected ? 'text-black/80 font-semibold' : 'text-white/60'}`}>
                {company.level}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
