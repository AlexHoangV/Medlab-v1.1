/* ═══════════════════════════════════════════════
   MED LAB – CALENDAR MODULE
   ═══════════════════════════════════════════════ */

const CALENDAR_EVENTS = {
  '2024-10-02': [{ text: '08:30 – Nguyễn Văn', type: 'safe' }],
  '2024-10-08': [{ text: '10:15 – Lê Thị Bình', type: 'warn' }, { text: '13:00 – Phạm Minh T', type: 'safe' }],
  '2024-10-10': [{ text: '08:30 Nội soi', type: 'safe' }, { text: '10:15 MRI', type: 'blue' }, { text: '13:00 Siêu âm', type: 'warn' }],
  '2024-10-15': [{ text: '13:15 – Đặng Thu T', type: 'safe' }],
};

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0-indexed

const MONTH_VN = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const DOW_VN   = ['THỨ 2','THỨ 3','THỨ 4','THỨ 5','THỨ 6','THỨ 7','CHỦ NHẬT'];

function renderCalendar() {
  const grid = document.getElementById('calGrid');
  if (!grid) return;

  const label = document.getElementById('calMonthLabel');
  if (label) label.textContent = `${MONTH_VN[currentMonth]}, ${currentYear}`;

  grid.innerHTML = '';

  // Day-of-week headers (Mon first)
  DOW_VN.forEach(d => {
    const h = document.createElement('div');
    h.className = 'cal-day-header';
    h.textContent = d;
    grid.appendChild(h);
  });

  const firstDay = new Date(currentYear, currentMonth, 1);
  // JS getDay(): 0=Sun,1=Mon...6=Sat → map to Mon=0 grid
  let startDow = firstDay.getDay(); // 0=Sun
  startDow = (startDow + 6) % 7;   // Mon=0

  const daysInMonth   = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const today = new Date();
  const isCurrentMonthView = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  let cells = [];
  // Prev month filler
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, month: 'prev' });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: 'current' });
  }
  // Next month filler (fill to 6 rows max)
  let nextDay = 1;
  while (cells.length % 7 !== 0 || cells.length < 35) {
    cells.push({ day: nextDay++, month: 'next' });
    if (cells.length >= 42) break;
  }

  cells.forEach(cell => {
    const div = document.createElement('div');
    div.className = 'cal-day' + (cell.month !== 'current' ? ' other-month' : '');

    if (cell.month === 'current' && isCurrentMonthView && cell.day === today.getDate()) {
      div.classList.add('today');
    }

    const numDiv = document.createElement('div');
    numDiv.className = 'cal-day__num';
    numDiv.textContent = cell.day;
    div.appendChild(numDiv);

    if (cell.month === 'current') {
      const dateKey = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(cell.day).padStart(2,'0')}`;
      const staticEvents = CALENDAR_EVENTS[dateKey] || [];
      const dbEvents = (typeof SCHEDULES_DB !== 'undefined' ? SCHEDULES_DB : []).filter(s => s.date === dateKey).map(s => {
        const patientId = Number(s.patientId);
        const pt = (typeof PATIENTS_DB !== 'undefined' ? PATIENTS_DB.find(p => p.id === patientId) : null);
        return {
          text: `${s.start} – ${pt && pt.fullName ? pt.fullName : 'BN #' + s.patientId}`,
          type: s.type === 'ONE_TO_MANY' ? 'blue' : 'safe'
        };
      });
      const events = [...dbEvents, ...staticEvents];

      events.forEach((ev, idx) => {
        if (idx === 0 && events.length > 1) {
          const cnt = document.createElement('div');
          cnt.className = 'cal-event-count';
          cnt.textContent = events.length + ' ca';
          div.appendChild(cnt);
        }
        if (idx < 3) {
          const evDiv = document.createElement('div');
          evDiv.className = `cal-event ${ev.type}`;
          evDiv.textContent = ev.text;
          evDiv.title = ev.text;
          evDiv.onclick = (e) => { e.stopPropagation(); window.location = 'procedure-entry.html'; };
          div.appendChild(evDiv);
        }
      });

      div.addEventListener('click', () => {
        document.querySelectorAll('.cal-day').forEach(d => d.style.outline = '');
        div.style.outline = '2px solid var(--color-primary)';
      });
    }

    grid.appendChild(div);
  });
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
}
function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar();
}
function goToday() {
  const t = new Date();
  currentYear = t.getFullYear();
  currentMonth = t.getMonth();
  renderCalendar();
}

document.addEventListener('DOMContentLoaded', renderCalendar);
window.addEventListener('medlab_data_updated', renderCalendar);

function openAddScheduleModal() {
  document.getElementById('calSchedDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('addScheduleModal').style.display = 'flex';
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function saveCalendarSchedule() {
  const dateStr = document.getElementById('calSchedDate').value;
  const procType = document.getElementById('calSchedProc').value;
  const patientName = document.getElementById('calSchedPatient').value || 'Bệnh nhân mới';
  const patientPID = document.getElementById('calSchedPID').value || 'BN-NEW';
  const startTime = document.getElementById('calSchedStart').value;
  const endTime = document.getElementById('calSchedEnd').value;
  const staffId = document.getElementById('calSchedStaff').value;

  // 1. Find or create patient
  let patientObj = PATIENTS_DB.find(p => p.fullName.toLowerCase() === patientName.toLowerCase() || p.pid === patientPID);
  if (!patientObj) {
    const newPId = Math.max(...PATIENTS_DB.map(p => p.id), 0) + 1;
    patientObj = { id: newPId, fullName: patientName, pid: patientPID, admitDate: new Date().toISOString().split('T')[0], dischargeDate: null, isActive: true, note: 'Tạo nhanh từ Lịch' };
    PATIENTS_DB.push(patientObj);
  }

  // 2. Create Schedule
  const newId = Math.max(...SCHEDULES_DB.map(s => s.id), 0) + 1;
  const newSchedule = {
    id: newId,
    date: dateStr,
    start: startTime,
    end: endTime,
    procedureId: procType,
    staffId: Number(staffId),
    patientId: patientObj.id,
    machineId: 1, // Defaulting to 1 for quick add
    type: procType === 'oxy_cao_ap' ? 'ONE_TO_MANY' : 'ONE_TO_ONE',
    status: 'BOOKED',
    note: `Đặt lịch nhanh: ${patientName}`
  };
  SCHEDULES_DB.push(newSchedule);

  // 3. Save & Sync
  if (typeof addAuditLog === 'function') {
    addAuditLog('SCHEDULE_CREATED_QUICK', null, 1, newId, `Đã đặt lịch nhanh ${procType} cho BN ${patientName}`);
  }
  if (typeof persistData === 'function') {
    persistData();
  }

  // 4. Update UI
  closeModal('addScheduleModal');
  if (typeof showToast === 'function') {
    showToast(`Đã lưu lịch cho BN ${patientName}`, 'success');
  } else {
    alert(`Đã lưu lịch cho BN ${patientName}`);
  }
  renderCalendar();
}