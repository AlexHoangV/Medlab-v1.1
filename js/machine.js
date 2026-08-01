/* ═══════════════════════════════════════════════
   MED LAB – MACHINE MANAGEMENT MODULE
   ═══════════════════════════════════════════════ */

const MACHINE_GROUPS = [
  { id:'dien_cham',     label:'Điện châm',           icon:'⚡', procIds:['dien_cham','thuy_cham'] },
  { id:'hong_ngoai',    label:'Hồng ngoại',           icon:'🔴', procIds:['hong_ngoai'] },
  { id:'sieu_am',       label:'Siêu âm điều trị',     icon:'🔊', procIds:['sieu_am'] },
  { id:'dien_xung',     label:'Điện xung / Điện phân',icon:'🌊', procIds:['dien_xung','dien_phan'] },
  { id:'dien_truong',   label:'Điện trường cao áp',   icon:'🧲', procIds:['dien_truong'] },
  { id:'dien_tu_truong',label:'Điện từ trường',        icon:'🔵', procIds:['dien_tu_truong'] },
  { id:'oxy_cao_ap',    label:'Oxy cao áp',            icon:'💨', procIds:['oxy_cao_ap'] },
  { id:'laser_noi_mach',label:'Laser nội mạch',        icon:'💡', procIds:['laser_noi_mach','laser_chieu'] },
  { id:'song_ngan',     label:'Sóng ngắn / Vi sóng',  icon:'📡', procIds:['song_ngan'] },
  { id:'keo_gian',      label:'Kéo giãn cột sống',    icon:'🦴', procIds:['keo_gian'] },
  { id:'parafin',       label:'Parafin',               icon:'🕯️', procIds:['parafin'] },
  { id:'xoa_bop',       label:'Xoa bóp máy',           icon:'🖐️', procIds:['xoa_bop','xb_vung'] },
  { id:'tap_vd',        label:'Xe đạp / Tập vận động', icon:'🚴', procIds:['tap_vd'] },
  { id:'other',         label:'Thiết bị khác',         icon:'🔧', procIds:[] },
];

let editMachineId = null;

function getMachineGroup(machine) {
  for (const g of MACHINE_GROUPS) {
    if (g.procIds.length === 0) continue;
    if (machine.procedureIds?.some(pid => g.procIds.includes(pid))) return g.id;
  }
  return 'other';
}

function renderMachineStats() {
  const el = document.getElementById('machineStats');
  if (!el) return;
  const total       = MACHINES_DB.length;
  const active      = MACHINES_DB.filter(m => m.status === 'ACTIVE').length;
  const maintenance = MACHINES_DB.filter(m => m.status === 'MAINTENANCE').length;
  const inactive    = MACHINES_DB.filter(m => m.status === 'INACTIVE').length;
  el.innerHTML = [
    { val: total,       lbl: 'Tổng thiết bị',  color: '#2563EB', icon: '🖥️' },
    { val: active,      lbl: 'Hoạt động',       color: '#22C55E', icon: '✅' },
    { val: maintenance, lbl: 'Bảo trì',         color: '#EF4444', icon: '🔧' },
    { val: inactive,    lbl: 'Ngừng hoạt động', color: '#9CA3AF', icon: '⛔' },
  ].map(s => `
    <div class="patient-stat">
      <span style="font-size:20px">${s.icon}</span>
      <div>
        <div class="patient-stat__val" style="color:${s.color}">${s.val}</div>
        <div class="patient-stat__lbl">${s.lbl}</div>
      </div>
    </div>`).join('');
}

