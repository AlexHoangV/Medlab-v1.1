/* ═══════════════════════════════════════════════
   MED LAB — CENTRAL DATA STORE
   Nguồn: 3 Google Sheets thực tế của khoa VLTL
   ═══════════════════════════════════════════════ */

/* ── PROCEDURE TYPE RULES ── */
const PROCEDURE_RULES = {
  ONE_TO_ONE:  { bufferMin: 2,  label: 'Thủ thuật 1:1',    color: '#3B82F6' },
  ONE_TO_MANY: { bufferMin: 5,  label: 'Thủ thuật 1-Nhiều', color: '#8B5CF6' },
};

/* ── PROCEDURE DICTIONARY (minutes + type) per TT 43/2013/TT-BYT ── */
const PROCEDURE_DICT = [
  { id:'xoa_bop',      name:'Xoa bóp',                       durationMin:20, type:'ONE_TO_ONE',  machineRequired:false },
  { id:'tap_vd',       name:'Tập vận động',                  durationMin:20, type:'ONE_TO_ONE',  machineRequired:false },
  { id:'sieu_am',      name:'Siêu âm điều trị',              durationMin:15, type:'ONE_TO_ONE',  machineRequired:true  },
  { id:'ngon_ngu',     name:'Tập ngôn ngữ',                  durationMin:20, type:'ONE_TO_ONE',  machineRequired:false },
  { id:'dien_cham',    name:'Điện châm',                      durationMin:20, type:'ONE_TO_MANY', machineRequired:true  },
  { id:'thuy_cham',    name:'Thủy châm',                     durationMin:20, type:'ONE_TO_MANY', machineRequired:true  },
  { id:'parafin',      name:'Đắp Parafin / nến',             durationMin:20, type:'ONE_TO_MANY', machineRequired:false },
  { id:'hong_ngoai',   name:'Chiếu hồng ngoại',              durationMin:15, type:'ONE_TO_MANY', machineRequired:true  },
  { id:'dien_xung',    name:'Điện xung',                     durationMin:20, type:'ONE_TO_MANY', machineRequired:true  },
  { id:'dien_phan',    name:'Điện phân dẫn thuốc',           durationMin:20, type:'ONE_TO_MANY', machineRequired:true  },
  { id:'dien_truong',  name:'Điện trường cao áp',            durationMin:20, type:'ONE_TO_MANY', machineRequired:true  },
  { id:'laser_noi_mach',name:'Laser nội mạch',               durationMin:45, type:'ONE_TO_MANY', machineRequired:true  },
  { id:'dien_tu_truong',name:'Điện từ trường',               durationMin:20, type:'ONE_TO_MANY', machineRequired:true  },
  { id:'song_ngan',    name:'Sóng ngắn',                     durationMin:20, type:'ONE_TO_MANY', machineRequired:true  },
  { id:'keo_gian',     name:'Kéo giãn cột sống',             durationMin:20, type:'ONE_TO_ONE',  machineRequired:true  },
  { id:'oxy_cao_ap',   name:'Oxy cao áp',                    durationMin:60, type:'ONE_TO_ONE',  machineRequired:true  },
  { id:'laser_chieu',  name:'Laser chiếu ngoài',             durationMin:20, type:'ONE_TO_MANY', machineRequired:true  },
  { id:'xb_vung',      name:'Xoa bóp vùng',                  durationMin:15, type:'ONE_TO_ONE',  machineRequired:false },
];

