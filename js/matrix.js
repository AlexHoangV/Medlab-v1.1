/* ═══════════════════════════════════════════════
   MED LAB – SCHEDULE MATRIX (Drag & Drop)
   Giống Google Sheet: cột KTV × hàng thời gian
   ═══════════════════════════════════════════════ */

const MATRIX_START = '07:40';
const MATRIX_END   = '17:00';
const SLOT_MIN     = 5; // 5-minute granularity

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
  const tbl      = document.getElementById('matrixTable');
  const dateStr  = document.getElementById('matrixDate')?.value;
  const showEmpty = document.getElementById('showEmpty')?.checked;
  if (!tbl) return;

  const activeStaff = STAFF_DB.filter(s => s.isActive);
  const timeSlots   = buildTimeSlots();
  const daySchedules = SCHEDULES_DB.filter(sc =>
    sc.date === dateStr &&
    sc.status !== 'CANCELLED' &&
    (currentFilter === 'all' ||
     (currentFilter === '1to1'    && sc.type === 'ONE_TO_ONE') ||
     (currentFilter === '1tomany' && sc.type === 'ONE_TO_MANY'))
  );

  // ── Header row
  let html = '<thead><tr>';
  html += `<th class="time-col">Giờ</th>`;
  activeStaff.forEach(s => {
    const count = daySchedules.filter(sc => sc.staffId === s.id).length;
    html += `<th style="min-width:120px">
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
        <div style="width:26px;height:26px;border-radius:50%;background:${s.color};color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center">${s.initials}</div>
        <div style="font-size:10px">${s.shortName}</div>
        <div style="font-size:9px;opacity:0.7">${count} ca</div>
      </div></th>`;
  });
  html += '</tr></thead><tbody>';

  // ── Build block lookup: staffId → list of blocks with slot ranges
  const blocksByStaff = {};
  activeStaff.forEach(s => { blocksByStaff[s.id] = []; });
  daySchedules.forEach(sc => {
    if (!blocksByStaff[sc.staffId]) return;
    const startSlot = timeToSlotIndex(sc.start);
    const endSlot   = timeToSlotIndex(sc.end);
    const height    = Math.max(1, endSlot - startSlot);
    blocksByStaff[sc.staffId].push({ ...sc, startSlot, endSlot, height });
  });

  // ── Rows
  const rendered = {}; // track rowspan cells
  activeStaff.forEach(s => { rendered[s.id] = new Set(); });

  timeSlots.forEach((t, slotIdx) => {
    const isHour = toMinutes(t) % 60 === 0;
    html += `<tr>`;
    html += `<td class="time-cell${isHour?' hour-mark':''}">${isHour ? t : ''}</td>`;

    activeStaff.forEach(s => {
      if (rendered[s.id].has(slotIdx)) return; // skip – occupied by rowspan

      // Find block starting at this slot for this staff
      const block = blocksByStaff[s.id].find(b => b.startSlot === slotIdx);
      if (block) {
        const rowspan = block.height;
        for (let r = slotIdx; r < slotIdx + rowspan; r++) rendered[s.id].add(r);

        const pt = getPatient(block.patientId);
        const pr = getProcedure(block.procedureId);
        const typeClass = block.type === 'ONE_TO_ONE' ? 'type-1to1' : 'type-1tomany';
        const collision = checkCollisionForBlock(block, daySchedules);

        html += `<td rowspan="${rowspan}" style="padding:0;position:relative">
          <div class="matrix-block ${typeClass}${collision?' collision':''}"
               style="position:relative;height:${rowspan * 28 - 4}px;top:2px"
               draggable="true"
               ondragstart="onBlockDragStart(event, ${block.id})"
               onclick="showBlockDetail(${block.id})"
               title="${pt?.fullName || '?'} | ${pr?.name || block.procedureId} | ${block.start}–${block.end}">
            ${collision ? '⚠ ' : ''}${pt?.fullName?.split(' ').pop() || '?'}
            ${rowspan >= 3 ? `<br><span style="font-weight:400;font-size:9px">${block.start}–${block.end}</span>` : ''}
          </div>
        </td>`;
      } else {
        // Empty slot
        html += `<td class="matrix-slot empty"
          ondragover="event.preventDefault(); this.classList.add('drop-target')"
          ondragleave="this.classList.remove('drop-target')"
          ondrop="onBlockDrop(event, ${s.id}, '${t}')"
          onclick="onEmptySlotClick(${s.id}, '${t}')">
        </td>`;
      }
    });
    html += '</tr>';
  });

  html += '</tbody>';
  tbl.innerHTML = html;
  updateCollisionBanner(daySchedules);
}

