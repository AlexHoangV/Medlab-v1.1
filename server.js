import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const __dirname = process.cwd();

const app = express();
const PORT = 3000;

app.use(express.json());

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(`[MedLab AI] ${req.method} ${req.url}`);
  next();
});

/* ═════════════════════════════════════════════════════════════════
   BACKEND DATABASE & API LAYER FOR 7 MEDLAB MODULES (BHYT COMPLIANT)
   ═════════════════════════════════════════════════════════════════ */

const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
const DB_FILE = isVercel ? path.join('/tmp', 'medlab_db.json') : path.join(__dirname, 'medlab_db.json');

// Ensure db exists in tmp if on vercel
if (isVercel && !fs.existsSync(DB_FILE)) {
  const sourceDb = path.join(__dirname, 'medlab_db.json');
  if (fs.existsSync(sourceDb)) {
    try {
      fs.copyFileSync(sourceDb, DB_FILE);
    } catch (e) {}
  }
}

// Initialize Default Database from 3 Google Sheets & TT 43/2013/TT-BYT
function getDefaultDB() {
  return {
    version: '1.2.0',
    lastUpdated: new Date().toISOString(),
    staff: [
      { id:1, fullName:'Liễu',      shortName:'LIỄU',      role:'TECHNICIAN', specialty:'Xoa bóp vùng',    isActive:true,  color:'#3B82F6', initials:'LI' },
      { id:2, fullName:'Thu Hằng',  shortName:'THU HẰNG',  role:'TECHNICIAN', specialty:'Xoa bóp vùng',    isActive:true,  color:'#8B5CF6', initials:'TH' },
      { id:3, fullName:'Thạch',     shortName:'THẠCH',     role:'TECHNICIAN', specialty:'Tập vận động',     isActive:true,  color:'#059669', initials:'TH2'},
      { id:4, fullName:'Tâm',       shortName:'TÂM',       role:'TECHNICIAN', specialty:'Tập vận động',     isActive:true,  color:'#D97706', initials:'TM' },
      { id:5, fullName:'Nhân',      shortName:'NHÂN',      role:'TECHNICIAN', specialty:'Tập vận động',     isActive:true,  color:'#DC2626', initials:'NH' },
      { id:6, fullName:'Tâm (SA)',  shortName:'TÂM SA',    role:'TECHNICIAN', specialty:'Siêu âm SAD02',    isActive:true,  color:'#0891B2', initials:'TS' },
      { id:7, fullName:'Như',       shortName:'NHƯ',       role:'TECHNICIAN', specialty:'Xoa bóp',          isActive:true,  color:'#7C3AED', initials:'NH2'},
      { id:8, fullName:'Như (NN)',  shortName:'NHƯ NN',    role:'TECHNICIAN', specialty:'Tập ngôn ngữ',     isActive:true,  color:'#BE185D', initials:'NN' },
      { id:9, fullName:'BS. Nguyễn Văn A', shortName:'BS.VAN A', role:'DOCTOR', specialty:'Điện châm',     isActive:true,  color:'#1D4ED8', initials:'VA' },
      { id:10,fullName:'BS. Trần K.',shortName:'BS.TRANK', role:'DOCTOR',     specialty:'Thủy châm',        isActive:true,  color:'#065F46', initials:'TK' }
    ],
    patients: [
      { id:'P001', fullName:'Lĩnh', hospitalCode:'13/07-B', dischargeDate:'13/07', condition:'Thoái hóa Cột sống', status:'ACTIVE' },
      { id:'P002', fullName:'Chê', hospitalCode:'26/06-T', dischargeDate:'26/06', condition:'Tai biến mạch máu não', status:'ACTIVE' },
      { id:'P003', fullName:'Phương', hospitalCode:'06/07-A', dischargeDate:'06/07', condition:'Viêm quanh khớp vai', status:'ACTIVE' },
      { id:'P004', fullName:'Oanh', hospitalCode:'28/07-C', dischargeDate:'28/07', condition:'Hội chứng ống cổ tay', status:'ACTIVE' },
      { id:'P005', fullName:'Thân', hospitalCode:'22/07-D', dischargeDate:'22/07', condition:'Đau thần kinh tọa', status:'ACTIVE' },
      { id:'P006', fullName:'Thiết', hospitalCode:'21/07-E', dischargeDate:'21/07', condition:'Liệt dây thần kinh VII', status:'ACTIVE' }
    ],
    machines: [
      { id:1, stt:1, tenTB:'Đèn hồng ngoại', kyHieu:'YK12', maDVKT:'1.700.110.237', tenDVKT:'Điều trị bằng hồng ngoại', maMay:'HN.1.26017.HN1', khoaSD:'VLTL', status:'ACTIVE', procedureIds:['hong_ngoai'] },
      { id:2, stt:7, tenTB:'Máy châm cứu 6 kênh', kyHieu:'ES-160', maDVKT:'800.050.230', tenDVKT:'Điều trị bằng điện châm', maMay:'CC6.1.26017.Seebarcodeseal.1', khoaSD:'VLTL', status:'ACTIVE', procedureIds:['dien_cham'] },
      { id:3, stt:8, tenTB:'Máy điện châm KWD-808I', kyHieu:'KWD-808I', maDVKT:'800.050.230', tenDVKT:'Điều trị bằng điện châm', maMay:'CC.1.26017.1603-0603', khoaSD:'VLTL', status:'ACTIVE', procedureIds:['dien_cham'] },
      { id:4, stt:22, tenTB:'Máy điện trường cao áp', kyHieu:'Bios-9000', maDVKT:'1.700.270.232', tenDVKT:'Điều trị bằng điện trường cao áp', maMay:'ĐTC.1.26017.32700324T', khoaSD:'VLTL', status:'ACTIVE', procedureIds:['dien_truong'] },
      { id:5, stt:20, tenTB:'Máy điện phân', kyHieu:'IONO BASE+', maDVKT:'1.700.060.231', tenDVKT:'Điều trị bằng điện phân dẫn thuốc', maMay:'ĐPT.1.26017.', khoaSD:'VLTL', status:'ACTIVE', procedureIds:['dien_phan'] },
      { id:6, stt:31, tenTB:'Máy oxy cao áp 3300H', kyHieu:'3300H', maDVKT:'300.591.116', tenDVKT:'Điều trị bằng oxy cao áp', maMay:'OCA.1.26017.33HS0575', khoaSD:'VLTL', status:'ACTIVE', procedureIds:['oxy_cao_ap'] },
      { id:7, stt:38, tenTB:'Máy siêu âm điều trị US-101L', kyHieu:'US-101L', maDVKT:'1.700.050.232', tenDVKT:'Điều trị bằng siêu âm', maMay:'SAĐ.1.26017.0672111', khoaSD:'VLTL', status:'ACTIVE', procedureIds:['sieu_am'] }
    ],
    schedules: [
      { id:'S001', date:'2026-08-01', staffId:1, patientId:'P001', machineCode:'SAĐ.1.26017.0672111', procedureId:'sieu_am', procedureType:'ONE_TO_ONE', startTime:'08:00', endTime:'08:15', status:'SCHEDULED' },
      { id:'S002', date:'2026-08-01', staffId:1, patientId:'P003', machineCode:'SAĐ.1.26017.0672111', procedureId:'sieu_am', procedureType:'ONE_TO_ONE', startTime:'08:18', endTime:'08:33', status:'SCHEDULED' },
      { id:'S003', date:'2026-08-01', staffId:3, patientId:'P004', machineCode:'OCA.1.26017.33HS0575', procedureId:'oxy_cao_ap', procedureType:'ONE_TO_MANY', startTime:'07:41', endTime:'08:41', status:'SCHEDULED' },
      { id:'S004', date:'2026-08-01', staffId:3, patientId:'P005', machineCode:'OCA.1.26017.33HS0575', procedureId:'oxy_cao_ap', procedureType:'ONE_TO_MANY', startTime:'08:46', endTime:'09:46', status:'SCHEDULED' }
    ],
    auditLogs: [
      { id:'A001', timestamp: new Date().toISOString(), type:'SYSTEM_INIT', message:'Khởi tạo hệ thống MedLab AI Database theo 3 Google Sheets VLTL', oldVal:null, newVal:'INIT' }
    ]
  };
}

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const db = getDefaultDB();
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
      return db;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading DB, returning default:', err);
    return getDefaultDB();
  }
}

