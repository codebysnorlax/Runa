/**
 * Chart export — manual canvas drawing matching the in-app Recharts style.
 * Uses monotone cubic interpolation (no overshooting) and Y-axis from 0.
 */

export const exportChartToImage = async (
  data: any[],
  chartType: 'performance' | 'weekly' | 'monthly' | 'distance-time',
  title: string,
  _event?: any
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 540, 75);

  const area = { x: 120, y: 170, width: 820, height: 620 };

  if (chartType === 'performance') drawPerformanceChart(ctx, data, area);
  else if (chartType === 'distance-time') drawDistanceTimeChart(ctx, data, area);
  else if (chartType === 'weekly') drawWeeklyChart(ctx, data, area);
  else if (chartType === 'monthly') drawMonthlyRings(ctx, data, area);

  try {
    const favicon = await loadImage('/favicon/favicon-32x32.png');
    ctx.drawImage(favicon, 920, 1020, 28, 28);
    ctx.fillStyle = '#555';
    ctx.font = '22px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('Runa', 1005, 1042);
  } catch { /* skip */ }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runa-${chartType}-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// ─── Helpers ──────────────────────────────────────────

const toY = (val: number, min: number, max: number, a: any) =>
  a.y + a.height - ((val - min) / (max - min)) * a.height;

const toX = (i: number, n: number, a: any) =>
  a.x + (i / Math.max(n - 1, 1)) * a.width;

/**
 * Monotone cubic Hermite interpolation (Fritsch-Carlson method).
 * Prevents overshooting — the curve stays within the bounds of adjacent data points.
 * This matches how Recharts type="monotone" works (d3-shape curveMonotoneX).
 */
const drawMonotoneCurve = (ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[], skipMoveTo = false) => {
  const n = pts.length;
  if (n < 2) return;
  if (n === 2) {
    if (!skipMoveTo) ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    return;
  }

  // Step 1: compute slopes of secant lines
  const dx: number[] = [];
  const dy: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1].x - pts[i].x);
    dy.push(pts[i + 1].y - pts[i].y);
    m.push(dy[i] / dx[i]);
  }

  // Step 2: compute tangent slopes using Fritsch-Carlson
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) {
      t.push(0);
    } else {
      t.push((m[i - 1] + m[i]) / 2);
    }
  }
  t.push(m[n - 2]);

  // Step 3: Fritsch-Carlson adjustment to preserve monotonicity
  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(m[i]) < 1e-10) {
      t[i] = 0;
      t[i + 1] = 0;
    } else {
      const a = t[i] / m[i];
      const b = t[i + 1] / m[i];
      const s = a * a + b * b;
      if (s > 9) {
        const tau = 3 / Math.sqrt(s);
        t[i] = tau * a * m[i];
        t[i + 1] = tau * b * m[i];
      }
    }
  }

  // Step 4: draw cubic Hermite spline segments
  if (!skipMoveTo) ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    ctx.bezierCurveTo(
      pts[i].x + h, pts[i].y + t[i] * h,
      pts[i + 1].x - h, pts[i + 1].y - t[i + 1] * h,
      pts[i + 1].x, pts[i + 1].y
    );
  }
};

/** Draw monotone-filled area (curve down to baseY) */
const drawMonotoneArea = (ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[], baseY: number, fill: CanvasGradient) => {
  if (pts.length < 2) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0].x, baseY);
  ctx.lineTo(pts[0].x, pts[0].y);
  drawMonotoneCurve(ctx, pts, true);
  ctx.lineTo(pts[pts.length - 1].x, baseY);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
};

