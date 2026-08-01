/* ═══════════════════════════════════════════════
   MED LAB – STAFF MANAGEMENT MODULE
   ═══════════════════════════════════════════════ */

let transferTargetStaffId = null;

function renderStaffGrid() {
  const grid   = document.getElementById('staffGrid');
  const search = (document.getElementById('staffSearch')?.value || '').toLowerCase();
  const role   = document.getElementById('roleFilter')?.value || '';
  const status = document.getElementById('statusFilter')?.value || '';

  const filtered = STAFF_DB.filter(s => {
    if (search && !s.fullName.toLowerCase().includes(search) && !s.specialty.toLowerCase().includes(search)) return false;
    if (role   && s.role !== role)                   return false;
    if (status === 'active' && !s.isActive)           return false;
    if (status === 'absent' &&  s.isActive)           return false;
    return true;
  });

  if (!grid) return;
  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-state__icon">👥</div><div class="empty-state__title">Không tìm thấy nhân sự</div></div>';
    return;
  }

  grid.innerHTML = filtered.map(s => {
    const todaySchedules = SCHEDULES_DB.filter(sc => sc.staffId === s.id && sc.status === 'BOOKED');
    const roleLabel = { DOCTOR:'Bác sĩ', TECHNICIAN:'Kỹ thuật viên', NURSE:'Điều dưỡng' }[s.role] || s.role;
    return `
    <div class="staff-card${!s.isActive ? ' absent' : ''}">
      ${!s.isActive ? `<div class="staff-card__absent-ribbon">VẮNG</div>` : ''}
      <div class="staff-card__header">
        <div class="staff-card__avatar" style="background:${s.color}">${s.initials}</div>
        <div>
          <div class="staff-card__name">${s.fullName}</div>
          <div class="staff-card__role">${roleLabel}</div>
          <div class="staff-card__spec">${s.specialty}</div>
        </div>
        <div class="staff-card__actions">
          <button class="icon-btn" onclick="toggleAbsent(${s.id})" title="${s.isActive ? 'Đánh dấu vắng mặt' : 'Kích hoạt lại'}">
            ${s.isActive
              ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
              : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`
            }
          </button>
          <button class="icon-btn text-danger" onclick="removeStaff(${s.id})" title="Xóa nhân sự">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
      <div class="staff-card__meta">
        <span class="staff-card__schedule-count">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          ${todaySchedules.length} ca hôm nay
        </span>
        <span class="badge ${s.isActive ? 'badge--green' : 'badge--red'}" style="font-size:10px">
          ${s.isActive ? 'Đang trực' : 'Vắng mặt'}
        </span>
      </div>
    </div>`;
  }).join('');
}

function renderStaffSummary() {
  const el = document.getElementById('staffSummary');
  if (!el) return;
  const total   = STAFF_DB.length;
  const active  = STAFF_DB.filter(s => s.isActive).length;
  const absent  = total - active;
  const doctors = STAFF_DB.filter(s => s.role === 'DOCTOR').length;
  el.innerHTML = [
    { val: total,   lbl: 'Tổng nhân sự',    color: '#2563EB', icon: '👥' },
    { val: active,  lbl: 'Đang trực',        color: '#22C55E', icon: '✅' },
    { val: absent,  lbl: 'Vắng mặt',         color: '#EF4444', icon: '🚫' },
    { val: doctors, lbl: 'Bác sĩ',           color: '#7C3AED', icon: '🩺' },
  ].map(s => `
    <div class="patient-stat">
      <span style="font-size:20px">${s.icon}</span>
      <div>
        <div class="patient-stat__val" style="color:${s.color}">${s.val}</div>
        <div class="patient-stat__lbl">${s.lbl}</div>
      </div>
    </div>`).join('');
}

function toggleAbsent(id) {
  const s = STAFF_DB.find(x => x.id === id);
  if (!s) return;
  if (s.isActive) {
    // Going absent → check if they have schedules
    const affectedSchedules = SCHEDULES_DB.filter(sc => sc.staffId === id && sc.status === 'BOOKED');
    if (affectedSchedules.length > 0) {
      // Show transfer modal
      transferTargetStaffId = id;
      const workDate = document.getElementById('workDate')?.value || new Date().toISOString().split('T')[0];
      document.getElementById('transferTitle').textContent = `Chuyển nhượng thủ thuật – ${s.fullName} nghỉ ngày ${workDate}`;
      document.getElementById('transferAlert').innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <strong>${s.fullName}</strong> nghỉ ngày ${workDate}. Xử lý chuyển nhượng <strong>${affectedSchedules.length} thủ thuật</strong> sang nhân sự thay thế?`;

      const list = document.getElementById('transferList');
      list.innerHTML = affectedSchedules.map(sc => {
        const pt = getPatient(sc.patientId);
        const pr = getProcedure(sc.procedureId);
        return `<div class="transfer-item">
          <div class="transfer-item__time">${sc.start} – ${sc.end}</div>
          <div class="transfer-item__patient">${pt?.fullName || '—'}</div>
          <div class="transfer-item__proc">${pr?.name || sc.procedureId}</div>
        </div>`;
      }).join('');

      // Populate replacement staff
      const sel = document.getElementById('bulkReplacement');
      sel.innerHTML = STAFF_DB
        .filter(x => x.id !== id && x.isActive)
        .map(x => `<option value="${x.id}">${x.fullName} – ${x.specialty}</option>`).join('');

      openModal('transferModal');
    } else {
      s.isActive = false;
      persistData();
      renderStaffGrid(); renderStaffSummary();
      showToast(`${s.fullName} đã được đánh dấu vắng mặt`, 'warn');
    }
  } else {
    s.isActive = true;
    persistData();
    renderStaffGrid(); renderStaffSummary();
    showToast(`${s.fullName} đã được kích hoạt lại`, 'success');
  }
}