function writeDB(data) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// Helper to check BHYT buffer rules (2 min for 1:1, 5 min for 1-Many)
function checkCollision(newBlock, existingBlocks) {
  const minBuffer = newBlock.procedureType === 'ONE_TO_MANY' ? 5 : 2;
  const toMin = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  const start = toMin(newBlock.startTime);
  const end = toMin(newBlock.endTime);

  const collisions = [];
  for (const block of existingBlocks) {
    if (block.id === newBlock.id || block.date !== newBlock.date) continue;
    
    // Check same staff or same machine
    const sameStaff = block.staffId === Number(newBlock.staffId);
    const sameMachine = newBlock.machineCode && block.machineCode === newBlock.machineCode;

    if (sameStaff || sameMachine) {
      const bStart = toMin(block.startTime);
      const bEnd = toMin(block.endTime);

      // Check overlap or buffer violation
      const isOverlap = !(end + minBuffer <= bStart || start >= bEnd + minBuffer);
      if (isOverlap) {
        collisions.push({
          type: sameStaff ? 'STAFF_COLLISION' : 'MACHINE_COLLISION',
          message: `Xung đột ${sameStaff ? 'nhân sự' : 'thiết bị'} (${block.startTime}-${block.endTime}) - Yêu cầu đệm tối thiểu ${minBuffer} phút`,
          conflictingBlock: block
        });
      }
    }
  }
  return { valid: collisions.length === 0, collisions, bufferRequired: minBuffer };
}