const drawGrid = (ctx: CanvasRenderingContext2D, a: any, n = 5) => {
  ctx.strokeStyle = 'rgba(75, 85, 99, 0.35)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  for (let i = 0; i <= n; i++) {
    const y = a.y + (a.height / n) * i;
    ctx.beginPath();
    ctx.moveTo(a.x, y);
    ctx.lineTo(a.x + a.width, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
};

const drawLegend = (ctx: CanvasRenderingContext2D, items: { label: string; color: string }[], cx: number, y: number) => {
  ctx.font = '18px system-ui';
  const totalW = items.reduce((s, it) => s + ctx.measureText(it.label).width + 38, 0) + (items.length - 1) * 20;
  let x = cx - totalW / 2;
  items.forEach((it) => {
    ctx.fillStyle = it.color;
    ctx.beginPath(); ctx.arc(x + 7, y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9CA3AF'; ctx.textAlign = 'left';
    ctx.fillText(it.label, x + 20, y + 5);
    x += ctx.measureText(it.label).width + 55;
  });
};

const drawYTicks = (ctx: CanvasRenderingContext2D, a: any, min: number, max: number, side: 'left' | 'right', fmt?: (v: number) => string, n = 5) => {
  ctx.fillStyle = '#6B7280'; ctx.font = '14px system-ui';
  ctx.textAlign = side === 'left' ? 'right' : 'left';
  const px = side === 'left' ? a.x - 12 : a.x + a.width + 12;
  for (let i = 0; i <= n; i++) {
    const val = max - (max - min) * (i / n);
    ctx.fillText(fmt ? fmt(val) : val.toFixed(1), px, a.y + (a.height / n) * i + 5);
  }
};

const drawXTicks = (ctx: CanvasRenderingContext2D, data: any[], a: any, getX: (i: number) => number) => {
  ctx.fillStyle = '#6B7280'; ctx.font = '13px system-ui'; ctx.textAlign = 'center';
  const step = Math.max(1, Math.ceil(data.length / 8));
  data.forEach((d, i) => {
    if (i % step === 0 || i === data.length - 1) {
      ctx.fillText(d.name.split('/').slice(0, 2).join('/'), getX(i), a.y + a.height + 25);
    }
  });
};

// ─── Chart Drawing ──────────────────────────────────

const drawPerformanceChart = (ctx: CanvasRenderingContext2D, data: any[], area: any) => {
  if (!data.length) return;

  // Y-axis: 0 to max (matching Recharts Area default domain)
  const maxDist = Math.max(...data.map(d => d.distance)) * 1.1;
  const maxPace = Math.max(...data.map(d => d.pace)) * 1.1;
  const baseY = area.y + area.height; // Y=0 line

  drawGrid(ctx, area);

  const distPts = data.map((d, i) => ({ x: toX(i, data.length, area), y: toY(d.distance, 0, maxDist, area) }));
  const pacePts = data.map((d, i) => ({ x: toX(i, data.length, area), y: toY(d.pace, 0, maxPace, area) }));

  // Distance gradient area fill — from top to bottom of chart
  const grad = ctx.createLinearGradient(0, area.y, 0, baseY);
  grad.addColorStop(0, 'rgba(255, 122, 0, 0.35)');
  grad.addColorStop(1, 'rgba(255, 122, 0, 0.02)');
  drawMonotoneArea(ctx, distPts, baseY, grad);

  // Distance line with glow
  ctx.save();
  ctx.shadowColor = '#FF7A00'; ctx.shadowBlur = 6;
  ctx.strokeStyle = '#FF7A00'; ctx.lineWidth = 2.5;
  ctx.beginPath(); drawMonotoneCurve(ctx, distPts); ctx.stroke();
  ctx.restore();

  // Pace line with glow
  ctx.save();
  ctx.shadowColor = '#A78BFA'; ctx.shadowBlur = 5;
  ctx.strokeStyle = '#A78BFA'; ctx.lineWidth = 2;
  ctx.beginPath(); drawMonotoneCurve(ctx, pacePts); ctx.stroke();
  ctx.restore();

  // Pace dots
  pacePts.forEach(p => {
    ctx.fillStyle = '#1F2937';
    ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#A78BFA';
    ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
  });

  drawLegend(ctx, [
    { label: 'Distance (km)', color: '#FF7A00' },
    { label: 'Pace (min/km)', color: '#A78BFA' },
  ], area.x + area.width / 2, area.y - 40);

  drawYTicks(ctx, area, 0, maxDist, 'left');
  drawYTicks(ctx, area, 0, maxPace, 'right', (v) => {
    const m = Math.floor(v); const s = Math.round((v - m) * 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  });
  drawXTicks(ctx, data, area, (i) => toX(i, data.length, area));
};

const drawDistanceTimeChart = (ctx: CanvasRenderingContext2D, data: any[], area: any) => {
  if (!data.length) return;

  const maxDist = Math.max(...data.map(d => d.distance)) * 1.1;
  const maxTime = Math.max(...data.map(d => d.time)) * 1.1;
  const baseY = area.y + area.height;

  drawGrid(ctx, area);

  const distPts = data.map((d, i) => ({ x: toX(i, data.length, area), y: toY(d.distance, 0, maxDist, area) }));
  const timePts = data.map((d, i) => ({ x: toX(i, data.length, area), y: toY(d.time, 0, maxTime, area) }));

  // Distance gradient
  const gd = ctx.createLinearGradient(0, area.y, 0, baseY);
  gd.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
  gd.addColorStop(1, 'rgba(52, 211, 153, 0.02)');
  drawMonotoneArea(ctx, distPts, baseY, gd);

  // Time gradient
  const gt = ctx.createLinearGradient(0, area.y, 0, baseY);
  gt.addColorStop(0, 'rgba(251, 113, 133, 0.2)');
  gt.addColorStop(1, 'rgba(251, 113, 133, 0.02)');
  drawMonotoneArea(ctx, timePts, baseY, gt);

  // Lines
  ctx.save();
  ctx.shadowColor = '#34D399'; ctx.shadowBlur = 6;
  ctx.strokeStyle = '#34D399'; ctx.lineWidth = 2.5;
  ctx.beginPath(); drawMonotoneCurve(ctx, distPts); ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = '#FB7185'; ctx.shadowBlur = 5;
  ctx.strokeStyle = '#FB7185'; ctx.lineWidth = 2;
  ctx.beginPath(); drawMonotoneCurve(ctx, timePts); ctx.stroke();
  ctx.restore();

  // Dots
  distPts.forEach(p => {
    ctx.fillStyle = '#1F2937';
    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#34D399';
    ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2); ctx.fill();
  });
  timePts.forEach(p => {
    ctx.fillStyle = '#1F2937';
    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FB7185';
    ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2); ctx.fill();
  });

  drawLegend(ctx, [
    { label: 'Distance (km)', color: '#34D399' },
    { label: 'Time (min)', color: '#FB7185' },
  ], area.x + area.width / 2, area.y - 40);

  drawYTicks(ctx, area, 0, maxDist, 'left', v => v.toFixed(1) + ' km');
  drawYTicks(ctx, area, 0, maxTime, 'right', v => v.toFixed(0) + ' min');
  drawXTicks(ctx, data, area, (i) => toX(i, data.length, area));
};

const drawWeeklyChart = (ctx: CanvasRenderingContext2D, data: any[], area: any) => {
  if (!data.length) return;
  const maxDist = Math.max(...data.map(d => d.distance), 1) * 1.15;
  const maxRuns = Math.max(...data.map(d => d.runs), 1) * 1.2;
  const gw = area.width / data.length;
  const bw = Math.min(gw * 0.35, 50);

  drawGrid(ctx, area);

  const roundedRect = (x: number, y: number, w: number, h: number, r: number) => {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  data.forEach((d, i) => {
    const cx = area.x + gw * i + gw / 2;
    const dh = (d.distance / maxDist) * area.height;
    const rh = (d.runs / maxRuns) * area.height;

    const by1 = area.y + area.height - dh;
    const go = ctx.createLinearGradient(0, by1, 0, area.y + area.height);
    go.addColorStop(0, 'rgba(255, 122, 0, 0.9)');
    go.addColorStop(1, 'rgba(255, 122, 0, 0.5)');
    ctx.fillStyle = go;
    roundedRect(cx - bw - 3, by1, bw, dh, 4);
    ctx.fill();

    const by2 = area.y + area.height - rh;
    const gp = ctx.createLinearGradient(0, by2, 0, area.y + area.height);
    gp.addColorStop(0, 'rgba(167, 139, 250, 0.9)');
    gp.addColorStop(1, 'rgba(167, 139, 250, 0.5)');
    ctx.fillStyle = gp;
    roundedRect(cx + 3, by2, bw, rh, 4);
    ctx.fill();
  });

  if (data[0]?.goal) {
    const gy = area.y + area.height - (data[0].goal / maxDist) * area.height;
    ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 1.5;
    ctx.setLineDash([7, 4]);
    ctx.beginPath(); ctx.moveTo(area.x, gy); ctx.lineTo(area.x + area.width, gy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#EF4444'; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'right';
    ctx.fillText('Goal', area.x + area.width - 5, gy - 7);
  }

  drawLegend(ctx, [
    { label: 'Distance (km)', color: '#FF7A00' },
    { label: 'Runs', color: '#A78BFA' },
  ], area.x + area.width / 2, area.y - 40);

  drawYTicks(ctx, area, 0, maxDist, 'left', v => v.toFixed(1) + ' km');
  drawYTicks(ctx, area, 0, maxRuns, 'right', v => Math.round(v).toString());
  drawXTicks(ctx, data, area, (i) => area.x + gw * i + gw / 2);
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

    ctx.strokeStyle = '#374151'; ctx.lineWidth = 18; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke();
    ctx.strokeStyle = '#FF7A00';
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + dp); ctx.stroke();

    ctx.strokeStyle = '#374151'; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.arc(cx, cy, r - 28, 0, 2 * Math.PI); ctx.stroke();
    ctx.strokeStyle = '#A78BFA';
    ctx.beginPath(); ctx.arc(cx, cy, r - 28, -Math.PI / 2, -Math.PI / 2 + rp); ctx.stroke();

    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 24px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(new Date(m.name + '-01').toLocaleDateString('en', { month: 'short' }), cx, cy + 2);
    ctx.fillStyle = '#9CA3AF'; ctx.font = '20px system-ui';
    ctx.fillText(`${m.distance.toFixed(1)}km`, cx, cy + 30);
    ctx.font = '18px system-ui'; ctx.fillText(`${m.runs} runs`, cx, cy + 52);
    ctx.font = '16px system-ui'; ctx.fillText(`${m.time.toFixed(1)}h`, cx, cy + 72);
  });
};
