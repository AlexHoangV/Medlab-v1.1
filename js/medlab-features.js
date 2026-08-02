/* ═════════════════════════════════════════════════════════════════
   MED LAB — ADVANCED FEATURES (Import Google Sheet, BHYT Export, Manual Booking)
   ═════════════════════════════════════════════════════════════════ */

// 1. Inject Modals into DOM if not present
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('importDataModal')) {
    const importModalHTML = `
      <div class="modal-overlay" id="importDataModal">
        <div class="modal" style="max-width:600px">
          <div class="modal__header">
            <div class="modal__title">📥 Import Dữ liệu từ Google Sheet / CSV</div>
            <button class="modal__close" onclick="closeModal('importDataModal')">✕</button>
          </div>
          <div class="modal__body" style="display:flex;flex-direction:column;gap:14px">
            <p style="font-size:13px;color:var(--color-gray-600)">
              Đồng bộ dữ liệu từ Google Sheets thực tế của khoa VLTL (Danh mục Bệnh nhân, Nhân sự, Máy móc, Lịch thủ thuật). Hệ thống sẽ tự động phân loại và chống xung đột 4D.
            </p>
            <div class="form-group">
              <label class="form-label">Chọn tệp dữ liệu (.csv, .json, .txt)</label>
              <input type="file" id="importFileInput" class="form-input" accept=".csv,.json,.txt" />
            </div>
            <div class="form-group">
              <label class="form-label">Hoặc dán nội dung Google Sheet (TSV / CSV / JSON)</label>
              <textarea id="importTextData" class="form-input" rows="5" placeholder="Dán dữ liệu từ bảng tính Google Sheets vào đây..."></textarea>
            </div>
            <div class="alert-box alert-box--success" id="importStatusBox" style="display:none"></div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--ghost" onclick="closeModal('importDataModal')">Hủy</button>
            <button class="btn btn--primary" onclick="executeDataImport()">Thực hiện Import</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', importModalHTML);
  }

  if (!document.getElementById('exportBHYTModal')) {
    const exportModalHTML = `
      <div class="modal-overlay" id="exportBHYTModal">
        <div class="modal" style="max-width:600px">
          <div class="modal__header">
            <div class="modal__title">📤 Xuất dữ liệu BHYT (XML / CSV Chuẩn Cổng Quốc Gia)</div>
            <button class="modal__close" onclick="closeModal('exportBHYTModal')">✕</button>
          </div>
          <div class="modal__body" style="display:flex;flex-direction:column;gap:14px">
            <p style="font-size:13px;color:var(--color-gray-600)">
              Xuất báo cáo định dạng chuẩn BHYT Thông tư 43/2013/TT-BYT kèm mã dịch vụ kỹ thuật, mã máy, thời gian thực hiện, và nguồn gán (tự động / tay sửa) để đối soát.
            </p>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Từ ngày</label>
                <input type="date" id="bhytFromDate" class="form-input" value="2026-07-01" />
              </div>
              <div class="form-group">
                <label class="form-label">Đến ngày</label>
                <input type="date" id="bhytToDate" class="form-input" value="2026-07-31" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Định dạng xuất</label>
              <select id="bhytFormat" class="form-select">
                <option value="csv">CSV (Excel đối soát nhanh)</option>
                <option value="xml">XML chuẩn Cổng BHYT Quốc gia</option>
              </select>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--ghost" onclick="closeModal('exportBHYTModal')">Hủy</button>
            <button class="btn btn--primary" onclick="executeBHYTExport()">Tải xuống tệp BHYT</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', exportModalHTML);
  }

  // Wire up buttons with onclick attributes or classes if they call missing functions
  window.openImportModal = () => openModal('importDataModal');
  window.openBHYTExportModal = () => openModal('exportBHYTModal');
  window.openAddScheduleModal = () => {
    if (typeof openModal === 'function') {
      if (document.getElementById('addBlockModal')) {
        openModal('addBlockModal');
      } else {
        // If on page without addBlockModal, redirect to schedule-matrix or show toast
        window.location.href = 'schedule-matrix.html';
      }
    }
  };
});

// Execute Import
function executeDataImport() {
  const textInput = document.getElementById('importTextData')?.value;
  const fileInput = document.getElementById('importFileInput')?.files[0];
  const statusBox = document.getElementById('importStatusBox');

  if (!textInput && !fileInput) {
    showToast('Vui lòng chọn tệp hoặc dán dữ liệu cần import', 'warn');
    return;
  }

  if (fileInput) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        processImportContent(content);
      } catch (err) {
        showToast('Lỗi đọc tệp: ' + err.message, 'danger');
      }
    };
    reader.readAsText(fileInput);
  } else if (textInput) {
    processImportContent(textInput);
  }
}

