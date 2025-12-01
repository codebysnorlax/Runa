import React from 'react';

interface HeatmapProps {
  data: { date: string; count: number }[];
}

const StreakHeatmap: React.FC<HeatmapProps> = ({ data }) => {
  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-700';
    if (count === 1) return 'bg-green-900';
    if (count === 2) return 'bg-green-700';
    if (count === 3) return 'bg-green-500';
    return 'bg-green-400';
  };

  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];
  
  data.forEach((day, index) => {
    const dayOfWeek = new Date(day.date).getDay();
    
    if (index === 0 && dayOfWeek !== 0) {
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({ date: '', count: -1 });
      }
    }
    
    currentWeek.push(day);
    
    if (dayOfWeek === 6 || index === data.length - 1) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: -1 });
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 text-xs text-gray-400 pt-5">
            {dayLabels.map((day, i) => (
              <div key={i} className="h-3 flex items-center" style={{ fontSize: '10px' }}>
                {i % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>
          
          <div className="flex-1">
            <div className="flex gap-1 mb-1 text-xs text-gray-400">
              {weeks.map((week, weekIndex) => {
                const firstDay = week.find(d => d.date);
                if (firstDay && new Date(firstDay.date).getDate() <= 7) {
                  const month = new Date(firstDay.date).getMonth();
                  return (
                    <div key={weekIndex} className="w-3" style={{ fontSize: '10px' }}>
                      {monthLabels[month]}
                    </div>
                  );
                }
                return <div key={weekIndex} className="w-3" />;
              })}
            </div>
            
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${day.count === -1 ? 'bg-transparent' : getColor(day.count)}`}
                      title={day.date ? `${day.date}: ${day.count} run${day.count !== 1 ? 's' : ''}` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-700" />
            <div className="w-3 h-3 rounded-sm bg-green-900" />
            <div className="w-3 h-3 rounded-sm bg-green-700" />
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <div className="w-3 h-3 rounded-sm bg-green-400" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default StreakHeatmap;
