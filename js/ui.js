/* ═══════════════════════════════════════════════
   MED LAB – SHARED UI COMPONENTS
   Sidebar, Topbar rendered dynamically on all pages
   ═══════════════════════════════════════════════ */

const NAV_ITEMS = [
  { id:'dashboard',         label:'Bảng điều khiển', href:'dashboard.html',          icon:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { id:'schedule-matrix',   label:'Ma trận lịch',     href:'schedule-matrix.html',    icon:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
  { id:'staff-management',  label:'Nhân sự',           href:'staff-management.html',   icon:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z' },
  { id:'patient-management',label:'Bệnh nhân',         href:'patient-management.html', icon:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8z' },
  { id:'machine-management',label:'Máy móc',           href:'machine-management.html', icon:'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18' },
  { id:'calendar',          label:'Thủ tục Y tế',      href:'calendar.html',           icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id:'time-allocation',   label:'Phân bổ thời gian', href:'time-allocation.html',    icon:'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2' },
];

function renderSidebar(activeId) {
  const el = document.getElementById('sidebar');
  if (!el) return;
  el.innerHTML = `
    <div class="sidebar__brand">
      <div class="sidebar__logo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v10l9 5 9-5V7L12 2Z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>
        </svg>
      </div>
      <div><div class="sidebar__title">Med Lab</div><div class="sidebar__sub">Hệ thống quản lý</div></div>
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
      <a class="nav-item" href="#"><svg class="nav-item__icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Cài đặt</a>
      <a class="nav-item nav-item--danger" href="login.html"><svg class="nav-item__icon" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Đăng xuất</a>
    </div>`;
}

function renderTopbar() {
  const el = document.getElementById('topbar');
  if (!el) return;
  el.innerHTML = `
    <nav class="topbar__breadcrumb">
      <a href="dashboard.html">Bệnh viện</a>
      <span class="sep">›</span>
      <span class="current">Med Lab – Khoa VLTL</span>
    </nav>
    <div class="topbar__right">
      <div class="topbar__search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <input type="text" placeholder="Tìm kiếm bệnh nhân, thủ thuật..." />
      </div>
      <div class="topbar__notif">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <span class="topbar__notif-badge">3</span>
      </div>
      <div class="topbar__user">
        <div class="topbar__avatar">VA</div>
        <div class="topbar__user-info">
          <div class="topbar__user-name">BS. Nguyễn Văn A</div>
          <div class="topbar__user-role">Khoa VLTL</div>
        </div>
      </div>
    </div>`;
}