function checkCollisionForBlock(block, daySchedules) {
  return daySchedules.some(other => {
    if (other.id === block.id) return false;
    if (other.staffId === block.staffId) {
      // 1:1 requires 2 min gap, 1-many requires 5 min gap
      const req = (block.type === 'ONE_TO_ONE' || other.type === 'ONE_TO_ONE') ? 2 : 5;
      const gap = Math.min(
        Math.abs(toMinutes(block.start) - toMinutes(other.end)),
        Math.abs(toMinutes(other.start) - toMinutes(block.end))
      );
      const overlap = toMinutes(block.start) < toMinutes(other.end) &&
                      toMinutes(block.end) > toMinutes(other.start);
      if (overlap || gap < req) return true;
    }
    return false;
  });
}

function updateCollisionBanner(daySchedules) {
  const banner = document.getElementById('collisionBanner');
  if (!banner) return;
  const collisions = daySchedules.filter(b => checkCollisionForBlock(b, daySchedules));
  if (collisions.length > 0) {
    banner.style.display = 'flex';
    banner.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    <strong>Phát hiện ${collisions.length} xung đột lịch!</strong> Các block đỏ vi phạm quy tắc khoảng cách tối thiểu. Vui lòng điều chỉnh trước khi đẩy lên BHYT.`;
  } else {
    banner.style.display = 'none';
  }
}

/* ── Drag & Drop ── */
function onBlockDragStart(event, blockId) {
  dragSourceId = blockId;
  event.dataTransfer.effectAllowed = 'move';
}

function onBlockDrop(event, staffId, targetTime) {
  event.preventDefault();
  event.currentTarget.classList.remove('drop-target');
  if (!dragSourceId) return;

  const block = SCHEDULES_DB.find(sc => sc.id === dragSourceId);
  if (!block) return;

  const dur = toMinutes(block.end) - toMinutes(block.start);
  block.start   = targetTime;
  block.end     = addMin(targetTime, dur);
  block.staffId = staffId;
  dragSourceId  = null;

  persistData();
  renderMatrix();
  showToast(`Ca thủ thuật đã được di chuyển tới ${targetTime}`, 'success');
}

function onEmptySlotClick(staffId, time) {
  const modal = document.getElementById('addBlockModal');
  if (!modal) return;
  document.getElementById('blockStart').value = time;
  document.getElementById('blockStaff').value = staffId;
  calcBlockEnd();
  openModal('addBlockModal');
}

/* ── Add block modal ── */
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
  staffSel.innerHTML= STAFF_DB.filter(s => s.isActive).map(s => `<option value="${s.id}">${s.shortName}</option>`).join('');

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

function selectProcType(type, manual = true) {
  selectedProcType = type;
  document.getElementById('type1to1Btn')?.classList.toggle('active', type === 'ONE_TO_ONE');
  document.getElementById('type1to1Btn')?.classList.toggle('blue',   type === 'ONE_TO_ONE');
  document.getElementById('type1manyBtn')?.classList.toggle('active', type === 'ONE_TO_MANY');
  document.getElementById('type1manyBtn')?.classList.toggle('purple', type === 'ONE_TO_MANY');

  const bufferEl = document.getElementById('bufferInfo');
  if (bufferEl) {
    if (type === 'ONE_TO_ONE') {
      bufferEl.className = 'buffer-info buffer-info--blue';
      bufferEl.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Buffer tối thiểu: <strong>2 phút</strong> giữa 2 bệnh nhân liên tiếp của cùng 1 KTV`;
    } else {
      bufferEl.className = 'buffer-info buffer-info--purple';
      bufferEl.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Buffer BHYT bắt buộc: <strong>5 phút</strong> giữa các bệnh nhân khác nhau (Thủ thuật 1-Nhiều)`;
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

  const existingForStaff = SCHEDULES_DB.filter(sc =>
    sc.staffId === staffId && sc.date === dateStr && sc.status === 'BOOKED'
  );

  const req = selectedProcType === 'ONE_TO_MANY' ? 5 : 2;
  let conflict = null;
  for (const sc of existingForStaff) {
    const overlap = toMinutes(start) < toMinutes(sc.end) && toMinutes(end) > toMinutes(sc.start);
    const gap = Math.min(
      Math.abs(toMinutes(start) - toMinutes(sc.end)),
      Math.abs(toMinutes(sc.start) - toMinutes(end))
    );
    if (overlap || gap < req) { conflict = sc; break; }
  }

  if (conflict) {
    const pt = getPatient(conflict.patientId);
    resultEl.innerHTML = `<div class="alert-box alert-box--danger">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2"/></svg>
      ⚠ Xung đột với ca của <strong>${pt?.fullName || '?'}</strong> lúc ${conflict.start}–${conflict.end}. Buffer tối thiểu: ${req} phút.
    </div>`;
    const smartEl = document.getElementById('smartSlots');
    if (smartEl) {
      const suggestions = findSmartSlots(staffId, dateStr, selectedProcType);
      smartEl.innerHTML = suggestions.length
        ? `<div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--color-primary)">⚡ Khung giờ sạch được đề xuất:</div>
           <div style="display:flex;gap:6px;flex-wrap:wrap">
             ${suggestions.slice(0,4).map(sl => `<button class="slot-item" onclick="applySmartSlot('${sl.start}','${sl.end}')">
               ${sl.start}–${sl.end} <span class="slot-safe">An toàn</span>
             </button>`).join('')}
           </div>`
        : '';
    }
  } else {
    resultEl.innerHTML = `<div class="alert-box alert-box--success">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
      ✅ Không có xung đột – Khung giờ sạch, an toàn BHYT
    </div>`;
    if (document.getElementById('smartSlots')) document.getElementById('smartSlots').innerHTML = '';
  }
}

function findSmartSlots(staffId, dateStr, type) {
  const procSel = document.getElementById('blockProcedure');
  const opt     = procSel?.selectedOptions[0];
  const dur     = parseInt(opt?.dataset?.dur || '20');
  const buf     = type === 'ONE_TO_MANY' ? 5 : 2;
  const existing= SCHEDULES_DB.filter(sc => sc.staffId === staffId && sc.date === dateStr && sc.status === 'BOOKED');
  const slots   = [];
  let cursor    = MATRIX_START;
  while (toMinutes(cursor) + dur <= toMinutes(MATRIX_END)) {
    const proposed_end = addMin(cursor, dur + buf);
    const ok = existing.every(sc => {
      const gap = Math.min(
        Math.abs(toMinutes(cursor) - toMinutes(sc.end)),
        Math.abs(toMinutes(sc.start) - toMinutes(proposed_end))
      );
      const overlap = toMinutes(cursor) < toMinutes(sc.end) && toMinutes(proposed_end) > toMinutes(sc.start);
      return !overlap && gap >= buf;
    });
    if (ok) slots.push({ start: cursor, end: addMin(cursor, dur) });
    cursor = addMin(cursor, 5);
    if (slots.length >= 6) break;
  }
  return slots;
}

function applySmartSlot(start, end) {
  if (document.getElementById('blockStart')) document.getElementById('blockStart').value = start;
  if (document.getElementById('blockEnd'))   document.getElementById('blockEnd').value   = end;
  checkBlockCollision();
}

function saveBlock() {
  const patientId  = parseInt(document.getElementById('blockPatient')?.value);
  const procId     = document.getElementById('blockProcedure')?.value;
  const staffId    = parseInt(document.getElementById('blockStaff')?.value);
  const machineId  = document.getElementById('blockMachine')?.value ? parseInt(document.getElementById('blockMachine').value) : null;
  const start      = document.getElementById('blockStart')?.value;
  const end        = document.getElementById('blockEnd')?.value;
  const dateStr    = document.getElementById('matrixDate')?.value;

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
  const pt = getPatient(patientId);
  showToast(`Đã đặt lịch: ${pt?.fullName} – ${start}→${end}`, 'success');
}

function showBlockDetail(id) {
  const sc = SCHEDULES_DB.find(x => x.id === id);
  if (!sc) return;
  const pt = getPatient(sc.patientId);
  const st = getStaff(sc.staffId);
  const pr = getProcedure(sc.procedureId);
  const mc = getMachine(sc.machineId);
  document.getElementById('blockDetailBody').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      <div class="form-row">
        <div><div class="form-label">Bệnh nhân</div><div style="font-weight:700">${pt?.fullName || '—'} <span style="color:var(--color-gray-400);font-size:11px">${pt?.pid}</span></div></div>
        <div><div class="form-label">Thủ thuật</div><div style="font-weight:700">${pr?.name || sc.procedureId}</div></div>
      </div>
      <div class="form-row">
        <div><div class="form-label">Nhân sự</div><div>${st?.fullName || '—'}</div></div>
        <div><div class="form-label">Máy</div><div>${mc ? mc.tenTB : 'Không dùng máy'}</div></div>
      </div>
      <div class="form-row">
        <div><div class="form-label">Thời gian</div><div style="font-weight:700;color:var(--color-primary)">${sc.start} – ${sc.end}</div></div>
        <div><div class="form-label">Loại</div><div>${sc.type === 'ONE_TO_ONE' ? '1:1' : '1-Nhiều'}</div></div>
      </div>
      <div><div class="form-label">Trạng thái</div><span class="badge ${sc.status==='BOOKED'?'badge--blue':'badge--gray'}" style="font-size:11px">${sc.status}</span></div>
    </div>`;
  document.getElementById('cancelBlockBtn').onclick = () => {
    sc.status = 'CANCELLED';
    persistData();
    closeModal('blockDetailModal');
    renderMatrix();
    showToast('Ca thủ thuật đã bị hủy, slot trả về trống', 'warn');
  };
  openModal('blockDetailModal');
}

function filterView(type) {
  currentFilter = type;
  document.querySelectorAll('.matrix-toolbar .btn').forEach(b => b.classList.remove('btn--primary'));
  renderMatrix();
}

function exportMatrixCSV() {
  const dateStr = document.getElementById('matrixDate')?.value;
  const rows = [['Ngày','Giờ bắt đầu','Giờ kết thúc','Bệnh nhân','Thủ thuật','Nhân sự','Mã máy','Loại','Trạng thái']];
  SCHEDULES_DB.filter(sc => sc.date === dateStr).forEach(sc => {
    const pt = getPatient(sc.patientId);
    const st = getStaff(sc.staffId);
    const pr = getProcedure(sc.procedureId);
    const mc = getMachine(sc.machineId);
    rows.push([sc.date, sc.start, sc.end, pt?.fullName, pr?.name, st?.fullName, mc?.maMay||'', sc.type, sc.status]);
  });
  const csv = rows.map(r => r.map(v => `"${v||''}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `lich-thu-thuat-${dateStr}.csv`;
  a.click();
}
