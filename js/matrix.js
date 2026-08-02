/* ═══════════════════════════════════════════════
   MED LAB – SCHEDULE MATRIX (Visily UX/UI Redesign)
   Ma Trận Lịch Vận Hành: Cột Tài Nguyên (Máy & Nhân sự) × Hàng Thời Gian (07:00 – 18:00)
   ═══════════════════════════════════════════════ */

const MATRIX_START = '07:00';
const MATRIX_END   = '18:00';
const SLOT_MIN     = 30; // 30-minute granularity for Visily layout

let currentFilter  = 'all';
let dragSourceId   = null;
let selectedProcType = 'ONE_TO_ONE';

/* ── Time helpers ── */
function timeToSlotIndex(t) {
  return Math.round((toMinutes(t) - toMinutes(MATRIX_START)) / SLOT_MIN);
}
function slotIndexToTime(i) {
  return addMin(MATRIX_START, i * SLOT_MIN);
}
function totalSlots() {
  return Math.ceil((toMinutes(MATRIX_END) - toMinutes(MATRIX_START)) / SLOT_MIN);
}

/* ── Build time slots array ── */
function buildTimeSlots() {
  const slots = [];
  let t = MATRIX_START;
  while (toMinutes(t) <= toMinutes(MATRIX_END)) {
    slots.push(t);
    t = addMin(t, SLOT_MIN);
  }
  return slots;
}