function confirmTransfer() {
  const replacementId = parseInt(document.getElementById('bulkReplacement').value);
  const s = STAFF_DB.find(x => x.id === transferTargetStaffId);
  const r = STAFF_DB.find(x => x.id === replacementId);
  if (!s || !r) return;

  const affected = SCHEDULES_DB.filter(sc => sc.staffId === transferTargetStaffId && sc.status === 'BOOKED');
  affected.forEach(sc => {
    addAuditLog('TRANSFER', sc.staffId, replacementId, sc.id, `Chuyển nhượng do nghỉ đột xuất`);
    sc.staffId = replacementId;
    sc.status = 'TRANSFERRED';
  });

  s.isActive = false;
  persistData();
  closeModal('transferModal');
  renderStaffGrid(); renderStaffSummary(); renderAuditLog();
  showToast(`Đã chuyển ${affected.length} ca từ ${s.fullName} → ${r.fullName}`, 'success');
}

function addStaff() {
  const name  = document.getElementById('newName')?.value?.trim();
  const short = document.getElementById('newShortName')?.value?.trim() || name?.toUpperCase();
  const role  = document.getElementById('newRole')?.value || 'TECHNICIAN';
  const spec  = document.getElementById('newSpecialty')?.value?.trim() || '';
  if (!name) { showToast('Vui lòng nhập tên nhân sự', 'warn'); return; }
  const colors = ['#3B82F6','#8B5CF6','#059669','#D97706','#DC2626','#0891B2','#7C3AED','#BE185D'];
  const newId = Math.max(...STAFF_DB.map(s => s.id)) + 1;
  STAFF_DB.push({
    id: newId, fullName: name, shortName: short, role,
    specialty: spec, isActive: true,
    color: colors[newId % colors.length],
    initials: (name || '').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
  });
  persistData();
  closeModal('addStaffModal');
  renderStaffGrid(); renderStaffSummary();
  showToast(`Đã thêm nhân sự: ${name}`, 'success');
}

function removeStaff(id) {
  const s = STAFF_DB.find(x => x.id === id);
  if (!s) return;
  const hasSchedules = SCHEDULES_DB.some(sc => sc.staffId === id && sc.status === 'BOOKED');
  if (hasSchedules) {
    showToast(`${s.fullName} còn ca đặt lịch. Vui lòng chuyển nhượng trước khi xóa.`, 'danger');
    return;
  }
  const idx = STAFF_DB.findIndex(x => x.id === id);
  if (idx > -1) STAFF_DB.splice(idx, 1);
  persistData();
  renderStaffGrid(); renderStaffSummary();
  showToast(`Đã xóa nhân sự: ${s.fullName}`, 'success');
}

function renderAuditLog() {
  const wrap = document.getElementById('auditLogWrap');
  if (!wrap) return;
  if (!AUDIT_LOG.length) {
    wrap.innerHTML = '<div class="empty-state"><div class="empty-state__icon">📋</div><div class="empty-state__title">Chưa có thao tác chuyển nhượng</div></div>';
    return;
  }
  wrap.innerHTML = `<div class="table-wrap"><table class="audit-table">
    <thead><tr><th>Thời điểm</th><th>Thao tác</th><th>Nhân sự cũ</th><th>Nhân sự mới</th><th>Ca #</th><th>Ghi chú</th></tr></thead>
    <tbody>${AUDIT_LOG.slice().reverse().map(log => `
      <tr>
        <td>${new Date(log.ts).toLocaleString('vi-VN')}</td>
        <td><span class="badge badge--yellow" style="font-size:10px">${log.action}</span></td>
        <td>${getStaff(log.oldStaffId)?.fullName || log.oldStaffId}</td>
        <td style="color:var(--color-primary);font-weight:600">${getStaff(log.newStaffId)?.fullName || log.newStaffId}</td>
        <td>${log.scheduleId}</td>
        <td>${log.note}</td>
      </tr>`).join('')}
    </tbody></table></div>`;
}
