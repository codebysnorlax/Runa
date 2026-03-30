import React, { memo, useState } from 'react';
import { X } from 'lucide-react';

const FilterModalComponent = ({ onClose, onApply, onClear, maxDistKm, initialTime, initialDistRange }: {
  onClose: () => void;
  onApply: (time: number | null, distRange: [number, number] | null) => void;
  onClear: () => void;
  maxDistKm: number;
  initialTime: number | null;
  initialDistRange: [number, number] | null;
}) => {
  const maxRange = maxDistKm;
  const [time, setTime] = useState<number | null>(initialTime);
  const [distMin, setDistMin] = useState(initialDistRange ? initialDistRange[0] / 1000 : 0);
  const [distMax, setDistMax] = useState(initialDistRange ? initialDistRange[1] / 1000 : maxRange);
  const [distEnabled, setDistEnabled] = useState(!!initialDistRange);
  const [applying, setApplying] = useState(false);

  const handleMinChange = (v: number) => {
    setDistMin(Math.min(v, distMax - 0.1));
    setDistEnabled(true);
  };
  const handleMaxChange = (v: number) => {
    setDistMax(Math.max(v, distMin + 0.1));
    setDistEnabled(true);
  };

  const leftPct = (distMin / maxRange) * 100;
  const rightPct = ((maxRange - distMax) / maxRange) * 100;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-2xl bg-gray-900/50 backdrop-blur-2xl border border-gray-700/50 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-orange via-orange-400 to-purple-500" />

        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Filter Charts</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Refine your analytics view</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Time Period */}
          <div className="mb-6">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2.5">
              Time Period
            </label>
            <div className="flex gap-2">
              {[
                { val: 7, label: "7D" },
                { val: 15, label: "15D" },
                { val: 30, label: "30D" },
                { val: 60, label: "60D" },
                { val: 90, label: "90D" },
              ].map((v) => (
                <button
                  key={v.val}
                  onClick={() => setTime(time === v.val ? null : v.val)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${time === v.val
                    ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20"
                    : "bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-gray-200"
                    }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Distance Range Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Distance Range
              </label>
              <button
                onClick={() => { setDistEnabled(!distEnabled); if (distEnabled) { setDistMin(0); setDistMax(maxRange); } }}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${distEnabled ? "bg-brand-orange/15 text-brand-orange" : "bg-gray-800 text-gray-500"
                  }`}
              >
                {distEnabled ? "ON" : "OFF"}
              </button>
            </div>

            {/* Range display */}
            <div className="flex justify-between items-center mb-3">
              <div className="bg-gray-800/80 rounded-lg px-3 py-1.5 border border-gray-700/50">
                <span className="text-sm font-bold text-white">{distMin.toFixed(1)}</span>
                <span className="text-[10px] text-gray-500 ml-0.5">km</span>
              </div>
              <div className="text-gray-600 text-xs">—</div>
              <div className="bg-gray-800/80 rounded-lg px-3 py-1.5 border border-gray-700/50">
                <span className="text-sm font-bold text-white">{distMax.toFixed(1)}</span>
                <span className="text-[10px] text-gray-500 ml-0.5">km</span>
              </div>
            </div>

            {/* Dual range slider */}
            <style>{`
              .range-thumb { -webkit-appearance: none; appearance: none; pointer-events: none; position: absolute; width: 100%; height: 32px; background: transparent; }
              .range-thumb::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: white; border: 2px solid; cursor: pointer; pointer-events: all; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
              .range-thumb::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: white; border: 2px solid; cursor: pointer; pointer-events: all; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
              .range-thumb::-moz-range-track { background: transparent; border: none; }
              .range-min::-webkit-slider-thumb { border-color: #FF7A00; }
              .range-max::-webkit-slider-thumb { border-color: #8B5CF6; }
              .range-min::-moz-range-thumb { border-color: #FF7A00; }
              .range-max::-moz-range-thumb { border-color: #8B5CF6; }
            `}</style>
            <div className="relative h-8 flex items-center">
              {/* Track */}
              <div className="absolute left-0 right-0 h-1.5 bg-gray-700/60 rounded-full" />
              {/* Active range */}
              <div
                className="absolute h-1.5 bg-gradient-to-r from-brand-orange to-orange-400 rounded-full"
                style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
              />
              {/* Min slider */}
              <input
                type="range"
                min="0"
                max={maxRange}
                step="0.1"
                value={distMin}
                onChange={(e) => handleMinChange(parseFloat(e.target.value))}
                className="range-thumb range-min"
                style={{ zIndex: 3 }}
              />
              {/* Max slider */}
              <input
                type="range"
                min="0"
                max={maxRange}
                step="0.1"
                value={distMax}
                onChange={(e) => handleMaxChange(parseFloat(e.target.value))}
                className="range-thumb range-max"
                style={{ zIndex: 4 }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-gray-600">0 km</span>
              <span className="text-[9px] text-gray-600">{maxRange} km</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <button
              onClick={() => { onClear(); onClose(); }}
              className="flex-1 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 text-xs font-semibold transition-colors"
            >
              Clear All
            </button>
            <button
              disabled={applying}
              onClick={() => {
                setApplying(true);
                setTimeout(() => onApply(time, distEnabled ? [distMin * 1000, distMax * 1000] : null), 600);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${applying ? 'bg-brand-orange/60 cursor-not-allowed' : 'bg-gradient-to-r from-brand-orange to-orange-600 hover:shadow-lg hover:shadow-brand-orange/20'} text-white`}
            >
              {applying ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Applying...
                </>
              ) : 'Apply Filters'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
FilterModalComponent.displayName = 'FilterModal';
export const FilterModal = memo(FilterModalComponent);