/* ── STAFF (8 KTV/BS/ĐD thực tế từ Sheet 2) ── */
const STAFF_DB = [
  { id:1, fullName:'Liễu',      shortName:'LIỄU',      role:'TECHNICIAN', specialty:'Xoa bóp vùng',    isActive:true,  color:'#3B82F6', initials:'LI' },
  { id:2, fullName:'Thu Hằng',  shortName:'THU HẰNG',  role:'TECHNICIAN', specialty:'Xoa bóp vùng',    isActive:true,  color:'#8B5CF6', initials:'TH' },
  { id:3, fullName:'Thạch',     shortName:'THẠCH',     role:'TECHNICIAN', specialty:'Tập vận động',     isActive:true,  color:'#059669', initials:'TH2'},
  { id:4, fullName:'Tâm',       shortName:'TÂM',       role:'TECHNICIAN', specialty:'Tập vận động',     isActive:true,  color:'#D97706', initials:'TM' },
  { id:5, fullName:'Nhân',      shortName:'NHÂN',      role:'TECHNICIAN', specialty:'Tập vận động',     isActive:true,  color:'#DC2626', initials:'NH' },
  { id:6, fullName:'Tâm (SA)',  shortName:'TÂM SA',    role:'TECHNICIAN', specialty:'Siêu âm SAD02',    isActive:true,  color:'#0891B2', initials:'TS' },
  { id:7, fullName:'Như',       shortName:'NHƯ',       role:'TECHNICIAN', specialty:'Xoa bóp',          isActive:true,  color:'#7C3AED', initials:'NH2'},
  { id:8, fullName:'Như (NN)',  shortName:'NHƯ NN',    role:'TECHNICIAN', specialty:'Tập ngôn ngữ',     isActive:true,  color:'#BE185D', initials:'NN' },
  { id:9, fullName:'BS. Nguyễn Văn A', shortName:'BS.VAN A', role:'DOCTOR', specialty:'Điện châm',     isActive:true,  color:'#1D4ED8', initials:'VA' },
  { id:10,fullName:'BS. Trần K.',shortName:'BS.TRANK', role:'DOCTOR',     specialty:'Thủy châm',        isActive:true,  color:'#065F46', initials:'TK' },
];