// ── API 0: Backend Health & System Scan status
app.get('/api/status', (req, res) => {
  const db = readDB();
  res.json({
    status: 'READY',
    backendBuilt: true,
    version: db.version,
    lastUpdated: db.lastUpdated,
    modules: {
      staffManagement: { active: true, count: db.staff.length },
      patientManagement: { active: true, count: db.patients.length },
      machineManagement: { active: true, count: db.machines.length },
      scheduleMatrix: { active: true, count: db.schedules.length },
      antiCollisionEngine: { active: true, rules: '1:1 (2 min buffer) | 1-Many (5 min buffer)' },
      auditLogChain: { active: true, count: db.auditLogs.length }
    }
  });
});

// ── API 1: Staff Management (Module 1 - Quản lý nhân sự theo ngày)
app.get('/api/staff', (req, res) => {
  const db = readDB();
  res.json(db.staff);
});

app.post('/api/staff/transfer', (req, res) => {
  const { oldStaffId, newStaffId, date, reason } = req.body;
  const db = readDB();
  const oldStaff = db.staff.find(s => s.id === Number(oldStaffId));
  const newStaff = db.staff.find(s => s.id === Number(newStaffId));
  
  if (!oldStaff || !newStaff) {
    return res.status(400).json({ error: 'Nhân sự không tồn tại' });
  }

  let transferredCount = 0;
  db.schedules.forEach(block => {
    if (block.staffId === Number(oldStaffId) && (!date || block.date === date)) {
      block.staffId = Number(newStaffId);
      transferredCount++;
    }
  });

  db.auditLogs.push({
    id: `A_${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'STAFF_TRANSFER',
    message: `Chuyển nhượng ${transferredCount} thủ thuật từ ${oldStaff.fullName} sang ${newStaff.fullName}`,
    oldVal: { staffId: oldStaffId, name: oldStaff.fullName },
    newVal: { staffId: newStaffId, name: newStaff.fullName, transferredCount, reason }
  });

  writeDB(db);
  res.json({ success: true, transferredCount, newStaff });
});

// ── API 2: Patient Management (Module 2 - Quản lý bệnh nhân & Ngừng điều trị)
app.get('/api/patients', (req, res) => {
  const db = readDB();
  res.json(db.patients);
});

app.post('/api/patients/:id/stop-treatment', (req, res) => {
  const { id } = req.params;
  const { stopDate, reason } = req.body;
  const db = readDB();
  const patient = db.patients.find(p => p.id === id || p.fullName === id);

  if (!patient) {
    return res.status(404).json({ error: 'Bệnh nhân không tồn tại' });
  }

  patient.status = 'STOPPED';
  patient.stoppedDate = stopDate || new Date().toISOString().split('T')[0];

  let freedBlocks = 0;
  db.schedules = db.schedules.map(block => {
    if (block.patientId === patient.id) {
      freedBlocks++;
      return { ...block, status: 'AVAILABLE', patientId: null };
    }
    return block;
  });

  db.auditLogs.push({
    id: `A_${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'PATIENT_STOPPED',
    message: `Bệnh nhân ${patient.fullName} ngừng điều trị. Đã giải phóng ${freedBlocks} block về trạng thái AVAILABLE.`,
    oldVal: { status: 'ACTIVE' },
    newVal: { status: 'STOPPED', freedBlocks, reason }
  });

  writeDB(db);
  res.json({ success: true, freedBlocks, patient });
});

// ── API 3: Machine Management (Module 3 - Quản lý mã máy BHYT cột F)
app.get('/api/machines', (req, res) => {
  const db = readDB();
  res.json(db.machines);
});

// ── API 4 & 5 & 7: Schedule Matrix, Anti-Collision Validation & Entity Binding
app.get('/api/schedules', (req, res) => {
  const { date } = req.query;
  const db = readDB();
  const filtered = date ? db.schedules.filter(s => s.date === date) : db.schedules;
  res.json(filtered);
});

app.post('/api/validate-collision', (req, res) => {
  const newBlock = req.body;
  const db = readDB();
  const check = checkCollision(newBlock, db.schedules);
  res.json(check);
});

app.post('/api/schedules', (req, res) => {
  const newBlock = req.body;
  const db = readDB();

  const check = checkCollision(newBlock, db.schedules);
  if (!check.valid) {
    return res.status(409).json({
      error: 'Phát hiện xung đột lịch / vi phạm đệm BHYT',
      collisions: check.collisions
    });
  }

  newBlock.id = newBlock.id || `S_${Date.now()}`;
  newBlock.status = newBlock.status || 'SCHEDULED';
  db.schedules.push(newBlock);

  db.auditLogs.push({
    id: `A_${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'SCHEDULE_CREATED',
    message: `Đã đặt lịch ${newBlock.procedureId} cho bệnh nhân ${newBlock.patientId}`,
    oldVal: null,
    newVal: newBlock
  });

  writeDB(db);
  res.status(201).json({ success: true, schedule: newBlock });
});

// ── API 6: Audit Logs (Lịch sử truy vết & thay đổi BHYT)
app.get('/api/audit-logs', (req, res) => {
  const db = readDB();
  res.json(db.auditLogs);
});

// ── API 7: Comprehensive 2-Way Sync with Database (medlab_db.json)
app.get('/api/db', (req, res) => {
  const db = readDB();
  res.json({
    staff: db.staff || [],
    patients: db.patients || [],
    machines: db.machines || [],
    schedules: db.schedules || [],
    auditLogs: db.auditLogs || []
  });
});

app.post('/api/db/sync', (req, res) => {
  const { staff, patients, machines, schedules, auditLogs } = req.body;
  const db = readDB();
  if (Array.isArray(staff)) db.staff = staff;
  if (Array.isArray(patients)) db.patients = patients;
  if (Array.isArray(machines)) db.machines = machines;
  if (Array.isArray(schedules)) db.schedules = schedules;
  if (Array.isArray(auditLogs)) db.auditLogs = auditLogs;
  writeDB(db);
  res.json({ success: true, timestamp: db.lastUpdated });
});


// Friendly redirects for extensionless routes (e.g. /dashboard -> /dashboard.html)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.includes('.') && req.path !== '/' && !req.path.startsWith('/api')) {
    const htmlPath = path.join(__dirname, `${req.path}.html`);
    if (fs.existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }
  }
  next();
});

// Vite middleware setup
async function startApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // server.cjs is located in /dist, so static files are in the same directory.
    const distPath = __dirname;
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const requestedPath = path.join(distPath, req.path);
      if (fs.existsSync(requestedPath) && !requestedPath.endsWith('.cjs')) {
        res.sendFile(requestedPath);
      } else {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ MedLab AI server & REST API running at http://0.0.0.0:${PORT}`);
  });
}

// Export app for Vercel
export default app;

// Start server for local development
if (!process.env.VERCEL) {
  startApp();
}

