/* ═══════════════════════════════════════════════
   MED LAB – PROCEDURE ENTRY + ANTI-COLLISION ENGINE
   ═══════════════════════════════════════════════ */

// ── Simulated existing bookings (staff schedule) ──
const EXISTING_BOOKINGS = [
  { staffName: 'BS. Nguyễn Văn A',   start: '08:00', end: '09:00', type: 'staff' },
  { staffName: 'KTV. Trần Văn C',    start: '09:00', end: '09:30', type: 'staff' },
  { machineId:  'M-CT-02',           start: '08:00', end: '18:00', type: 'machine' },
  { patientPID: 'BN12345',           start: '10:00', end: '11:00', type: 'patient' },
];

let memberCount = 2;

// ── Procedure type change handler ──
function onProcedureTypeChange(val) {
  const durations = {
    noi_soi: 15, mri: 45, ct_scan: 30, sieu_am: 20,
    parafin: 20, cham_cuu: 20, keo_gian: 20, bo_bot: 30,
    xet_nghiem: 10, xquang: 10,
  };
  const dur = durations[val] || 0;
  const startTime = document.getElementById('startTime')?.value || '09:30';
  if (dur > 0) {
    const end = addMinutesToTime(startTime, dur + 3); // +3 buffer
    const endEl = document.getElementById('endTime');
    if (endEl) {
      endEl.value = end;
      const note = endEl.nextElementSibling;
      if (note) note.textContent = `= ${dur} phút + 3 phút đệm BYT`;
    }
    updateSlotSuggestions(startTime, dur + 3);
  }
  runCollisionCheck();
}

// ── Update end time whenever start time changes ──
document.addEventListener('DOMContentLoaded', () => {
  const startEl = document.getElementById('startTime');
  const typeEl  = document.getElementById('procedureType');
  const dateEl  = document.getElementById('procedureDate');
  if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
  if (startEl) startEl.addEventListener('change', () => { onProcedureTypeChange(typeEl?.value || ''); });

  // Initial auto-calc
  onProcedureTypeChange(typeEl?.value || 'mri');
  runCollisionCheck();
});

// ── Anti-Collision Engine (4D) ──
function runCollisionCheck() {
  const startTime = document.getElementById('startTime')?.value;
  const endTime   = document.getElementById('endTime')?.value;
  const patientPID = document.getElementById('patientPID')?.value || '';
  const procedureType = document.getElementById('procedureType')?.value;

  if (!startTime || !endTime) return;

  let staffOk   = true;
  let machineOk = true;
  let patientOk = true;
  let protocolOk = Boolean(procedureType);

  const selectedMachine = document.querySelector('.machine-card.selected')?.dataset?.machineId;

  EXISTING_BOOKINGS.forEach(b => {
    if (b.type === 'staff') {
      const teamNames = Array.from(document.querySelectorAll('.team-member__name')).map(i => i.value);
      teamNames.push('BS. Nguyễn Văn A'); // main doctor
      if (teamNames.some(n => n.includes((b.staffName || '').split(' ').pop() || '___'))) {
        if (timesOverlap(startTime, endTime, b.start, b.end)) staffOk = false;
      }
    }
    if (b.type === 'machine' && selectedMachine === b.machineId) {
      if (timesOverlap(startTime, endTime, b.start, b.end)) machineOk = false;
    }
    if (b.type === 'patient' && patientPID === b.patientPID) {
      if (timesOverlap(startTime, endTime, b.start, b.end)) patientOk = false;
    }
  });

  updateCollisionUI(staffOk, machineOk, patientOk, protocolOk);
  updateComplianceChecks(staffOk, machineOk, patientOk, protocolOk);
}