/* ── MACHINES (63 thiết bị thực tế từ Sheet 3 — cột F) ── */
const MACHINES_DB = [
  // ── Hồng ngoại
  { id:1,  stt:1,  tenTB:'Đèn hồng ngoại',          kyHieu:'YK12',        maDVKT:'1.700.110.237', tenDVKT:'Điều trị bằng hồng ngoại',           maMay:'HN.1.26017.HN1',                    khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['hong_ngoai'] },
  { id:2,  stt:4,  tenTB:'Đèn hồng ngoại để bàn',   kyHieu:'YK12V',       maDVKT:'1.700.110.237', tenDVKT:'Điều trị bằng hồng ngoại',           maMay:'HN.1.26017.HN1',                    khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['hong_ngoai'] },
  // ── Điện châm
  { id:3,  stt:7,  tenTB:'Máy châm cứu 6 kênh',     kyHieu:'ES-160',      maDVKT:'800.050.230',   tenDVKT:'Điều trị bằng điện châm',            maMay:'CC6.1.26017.Seebarcodeseal.1',      khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_cham'] },
  { id:4,  stt:8,  tenTB:'Máy điện châm KWD-808I',  kyHieu:'KWD-808I',    maDVKT:'800.050.230',   tenDVKT:'Điều trị bằng điện châm',            maMay:'CC.1.26017.1603-0603',              khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_cham'] },
  { id:5,  stt:9,  tenTB:'Máy điện châm KWD-808I',  kyHieu:'KWD-808I',    maDVKT:'800.050.230',   tenDVKT:'Điều trị bằng điện châm',            maMay:'CC.1.26017.1603-0612',              khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_cham'] },
  { id:6,  stt:13, tenTB:'Máy điện châm SDZ-II',    kyHieu:'SDZ-II',      maDVKT:'800.050.230',   tenDVKT:'Điều trị bằng điện châm',            maMay:'CC.1.26017.D002G256000596W',        khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_cham'] },
  { id:7,  stt:14, tenTB:'Máy điện châm SDZ-II',    kyHieu:'SDZ-II',      maDVKT:'800.050.230',   tenDVKT:'Điều trị bằng điện châm',            maMay:'CC.1.26017.D002G256000068W',        khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_cham'] },
  { id:8,  stt:15, tenTB:'Máy điện châm SDZ-II',    kyHieu:'SDZ-II',      maDVKT:'800.050.230',   tenDVKT:'Điều trị bằng điện châm',            maMay:'CC.1.26017.D002G256000598W',        khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_cham'] },
  { id:9,  stt:18, tenTB:'Máy laser châm 12 đầu',   kyHieu:'Mini-630',    maDVKT:'800.110.243',   tenDVKT:'Điều trị bằng laser châm',           maMay:'LCC.1.26017.CC-16421',              khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_cham'] },
  // ── Điện trường cao áp
  { id:10, stt:22, tenTB:'Máy điện trường cao áp',  kyHieu:'Bios-9000',   maDVKT:'1.700.270.232', tenDVKT:'Điều trị bằng điện trường cao áp',   maMay:'ĐTC.1.26017.32700324T',             khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_truong'] },
  // ── Điện phân
  { id:11, stt:20, tenTB:'Máy điện phân',           kyHieu:'IONO BASE+',  maDVKT:'1.700.060.231', tenDVKT:'Điều trị bằng điện phân dẫn thuốc', maMay:'ĐPT.1.26017.',                      khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_phan'] },
  { id:12, stt:29, tenTB:'Máy điều trị điện xung',  kyHieu:'Therapic 2000',maDVKT:'1.700.060.231',tenDVKT:'Điều trị bằng điện phân dẫn thuốc', maMay:'ĐTX.1.26017.EM02090220',            khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_phan','dien_xung'] },
  // ── Điện từ trường
  { id:13, stt:28, tenTB:'Máy điện từ trường',      kyHieu:'SYNERGY',     maDVKT:'1.700.040.232', tenDVKT:'Điều trị bằng điện từ trường',       maMay:'ĐTT.1.26017.144',                   khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_tu_truong'] },
  { id:14, stt:26, tenTB:'Giường từ trường toàn thân',kyHieu:'MAG-Expert', maDVKT:'1.700.040.233', tenDVKT:'Điều trị bằng điện từ trường',       maMay:'GTT.1.26017.1103205',               khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_tu_truong'] },
  // ── Oxy cao áp
  { id:15, stt:31, tenTB:'Máy oxy cao áp 3300H',    kyHieu:'3300H',       maDVKT:'300.591.116',   tenDVKT:'Điều trị bằng oxy cao áp',           maMay:'OCA.1.26017.33HS0575',              khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['oxy_cao_ap'] },
  { id:16, stt:32, tenTB:'Máy oxy cao áp Foryou',   kyHieu:'Foryou',      maDVKT:'300.591.116',   tenDVKT:'Điều trị bằng oxy cao áp',           maMay:'OCA.1.26017.F05071',                khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['oxy_cao_ap'] },
  { id:17, stt:33, tenTB:'Máy oxy cao áp F08051',   kyHieu:'FO5076',      maDVKT:'300.591.116',   tenDVKT:'Điều trị bằng oxy cao áp',           maMay:'OCA.1.26017.F08051',                khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['oxy_cao_ap'] },
  // ── Siêu âm
  { id:18, stt:34, tenTB:'Máy siêu âm US-101L',     kyHieu:'US-101L',     maDVKT:'1.700.080.253', tenDVKT:'Điều trị bằng siêu âm',              maMay:'ĐTS.1.26017.SA101L',                khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['sieu_am'] },
  { id:19, stt:47, tenTB:'Máy siêu âm Physioson',   kyHieu:'Physioson',   maDVKT:'1.700.080.253', tenDVKT:'Điều trị bằng siêu âm',              maMay:'SAĐ.1.26017.0672111',               khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['sieu_am'] },
  { id:20, stt:41, tenTB:'Máy kích thích liền xương',kyHieu:'OSTEOTRON IV',maDVKT:'1.700.080.253', tenDVKT:'Điều trị bằng siêu âm',              maMay:'KTX.1.26017.Seebarcodeseal.6',      khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['sieu_am'] },
  { id:21, stt:35, tenTB:'Máy siêu âm đa tần US-751',kyHieu:'US-751',     maDVKT:'1.700.080.253', tenDVKT:'Điều trị bằng siêu âm',              maMay:'ĐTS.1.26017.Seebarcodeseal.5',      khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['sieu_am'] },
  // ── Kéo giãn
  { id:22, stt:39, tenTB:'Máy kéo giãn cột sống',   kyHieu:'Elkeine-IIIR',maDVKT:'1.700.260.220', tenDVKT:'Điều trị bằng máy kéo giãn',         maMay:'KG.1.26017.0000860568',             khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['keo_gian'] },
  // ── Laser nội mạch
  { id:23, stt:42, tenTB:'Máy laser nội mạch KX350',kyHieu:'KX350-1B',    maDVKT:'1.700.120.243', tenDVKT:'Laser nội mạch',                     maMay:'LNM.1.26017.05101009',              khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['laser_noi_mach'] },
  { id:24, stt:43, tenTB:'Máy laser nội mạch GX1000',kyHieu:'GX1000',     maDVKT:'1.700.120.243', tenDVKT:'Laser nội mạch',                     maMay:'LNM.1.26017.2015650009',            khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['laser_noi_mach'] },
  { id:25, stt:44, tenTB:'Máy Laser trị liệu',       kyHieu:'Lambda',      maDVKT:'1.700.120.243', tenDVKT:'Laser chiếu ngoài',                  maMay:'LĐT.1.26017.0294463',               khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['laser_chieu'] },
  // ── Sóng ngắn / vi sóng
  { id:26, stt:48, tenTB:'Máy sóng ngắn DX 500',    kyHieu:'DX 500',      maDVKT:'1.700.010.254', tenDVKT:'Điều trị bằng sóng ngắn',            maMay:'SN.1.26017.1924',                   khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['song_ngan'] },
  { id:27, stt:36, tenTB:'Máy điều trị vi sóng',    kyHieu:'ENDOSAN',     maDVKT:'1.700.010.254', tenDVKT:'Điều trị bằng vi sóng',              maMay:'VS.1.26017.131',                    khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['song_ngan'] },
  // ── Điện xung
  { id:28, stt:23, tenTB:'Máy điện xung PME',        kyHieu:'PME 2-0668111gb',maDVKT:'1.700.070.234',tenDVKT:'Điều trị bằng dòng điện xung',    maMay:'ĐX.1.26017.0504802',                khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_xung'] },
  { id:29, stt:25, tenTB:'Máy điện xung giác hút',  kyHieu:'BM-420',      maDVKT:'1.700.070.237', tenDVKT:'Điều trị bằng dòng điện xung',       maMay:'ĐXG.1.26017.004273',                khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_xung'] },
  { id:30, stt:50, tenTB:'Máy VLTL Doctor Home DH16',kyHieu:'DH16',        maDVKT:'1.700.070.234', tenDVKT:'Điều trị bằng dòng điện xung',       maMay:'D16.1.26017.AA0024',                khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_xung'] },
  { id:31, stt:51, tenTB:'Máy VLTL DH14 (AA026)',   kyHieu:'DH14',        maDVKT:'1.700.070.234', tenDVKT:'Điều trị bằng dòng điện xung',       maMay:'D14.1.26017.AA026',                 khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_xung'] },
  { id:32, stt:52, tenTB:'Máy VLTL DH14 (AD0992)',  kyHieu:'DH14',        maDVKT:'1.700.070.234', tenDVKT:'Điều trị bằng dòng điện xung',       maMay:'D14.1.26017.AD0992',                khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_xung'] },
  { id:33, stt:53, tenTB:'Máy VLTL DH14 (BB252)',   kyHieu:'DH14',        maDVKT:'1.700.070.234', tenDVKT:'Điều trị bằng dòng điện xung',       maMay:'D14.1.26017.BB252',                 khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_xung'] },
  { id:34, stt:54, tenTB:'Máy VLTL DH14 (BB250)',   kyHieu:'DH14',        maDVKT:'1.700.070.235', tenDVKT:'Điều trị bằng dòng điện xung',       maMay:'D14.1.26017.BB250',                 khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['dien_xung'] },
  // ── Parafin
  { id:35, stt:59, tenTB:'Tủ sấy parafin',          kyHieu:'TB0015',      maDVKT:'1.700.180.221', tenDVKT:'Điều trị bằng Parafin',              maMay:'TSP.1.26017.TSP1',                  khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['parafin'] },
  // ── Xoa bóp máy
  { id:36, stt:45, tenTB:'Máy nén ép trị liệu DL',  kyHieu:'DL2003V3',    maDVKT:'1.701.680.281', tenDVKT:'Kỹ thuật xoa bóp bằng máy',          maMay:'NTL.1.26017.1405316',               khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['xoa_bop'] },
  { id:37, stt:21, tenTB:'Máy điện rung massage',   kyHieu:'VR-7N',       maDVKT:'1.701.680.281', tenDVKT:'Kỹ thuật xoa bóp bằng máy',          maMay:'ĐR.1.26017.VR-7N',                  khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['xoa_bop'] },
  // ── Xe đạp tập
  { id:38, stt:60, tenTB:'Xe đạp tập BK-5806',      kyHieu:'BK-5806',     maDVKT:'1.700.710.270', tenDVKT:'Tập với xe tập',                     maMay:'XĐ.3.26017.X3',                     khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['tap_vd'] },
  { id:39, stt:61, tenTB:'Xe đạp tập X17',          kyHieu:'MN-XDL0001',  maDVKT:'1.700.710.271', tenDVKT:'Tập với xe tập',                     maMay:'XĐ.1.26017.X17',                    khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['tap_vd'] },
  { id:40, stt:62, tenTB:'Xe đạp tập X18',          kyHieu:'MN-XDL0001',  maDVKT:'1.700.710.272', tenDVKT:'Tập với xe tập',                     maMay:'XĐ.1.26017.X18',                    khoaSD:'VLTL', status:'ACTIVE',  procedureIds:['tap_vd'] },
  { id:41, stt:63, tenTB:'Xe đạp tập (hỏng)',       kyHieu:'—',           maDVKT:'1.700.710.273', tenDVKT:'Tập với xe tập',                     maMay:'',                                  khoaSD:'VLTL', status:'MAINTENANCE', procedureIds:['tap_vd'] },
  // ── Kéo giãn bổ sung
  { id:42, stt:27, tenTB:'Máy điều trị cơ sàn chậu',kyHieu:'P12',         maDVKT:'',              tenDVKT:'',                                    maMay:'CSC.1.26017.050498251204007',       khoaSD:'VLTL', status:'ACTIVE',  procedureIds:[] },
  // ── Bồn sục
  { id:43, stt:55, tenTB:'Bồn sục chân Beurrer',    kyHieu:'Beurrer',     maDVKT:'302.850.249',   tenDVKT:'Ngâm thuốc y học cổ truyền bộ phận', maMay:'Beurrer FB50',                      khoaSD:'VLTL', status:'ACTIVE',  procedureIds:[] },
  { id:44, stt:57, tenTB:'Bồn sục chân PC1301',     kyHieu:'PC1301',      maDVKT:'302.850.251',   tenDVKT:'Ngâm thuốc y học cổ truyền bộ phận', maMay:'PC1301 LAICA',                      khoaSD:'VLTL', status:'ACTIVE',  procedureIds:[] },
  // ── Sóng xung kích
  { id:45, stt:49, tenTB:'Máy sóng xung kích',      kyHieu:'HCSWT',       maDVKT:'1.700.090.255', tenDVKT:'Điều trị bằng sóng xung kích',       maMay:'SXK.1.26017.379',                   khoaSD:'VLTL', status:'ACTIVE',  procedureIds:[] },
  // ── Khí dung
  { id:46, stt:40, tenTB:'Máy khí dung',            kyHieu:'Narita',      maDVKT:'1.502.220.898', tenDVKT:'Khí dung mũi họng',                  maMay:'KD.1.26017.160400593',              khoaSD:'VLTL', status:'ACTIVE',  procedureIds:[] },
];

/* ── PATIENTS (từ Sheet 2 – format: Tên + ngày + mã viện) ── */
const PATIENTS_DB = [
  { id:1,  fullName:'Phương',     pid:'BN-001', admitDate:'2026-07-06', dischargeDate:null, isActive:true,  note:'Tập vận động' },
  { id:2,  fullName:'Phượng',     pid:'BN-002', admitDate:'2026-07-06', dischargeDate:null, isActive:true,  note:'Tập vận động' },
  { id:3,  fullName:'Phú',        pid:'BN-003', admitDate:'2026-07-01', dischargeDate:null, isActive:true,  note:'tùng – Tập VĐ' },
  { id:4,  fullName:'Lĩnh',       pid:'BN-004', admitDate:'2026-07-13', dischargeDate:null, isActive:true,  note:'-B' },
  { id:5,  fullName:'Chê',        pid:'BN-005', admitDate:'2026-06-26', dischargeDate:null, isActive:true,  note:'tùng' },
  { id:6,  fullName:'Lý',         pid:'BN-006', admitDate:'2026-07-10', dischargeDate:null, isActive:true,  note:'Tập VĐ' },
  { id:7,  fullName:'Thành',      pid:'BN-007', admitDate:'2026-07-13', dischargeDate:null, isActive:true,  note:'-B' },
  { id:8,  fullName:'Tít',        pid:'BN-008', admitDate:'2026-07-10', dischargeDate:null, isActive:true,  note:'Tập VĐ' },
  { id:9,  fullName:'Triều',      pid:'BN-009', admitDate:'2026-07-10', dischargeDate:null, isActive:true,  note:'' },
  { id:10, fullName:'Thanh Minh', pid:'BN-010', admitDate:'2026-07-10', dischargeDate:null, isActive:true,  note:'đ.h' },
  { id:11, fullName:'Nguyễn Thủy',pid:'BN-011', admitDate:'2026-07-01', dischargeDate:null, isActive:true,  note:'tùng' },
  { id:12, fullName:'Hồng Đào',   pid:'BN-012', admitDate:'2026-07-10', dischargeDate:null, isActive:true,  note:'đ.h' },
  { id:13, fullName:'Tâm BN',     pid:'BN-013', admitDate:'2026-07-10', dischargeDate:null, isActive:true,  note:'đ.h' },
  { id:14, fullName:'Nang',       pid:'BN-014', admitDate:'2026-07-10', dischargeDate:null, isActive:true,  note:'' },
  { id:15, fullName:'Tùng',       pid:'BN-015', admitDate:'2026-07-10', dischargeDate:null, isActive:true,  note:'' },
  { id:16, fullName:'Hiếu',       pid:'BN-016', admitDate:'2026-07-10', dischargeDate:null, isActive:true,  note:'đ.h' },
  { id:17, fullName:'Bài',        pid:'BN-017', admitDate:'2026-07-08', dischargeDate:null, isActive:true,  note:'' },
  { id:18, fullName:'Thủy',       pid:'BN-018', admitDate:'2026-07-10', dischargeDate:null, isActive:true,  note:'đ.h' },
  { id:19, fullName:'Đào',        pid:'BN-019', admitDate:'2026-07-10', dischargeDate:null, isActive:true,  note:'đ.h' },
  { id:20, fullName:'Thân',       pid:'BN-020', admitDate:'2026-07-22', dischargeDate:null, isActive:true,  note:'OCA – tùng' },
  { id:21, fullName:'Thiết',      pid:'BN-021', admitDate:'2026-07-21', dischargeDate:null, isActive:true,  note:'OCA' },
  { id:22, fullName:'Đồng',       pid:'BN-022', admitDate:'2026-07-26', dischargeDate:null, isActive:true,  note:'OCA' },
  { id:23, fullName:'Oanh',       pid:'BN-023', admitDate:'2026-07-28', dischargeDate:null, isActive:true,  note:'OCA chiều' },
];

/* ── PROCEDURE SCHEDULES (seed từ Sheet 1 + Sheet 2) ── */
const SCHEDULES_DB = [
  // Oxy cao áp – Máy F08051
  { id:1,  date:'2026-07-25', start:'07:41', end:'08:41', procedureId:'oxy_cao_ap', staffId:9,  patientId:20, machineId:17, type:'ONE_TO_ONE',  status:'BOOKED' },
  { id:2,  date:'2026-07-25', start:'08:46', end:'09:46', procedureId:'oxy_cao_ap', staffId:9,  patientId:21, machineId:17, type:'ONE_TO_ONE',  status:'BOOKED' },
  { id:3,  date:'2026-07-25', start:'09:51', end:'10:51', procedureId:'oxy_cao_ap', staffId:9,  patientId:22, machineId:17, type:'ONE_TO_ONE',  status:'BOOKED' },
  { id:4,  date:'2026-07-25', start:'10:56', end:'11:56', procedureId:'oxy_cao_ap', staffId:9,  patientId:14, machineId:17, type:'ONE_TO_ONE',  status:'BOOKED' },
  { id:5,  date:'2026-07-25', start:'13:11', end:'14:11', procedureId:'oxy_cao_ap', staffId:10, patientId:23, machineId:17, type:'ONE_TO_ONE',  status:'BOOKED' },
  // Xoa bóp vùng – LIỄU (sáng)
  { id:6,  date:'2026-07-25', start:'08:20', end:'08:35', procedureId:'xb_vung', staffId:1,  patientId:3,  machineId:null, type:'ONE_TO_ONE', status:'BOOKED' },
  { id:7,  date:'2026-07-25', start:'08:40', end:'08:55', procedureId:'xb_vung', staffId:1,  patientId:4,  machineId:null, type:'ONE_TO_ONE', status:'BOOKED' },
  // Tập vận động – THẠCH
  { id:8,  date:'2026-07-25', start:'07:40', end:'07:55', procedureId:'tap_vd', staffId:3,  patientId:2,  machineId:null, type:'ONE_TO_ONE', status:'BOOKED' },
  { id:9,  date:'2026-07-25', start:'08:00', end:'08:15', procedureId:'tap_vd', staffId:3,  patientId:5,  machineId:null, type:'ONE_TO_ONE', status:'BOOKED' },
  // Tập vận động – NHÂN
  { id:10, date:'2026-07-25', start:'07:40', end:'07:55', procedureId:'tap_vd', staffId:5,  patientId:1,  machineId:null, type:'ONE_TO_ONE', status:'BOOKED' },
  { id:11, date:'2026-07-25', start:'08:00', end:'08:15', procedureId:'tap_vd', staffId:5,  patientId:6,  machineId:null, type:'ONE_TO_ONE', status:'BOOKED' },
  // Siêu âm – TÂM (chiều)
  { id:12, date:'2026-07-25', start:'13:00', end:'13:15', procedureId:'sieu_am', staffId:6,  patientId:9,  machineId:19, type:'ONE_TO_ONE', status:'BOOKED' },
  { id:13, date:'2026-07-25', start:'13:20', end:'13:35', procedureId:'sieu_am', staffId:6,  patientId:10, machineId:19, type:'ONE_TO_ONE', status:'BOOKED' },
];

/* ── AUDIT LOG ── */
const AUDIT_LOG = [];

/* ── HELPERS ── */
function getStaff(id) { return STAFF_DB.find(s => s.id === id); }
function getMachine(id) { return MACHINES_DB.find(m => m.id === id); }
function getPatient(id) { return PATIENTS_DB.find(p => p.id === id); }
function getProcedure(id) { return PROCEDURE_DICT.find(p => p.id === id); }

function addAuditLog(action, oldStaffId, newStaffId, scheduleId, note='') {
  AUDIT_LOG.push({ ts: new Date().toISOString(), action, oldStaffId, newStaffId, scheduleId, note });
}

function toMinutes(t) {
  if (!t || typeof t !== 'string' || !t.includes(':')) return 0;
  const [h,m] = t.split(':').map(Number);
  return (isNaN(h)?0:h)*60 + (isNaN(m)?0:m);
}
function addMin(t, min) {
  let m = toMinutes(t) + min;
  return `${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
}

/* Save to localStorage and Backend Server (medlab_db.json) for full persistence across pages */
function persistData() {
  try {
    localStorage.setItem('medlab_staff',     JSON.stringify(STAFF_DB));
    localStorage.setItem('medlab_patients',  JSON.stringify(PATIENTS_DB));
    localStorage.setItem('medlab_machines',  JSON.stringify(MACHINES_DB));
    localStorage.setItem('medlab_schedules', JSON.stringify(SCHEDULES_DB));
    localStorage.setItem('medlab_audit',     JSON.stringify(AUDIT_LOG));
    // Also dispatch custom event so open views can re-render immediately
    window.dispatchEvent(new CustomEvent('medlab_data_updated'));

    // Sync permanently to backend REST API (medlab_db.json)
    fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staff: STAFF_DB,
        patients: PATIENTS_DB,
        machines: MACHINES_DB,
        schedules: SCHEDULES_DB,
        auditLogs: AUDIT_LOG
      })
    }).catch(err => console.error('Backend sync failed:', err));
  } catch (e) {
    console.error('Error saving persistData:', e);
  }
}

function loadPersistedData() {
  try {
    const s = localStorage.getItem('medlab_staff');
    if (s) {
      const d = JSON.parse(s);
      STAFF_DB.length = 0;
      STAFF_DB.push(...d);
    }
    const p = localStorage.getItem('medlab_patients');
    if (p) {
      const d = JSON.parse(p);
      PATIENTS_DB.length = 0;
      PATIENTS_DB.push(...d);
    }
    const m = localStorage.getItem('medlab_machines');
    if (m) {
      const d = JSON.parse(m);
      MACHINES_DB.length = 0;
      MACHINES_DB.push(...d);
    }
    const sc = localStorage.getItem('medlab_schedules');
    if (sc) {
      const d = JSON.parse(sc);
      SCHEDULES_DB.length = 0;
      SCHEDULES_DB.push(...d);
    }
    const au = localStorage.getItem('medlab_audit');
    if (au) {
      const d = JSON.parse(au);
      AUDIT_LOG.length = 0;
      AUDIT_LOG.push(...d);
    }
  } catch(e) {
    console.error('Error loading localStorage:', e);
  }

  // Fetch authoritative persistent database from Backend REST API (medlab_db.json)
  fetch('/api/db')
    .then(res => res.json())
    .then(db => {
      let updated = false;
      if (db.staff && db.staff.length > 0 && JSON.stringify(db.staff) !== JSON.stringify(STAFF_DB)) {
        STAFF_DB.length = 0;
        STAFF_DB.push(...db.staff);
        updated = true;
      }
      if (db.patients && db.patients.length > 0 && JSON.stringify(db.patients) !== JSON.stringify(PATIENTS_DB)) {
        PATIENTS_DB.length = 0;
        PATIENTS_DB.push(...db.patients);
        updated = true;
      }
      if (db.machines && db.machines.length > 0 && JSON.stringify(db.machines) !== JSON.stringify(MACHINES_DB)) {
        MACHINES_DB.length = 0;
        MACHINES_DB.push(...db.machines);
        updated = true;
      }
      if (db.schedules && db.schedules.length > 0 && JSON.stringify(db.schedules) !== JSON.stringify(SCHEDULES_DB)) {
        SCHEDULES_DB.length = 0;
        SCHEDULES_DB.push(...db.schedules);
        updated = true;
      }
      if (db.auditLogs && db.auditLogs.length > 0 && JSON.stringify(db.auditLogs) !== JSON.stringify(AUDIT_LOG)) {
        AUDIT_LOG.length = 0;
        AUDIT_LOG.push(...db.auditLogs);
        updated = true;
      }
      if (updated) {
        localStorage.setItem('medlab_staff',     JSON.stringify(STAFF_DB));
        localStorage.setItem('medlab_patients',  JSON.stringify(PATIENTS_DB));
        localStorage.setItem('medlab_machines',  JSON.stringify(MACHINES_DB));
        localStorage.setItem('medlab_schedules', JSON.stringify(SCHEDULES_DB));
        localStorage.setItem('medlab_audit',     JSON.stringify(AUDIT_LOG));
        window.dispatchEvent(new CustomEvent('medlab_data_updated'));
      }
    })
    .catch(err => console.error('Failed to sync from backend DB:', err));
}
document.addEventListener('DOMContentLoaded', loadPersistedData);


