/* ═══════════════════════════════════════════════
   MED LAB – INLINE SVG CHART (no external deps)
   ═══════════════════════════════════════════════ */

const CHART_DATA = {
  today: {
    labels: ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'],
    active:    [5, 12, 18, 22, 15, 20, 28, 25, 18, 10, 4],
    completed: [0,  3,  8, 14, 20, 25, 32, 38, 44, 50, 55],
  },
  week: {
    labels: ['T2','T3','T4','T5','T6','T7','CN'],
    active:    [30, 45, 42, 48, 38, 25, 12],
    completed: [25, 40, 38, 44, 35, 20, 10],
  }
};

let currentChartType = 'today';

function initChart() {
  renderChart(currentChartType);
}

function updateChart(type) {
  currentChartType = type;
  renderChart(type);
}

function renderChart(type) {
  const canvas = document.getElementById('procedureChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const data = CHART_DATA[type];
  const W = canvas.offsetWidth || 600;
  const H = 180;
  canvas.width = W;
  canvas.height = H;

  ctx.clearRect(0, 0, W, H);

  const PAD = { top: 10, right: 20, bottom: 30, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const maxVal = 60;
  const n = data.labels.length;
  const step = chartW / (n - 1);

  // Grid lines
  ctx.strokeStyle = '#F3F4F6';
  ctx.lineWidth = 1;
  [0, 15, 30, 45, 60].forEach(v => {
    const y = PAD.top + chartH - (v / maxVal) * chartH;
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + chartW, y);
    ctx.stroke();
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(v, PAD.left - 6, y + 3);
  });

  // X axis labels
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'center';
  data.labels.forEach((lbl, i) => {
    const x = PAD.left + i * step;
    ctx.fillText(lbl, x, H - 6);
  });

  // Area fill for "completed" (yellow/warm)
  const completedPts = data.completed.map((v, i) => ({
    x: PAD.left + i * step,
    y: PAD.top + chartH - (Math.min(v, maxVal) / maxVal) * chartH
  }));
  ctx.beginPath();
  ctx.moveTo(completedPts[0].x, PAD.top + chartH);
  completedPts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(completedPts[completedPts.length - 1].x, PAD.top + chartH);
  ctx.closePath();
  const gradY = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
  gradY.addColorStop(0, 'rgba(253,230,138,0.6)');
  gradY.addColorStop(1, 'rgba(253,230,138,0.05)');
  ctx.fillStyle = gradY;
  ctx.fill();

  // Line for "completed"
  ctx.beginPath();
  completedPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Area fill for "active" (blue)
  const activePts = data.active.map((v, i) => ({
    x: PAD.left + i * step,
    y: PAD.top + chartH - (Math.min(v, maxVal) / maxVal) * chartH
  }));
  ctx.beginPath();
  ctx.moveTo(activePts[0].x, PAD.top + chartH);
  activePts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(activePts[activePts.length - 1].x, PAD.top + chartH);
  ctx.closePath();
  const gradB = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
  gradB.addColorStop(0, 'rgba(37,99,235,0.25)');
  gradB.addColorStop(1, 'rgba(37,99,235,0.02)');
  ctx.fillStyle = gradB;
  ctx.fill();

  // Line for "active"
  ctx.beginPath();
  activePts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = '#2563EB';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dots on active line
  activePts.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#2563EB';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

window.addEventListener('resize', () => { if (currentChartType) renderChart(currentChartType); });
