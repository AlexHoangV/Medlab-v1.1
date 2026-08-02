/* ═══════════════════════════════════════════════
   MED LAB – SHARED UI COMPONENTS
   Sidebar, Topbar rendered dynamically on all pages + Global Modals & Popovers
   ═══════════════════════════════════════════════ */

const NAV_ITEMS = [
  { id:'dashboard',         label:'Bảng điều khiển', href:'dashboard.html',          icon:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { id:'schedule-matrix',   label:'Ma trận lịch',     href:'schedule-matrix.html',    icon:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
  { id:'staff-management',  label:'Nhân sự',           href:'staff-management.html',   icon:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z' },
  { id:'patient-management',label:'Bệnh nhân',         href:'patient-management.html', icon:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8z' },
  { id:'machine-management',label:'Máy móc',           href:'machine-management.html', icon:'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18' },
  { id:'calendar',          label:'Thủ tục Y tế',      href:'calendar.html',           icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
];

function renderSidebar(activeId) {
  const el = document.getElementById('sidebar');
  if (!el) return;
  el.innerHTML = `
    <div class="sidebar__brand">
      <div class="sidebar__logo" style="background:linear-gradient(135deg,#2563EB,#1D4ED8);display:flex;align-items:center;justify-content:center;border-radius:10px;box-shadow:0 4px 12px rgba(37,99,235,0.3)">
        <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
          <path d="M20 3C20 3 29 5 33 11C37 17 37 25 33 32C29 39 20 37 20 37C20 37 11 39 7 32C3 25 3 17 7 11C11 5 20 3 20 3Z" fill="#3B82F6"/>
          <rect x="17" y="11" width="6" height="18" rx="2" fill="white"/>
          <rect x="11" y="17" width="18" height="6" rx="2" fill="white"/>
        </svg>
      </div>
      <div><div class="sidebar__title">MedLab AI</div><div class="sidebar__sub">Hệ thống YHCT & PHCN</div></div>
    </div>
    <nav class="sidebar__nav">
      ${NAV_ITEMS.map(item => `
        <a class="nav-item${item.id===activeId?' active':''}" href="${item.href}">
          <svg class="nav-item__icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="${item.icon}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          ${item.label}
        </a>`).join('')}
    </nav>
    <div class="sidebar__footer">
      <a class="nav-item" href="javascript:void(0)" onclick="openSettingsModal()"><svg class="nav-item__icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Cài đặt</a>
      <a class="nav-item nav-item--danger" href="login.html"><svg class="nav-item__icon" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Đăng xuất</a>
    </div>`;
}

function renderTopbar() {
  const el = document.getElementById('topbar');
  if (!el) return;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px">
      <button class="mobile-menu-btn" onclick="toggleMobileSidebar()" style="display:none;background:none;border:none;cursor:pointer;padding:4px;color:var(--color-gray-700)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <nav class="topbar__breadcrumb">
        <a href="dashboard.html">Bệnh viện</a>
        <span class="sep">›</span>
        <span class="current">MedLab AI - Khoa VLTL</span>
      </nav>
    </div>
    <div class="topbar__right" style="position:relative;">
      <!-- Search with Dropdown -->
      <div class="topbar__search" style="position:relative;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <input type="text" id="globalSearchInput" placeholder="Tìm kiếm bệnh nhân, thủ thuật..." oninput="handleGlobalSearch(this.value)" autocomplete="off" />
        <div id="globalSearchDropdown" style="position:absolute; top:42px; left:0; right:0; background:#fff; border:1px solid var(--color-gray-200); border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.1); display:none; z-index:1100; max-height:300px; overflow-y:auto;"></div>
      </div>

      <!-- Notifications Bell -->
      <div class="topbar__notif" onclick="toggleNotificationsPopover(event)" title="Thông báo hệ thống">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <span class="topbar__notif-badge">3</span>
        <div id="notifPopover" style="position:absolute; top:44px; right:0; width:340px; background:#fff; border:1px solid var(--color-gray-200); border-radius:12px; box-shadow:0 15px 30px rgba(0,0,0,0.15); display:none; z-index:1100; padding:16px; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--color-gray-100); padding-bottom:8px;">
            <div style="font-weight:700; font-size:14px;">Thông báo Y tế (3)</div>
            <button class="btn btn--ghost btn--sm" style="font-size:11px;" onclick="showToast('Đã đánh dấu đọc tất cả', 'success')">Đã đọc</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px; font-size:12px;">
            <div style="padding:10px; background:var(--color-danger-bg); border-radius:8px; border-left:3px solid var(--color-danger);">
              <div style="font-weight:600; color:var(--color-danger); margin-bottom:2px;">🚨 Ca khẩn cấp: Hoàng Gia Bảo</div>
              <div>Yêu cầu X-Quang phổi khẩn nội viện lúc 09:40.</div>
            </div>
            <div style="padding:10px; background:var(--color-warning-bg); border-radius:8px; border-left:3px solid var(--color-warning);">
              <div style="font-weight:600; color:#B45309; margin-bottom:2px;">⚠ Cảnh báo xung đột lịch</div>
              <div>Trùng lịch thủ thuật 08:00 của BS. Nguyễn Văn A.</div>
            </div>
            <div style="padding:10px; background:var(--color-primary-light); border-radius:8px; border-left:3px solid var(--color-primary);">
              <div style="font-weight:600; color:var(--color-primary); margin-bottom:2px;">📋 Duyệt lịch tuần mới</div>
              <div>Có 8 ca trực chờ phân công trong tuần tới.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Profile -->
      <div class="topbar__user" onclick="toggleProfilePopover(event)" title="Tài khoản bác sĩ">
        <div class="topbar__avatar">VA</div>
        <div class="topbar__user-info hide-mobile">
          <div class="topbar__user-name">BS. Nguyễn Văn A</div>
          <div class="topbar__user-role">Khoa VLTL</div>
        </div>
        <div id="profilePopover" style="position:absolute; top:44px; right:0; width:220px; background:#fff; border:1px solid var(--color-gray-200); border-radius:12px; box-shadow:0 15px 30px rgba(0,0,0,0.15); display:none; z-index:1100; padding:8px 0; text-align:left;">
          <div style="padding:10px 16px; border-bottom:1px solid var(--color-gray-100);">
            <div style="font-weight:600; font-size:13px;">BS. Nguyễn Văn A</div>
            <div style="font-size:11px; color:var(--color-gray-500);">vana.nguyen@medlab.vn</div>
          </div>
          <a href="javascript:void(0)" onclick="openPatientDetailModal(1)" style="display:block; padding:10px 16px; font-size:13px; color:var(--color-gray-700);" onmouseover="this.style.background='var(--color-gray-50)'" onmouseout="this.style.background='transparent'">Hồ sơ cá nhân</a>
          <a href="javascript:void(0)" onclick="openSettingsModal()" style="display:block; padding:10px 16px; font-size:13px; color:var(--color-gray-700);" onmouseover="this.style.background='var(--color-gray-50)'" onmouseout="this.style.background='transparent'">Cài đặt hệ thống</a>
          <div style="border-top:1px solid var(--color-gray-100); margin-top:4px; padding-top:4px;">
            <a href="login.html" style="display:block; padding:10px 16px; font-size:13px; color:var(--color-danger);">Đăng xuất</a>
          </div>
        </div>
      </div>
    </div>`;

  window.toggleMobileSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('sidebar--open');
  };
}

// Global Popover Toggles & Handlers
function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}
// Apply saved theme on load
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
});

function toggleNotificationsPopover(e) {
  e.stopPropagation();
  const pop = document.getElementById('notifPopover');
  const prof = document.getElementById('profilePopover');
  if (prof) prof.style.display = 'none';
  if (pop) pop.style.display = pop.style.display === 'block' ? 'none' : 'block';
}

function toggleProfilePopover(e) {
  e.stopPropagation();
  const pop = document.getElementById('profilePopover');
  const notif = document.getElementById('notifPopover');
  if (notif) notif.style.display = 'none';
  if (pop) pop.style.display = pop.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener('click', () => {
  const notif = document.getElementById('notifPopover');
  const prof = document.getElementById('profilePopover');
  const searchDrop = document.getElementById('globalSearchDropdown');
  if (notif) notif.style.display = 'none';
  if (prof) prof.style.display = 'none';
  if (searchDrop) searchDrop.style.display = 'none';
});

// Global Search filter across Patients, Staff, Machines
function handleGlobalSearch(query) {
  const drop = document.getElementById('globalSearchDropdown');
  if (!drop) return;
  query = query.trim().toLowerCase();
  if (!query) {
    drop.style.display = 'none';
    return;
  }

  const pMatch = (typeof PATIENTS_DB !== 'undefined' ? PATIENTS_DB : []).filter(p => p.fullName.toLowerCase().includes(query) || p.pid.toLowerCase().includes(query)).slice(0, 3);
  const sMatch = (typeof STAFF_DB !== 'undefined' ? STAFF_DB : []).filter(s => s.fullName.toLowerCase().includes(query) || s.specialty.toLowerCase().includes(query)).slice(0, 3);
  const mMatch = (typeof MACHINES_DB !== 'undefined' ? MACHINES_DB : []).filter(m => m.tenTB.toLowerCase().includes(query) || m.kyHieu.toLowerCase().includes(query)).slice(0, 3);

  if (!pMatch.length && !sMatch.length && !mMatch.length) {
    drop.innerHTML = `<div style="padding:12px; font-size:13px; color:var(--color-gray-400); text-align:center;">Không tìm thấy kết quả cho "${query}"</div>`;
    drop.style.display = 'block';
    return;
  }

  let html = '';
  if (pMatch.length) {
    html += `<div style="padding:8px 12px; font-size:11px; font-weight:700; color:var(--color-gray-400); background:var(--color-gray-50); text-transform:uppercase;">Bệnh nhân</div>`;
    pMatch.forEach(p => {
      html += `<div onclick="openPatientDetailModal(${p.id || 1})" style="padding:10px 12px; border-bottom:1px solid var(--color-gray-100); cursor:pointer; font-size:13px;" onmouseover="this.style.background='var(--color-gray-50)'" onmouseout="this.style.background='#fff'">
        <div style="font-weight:600; color:var(--color-primary);">${p.fullName} (${p.pid})</div>
        <div style="font-size:11px; color:var(--color-gray-500);">${p.note || 'Đang điều trị tại khoa'}</div>
      </div>`;
    });
  }
  if (sMatch.length) {
    html += `<div style="padding:8px 12px; font-size:11px; font-weight:700; color:var(--color-gray-400); background:var(--color-gray-50); text-transform:uppercase;">Nhân sự y tế</div>`;
    sMatch.forEach(s => {
      html += `<div onclick="window.location='staff-management.html'" style="padding:10px 12px; border-bottom:1px solid var(--color-gray-100); cursor:pointer; font-size:13px;" onmouseover="this.style.background='var(--color-gray-50)'" onmouseout="this.style.background='#fff'">
        <div style="font-weight:600;">${s.fullName} (${s.role})</div>
        <div style="font-size:11px; color:var(--color-gray-500);">Chuyên môn: ${s.specialty}</div>
      </div>`;
    });
  }
  if (mMatch.length) {
    html += `<div style="padding:8px 12px; font-size:11px; font-weight:700; color:var(--color-gray-400); background:var(--color-gray-50); text-transform:uppercase;">Thiết bị / Máy móc</div>`;
    mMatch.forEach(m => {
      html += `<div onclick="window.location='machine-management.html'" style="padding:10px 12px; cursor:pointer; font-size:13px;" onmouseover="this.style.background='var(--color-gray-50)'" onmouseout="this.style.background='#fff'">
        <div style="font-weight:600;">${m.tenTB} (${m.kyHieu})</div>
        <div style="font-size:11px; color:var(--color-gray-500);">Mã: ${m.maMay || m.maDVKT}</div>
      </div>`;
    });
  }

  drop.innerHTML = html;
  drop.style.display = 'block';
}

// ── Patient Detail Modal (Visily design) ──
function openPatientDetailModal(patientId) {
  const patient = (typeof PATIENTS_DB !== 'undefined' ? PATIENTS_DB.find(p => p.id === patientId) : null) || {
    id: 1, fullName: 'Nguyễn Thị Mai', pid: 'BN-2024-8892', admitDate: '12/05/1988', gender: 'Nữ', blood: 'O+', phone: '0905 123 456', email: 'mai.nguyen@email.com', address: '123 Lê Lợi, Quận 1, TP. Hồ Chí Minh', insurance: 'GD4791234567890', note: 'Viêm xoang mãn tính, Dị ứng Penicillin'
  };

  let modalEl = document.getElementById('patientDetailModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'patientDetailModal';
    modalEl.className = 'modal-overlay';
    document.body.appendChild(modalEl);
  }

  modalEl.innerHTML = `
    <div class="modal" style="width:100%; max-width:820px; border-radius:16px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); background:#fff;">
      <!-- Header / Banner -->
      <div style="background:linear-gradient(135deg,#1D4ED8,#2563EB); padding:24px; color:#fff; position:relative;">
        <button onclick="closeModal('patientDetailModal')" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.2); border:none; width:32px; height:32px; border-radius:50%; color:#fff; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div style="font-size:12px; background:rgba(255,255,255,0.2); padding:4px 12px; border-radius:20px; font-weight:600;">Hồ sơ chi tiết bệnh nhân</div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn--ghost btn--sm" style="color:#fff; border-color:rgba(255,255,255,0.4);" onclick="showToast('Đã chia sẻ hồ sơ', 'success')">Chia sẻ</button>
            <button class="btn btn--ghost btn--sm" style="color:#fff; border-color:rgba(255,255,255,0.4);" onclick="showToast('Đang xuất PDF hồ sơ...', 'info')">Xuất PDF</button>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:20px;">
          <div style="width:80px; height:80px; border-radius:16px; background:#fff; color:#2563EB; font-weight:800; font-size:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            ${patient.fullName ? patient.fullName[0].toUpperCase() : 'N'}
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:10px;">
              <h2 style="font-size:22px; font-weight:800; margin:0;">${patient.fullName || 'Nguyễn Thị Mai'}</h2>
              <span style="background:rgba(255,255,255,0.25); padding:2px 10px; border-radius:6px; font-size:12px; font-weight:600;">${patient.pid || 'BN-2024-8892'}</span>
            </div>
            <div style="display:flex; gap:16px; font-size:13px; opacity:0.9; margin-top:6px;">
              <span>📅 ${patient.admitDate || '12/05/1988'} (38 tuổi)</span>
              <span>👤 ${patient.gender || 'Nữ'}</span>
              <span>🩸 Nhóm máu ${patient.blood || 'O+'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Body Content -->
      <div style="padding:24px; display:grid; grid-template-columns: 1fr 2fr; gap:24px; max-height:75vh; overflow-y:auto;">
        <!-- Left: Contact & Clinical Warnings -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          <div style="background:var(--color-gray-50); border:1px solid var(--color-gray-200); border-radius:12px; padding:16px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:12px; color:var(--color-gray-900);">📞 Thông tin liên lạc</div>
            <div style="font-size:13px; display:flex; flex-direction:column; gap:8px;">
              <div><strong>Điện thoại:</strong> ${patient.phone || '0905 123 456'}</div>
              <div><strong>Email:</strong> ${patient.email || 'mai.nguyen@email.com'}</div>
              <div><strong>Địa chỉ:</strong> ${patient.address || '123 Lê Lợi, Q.1, TP.HCM'}</div>
              <div><strong>Mã BHYT:</strong> ${patient.insurance || 'GD4791234567890'}</div>
            </div>
          </div>

          <div style="background:#FEF2F2; border:1px solid #FECACA; border-radius:12px; padding:16px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:10px; color:#DC2626;">🚨 Cảnh báo lâm sàng</div>
            <div style="font-size:12px; margin-bottom:8px;"><strong>Dị ứng:</strong></div>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;">
              <span style="background:#DC2626; color:#fff; padding:2px 8px; border-radius:6px; font-weight:600;">Penicillin</span>
              <span style="background:#DC2626; color:#fff; padding:2px 8px; border-radius:6px; font-weight:600;">Phấn hoa</span>
            </div>
            <div style="font-size:12px; margin-bottom:4px;"><strong>Bệnh lý mãn tính:</strong></div>
            <div style="font-size:13px; color:var(--color-gray-700);">Viêm xoang mãn tính, Thoái hóa cột sống cổ.</div>
          </div>

          <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:12px; padding:16px;">
            <div style="font-weight:700; font-size:14px; margin-bottom:8px; color:#16A34A;">📊 Chỉ số sinh tồn gần nhất</div>
            <div style="font-size:12px; color:var(--color-gray-600); margin-bottom:8px;">Cập nhật hôm nay - 08:30</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:13px;">
              <div style="background:#fff; padding:8px; border-radius:8px;">Huyết áp: <strong>120/80 mmHg</strong></div>
              <div style="background:#fff; padding:8px; border-radius:8px;">Nhịp tim: <strong>72 bpm</strong></div>
              <div style="background:#fff; padding:8px; border-radius:8px;">Nhiệt độ: <strong>36.5 °C</strong></div>
              <div style="background:#fff; padding:8px; border-radius:8px;">Cân nặng: <strong>62.4 kg</strong></div>
            </div>
          </div>
        </div>

        <!-- Right: Procedure History & Timeline -->
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; gap:12px; border-bottom:1px solid var(--color-gray-200); padding-bottom:8px;">
            <button class="btn btn--primary btn--sm">Lịch sử thủ thuật</button>
            <button class="btn btn--ghost btn--sm" onclick="showToast('Chuyển sang tab Tiền sử', 'info')">Tiền sử</button>
            <button class="btn btn--ghost btn--sm" onclick="showToast('Chuyển sang tab Kết quả XN', 'info')">Kết quả</button>
          </div>

          <div style="font-weight:700; font-size:15px; color:var(--color-gray-900);">Lịch sử thủ thuật y tế (TT 43/2013/TT-BYT)</div>
          
          <div style="display:flex; flex-direction:column; gap:10px;">
            <div style="padding:12px; border:1px solid var(--color-gray-200); border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:600; font-size:13px; color:var(--color-primary);">P-10024 • Xét nghiệm máu tổng quát</div>
                <div style="font-size:12px; color:var(--color-gray-500);">Phụ trách: BS. Trần K. • Phòng 302</div>
              </div>
              <div style="text-align:right;">
                <span style="background:#F0FDF4; color:#16A34A; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600;">Hoàn thành</span>
                <div style="font-size:11px; color:var(--color-gray-400); margin-top:2px;">25/07/2026 - 08:20</div>
              </div>
            </div>

            <div style="padding:12px; border:1px solid var(--color-gray-200); border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:600; font-size:13px; color:var(--color-primary);">P-10045 • Chụp X-Quang Phổi</div>
                <div style="font-size:12px; color:var(--color-gray-500);">Phụ trách: BS. Nguyễn Văn A • X-Ray 1</div>
              </div>
              <div style="text-align:right;">
                <span style="background:#F0FDF4; color:#16A34A; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600;">Hoàn thành</span>
                <div style="font-size:11px; color:var(--color-gray-400); margin-top:2px;">24/07/2026 - 14:15</div>
              </div>
            </div>

            <div style="padding:12px; border:1px solid var(--color-gray-200); border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:600; font-size:13px; color:var(--color-primary);">P-10082 • Nội soi dạ dày</div>
                <div style="font-size:12px; color:var(--color-gray-500);">Phụ trách: BS. Hoàng L. • Phòng 105</div>
              </div>
              <div style="text-align:right;">
                <span style="background:#F0FDF4; color:#16A34A; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600;">Hoàn thành</span>
                <div style="font-size:11px; color:var(--color-gray-400); margin-top:2px;">15/05/2026 - 09:30</div>
              </div>
            </div>
          </div>

          <button class="btn btn--outline" style="width:100%; justify-content:center; margin-top:10px;" onclick="showToast('Đã tải thêm hồ sơ cũ từ lưu trữ BHYT', 'success')">Tải thêm hồ sơ cũ</button>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding:16px 24px; border-top:1px solid var(--color-gray-200); background:var(--color-gray-50); display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:12px; color:var(--color-gray-500);">Hệ thống Quản lý Y tế MedLab AI • Đã đồng bộ BHYT</span>
        <button class="btn btn--primary" onclick="closeModal('patientDetailModal')">Đóng hồ sơ</button>
      </div>
    </div>`;

  openModal('patientDetailModal');
}

// ── Settings Modal ──
function openSettingsModal() {
  let modalEl = document.getElementById('settingsModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'settingsModal';
    modalEl.className = 'modal-overlay';
    document.body.appendChild(modalEl);
  }

  modalEl.innerHTML = `
    <div class="modal" style="width:100%; max-width:550px; border-radius:16px; overflow:hidden; background:#fff; padding:24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3 style="font-size:18px; font-weight:700;">Cài đặt hệ thống MedLab AI</h3>
        <button class="icon-btn" onclick="closeModal('settingsModal')">✕</button>
      </div>
      <div style="display:flex; flex-direction:column; gap:16px; font-size:13px;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--color-gray-50); border-radius:8px;">
          <div>
            <div style="font-weight:600;">Khoa y tế mặc định</div>
            <div style="font-size:11px; color:var(--color-gray-500);">Khoa Vật lý trị liệu & Phục hồi chức năng</div>
          </div>
          <span style="color:var(--color-primary); font-weight:600;">Đã kết nối</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--color-gray-50); border-radius:8px;">
          <div>
            <div style="font-weight:600;">Quy tắc đệm BHYT (TT 43)</div>
            <div style="font-size:11px; color:var(--color-gray-500);">1:1 (2 phút đệm) | 1-Nhiều (5 phút đệm)</div>
          </div>
          <span style="color:var(--color-success); font-weight:600;">Đang bật</span>
        </div>
        <div>
          <label style="display:block; font-weight:600; margin-bottom:6px;">Chế độ hiển thị giao diện</label>
          <select class="form-select" style="width:100%; padding:10px; border:1px solid var(--color-gray-300); border-radius:8px;" onchange="toggleTheme()">
            <option value="light">Sáng (Light Mode - Tiêu chuẩn y tế)</option>
            <option value="dark">Tối (Dark Mode - Phòng tối X-Quang)</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-weight:600; margin-bottom:6px;">Email nhận cảnh báo hệ thống</label>
          <input type="email" class="form-input" value="vana.nguyen@medlab.vn" style="width:100%; padding:10px; border:1px solid var(--color-gray-300); border-radius:8px;" />
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px;">
        <button class="btn btn--ghost" onclick="closeModal('settingsModal')">Hủy</button>
        <button class="btn btn--primary" onclick="showToast('Đã lưu cài đặt hệ thống thành công', 'success'); closeModal('settingsModal');">Lưu thay đổi</button>
      </div>
    </div>`;

  openModal('settingsModal');
}

