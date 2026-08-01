/* ═══════════════════════════════════════════════
   MED LAB – PATIENT MANAGEMENT MODULE
   ═══════════════════════════════════════════════ */

let stopTargetPatientId = null;

function renderPtStats() {
  const el = document.getElementById('ptStats');
  if (!el) return;
  const total    = PATIENTS_DB.length;
  const active   = PATIENTS_DB.filter(p => p.isActive).length;
  const stopped  = total - active;
  const todayNew = PATIENTS_DB.filter(p => p.admitDate === new Date().toISOString().split('T')[0]).length;
  el.innerHTML = [
    { val: total,   lbl: 'Tổng BN',          color: '#2563EB', icon: '🏥' },
    { val: active,  lbl: 'Đang điều trị',     color: '#22C55E', icon: '✅' },
    { val: stopped, lbl: 'Ngừng điều trị',    color: '#EF4444', icon: '🚫' },
    { val: todayNew,lbl: 'Nhập viện hôm nay', color: '#F59E0B', icon: '🆕' },
  ].map(s => `
    <div class="patient-stat">
      <span style="font-size:20px">${s.icon}</span>
      <div>
        <div class="patient-stat__val" style="color:${s.color}">${s.val}</div>
        <div class="patient-stat__lbl">${s.lbl}</div>
      </div>
    </div>`).join('');
}

function renderPatientTable() {
  const tbody  = document.getElementById('patientTbody');
  if (!tbody) return;
  const search = (document.getElementById('ptSearch')?.value || '').toLowerCase();
  const sf     = document.getElementById('ptStatusFilter')?.value || '';

  const filtered = PATIENTS_DB.filter(p => {
    if (search && !p.fullName.toLowerCase().includes(search) && !p.pid.toLowerCase().includes(search)) return false;
    if (sf === 'active'  && !p.isActive) return false;
    if (sf === 'stopped' &&  p.isActive) return false;
    return true;
  });

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--color-gray-400)">Không có bệnh nhân nào</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const todaySc = SCHEDULES_DB.filter(sc => sc.patientId === p.id && sc.status === 'BOOKED').length;
    const statusTag = p.isActive
      ? `<span class="pt-tag pt-tag--active">Đang điều trị</span>`
      : `<span class="pt-tag pt-tag--stopped">Ngừng điều trị</span>`;

    return `<tr>
      <td><strong style="color:var(--color-primary)">${p.pid}</strong></td>
      <td><strong>${p.fullName}</strong></td>
      <td>${p.admitDate || '—'}</td>
      <td>
        ${todaySc > 0
          ? `<span class="badge badge--blue" style="font-size:10px">${todaySc} ca</span>`
          : `<span style="font-size:12px;color:var(--color-gray-400)">Chưa xếp lịch</span>`}
      </td>
      <td><span style="font-size:12px;color:var(--color-gray-500)">${p.note || '—'}</span></td>
      <td>${statusTag}</td>
      <td>
        <div style="display:flex;gap:4px">
          ${p.isActive
            ? `<button class="btn btn--danger btn--sm" onclick="openStopModal(${p.id})">Ngừng điều trị</button>`
            : `<button class="btn btn--outline btn--sm" onclick="reactivatePatient(${p.id})">Kích hoạt lại</button>`}
          <button class="icon-btn" onclick="deletePatient(${p.id})" title="Xóa"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openStopModal(id) {
  stopTargetPatientId = id;
  const p = getPatient(id);
  if (!p) return;
  document.getElementById('stopModalTitle').textContent = `Ngừng điều trị – ${p.fullName}`;
  const affectedBlocks = SCHEDULES_DB.filter(sc => sc.patientId === id && sc.status === 'BOOKED');
  document.getElementById('stopBlockCount').innerHTML =
    affectedBlocks.length > 0
      ? `⚠ Sẽ hủy <strong style="color:var(--color-danger)">${affectedBlocks.length} block thủ thuật</strong> và trả về TRỐNG.`
      : `✅ Không có block thủ thuật nào cần hủy.`;
  openModal('stopModal');
}

function confirmStop() {
  const p = getPatient(stopTargetPatientId);
  if (!p) return;
  const reason = document.getElementById('stopReason')?.value || '';

  const freed = SCHEDULES_DB.filter(sc => sc.patientId === stopTargetPatientId && sc.status === 'BOOKED');
  freed.forEach(sc => { sc.status = 'CANCELLED'; });
  p.isActive = false;
  p.dischargeDate = new Date().toISOString().split('T')[0];

  persistData();
  closeModal('stopModal');

  // Show freed blocks panel
  if (freed.length > 0) {
    const card = document.getElementById('freedBlocksCard');
    const list = document.getElementById('freedBlocksList');
    if (card && list) {
      list.innerHTML = freed.map(sc => {
        const st = getStaff(sc.staffId);
        const pr = getProcedure(sc.procedureId);
        return `<div class="transfer-item">
          <div class="transfer-item__time">${sc.start} – ${sc.end}</div>
          <div class="transfer-item__patient">${pr?.name || sc.procedureId}</div>
          <div class="transfer-item__proc">Phụ trách: ${st?.fullName || '—'} | <span style="color:var(--color-success);font-weight:700">TRỐNG – Sẵn sàng đặt lại</span></div>
        </div>`;
      }).join('');
      card.style.display = 'block';
    }
  }

  renderPatientTable(); renderPtStats();
  showToast(`${p.fullName} đã ngừng điều trị. ${freed.length} block trả về trống.`, 'success');
}

function reactivatePatient(id) {
  const p = getPatient(id);
  if (!p) return;
  p.isActive = true;
  p.dischargeDate = null;
  persistData();
  renderPatientTable(); renderPtStats();
  showToast(`${p.fullName} đã được kích hoạt lại`, 'success');
}

function deletePatient(id) {
  const p = getPatient(id);
  if (!p) return;
  const idx = PATIENTS_DB.findIndex(x => x.id === id);
  if (idx > -1) PATIENTS_DB.splice(idx, 1);
  persistData();
  renderPatientTable(); renderPtStats();
  showToast(`Đã xóa bệnh nhân ${p.fullName}`, 'success');
}

function addPatient() {
  const name  = document.getElementById('ptName')?.value?.trim();
  const pid   = document.getElementById('ptPID')?.value?.trim();
  const admit = document.getElementById('ptAdmit')?.value || new Date().toISOString().split('T')[0];
  const note  = document.getElementById('ptNote')?.value?.trim() || '';
  if (!name) { showToast('Vui lòng nhập tên bệnh nhân', 'warn'); return; }
  const newId = Math.max(...PATIENTS_DB.map(p => p.id), 0) + 1;
  PATIENTS_DB.push({ id: newId, fullName: name, pid: pid || `BN-${String(newId).padStart(3,'0')}`, admitDate: admit, dischargeDate: null, isActive: true, note });
  persistData();
  closeModal('addPatientModal');
  renderPatientTable(); renderPtStats();
  showToast(`Đã thêm bệnh nhân: ${name}`, 'success');
  if (document.getElementById('ptName')) document.getElementById('ptName').value = '';
}

function exportCSV() {
  const rows = [['PID','Họ tên','Ngày nhập','Trạng thái','Ghi chú']];
  PATIENTS_DB.forEach(p => rows.push([p.pid, p.fullName, p.admitDate, p.isActive?'Đang điều trị':'Ngừng', p.note]));
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `danh-sach-benh-nhan-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}
