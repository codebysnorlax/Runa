export const exportChartToImage = async (
  data: any[],
  chartType: 'performance' | 'weekly' | 'monthly' | 'distance-time',
  title: string
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0F0F0F';
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 52px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(title, 540, 90);

  const chartArea = { x: 150, y: 200, width: 780, height: 620 };

  if (chartType === 'performance') {
    drawPerformanceChart(ctx, data, chartArea);
  } else if (chartType === 'weekly') {
    drawWeeklyChart(ctx, data, chartArea);
  } else if (chartType === 'monthly') {
    drawMonthlyRings(ctx, data, chartArea);
  } else if (chartType === 'distance-time') {
    drawDistanceTimeChart(ctx, data, chartArea);
  }

  const favicon = await loadImage('/favicon/favicon-32x32.png');
  ctx.drawImage(favicon, 910, 1010, 32, 32);

  ctx.fillStyle = '#666666';
  ctx.font = '24px system-ui';
  ctx.textAlign = 'right';
  ctx.fillText('Runa', 1010, 1035);

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob!);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runa-${chartType}-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const drawPerformanceChart = (ctx: CanvasRenderingContext2D, data: any[], area: any) => {
  if (!data.length) return;
  const maxDist = Math.max(...data.map(d => d.distance), 1);
  const maxPace = Math.max(...data.map(d => d.pace), 1);
  const step = area.width / Math.max(data.length - 1, 1);

  // Grid lines
  ctx.strokeStyle = '#2D2D2D';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = area.y + (area.height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(area.x, y);
    ctx.lineTo(area.x + area.width, y);
    ctx.stroke();
  }

  // Vertical grid lines
  const vGridCount = Math.min(data.length - 1, 10);
  for (let i = 0; i <= vGridCount; i++) {
    const x = area.x + (area.width / vGridCount) * i;
    ctx.beginPath();
    ctx.moveTo(x, area.y);
    ctx.lineTo(x, area.y + area.height);
    ctx.stroke();
  }

  // Distance area fill
  ctx.fillStyle = 'rgba(255, 122, 0, 0.3)';
  ctx.beginPath();
  ctx.moveTo(area.x, area.y + area.height);
  data.forEach((d, i) => ctx.lineTo(area.x + i * step, area.y + area.height - (d.distance / maxDist) * area.height));
  ctx.lineTo(area.x + (data.length - 1) * step, area.y + area.height);
  ctx.closePath();
  ctx.fill();

  // Distance line
  ctx.strokeStyle = '#FF7A00';
  ctx.lineWidth = 3;
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = area.x + i * step;
    const y = area.y + area.height - (d.distance / maxDist) * area.height;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Pace line
  ctx.strokeStyle = '#8884d8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = area.x + i * step;
    const y = area.y + area.height - (d.pace / maxPace) * area.height;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Legend
  const legendY = area.y - 50;
  ctx.fillStyle = '#FF7A00';
  ctx.fillRect(area.x + area.width / 2 - 200, legendY, 28, 28);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText('Distance (km)', area.x + area.width / 2 - 165, legendY + 20);

  ctx.fillStyle = '#8884d8';
  ctx.fillRect(area.x + area.width / 2 + 10, legendY, 28, 28);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Pace (min/km)', area.x + area.width / 2 + 45, legendY + 20);

  // Y-axis labels (left - distance)
  ctx.fillStyle = '#9CA3AF';
  ctx.font = 'bold 18px system-ui';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const val = maxDist * (1 - i / 5);
    ctx.fillText(val.toFixed(1), area.x - 20, area.y + (area.height / 5) * i + 7);
  }

  // Y-axis labels (right - pace)
  ctx.textAlign = 'left';
  ctx.font = 'bold 18px system-ui';
  for (let i = 0; i <= 5; i++) {
    const val = maxPace * (1 - i / 5);
    const m = Math.floor(val);
    const s = Math.round((val - m) * 60);
    ctx.fillText(`${m}:${s.toString().padStart(2, '0')}`, area.x + area.width + 20, area.y + (area.height / 5) * i + 7);
  }

  // X-axis labels
  ctx.textAlign = 'center';
  ctx.font = 'bold 16px system-ui';
  const labelStep = Math.ceil(data.length / 7);
  data.forEach((d, i) => {
    if (i % labelStep === 0 || i === data.length - 1) {
      const x = area.x + i * step;
      const label = d.name.split('/').slice(0, 2).join('/');
      ctx.fillText(label, x, area.y + area.height + 30);
    }
  });
};

