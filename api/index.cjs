var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.js
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var __dirname = process.cwd();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
app.use((req, res, next) => {
  console.log(`[MedLab AI] ${req.method} ${req.url}`);
  next();
});
var isVercel = process.env.VERCEL || process.env.NODE_ENV === "production";
var DB_FILE = isVercel ? import_path.default.join("/tmp", "medlab_db.json") : import_path.default.join(__dirname, "medlab_db.json");
if (isVercel && !import_fs.default.existsSync(DB_FILE)) {
  const sourceDb = import_path.default.join(__dirname, "medlab_db.json");
  if (import_fs.default.existsSync(sourceDb)) {
    try {
      import_fs.default.copyFileSync(sourceDb, DB_FILE);
    } catch (e) {
    }
  }
}
function getDefaultDB() {
  return {
    version: "1.2.0",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    staff: [
      { id: 1, fullName: "Li\u1EC5u", shortName: "LI\u1EC4U", role: "TECHNICIAN", specialty: "Xoa b\xF3p v\xF9ng", isActive: true, color: "#3B82F6", initials: "LI" },
      { id: 2, fullName: "Thu H\u1EB1ng", shortName: "THU H\u1EB0NG", role: "TECHNICIAN", specialty: "Xoa b\xF3p v\xF9ng", isActive: true, color: "#8B5CF6", initials: "TH" },
      { id: 3, fullName: "Th\u1EA1ch", shortName: "TH\u1EA0CH", role: "TECHNICIAN", specialty: "T\u1EADp v\u1EADn \u0111\u1ED9ng", isActive: true, color: "#059669", initials: "TH2" },
      { id: 4, fullName: "T\xE2m", shortName: "T\xC2M", role: "TECHNICIAN", specialty: "T\u1EADp v\u1EADn \u0111\u1ED9ng", isActive: true, color: "#D97706", initials: "TM" },
      { id: 5, fullName: "Nh\xE2n", shortName: "NH\xC2N", role: "TECHNICIAN", specialty: "T\u1EADp v\u1EADn \u0111\u1ED9ng", isActive: true, color: "#DC2626", initials: "NH" },
      { id: 6, fullName: "T\xE2m (SA)", shortName: "T\xC2M SA", role: "TECHNICIAN", specialty: "Si\xEAu \xE2m SAD02", isActive: true, color: "#0891B2", initials: "TS" },
      { id: 7, fullName: "Nh\u01B0", shortName: "NH\u01AF", role: "TECHNICIAN", specialty: "Xoa b\xF3p", isActive: true, color: "#7C3AED", initials: "NH2" },
      { id: 8, fullName: "Nh\u01B0 (NN)", shortName: "NH\u01AF NN", role: "TECHNICIAN", specialty: "T\u1EADp ng\xF4n ng\u1EEF", isActive: true, color: "#BE185D", initials: "NN" },
      { id: 9, fullName: "BS. Nguy\u1EC5n V\u0103n A", shortName: "BS.VAN A", role: "DOCTOR", specialty: "\u0110i\u1EC7n ch\xE2m", isActive: true, color: "#1D4ED8", initials: "VA" },
      { id: 10, fullName: "BS. Tr\u1EA7n K.", shortName: "BS.TRANK", role: "DOCTOR", specialty: "Th\u1EE7y ch\xE2m", isActive: true, color: "#065F46", initials: "TK" }
    ],
    patients: [
      { id: "P001", fullName: "L\u0129nh", hospitalCode: "13/07-B", dischargeDate: "13/07", condition: "Tho\xE1i h\xF3a C\u1ED9t s\u1ED1ng", status: "ACTIVE" },
      { id: "P002", fullName: "Ch\xEA", hospitalCode: "26/06-T", dischargeDate: "26/06", condition: "Tai bi\u1EBFn m\u1EA1ch m\xE1u n\xE3o", status: "ACTIVE" },
      { id: "P003", fullName: "Ph\u01B0\u01A1ng", hospitalCode: "06/07-A", dischargeDate: "06/07", condition: "Vi\xEAm quanh kh\u1EDBp vai", status: "ACTIVE" },
      { id: "P004", fullName: "Oanh", hospitalCode: "28/07-C", dischargeDate: "28/07", condition: "H\u1ED9i ch\u1EE9ng \u1ED1ng c\u1ED5 tay", status: "ACTIVE" },
      { id: "P005", fullName: "Th\xE2n", hospitalCode: "22/07-D", dischargeDate: "22/07", condition: "\u0110au th\u1EA7n kinh t\u1ECDa", status: "ACTIVE" },
      { id: "P006", fullName: "Thi\u1EBFt", hospitalCode: "21/07-E", dischargeDate: "21/07", condition: "Li\u1EC7t d\xE2y th\u1EA7n kinh VII", status: "ACTIVE" }
    ],
    machines: [
      { id: 1, stt: 1, tenTB: "\u0110\xE8n h\u1ED3ng ngo\u1EA1i", kyHieu: "YK12", maDVKT: "1.700.110.237", tenDVKT: "\u0110i\u1EC1u tr\u1ECB b\u1EB1ng h\u1ED3ng ngo\u1EA1i", maMay: "HN.1.26017.HN1", khoaSD: "VLTL", status: "ACTIVE", procedureIds: ["hong_ngoai"] },
      { id: 2, stt: 7, tenTB: "M\xE1y ch\xE2m c\u1EE9u 6 k\xEAnh", kyHieu: "ES-160", maDVKT: "800.050.230", tenDVKT: "\u0110i\u1EC1u tr\u1ECB b\u1EB1ng \u0111i\u1EC7n ch\xE2m", maMay: "CC6.1.26017.Seebarcodeseal.1", khoaSD: "VLTL", status: "ACTIVE", procedureIds: ["dien_cham"] },
      { id: 3, stt: 8, tenTB: "M\xE1y \u0111i\u1EC7n ch\xE2m KWD-808I", kyHieu: "KWD-808I", maDVKT: "800.050.230", tenDVKT: "\u0110i\u1EC1u tr\u1ECB b\u1EB1ng \u0111i\u1EC7n ch\xE2m", maMay: "CC.1.26017.1603-0603", khoaSD: "VLTL", status: "ACTIVE", procedureIds: ["dien_cham"] },
      { id: 4, stt: 22, tenTB: "M\xE1y \u0111i\u1EC7n tr\u01B0\u1EDDng cao \xE1p", kyHieu: "Bios-9000", maDVKT: "1.700.270.232", tenDVKT: "\u0110i\u1EC1u tr\u1ECB b\u1EB1ng \u0111i\u1EC7n tr\u01B0\u1EDDng cao \xE1p", maMay: "\u0110TC.1.26017.32700324T", khoaSD: "VLTL", status: "ACTIVE", procedureIds: ["dien_truong"] },
      { id: 5, stt: 20, tenTB: "M\xE1y \u0111i\u1EC7n ph\xE2n", kyHieu: "IONO BASE+", maDVKT: "1.700.060.231", tenDVKT: "\u0110i\u1EC1u tr\u1ECB b\u1EB1ng \u0111i\u1EC7n ph\xE2n d\u1EABn thu\u1ED1c", maMay: "\u0110PT.1.26017.", khoaSD: "VLTL", status: "ACTIVE", procedureIds: ["dien_phan"] },
      { id: 6, stt: 31, tenTB: "M\xE1y oxy cao \xE1p 3300H", kyHieu: "3300H", maDVKT: "300.591.116", tenDVKT: "\u0110i\u1EC1u tr\u1ECB b\u1EB1ng oxy cao \xE1p", maMay: "OCA.1.26017.33HS0575", khoaSD: "VLTL", status: "ACTIVE", procedureIds: ["oxy_cao_ap"] },
      { id: 7, stt: 38, tenTB: "M\xE1y si\xEAu \xE2m \u0111i\u1EC1u tr\u1ECB US-101L", kyHieu: "US-101L", maDVKT: "1.700.050.232", tenDVKT: "\u0110i\u1EC1u tr\u1ECB b\u1EB1ng si\xEAu \xE2m", maMay: "SA\u0110.1.26017.0672111", khoaSD: "VLTL", status: "ACTIVE", procedureIds: ["sieu_am"] }
    ],
    schedules: [
      { id: "S001", date: "2026-08-01", staffId: 1, patientId: "P001", machineCode: "SA\u0110.1.26017.0672111", procedureId: "sieu_am", procedureType: "ONE_TO_ONE", startTime: "08:00", endTime: "08:15", status: "SCHEDULED" },
      { id: "S002", date: "2026-08-01", staffId: 1, patientId: "P003", machineCode: "SA\u0110.1.26017.0672111", procedureId: "sieu_am", procedureType: "ONE_TO_ONE", startTime: "08:18", endTime: "08:33", status: "SCHEDULED" },
      { id: "S003", date: "2026-08-01", staffId: 3, patientId: "P004", machineCode: "OCA.1.26017.33HS0575", procedureId: "oxy_cao_ap", procedureType: "ONE_TO_MANY", startTime: "07:41", endTime: "08:41", status: "SCHEDULED" },
      { id: "S004", date: "2026-08-01", staffId: 3, patientId: "P005", machineCode: "OCA.1.26017.33HS0575", procedureId: "oxy_cao_ap", procedureType: "ONE_TO_MANY", startTime: "08:46", endTime: "09:46", status: "SCHEDULED" }
    ],
    auditLogs: [
      { id: "A001", timestamp: (/* @__PURE__ */ new Date()).toISOString(), type: "SYSTEM_INIT", message: "Kh\u1EDFi t\u1EA1o h\u1EC7 th\u1ED1ng MedLab AI Database theo 3 Google Sheets VLTL", oldVal: null, newVal: "INIT" }
    ]
  };
}
function readDB() {
  try {
    if (!import_fs.default.existsSync(DB_FILE)) {
      const db = getDefaultDB();
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
      return db;
    }
    return JSON.parse(import_fs.default.readFileSync(DB_FILE, "utf8"));
  } catch (err) {
    console.error("Error reading DB, returning default:", err);
    return getDefaultDB();
  }
}
function writeDB(data) {
  try {
    data.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing DB:", err);
    return false;
  }
}
function checkCollision(newBlock, existingBlocks) {
  const minBuffer = newBlock.procedureType === "ONE_TO_MANY" ? 5 : 2;
  const toMin = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };
  const start = toMin(newBlock.startTime);
  const end = toMin(newBlock.endTime);
  const collisions = [];
  for (const block of existingBlocks) {
    if (block.id === newBlock.id || block.date !== newBlock.date) continue;
    const sameStaff = block.staffId === Number(newBlock.staffId);
    const sameMachine = newBlock.machineCode && block.machineCode === newBlock.machineCode;
    if (sameStaff || sameMachine) {
      const bStart = toMin(block.startTime);
      const bEnd = toMin(block.endTime);
      const isOverlap = !(end + minBuffer <= bStart || start >= bEnd + minBuffer);
      if (isOverlap) {
        collisions.push({
          type: sameStaff ? "STAFF_COLLISION" : "MACHINE_COLLISION",
          message: `Xung \u0111\u1ED9t ${sameStaff ? "nh\xE2n s\u1EF1" : "thi\u1EBFt b\u1ECB"} (${block.startTime}-${block.endTime}) - Y\xEAu c\u1EA7u \u0111\u1EC7m t\u1ED1i thi\u1EC3u ${minBuffer} ph\xFAt`,
          conflictingBlock: block
        });
      }
    }
  }
  return { valid: collisions.length === 0, collisions, bufferRequired: minBuffer };
}
app.get("/api/status", (req, res) => {
  const db = readDB();
  res.json({
    status: "READY",
    backendBuilt: true,
    version: db.version,
    lastUpdated: db.lastUpdated,
    modules: {
      staffManagement: { active: true, count: db.staff.length },
      patientManagement: { active: true, count: db.patients.length },
      machineManagement: { active: true, count: db.machines.length },
      scheduleMatrix: { active: true, count: db.schedules.length },
      antiCollisionEngine: { active: true, rules: "1:1 (2 min buffer) | 1-Many (5 min buffer)" },
      auditLogChain: { active: true, count: db.auditLogs.length }
    }
  });
});
app.get("/api/staff", (req, res) => {
  const db = readDB();
  res.json(db.staff);
});
app.post("/api/staff/transfer", (req, res) => {
  const { oldStaffId, newStaffId, date, reason } = req.body;
  const db = readDB();
  const oldStaff = db.staff.find((s) => s.id === Number(oldStaffId));
  const newStaff = db.staff.find((s) => s.id === Number(newStaffId));
  if (!oldStaff || !newStaff) {
    return res.status(400).json({ error: "Nh\xE2n s\u1EF1 kh\xF4ng t\u1ED3n t\u1EA1i" });
  }
  let transferredCount = 0;
  db.schedules.forEach((block) => {
    if (block.staffId === Number(oldStaffId) && (!date || block.date === date)) {
      block.staffId = Number(newStaffId);
      transferredCount++;
    }
  });
  db.auditLogs.push({
    id: `A_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "STAFF_TRANSFER",
    message: `Chuy\u1EC3n nh\u01B0\u1EE3ng ${transferredCount} th\u1EE7 thu\u1EADt t\u1EEB ${oldStaff.fullName} sang ${newStaff.fullName}`,
    oldVal: { staffId: oldStaffId, name: oldStaff.fullName },
    newVal: { staffId: newStaffId, name: newStaff.fullName, transferredCount, reason }
  });
  writeDB(db);
  res.json({ success: true, transferredCount, newStaff });
});
app.get("/api/patients", (req, res) => {
  const db = readDB();
  res.json(db.patients);
});
app.post("/api/patients/:id/stop-treatment", (req, res) => {
  const { id } = req.params;
  const { stopDate, reason } = req.body;
  const db = readDB();
  const patient = db.patients.find((p) => p.id === id || p.fullName === id);
  if (!patient) {
    return res.status(404).json({ error: "B\u1EC7nh nh\xE2n kh\xF4ng t\u1ED3n t\u1EA1i" });
  }
  patient.status = "STOPPED";
  patient.stoppedDate = stopDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let freedBlocks = 0;
  db.schedules = db.schedules.map((block) => {
    if (block.patientId === patient.id) {
      freedBlocks++;
      return { ...block, status: "AVAILABLE", patientId: null };
    }
    return block;
  });
  db.auditLogs.push({
    id: `A_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "PATIENT_STOPPED",
    message: `B\u1EC7nh nh\xE2n ${patient.fullName} ng\u1EEBng \u0111i\u1EC1u tr\u1ECB. \u0110\xE3 gi\u1EA3i ph\xF3ng ${freedBlocks} block v\u1EC1 tr\u1EA1ng th\xE1i AVAILABLE.`,
    oldVal: { status: "ACTIVE" },
    newVal: { status: "STOPPED", freedBlocks, reason }
  });
  writeDB(db);
  res.json({ success: true, freedBlocks, patient });
});
app.get("/api/machines", (req, res) => {
  const db = readDB();
  res.json(db.machines);
});
app.get("/api/schedules", (req, res) => {
  const { date } = req.query;
  const db = readDB();
  const filtered = date ? db.schedules.filter((s) => s.date === date) : db.schedules;
  res.json(filtered);
});
app.post("/api/validate-collision", (req, res) => {
  const newBlock = req.body;
  const db = readDB();
  const check = checkCollision(newBlock, db.schedules);
  res.json(check);
});
app.post("/api/schedules", (req, res) => {
  const newBlock = req.body;
  const db = readDB();
  const check = checkCollision(newBlock, db.schedules);
  if (!check.valid) {
    return res.status(409).json({
      error: "Ph\xE1t hi\u1EC7n xung \u0111\u1ED9t l\u1ECBch / vi ph\u1EA1m \u0111\u1EC7m BHYT",
      collisions: check.collisions
    });
  }
  newBlock.id = newBlock.id || `S_${Date.now()}`;
  newBlock.status = newBlock.status || "SCHEDULED";
  db.schedules.push(newBlock);
  db.auditLogs.push({
    id: `A_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "SCHEDULE_CREATED",
    message: `\u0110\xE3 \u0111\u1EB7t l\u1ECBch ${newBlock.procedureId} cho b\u1EC7nh nh\xE2n ${newBlock.patientId}`,
    oldVal: null,
    newVal: newBlock
  });
  writeDB(db);
  res.status(201).json({ success: true, schedule: newBlock });
});
app.get("/api/audit-logs", (req, res) => {
  const db = readDB();
  res.json(db.auditLogs);
});
app.get("/api/db", (req, res) => {
  const db = readDB();
  res.json({
    staff: db.staff || [],
    patients: db.patients || [],
    machines: db.machines || [],
    schedules: db.schedules || [],
    auditLogs: db.auditLogs || []
  });
});
app.post("/api/db/sync", (req, res) => {
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
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.includes(".") && req.path !== "/" && !req.path.startsWith("/api")) {
    const htmlPath = import_path.default.join(__dirname, `${req.path}.html`);
    if (import_fs.default.existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }
  }
  next();
});
async function startApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = __dirname;
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      const requestedPath = import_path.default.join(distPath, req.path);
      if (import_fs.default.existsSync(requestedPath) && !requestedPath.endsWith(".cjs")) {
        res.sendFile(requestedPath);
      } else {
        res.sendFile(import_path.default.join(distPath, "index.html"));
      }
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u2705 MedLab AI server & REST API running at http://0.0.0.0:${PORT}`);
  });
}
var server_default = app;
if (!process.env.VERCEL) {
  startApp();
}
//# sourceMappingURL=index.cjs.map
