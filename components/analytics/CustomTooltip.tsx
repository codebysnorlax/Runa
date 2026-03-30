import { TooltipProps } from 'recharts';
import { formatPace } from '@/utils/formatters';

type CustomTooltipProps = TooltipProps<number, string>;

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 px-3.5 py-2.5 rounded-xl shadow-2xl">
        <p className="text-[11px] text-gray-400 font-medium mb-1.5 border-b border-gray-700/40 pb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((pld, index: number) => (
            <div key={index} className="flex items-center gap-2 text-[12px]">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: pld.color }} />
              <span className="text-gray-400">{pld.name}:</span>
              <span className="text-white font-semibold ml-auto">
                {pld.name && pld.name.includes("Pace")
                  ? `${formatPace(pld.value || 0)} min/km`
                  : typeof pld.value === 'number' ? pld.value.toFixed(2) : pld.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};