function renderMachineGroups() {
  const wrap   = document.getElementById('machineGroupsWrap');
  if (!wrap) return;
  const search = (document.getElementById('machineSearch')?.value || '').toLowerCase();
  const sf     = document.getElementById('machineStatusFilter')?.value || '';
  const gf     = document.getElementById('machineGroupFilter')?.value || '';

  let filtered = MACHINES_DB.filter(m => {
    if (search && !m.tenTB.toLowerCase().includes(search) && !m.maMay.toLowerCase().includes(search) && !m.tenDVKT.toLowerCase().includes(search)) return false;
    if (sf && m.status !== sf) return false;
    if (gf && getMachineGroup(m) !== gf) return false;
    return true;
  });

  const grouped = {};
  filtered.forEach(m => {
    const gid = getMachineGroup(m);
    if (!grouped[gid]) grouped[gid] = [];
    grouped[gid].push(m);
  });

  if (!Object.keys(grouped).length) {
    wrap.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🔧</div><div class="empty-state__title">Không tìm thấy thiết bị nào</div></div>';
    return;
  }

  wrap.innerHTML = MACHINE_GROUPS
    .filter(g => grouped[g.id]?.length)
    .map(g => `
      <div class="machine-group">
        <div class="machine-group__title">${g.icon} ${g.label} <span style="font-size:11px;font-weight:400;color:var(--color-gray-400)">(${grouped[g.id].length} thiết bị)</span></div>
        <div class="card" style="padding:0;overflow:hidden">
          <table class="machine-table">
            <thead><tr>
              <th style="width:36px">STT</th>
              <th>Tên thiết bị</th>
              <th>Ký hiệu</th>
              <th>Mã máy (cột F)</th>
              <th>Mã DVKT</th>
              <th>Trạng thái</th>
              <th style="width:100px">Thao tác</th>
            </tr></thead>
            <tbody>
              ${grouped[g.id].map(m => `
                <tr>
                  <td style="color:var(--color-gray-400);font-size:11px">${m.stt}</td>
                  <td><strong>${m.tenTB}</strong><br><span style="font-size:10px;color:var(--color-gray-400)">${m.tenDVKT}</span></td>
                  <td><span style="font-size:12px;font-weight:600">${m.kyHieu||'—'}</span></td>
                  <td>${m.maMay ? `<span class="machine-code-tag">${m.maMay}</span>` : '<span style="color:var(--color-gray-300);font-size:11px">Không có mã</span>'}</td>
                  <td><span style="font-size:11px;color:var(--color-gray-500)">${m.maDVKT||'—'}</span></td>
                  <td>${statusPill(m.status)}</td>
                  <td>
                    <div style="display:flex;gap:4px">
                      <button class="icon-btn" onclick="cycleStatus(${m.id})" title="Đổi trạng thái">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      </button>
                      <button class="icon-btn" onclick="editMachine(${m.id})" title="Chỉnh sửa">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      </button>
                      <button class="icon-btn text-danger" onclick="deleteMachine(${m.id})" title="Xóa">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`).join('');
}

function statusPill(status) {
  const map = {
    ACTIVE:      ['status-pill--active',      '● Hoạt động'],
    MAINTENANCE: ['status-pill--maintenance', '🔧 Bảo trì'],
    INACTIVE:    ['status-pill--inactive',    '⛔ Ngừng'],
  };
  const [cls, lbl] = map[status] || map.INACTIVE;
  return `<span class="status-pill ${cls}">${lbl}</span>`;
}

function cycleStatus(id) {
  const m = getMachine(id);
  if (!m) return;
  const cycle = { ACTIVE:'MAINTENANCE', MAINTENANCE:'INACTIVE', INACTIVE:'ACTIVE' };
  m.status = cycle[m.status] || 'ACTIVE';
  persistData();
  renderMachineGroups(); renderMachineStats();
  showToast(`${m.tenTB} → ${m.status}`, 'success');
}

function editMachine(id) {
  editMachineId = id;
  const m = getMachine(id);
  if (!m) return;
  document.getElementById('editMachineBody').innerHTML = `
    <div class="form-group"><label class="form-label">Tên thiết bị</label><input class="form-input" id="em_name" value="${m.tenTB}"/></div>
    <div class="form-row" style="margin-top:12px">
      <div class="form-group"><label class="form-label">Mã máy (cột F)</label><input class="form-input" id="em_code" value="${m.maMay}"/></div>
      <div class="form-group"><label class="form-label">Trạng thái</label>
        <select class="form-select" id="em_status">
          <option value="ACTIVE"${m.status==='ACTIVE'?' selected':''}>Hoạt động</option>
          <option value="MAINTENANCE"${m.status==='MAINTENANCE'?' selected':''}>Bảo trì</option>
          <option value="INACTIVE"${m.status==='INACTIVE'?' selected':''}>Ngừng hoạt động</option>
        </select>
      </div>
    </div>`;
  openModal('editMachineModal');
}

function saveMachineEdit() {
  const m = getMachine(editMachineId);
  if (!m) return;
  m.tenTB = document.getElementById('em_name')?.value?.trim() || m.tenTB;
  m.maMay = document.getElementById('em_code')?.value?.trim() || m.maMay;
  m.status = document.getElementById('em_status')?.value || m.status;
  persistData();
  closeModal('editMachineModal');
  renderMachineGroups(); renderMachineStats();
  showToast(`Đã cập nhật: ${m.tenTB}`, 'success');
}

function deleteMachine(id) {
  const m = getMachine(id);
  if (!m) return;
  const inUse = SCHEDULES_DB.some(sc => sc.machineId === id && sc.status === 'BOOKED');
  if (inUse) { showToast('Máy đang có ca đặt lịch. Không thể xóa.', 'danger'); return; }
  const idx = MACHINES_DB.findIndex(x => x.id === id);
  if (idx > -1) MACHINES_DB.splice(idx, 1);
  persistData();
  renderMachineGroups(); renderMachineStats();
  showToast(`Đã xóa: ${m.tenTB}`, 'success');
}

function addMachine() {
  const name   = document.getElementById('mName')?.value?.trim();
  const kyHieu = document.getElementById('mKyHieu')?.value?.trim() || '';
  const maMay  = document.getElementById('mMaMay')?.value?.trim();
  const maDVKT = document.getElementById('mMaDVKT')?.value?.trim() || '';
  const tenDVKT= document.getElementById('mTenDVKT')?.value?.trim() || '';
  const procId = document.getElementById('mProcedure')?.value || '';
  const status = document.getElementById('mStatus')?.value || 'ACTIVE';
  if (!name || !maMay) { showToast('Vui lòng nhập tên và mã máy', 'warn'); return; }
  const newId = Math.max(...MACHINES_DB.map(m => m.id), 0) + 1;
  MACHINES_DB.push({ id:newId, stt:newId, tenTB:name, kyHieu, maDVKT, tenDVKT, maMay, khoaSD:'VLTL', status, procedureIds: procId ? [procId] : [] });
  persistData();
  closeModal('addMachineModal');
  renderMachineGroups(); renderMachineStats();
  showToast(`Đã thêm thiết bị: ${name}`, 'success');
}

function exportMachineCSV() {
  const rows = [['STT','Tên thiết bị','Ký hiệu','Mã DVKT','Tên DVKT','Mã máy (cột F)','Khoa SD','Trạng thái']];
  MACHINES_DB.forEach(m => rows.push([m.stt, m.tenTB, m.kyHieu, m.maDVKT, m.tenDVKT, m.maMay, m.khoaSD, m.status]));
  const csv = rows.map(r => r.map(v => `"${v||''}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `danh-sach-may-vltl-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}