/* ── Render matrix table ── */
function renderMatrix() {
  const tbl       = document.getElementById('matrixTable');
  const dateStr   = document.getElementById('matrixDate')?.value;
  const showEmpty = document.getElementById('showEmpty')?.checked;
  const searchKey = document.getElementById('matrixSearch')?.value?.toLowerCase() || '';
  if (!tbl) return;

  // Resources columns: Combine top machines and active staff
  const activeMachines = MACHINES_DB.filter(m => m.status === 'ACTIVE').slice(0, 4);
  const activeStaff    = STAFF_DB.filter(s => s.isActive).slice(0, 5);
  const resources = [
    ...activeMachines.map(m => ({ id: 'm_' + m.id, name: m.tenTB, type: 'machine', refId: m.id, code: m.maMay })),
    ...activeStaff.map(s => ({ id: 's_' + s.id, name: s.fullName, type: 'staff', refId: s.id, code: s.initials }))
  ];

  const timeSlots = buildTimeSlots();
  const daySchedules = SCHEDULES_DB.filter(sc => {
    if (sc.date !== dateStr || sc.status === 'CANCELLED') return false;
    if (currentFilter === '1to1' && sc.type !== 'ONE_TO_ONE') return false;
    if (currentFilter === '1tomany' && sc.type !== 'ONE_TO_MANY') return false;
    if (searchKey) {
      const pt = getPatient(sc.patientId);
      const pr = getProcedure(sc.procedureId);
      const match = (pt?.fullName?.toLowerCase().includes(searchKey) ||
                     pt?.pid?.toLowerCase().includes(searchKey) ||
                     pr?.name?.toLowerCase().includes(searchKey));
      if (!match) return false;
    }
    return true;
  });

  // Update top stats
  const statTotal = document.getElementById('statTotalCa');
  const statConflicts = document.getElementById('statConflicts');
  if (statTotal) statTotal.innerText = daySchedules.length;
  
  const collisions = daySchedules.filter(b => checkCollisionForBlock(b, daySchedules));
  if (statConflicts) statConflicts.innerText = String(collisions.length).padStart(2, '0');

  // ── Header row
  let html = '<thead><tr>';
  html += `<th class="time-header-cell">THỜI GIAN</th>`;
  resources.forEach(res => {
    const isMach = res.type === 'machine';
    const count = daySchedules.filter(sc => isMach ? sc.machineId === res.refId : sc.staffId === res.refId).length;
    html += `<th style="min-width:160px">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:32px;height:32px;border-radius:8px;background:${isMach ? '#EFF6FF' : '#F3E8FF'};color:${isMach ? '#2563EB' : '#7C3AED'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px">
          ${isMach ? '⚡' : res.code}
        </div>
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--color-gray-900)">${res.name}</div>
          <div style="font-size:10px;color:var(--color-gray-500);text-transform:uppercase">${isMach ? 'Thiết bị' : 'Nhân sự'} • ${count} ca</div>
        </div>
      </div>
    </th>`;
  });
  html += '</tr></thead><tbody>';

  // ── Build block lookup: resource key → list of blocks
  const blocksByRes = {};
  resources.forEach(res => { blocksByRes[res.id] = []; });
  daySchedules.forEach(sc => {
    // Map to machine or staff
    const resKey = sc.machineId ? 'm_' + sc.machineId : 's_' + sc.staffId;
    if (!blocksByRes[resKey]) {
      // fallback to staff
      const fallbackKey = 's_' + sc.staffId;
      if (blocksByRes[fallbackKey]) blocksByRes[fallbackKey].push(sc);
      return;
    }
    blocksByRes[resKey].push(sc);
  });

  // Calculate slot spans
  const rendered = {};
  resources.forEach(res => { rendered[res.id] = new Set(); });

  timeSlots.forEach((t, slotIdx) => {
    const isHour = t.endsWith(':00');
    html += `<tr>`;
    html += `<td class="time-header-cell" style="background:${isHour ? '#F1F5F9' : '#F8FAFC'};font-weight:${isHour ? '700' : '400'}">${t}</td>`;

    resources.forEach(res => {
      if (rendered[res.id].has(slotIdx)) return;

      // Find block overlapping or starting at this time slot
      const rBlocks = blocksByRes[res.id] || [];
      const block = rBlocks.find(b => {
        const bStartIdx = timeToSlotIndex(b.start);
        return bStartIdx === slotIdx;
      });

      if (block) {
        const startIdx = timeToSlotIndex(block.start);
        const endIdx = timeToSlotIndex(block.end);
        const span = Math.max(1, endIdx - startIdx);
        for (let r = slotIdx; r < slotIdx + span; r++) rendered[res.id].add(r);

        const pt = getPatient(block.patientId);
        const pr = getProcedure(block.procedureId);
        const isConflict = checkCollisionForBlock(block, daySchedules);
        const itemClass = isConflict ? 'app-item-red' : (block.status === 'BOOKED' ? 'app-item-blue' : 'app-item-yellow');

        html += `<td rowspan="${span}" style="padding:2px;position:relative">
          <div class="matrix-appointment-item ${itemClass}"
               style="height:calc(${span * 64}px - 6px)"
               draggable="true"
               ondragstart="onBlockDragStart(event, ${block.id})"
               onclick="showBlockDetail(${block.id})">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-weight:700;font-size:11px">${block.start} - ${block.end}</span>
                <span class="badge ${isConflict?'badge--danger':'badge--blue'}" style="font-size:9px;padding:1px 6px">${isConflict ? 'Xung đột' : (block.type==='ONE_TO_ONE'?'1:1':'1-Nhiều')}</span>
              </div>
              <div style="font-weight:800;margin-top:3px;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${pt?.fullName || 'Bệnh nhân'}</div>
              <div style="font-size:11px;opacity:0.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${pr?.name || block.procedureId}</div>
            </div>
            <div style="font-size:10px;opacity:0.75;display:flex;justify-content:space-between;align-items:center;margin-top:4px">
              <span>Mã: APT-${block.id}</span>
              <span>⚡ Xem chi tiết</span>
            </div>
          </div>
        </td>`;
      } else {
        html += `<td class="matrix-slot empty"
          ondragover="event.preventDefault(); this.style.background='#EFF6FF'"
          ondragleave="this.style.background='transparent'"
          ondrop="onBlockDrop(event, '${res.id}', '${t}')"
          onclick="onEmptySlotClick('${res.id}', '${t}')"
          style="cursor:pointer;transition:background 0.15s">
        </td>`;
      }
    });

    html += '</tr>';
  });

  html += '</tbody>';
  tbl.innerHTML = html;
}

function checkCollisionForBlock(block, daySchedules) {
  return daySchedules.some(other => {
    if (other.id === block.id) return false;
    if (other.staffId === block.staffId || (block.machineId && other.machineId === block.machineId)) {
      const req = (block.type === 'ONE_TO_ONE' || other.type === 'ONE_TO_ONE') ? 2 : 5;
      const overlap = toMinutes(block.start) < toMinutes(other.end) &&
                      toMinutes(block.end) > toMinutes(other.start);
      if (overlap) return true;
    }
    return false;
  });
}

/* ── Drag & Drop ── */
function onBlockDragStart(event, blockId) {
  dragSourceId = blockId;
  event.dataTransfer.effectAllowed = 'move';
}

function onBlockDrop(event, resId, targetTime) {
  event.preventDefault();
  event.currentTarget.style.background = 'transparent';
  if (!dragSourceId) return;

  const block = SCHEDULES_DB.find(sc => sc.id === dragSourceId);
  if (!block) return;

  const dur = toMinutes(block.end) - toMinutes(block.start);
  block.start = targetTime;
  block.end   = addMin(targetTime, dur);
  
  if (resId.startsWith('m_')) {
    block.machineId = parseInt(resId.substring(2));
  } else if (resId.startsWith('s_')) {
    block.staffId = parseInt(resId.substring(2));
  }
  
  dragSourceId = null;
  persistData();
  renderMatrix();
  showToast(`Đã di chuyển ca hẹn sang ${targetTime}`, 'success');
}