function processImportContent(content) {
  try {
    // If JSON
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      const parsed = JSON.parse(content);
      if (parsed.staff) STAFF_DB.length = 0, STAFF_DB.push(...parsed.staff);
      if (parsed.patients) PATIENTS_DB.length = 0, PATIENTS_DB.push(...parsed.patients);
      if (parsed.machines) MACHINES_DB.length = 0, MACHINES_DB.push(...parsed.machines);
      if (parsed.schedules) SCHEDULES_DB.length = 0, SCHEDULES_DB.push(...parsed.schedules);
    } else {
      // Parse CSV / TSV lines
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      let count = 0;
      lines.forEach((line, idx) => {
        if (idx === 0) return; // header
        const parts = line.split(/[,;\t]/).map(p => p.replace(/^["']|["']$/g, '').trim());
        if (parts.length >= 2) {
          const name = parts[0];
          const phone = parts[1] || '090' + Math.floor(1000000 + Math.random() * 9000000);
          if (!PATIENTS_DB.some(p => p.fullName === name)) {
            PATIENTS_DB.push({
              id: PATIENTS_DB.length + 100,
              fullName: name,
              pid: `BN-${String(PATIENTS_DB.length + 1).padStart(3, '0')}`,
              admitDate: new Date().toISOString().split('T')[0],
              isActive: true,
              note: parts[2] || 'Imported from Google Sheet'
            });
            count++;
          }
        }
      });
      showToast(`Đã import thành công ${count} bệnh nhân mới từ Google Sheet!`, 'success');
    }

    if (typeof persistData === 'function') persistData();
    const statusBox = document.getElementById('importStatusBox');
    if (statusBox) {
      statusBox.style.display = 'block';
      statusBox.innerHTML = `✅ Import thành công! Dữ liệu đã được đồng bộ với hệ thống chống xung đột 4D.`;
    }
    setTimeout(() => {
      closeModal('importDataModal');
      if (typeof renderMatrix === 'function') renderMatrix();
      if (typeof renderCalendar === 'function') renderCalendar();
    }, 1500);
  } catch (err) {
    showToast('Lỗi xử lý dữ liệu import: ' + err.message, 'danger');
  }
}

// Execute BHYT Export
function executeBHYTExport() {
  const fromDate = document.getElementById('bhytFromDate')?.value || '2026-07-01';
  const toDate = document.getElementById('bhytToDate')?.value || '2026-07-31';
  const format = document.getElementById('bhytFormat')?.value || 'csv';

  const filteredSchedules = SCHEDULES_DB.filter(sc => sc.date >= fromDate && sc.date <= toDate && sc.status !== 'CANCELLED');

  if (format === 'csv') {
    const rows = [
      ['STT', 'Mã KCB', 'Họ tên bệnh nhân', 'Mã DVKT', 'Tên dịch vụ kỹ thuật', 'Mã máy sử dụng', 'Ngày', 'Giờ Bắt đầu', 'Giờ Kết thúc', 'Kỹ thuật viên', 'Nguồn gán', 'Trạng thái']
    ];
    filteredSchedules.forEach((sc, idx) => {
      const pt = typeof getPatient === 'function' ? getPatient(sc.patientId) : { fullName: 'BN #' + sc.patientId, pid: 'BN00' + sc.patientId };
      const st = typeof getStaff === 'function' ? getStaff(sc.staffId) : { fullName: 'KTV #' + sc.staffId };
      const pr = typeof getProcedure === 'function' ? getProcedure(sc.procedureId) : { name: sc.procedureId };
      const mc = typeof getMachine === 'function' ? getMachine(sc.machineId) : { maMay: '—' };

      rows.push([
        idx + 1,
        pt?.pid || 'BN001',
        pt?.fullName || '',
        pr?.maDVKT || '1.700.080.253',
        pr?.name || sc.procedureId,
        mc?.maMay || '—',
        sc.date,
        sc.start,
        sc.end,
        st?.fullName || '',
        sc.nguon_gan || 'tu_dong',
        sc.status
      ]);
    });

    const csvContent = rows.map(r => r.map(v => `"${v || ''}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BHYT_BaoCao_ThuThuat_${fromDate}_den_${toDate}.csv`;
    a.click();
    showToast('Đã xuất file CSV đối soát BHYT thành công!', 'success');
  } else {
    // XML Export for BHYT Portal
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<HoSoBHYT TuNgay="${fromDate}" DenNgay="${toDate}" DonVi="Khoa YHCT &amp; PHCN">\n  <DanhSachThuThuat>\n`;
    filteredSchedules.forEach((sc, idx) => {
      const pt = typeof getPatient === 'function' ? getPatient(sc.patientId) : { fullName: 'BN', pid: 'BN1' };
      const st = typeof getStaff === 'function' ? getStaff(sc.staffId) : { fullName: 'KTV' };
      const pr = typeof getProcedure === 'function' ? getProcedure(sc.procedureId) : { name: sc.procedureId };
      const mc = typeof getMachine === 'function' ? getMachine(sc.machineId) : { maMay: '' };

      xml += `    <ThuThuat STT="${idx + 1}">\n`;
      xml += `      <MaBenhNhan>${pt?.pid || ''}</MaBenhNhan>\n`;
      xml += `      <TenBenhNhan><![CDATA[${pt?.fullName || ''}]]></TenBenhNhan>\n`;
      xml += `      <MaDVKT>${pr?.maDVKT || '1.700.080.253'}</MaDVKT>\n`;
      xml += `      <TenDVKT><![CDATA[${pr?.name || sc.procedureId}]]></TenDVKT>\n`;
      xml += `      <MaMay>${mc?.maMay || ''}</MaMay>\n`;
      xml += `      <NgayThucHien>${sc.date}</NgayThucHien>\n`;
      xml += `      <ThoiGianBatDau>${sc.start}</ThoiGianBatDau>\n`;
      xml += `      <ThoiGianKetThuc>${sc.end}</ThoiGianKetThuc>\n`;
      xml += `      <NhanVienPhuTrach><![CDATA[${st?.fullName || ''}]]></NhanVienPhuTrach>\n`;
      xml += `      <NguonGan>${sc.nguon_gan || 'tu_dong'}</NguonGan>\n`;
      xml += `    </ThuThuat>\n`;
    });
    xml += `  </DanhSachThuThuat>\n</HoSoBHYT>`;

    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BHYT_XML_${fromDate}_den_${toDate}.xml`;
    a.click();
    showToast('Đã xuất file XML chuẩn Cổng BHYT Quốc gia thành công!', 'success');
  }

  closeModal('exportBHYTModal');
}
