/* ═══════════════════════════════════════════════
   MED LAB – SHARED APP UTILITIES
   ═══════════════════════════════════════════════ */

// ── Procedure duration dictionary (minutes) per TT 43/2013/TT-BYT ──
const PROCEDURE_DURATIONS = {
  noi_soi:    15,
  mri:        45,
  ct_scan:    30,
  sieu_am:    20,
  parafin:    20,
  cham_cuu:   20,
  keo_gian:   20,
  bo_bot:     30,
  xet_nghiem: 10,
  xquang:     10,
};

const BUFFER_MINUTES = 3; // Mandatory BYT buffer

function addMinutesToTime(timeStr, minutes) {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return '00:00';
  const [h, m] = timeStr.split(':').map(Number);
  const total = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m) + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`;
}

function timesOverlap(s1, e1, s2, e2) {
  // All times as minutes since midnight
  const toMin = t => {
    if (!t || typeof t !== 'string' || !t.includes(':')) return 0;
    const [h,m] = t.split(':').map(Number);
    return (isNaN(h)?0:h)*60 + (isNaN(m)?0:m);
  };
  return toMin(s1) < toMin(e2) && toMin(e1) > toMin(s2);
}

// ── Modal helpers ──
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ── Toast notifications ──
function showToast(msg, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const colors = { success: '#22C55E', danger: '#EF4444', warn: '#F59E0B', info: '#3B82F6' };
  toast.style.cssText = `background:#fff;border:1.5px solid ${colors[type]||colors.info};border-radius:10px;padding:12px 16px;font-size:13px;font-weight:500;color:#1F2937;box-shadow:0 8px 20px rgba(0,0,0,0.12);display:flex;align-items:center;gap:10px;min-width:260px;animation:slideIn 0.3s ease;`;
  toast.innerHTML = `<span style="color:${colors[type]||colors.info};font-size:16px">${type==='success'?'✓':type==='danger'?'✕':type==='warn'?'⚠':'ℹ'}</span>${msg}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// Add toast animation
const toastStyle = document.createElement('style');
toastStyle.textContent = '@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}';
document.head.appendChild(toastStyle);