function onEmptySlotClick(resId, time) {
  const modal = document.getElementById('addBlockModal');
  if (!modal) return;
  document.getElementById('blockStart').value = time;
  if (resId.startsWith('s_')) {
    document.getElementById('blockStaff').value = parseInt(resId.substring(2));
  } else if (resId.startsWith('m_')) {
    document.getElementById('blockMachine').value = parseInt(resId.substring(2));
  }
  calcBlockEnd();
  openModal('addBlockModal');
}

function initMatrix() {
  populateBlockForm();
  renderMatrix();
}

function populateBlockForm() {
  const patSel  = document.getElementById('blockPatient');
  const procSel = document.getElementById('blockProcedure');
  const staffSel= document.getElementById('blockStaff');
  if (!patSel || !procSel || !staffSel) return;

  patSel.innerHTML  = PATIENTS_DB.filter(p => p.isActive).map(p => `<option value="${p.id}">${p.fullName} (${p.pid})</option>`).join('');
  procSel.innerHTML = PROCEDURE_DICT.map(p => `<option value="${p.id}" data-dur="${p.durationMin}" data-type="${p.type}">${p.name} (${p.durationMin}p)</option>`).join('');
  staffSel.innerHTML= STAFF_DB.filter(s => s.isActive).map(s => `<option value="${s.id}">${s.fullName}</option>`).join('');

  calcBlockEnd();
  populateMachineSelect();
}

function populateMachineSelect(procId) {
  const sel = document.getElementById('blockMachine');
  if (!sel) return;
  const avail = procId
    ? MACHINES_DB.filter(m => m.status === 'ACTIVE' && m.procedureIds?.includes(procId))
    : MACHINES_DB.filter(m => m.status === 'ACTIVE');
  sel.innerHTML = `<option value="">-- Không dùng máy --</option>` +
    avail.map(m => `<option value="${m.id}">${m.tenTB} (${m.maMay})</option>`).join('');
}

function onBlockProcChange() {
  const sel = document.getElementById('blockProcedure');
  const opt = sel?.selectedOptions[0];
  const type = opt?.dataset?.type || 'ONE_TO_ONE';
  selectProcType(type, false);
  calcBlockEnd();
  populateMachineSelect(sel?.value);
}

function selectProcType(type) {
  selectedProcType = type;
  document.getElementById('type1to1Btn')?.classList.toggle('active', type === 'ONE_TO_ONE');
  document.getElementById('type1to1Btn')?.classList.toggle('blue',   type === 'ONE_TO_ONE');
  document.getElementById('type1manyBtn')?.classList.toggle('active', type === 'ONE_TO_MANY');
  document.getElementById('type1manyBtn')?.classList.toggle('purple', type === 'ONE_TO_MANY');

  const bufferEl = document.getElementById('bufferInfo');
  if (bufferEl) {
    if (type === 'ONE_TO_ONE') {
      bufferEl.className = 'buffer-info buffer-info--blue';
      bufferEl.innerHTML = `Buffer tối thiểu: <strong>2 phút</strong> giữa 2 bệnh nhân liên tiếp`;
    } else {
      bufferEl.className = 'buffer-info buffer-info--purple';
      bufferEl.innerHTML = `Buffer BHYT bắt buộc: <strong>5 phút</strong> (Thủ thuật 1-Nhiều)`;
    }
  }
}

function calcBlockEnd() {
  const start  = document.getElementById('blockStart')?.value;
  const procSel= document.getElementById('blockProcedure');
  const opt    = procSel?.selectedOptions[0];
  const dur    = parseInt(opt?.dataset?.dur || '20');
  const buf    = selectedProcType === 'ONE_TO_MANY' ? 5 : 2;
  if (start) {
    const endEl = document.getElementById('blockEnd');
    if (endEl) endEl.value = addMin(start, dur + buf);
  }
  checkBlockCollision();
}

function checkBlockCollision() {
  const start   = document.getElementById('blockStart')?.value;
  const end     = document.getElementById('blockEnd')?.value;
  const staffId = parseInt(document.getElementById('blockStaff')?.value);
  const dateStr = document.getElementById('matrixDate')?.value;
  const resultEl= document.getElementById('blockCollisionResult');
  if (!start || !end || !staffId || !resultEl) return;

  const existing = SCHEDULES_DB.filter(sc => sc.staffId === staffId && sc.date === dateStr && sc.status === 'BOOKED');
  let conflict = existing.find(sc => {
    return toMinutes(start) < toMinutes(sc.end) && toMinutes(end) > toMinutes(sc.start);
  });

  if (conflict) {
    const pt = getPatient(conflict.patientId);
    resultEl.innerHTML = `<div class="alert-box alert-box--danger">⚠ Trùng lịch với <strong>${pt?.fullName || 'BN'}</strong> (${conflict.start}–${conflict.end})</div>`;
  } else {
    resultEl.innerHTML = `<div class="alert-box alert-box--success">✅ Khung giờ sạch, an toàn</div>`;
  }
}