function updateCollisionUI(staff, machine, patient, protocol) {
  const bar = document.getElementById('collisionStatus');
  if (!bar) return;

  const items = bar.querySelectorAll('.collision-status__item');
  const states = [staff, machine, patient, protocol];
  const labels = [
    'Kiểm tra nhân sự',
    'Kiểm tra máy',
    'Kiểm tra bệnh nhân',
    'Quy chuẩn BYT'
  ];

  items.forEach((item, i) => {
    const ok = states[i];
    item.className = 'collision-status__item' + (ok ? '' : ' error');
    item.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">${ok
      ? '<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
      : '<line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>'
    }</svg>${labels[i]}: ${ok ? 'OK' : 'LỖI'}`;
  });

  bar.className = 'collision-status' + (staff && machine && patient && protocol ? '' : ' has-error');
}

function updateComplianceChecks(staff, machine, patient, protocol) {
  const map = {
    'chk-pid':    true,          // Always valid in demo
    'chk-device': machine,
    'chk-staff':  staff,
    'chk-time':   protocol,
    'chk-collision': staff && machine && patient && protocol,
  };
  Object.entries(map).forEach(([id, ok]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const icon = el.querySelector('.check-icon');
    if (!icon) return;
    icon.className = `check-icon ${ok ? 'safe' : 'fail'}`;
    icon.innerHTML = ok
      ? '<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
      : '<line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>';
  });
}

// ── Machine selection ──
function selectMachine(card, id) {
  if (card.classList.contains('busy')) {
    showToast('Máy này đang bận – vui lòng chọn máy khác', 'danger');
    return;
  }
  document.querySelectorAll('.machine-card').forEach(c => {
    c.classList.remove('selected');
    const dot = c.querySelector('.machine-sel-dot');
    if (dot) dot.remove();
  });
  card.classList.add('selected');
  card.dataset.machineId = id;
  const dot = document.createElement('div');
  dot.className = 'machine-sel-dot';
  card.appendChild(dot);
  runCollisionCheck();
  showToast(`Đã chọn máy ${id}`, 'success');
}

// ── Smart slot suggestions ──
function updateSlotSuggestions(start, dur) {
  const container = document.getElementById('slotSuggestions');
  if (!container) return;
  const slots = [start, addMinutesToTime(start, 90), addMinutesToTime(start, 180)];
  container.innerHTML = '';
  slots.forEach((s, i) => {
    const e = addMinutesToTime(s, dur);
    const div = document.createElement('div');
    div.className = `slot-item${i === 0 ? ' active' : ''}`;
    div.onclick = () => selectSlot(div, s, e);
    div.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none">${i===0?'<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>':'<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>'}</svg>${s} – ${e} <span class="slot-safe">An toàn</span>`;
    container.appendChild(div);
  });
}

function selectSlot(el, start, end) {
  document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  const si = document.getElementById('startTime');
  const ei = document.getElementById('endTime');
  if (si) si.value = start;
  if (ei) ei.value = end;
  showToast(`Đã chọn khung giờ ${start} – ${end}`, 'success');
  runCollisionCheck();
}

// ── Urgent mode toggle ──
function toggleUrgent(cb) {
  if (cb.checked) showToast('Chế độ cấp cứu – ưu tiên xếp lịch ngay lập tức', 'warn');
}

// ── Team member CRUD ──
function addTeamMember() {
  openModal('addMemberModal');
  setTimeout(() => document.getElementById('newMemberName')?.focus(), 100);
}