const drawDistanceTimeChart = (ctx: CanvasRenderingContext2D, data: any[], area: any) => {
  if (!data.length) return;
  const maxDist = Math.max(...data.map(d => d.distance), 1);
  const maxTime = Math.max(...data.map(d => d.time), 1);
  const gw = area.width / data.length;
  const bw = Math.min(gw * 0.45, 60);

  // Grid
  ctx.strokeStyle = '#2D2D2D';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = area.y + (area.height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(area.x, y);
    ctx.lineTo(area.x + area.width, y);
    ctx.stroke();
  }

  // Bars
  data.forEach((d, i) => {
    const cx = area.x + gw * i + gw / 2;
    const dh = (d.distance / maxDist) * area.height;
    const th = (d.time / maxTime) * area.height;

    ctx.fillStyle = '#82ca9d';
    ctx.fillRect(cx - bw - 4, area.y + area.height - dh, bw, dh);

    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(cx + 4, area.y + area.height - th, bw, th);
  });

  // Legend
  const legendY = area.y - 50;
  ctx.fillStyle = '#82ca9d';
  ctx.fillRect(area.x + area.width / 2 - 200, legendY, 28, 28);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText('Distance (km)', area.x + area.width / 2 - 165, legendY + 20);

  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(area.x + area.width / 2 + 10, legendY, 28, 28);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Time (min)', area.x + area.width / 2 + 45, legendY + 20);

  // Y-axis labels
  ctx.fillStyle = '#9CA3AF';
  ctx.font = 'bold 18px system-ui';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const val = maxDist * (1 - i / 5);
    ctx.fillText(val.toFixed(1) + ' km', area.x - 20, area.y + (area.height / 5) * i + 7);
  }
  ctx.textAlign = 'left';
  for (let i = 0; i <= 5; i++) {
    const val = maxTime * (1 - i / 5);
    ctx.fillText(val.toFixed(0) + ' min', area.x + area.width + 20, area.y + (area.height / 5) * i + 7);
  }

  // X-axis labels
  ctx.textAlign = 'center';
  ctx.font = 'bold 16px system-ui';
  const labelStep = Math.ceil(data.length / 7);
  data.forEach((d, i) => {
    if (i % labelStep === 0 || i === data.length - 1) {
      const cx = area.x + gw * i + gw / 2;
      const label = d.name.split('/').slice(0, 2).join('/');
      ctx.fillText(label, cx, area.y + area.height + 30);
    }
  });
};

const drawWeeklyChart = (ctx: CanvasRenderingContext2D, data: any[], area: any) => {
  if (!data.length) return;
  const maxDist = Math.max(...data.map(d => d.distance), 1);
  const maxRuns = Math.max(...data.map(d => d.runs), 1);
  const gw = area.width / data.length;
  const bw = Math.min(gw * 0.45, 60);

  // Grid
  ctx.strokeStyle = '#2D2D2D';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = area.y + (area.height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(area.x, y);
    ctx.lineTo(area.x + area.width, y);
    ctx.stroke();
  }

  // Bars
  data.forEach((d, i) => {
    const cx = area.x + gw * i + gw / 2;
    const dh = (d.distance / maxDist) * area.height;
    const rh = (d.runs / maxRuns) * area.height;

    ctx.fillStyle = '#FF7A00';
    ctx.fillRect(cx - bw - 4, area.y + area.height - dh, bw, dh);

    ctx.fillStyle = '#8884d8';
    ctx.fillRect(cx + 4, area.y + area.height - rh, bw, rh);
  });

  // Legend
  const legendY = area.y - 50;
  ctx.fillStyle = '#FF7A00';
  ctx.fillRect(area.x + area.width / 2 - 170, legendY, 28, 28);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText('Distance (km)', area.x + area.width / 2 - 135, legendY + 20);

  ctx.fillStyle = '#8884d8';
  ctx.fillRect(area.x + area.width / 2 + 40, legendY, 28, 28);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Runs', area.x + area.width / 2 + 75, legendY + 20);

  // Y-axis labels
  ctx.fillStyle = '#9CA3AF';
  ctx.font = 'bold 18px system-ui';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const val = maxDist * (1 - i / 5);
    ctx.fillText(val.toFixed(1) + ' km', area.x - 20, area.y + (area.height / 5) * i + 7);
  }
  ctx.textAlign = 'left';
  for (let i = 0; i <= 5; i++) {
    const val = Math.round(maxRuns * (1 - i / 5));
    ctx.fillText(val.toString(), area.x + area.width + 20, area.y + (area.height / 5) * i + 7);
  }

  // X-axis labels
  ctx.textAlign = 'center';
  ctx.font = 'bold 16px system-ui';
  const labelStep = Math.ceil(data.length / 6);
  data.forEach((d, i) => {
    if (i % labelStep === 0 || i === data.length - 1) {
      const cx = area.x + gw * i + gw / 2;
      const label = d.name.split('/').slice(0, 2).join('/');
      ctx.fillText(label, cx, area.y + area.height + 30);
    }
  });
};

const drawMonthlyRings = (ctx: CanvasRenderingContext2D, data: any[], area: any) => {
  if (!data.length) return;
  const maxDist = Math.max(...data.map(m => m.distance));
  const maxRuns = Math.max(...data.map(m => m.runs));
  const cols = Math.min(data.length, 3);
  const rows = Math.ceil(data.length / cols);
  const cw = area.width / cols;
  const ch = area.height / rows;
  const r = Math.min(cw, ch) / 2.8;

  data.forEach((m, i) => {
    const cx = area.x + (i % cols) * cw + cw / 2;
    const cy = area.y + Math.floor(i / cols) * ch + ch / 2;
    const dp = (m.distance / maxDist) * 2 * Math.PI;
    const rp = (m.runs / maxRuns) * 2 * Math.PI;

    // Outer ring background
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.stroke();

    // Outer ring progress
    ctx.strokeStyle = '#FF7A00';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + dp);
    ctx.stroke();

    // Inner ring background
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 28, 0, 2 * Math.PI);
    ctx.stroke();

    // Inner ring progress
    ctx.strokeStyle = '#8884d8';
    ctx.beginPath();
    ctx.arc(cx, cy, r - 28, -Math.PI / 2, -Math.PI / 2 + rp);
    ctx.stroke();

    // Month label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(new Date(m.name + '-01').toLocaleDateString('en', { month: 'short' }), cx, cy + 2);

    // Stats
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '20px system-ui';
    ctx.fillText(`${m.distance.toFixed(1)}km`, cx, cy + 30);
    ctx.font = '18px system-ui';
    ctx.fillText(`${m.runs} runs`, cx, cy + 52);
    ctx.font = '16px system-ui';
    ctx.fillText(`${m.time.toFixed(1)}h`, cx, cy + 72);
  });
};