function saveBlock() {
  const patientId = parseInt(document.getElementById('blockPatient')?.value);
  const procId    = document.getElementById('blockProcedure')?.value;
  const staffId   = parseInt(document.getElementById('blockStaff')?.value);
  const machineId = document.getElementById('blockMachine')?.value ? parseInt(document.getElementById('blockMachine').value) : null;
  const start     = document.getElementById('blockStart')?.value;
  const end       = document.getElementById('blockEnd')?.value;
  const dateStr   = document.getElementById('matrixDate')?.value;

  if (!patientId || !procId || !staffId || !start || !end) {
    showToast('Vui lòng điền đầy đủ thông tin', 'warn'); return;
  }

  const newId = Math.max(...SCHEDULES_DB.map(s => s.id), 0) + 1;
  SCHEDULES_DB.push({
    id: newId, date: dateStr, start, end,
    procedureId: procId, staffId, patientId, machineId,
    type: selectedProcType, status: 'BOOKED'
  });

  persistData();
  closeModal('addBlockModal');
  renderMatrix();
  showToast(`Đã tạo ca lịch thành công (APT-${newId})`, 'success');
}

function showBlockDetail(id) {
  const sc = SCHEDULES_DB.find(x => x.id === id);
  if (!sc) return;
  const pt = getPatient(sc.patientId);
  const st = getStaff(sc.staffId);
  const pr = getProcedure(sc.procedureId);
  const mc = getMachine(sc.machineId);

  document.getElementById('blockDetailBody').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="form-row">
        <div><div class="form-label">Mã ca hẹn</div><div style="font-weight:700;color:var(--color-primary)">APT-${sc.id}</div></div>
        <div><div class="form-label">Trạng thái</div><span class="badge badge--blue">${sc.status}</span></div>
      </div>
      <div class="form-row">
        <div><div class="form-label">Bệnh nhân</div><div style="font-weight:700">${pt?.fullName || '—'}</div><div style="font-size:11px;color:var(--color-gray-500)">PID: ${pt?.pid}</div></div>
        <div><div class="form-label">Dịch vụ thủ thuật</div><div style="font-weight:700">${pr?.name || sc.procedureId}</div></div>
      </div>
      <div class="form-row">
        <div><div class="form-label">Nhân sự thực hiện</div><div>${st?.fullName || '—'}</div></div>
        <div><div class="form-label">Thiết bị</div><div>${mc ? mc.tenTB : 'Không dùng máy'}</div></div>
      </div>
      <div><div class="form-label">Khung giờ</div><div style="font-size:15px;font-weight:800;color:var(--color-primary)">${sc.start} – ${sc.end} (${sc.type === 'ONE_TO_ONE' ? '1:1' : '1-Nhiều'})</div></div>
    </div>`;

  document.getElementById('cancelBlockBtn').onclick = () => {
    sc.status = 'CANCELLED';
    persistData();
    closeModal('blockDetailModal');
    renderMatrix();
    showToast(`Đã hủy ca APT-${sc.id}`, 'warn');
  };
  openModal('blockDetailModal');
}

function filterView(type) {
  currentFilter = type;
  ['All', '1to1', '1tomany'].forEach(t => {
    const btn = document.getElementById('filterBtn' + t);
    if (btn) btn.classList.toggle('btn--primary', t.toLowerCase() === (type === 'all' ? 'all' : (type === '1to1' ? '1to1' : '1tomany')));
  });
  renderMatrix();
}

function exportMatrixCSV() {
  const dateStr = document.getElementById('matrixDate')?.value;
  const rows = [['Mã ca','Ngày','Giờ bắt đầu','Giờ kết thúc','Bệnh nhân','Dịch vụ','Nhân sự','Trạng thái']];
  SCHEDULES_DB.filter(sc => sc.date === dateStr).forEach(sc => {
    const pt = getPatient(sc.patientId);
    const st = getStaff(sc.staffId);
    const pr = getProcedure(sc.procedureId);
    rows.push([`APT-${sc.id}`, sc.date, sc.start, sc.end, pt?.fullName, pr?.name, st?.fullName, sc.status]);
  });
  const csv = rows.map(r => r.map(v => `"${v||''}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `ma-tran-lich-${dateStr}.csv`;
  a.click();
  showToast('Đã xuất file CSV thành công', 'success');
}