function confirmAddMember() {
  const nameEl = document.getElementById('newMemberName');
  const roleEl = document.getElementById('newMemberRole');
  const name = nameEl?.value?.trim();
  if (!name) { showToast('Vui lòng nhập tên nhân viên', 'warn'); return; }

  memberCount++;
  const colors = ['#2563EB','#059669','#D97706','#7C3AED','#DC2626'];
  const color = colors[memberCount % colors.length];
  const initials = (name || '').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
  const role = roleEl?.value || 'Nhân viên';

  const list = document.getElementById('teamList');
  const div = document.createElement('div');
  div.className = 'team-member';
  div.dataset.id = memberCount;
  div.innerHTML = `
    <div class="staff-avatar" style="width:32px;height:32px;font-size:11px;background:linear-gradient(135deg,${color},${color}99)">${initials}</div>
    <div class="team-member__info">
      <input class="team-member__name" type="text" value="${name}" oninput="runCollisionCheck()" />
      <div class="team-member__role">${role}</div>
    </div>
    <button class="icon-btn text-danger" onclick="removeTeamMember(${memberCount})">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>`;
  if (list) list.appendChild(div);

  if (nameEl) nameEl.value = '';
  closeModal('addMemberModal');
  runCollisionCheck();
  showToast(`Đã thêm ${name} – kiểm tra lịch hoàn tất`, 'success');
}

function removeTeamMember(id) {
  const el = document.querySelector(`.team-member[data-id="${id}"]`);
  if (el) { el.style.opacity = '0'; el.style.transition = 'opacity 0.2s'; setTimeout(() => { el.remove(); runCollisionCheck(); }, 200); }
}

// ── Save procedure ──
function saveProcedure() {
  const allOk = document.querySelectorAll('.collision-status__item.error').length === 0;
  if (!allOk) {
    showToast('Có lỗi kiểm tra 4D – vui lòng sửa trước khi lưu', 'danger');
    return;
  }
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Đang lưu...';
    setTimeout(() => {
      // 1. Extract values from form
      const patientName = document.getElementById('patientName')?.value || 'Bệnh nhân mới';
      const patientPID = document.getElementById('patientPID')?.value || 'BN-NEW';
      const procType = document.getElementById('procedureType')?.value || 'oxy_cao_ap';
      const startTime = document.getElementById('startTime')?.value || '09:00';
      const endTime = document.getElementById('endTime')?.value || '09:45';
      const selectedMachineCard = document.querySelector('.machine-card.selected');
      const machineId = selectedMachineCard ? parseInt(selectedMachineCard.dataset.machineId || '17') : 17;

      // 2. Find or create patient in PATIENTS_DB
      let patientObj = PATIENTS_DB.find(p => p.fullName.toLowerCase() === patientName.toLowerCase() || p.pid === patientPID);
      if (!patientObj) {
        const newPId = Math.max(...PATIENTS_DB.map(p => p.id), 0) + 1;
        patientObj = { id: newPId, fullName: patientName, pid: patientPID, admitDate: new Date().toISOString().split('T')[0], dischargeDate: null, isActive: true, note: 'Tạo từ Nhập ca' };
        PATIENTS_DB.push(patientObj);
      }

      // 3. Add to SCHEDULES_DB for selected date
      const dateStr = document.getElementById('procedureDate')?.value || new Date().toISOString().split('T')[0];
      const newId = Math.max(...SCHEDULES_DB.map(s => s.id), 0) + 1;
      const newSchedule = {
        id: newId,
        date: dateStr,
        start: startTime,
        end: endTime,
        procedureId: procType,
        staffId: 1,
        patientId: patientObj.id,
        machineId: machineId,
        type: procType === 'oxy_cao_ap' ? 'ONE_TO_MANY' : 'ONE_TO_ONE',
        status: 'BOOKED',
        note: `Đặt lịch thủ thuật: ${patientName}`
      };
      SCHEDULES_DB.push(newSchedule);

      // 4. Add audit log & persist
      addAuditLog('PROCEDURE_BOOKED', null, 1, newId, `Đã đặt lịch ${procType} cho BN ${patientName}`);
      persistData();

      // 5. Optionally sync to server API
      fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule)
      }).catch(() => {});

      saveBtn.disabled = false;
      saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/></svg> Lưu hồ sơ';
      openModal('saveSuccessModal');
      showToast(`Đã lưu thủ thuật & đồng bộ lịch bệnh viện cho BN ${patientName}`, 'success');
    }, 600);
  }
}
