import { db } from './database.js';
import fs from 'fs';
import path from 'path';
import { questionService } from '../services/question.service.js';
import { mediaRepository } from '../repositories/media.repository.js';
import { topicRepository } from '../repositories/topic.repository.js';

const UPLOAD_DIR = path.resolve(process.cwd(), 'data/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Helper to write SVG asset to disk
function createSvgAsset(filename: string, svgContent: string): string {
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, svgContent.trim());
  return `/media/${filename}`;
}

export async function seedTechnicalData() {
  console.log('--- Starting Database Seeding ---');

  // Clear existing data safely
  db.exec(`
    DELETE FROM options;
    DELETE FROM questions;
    DELETE FROM media_assets;
    DELETE FROM topics;
    DELETE FROM sqlite_sequence;
  `);

  // 1. Generate Technical SVG Diagrams for High Contrast Display
  const rlcCircuitSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240" width="100%" height="100%">
    <rect width="600" height="240" fill="#0f172a" rx="12"/>
    <style>
      .wire { stroke: #38bdf8; stroke-width: 3; fill: none; stroke-linecap: round; }
      .comp { stroke: #f8fafc; stroke-width: 2.5; fill: none; }
      .txt { fill: #f8fafc; font-family: 'JetBrains Mono', monospace, sans-serif; font-size: 14px; }
      .lbl { fill: #94a3b8; font-family: 'JetBrains Mono', monospace, sans-serif; font-size: 12px; }
      .hilite { fill: #f59e0b; font-weight: bold; }
    </style>
    <!-- Circuit Loop -->
    <path d="M 80 120 L 140 120" class="wire" />
    <circle cx="80" cy="120" r="28" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
    <path d="M 68 120 Q 74 110, 80 120 T 92 120" stroke="#38bdf8" stroke-width="2.5" fill="none"/>
    <text x="80" y="165" text-anchor="middle" class="txt">V(t) = V₀sin(ωt)</text>
    
    <!-- Top Wire & Resistor R -->
    <path d="M 80 92 L 80 50 L 180 50" class="wire" />
    <!-- Resistor Zigzag -->
    <path d="M 180 50 L 190 35 L 205 65 L 220 35 L 235 65 L 250 35 L 265 65 L 275 50 L 310 50" class="comp" />
    <text x="230" y="25" text-anchor="middle" class="txt hilite">R = 50 Ω</text>
    
    <!-- Inductor L -->
    <path d="M 310 50 L 330 50" class="wire" />
    <!-- Coils -->
    <path d="M 330 50 Q 345 30, 360 50 Q 375 30, 390 50 Q 405 30, 420 50 Q 435 30, 450 50" class="comp" stroke="#38bdf8"/>
    <path d="M 450 50 L 480 50" class="wire" />
    <text x="390" y="25" text-anchor="middle" class="txt hilite">L = 200 mH</text>
    
    <!-- Right Wire down & Capacitor C -->
    <path d="M 480 50 L 520 50 L 520 105" class="wire" />
    <!-- Plates -->
    <line x1="495" y1="105" x2="545" y2="105" stroke="#f8fafc" stroke-width="3" />
    <line x1="495" y1="117" x2="545" y2="117" stroke="#f8fafc" stroke-width="3" />
    <text x="560" y="115" class="txt hilite">C = 10 µF</text>
    <path d="M 520 117 L 520 190 L 80 190 L 80 148" class="wire" />
    
    <text x="300" y="215" text-anchor="middle" class="lbl">Hình 1.1: Mạch điện xoay chiều RLC nối tiếp</text>
  </svg>
  `;

  const opAmpSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 250" width="100%" height="100%">
    <rect width="600" height="250" fill="#0f172a" rx="12"/>
    <style>
      .wire { stroke: #38bdf8; stroke-width: 3; fill: none; }
      .comp { stroke: #f8fafc; stroke-width: 2.5; fill: none; }
      .txt { fill: #f8fafc; font-family: 'JetBrains Mono', monospace; font-size: 14px; }
      .hilite { fill: #38bdf8; font-weight: bold; }
    </style>
    <!-- Op-Amp Triangle -->
    <polygon points="300,70 300,190 420,130" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
    <text x="315" y="105" class="txt" font-size="20">−</text>
    <text x="315" y="165" class="txt" font-size="18">+</text>
    <text x="350" y="135" class="txt" font-weight="bold">OP-AMP</text>
    
    <!-- Non-inverting to ground -->
    <path d="M 300 160 L 250 160 L 250 190" class="wire"/>
    <!-- Ground symbol -->
    <line x1="235" y1="190" x2="265" y2="190" stroke="#f8fafc" stroke-width="2.5"/>
    <line x1="240" y1="196" x2="260" y2="196" stroke="#f8fafc" stroke-width="2"/>
    <line x1="245" y1="202" x2="255" y2="202" stroke="#f8fafc" stroke-width="1.5"/>

    <!-- Inverting input & R_in -->
    <path d="M 80 100 L 130 100" class="wire"/>
    <circle cx="75" cy="100" r="4" fill="#38bdf8"/>
    <text x="65" y="90" class="txt hilite">V_in</text>
    <!-- R_in box -->
    <rect x="130" y="88" width="60" height="24" fill="#1e293b" stroke="#f8fafc" stroke-width="2"/>
    <text x="160" y="105" text-anchor="middle" class="txt">R_in</text>
    <path d="M 190 100 L 300 100" class="wire"/>

    <!-- Feedback Resistor R_f -->
    <path d="M 230 100 L 230 40 L 320 40" class="wire"/>
    <circle cx="230" cy="100" r="4" fill="#38bdf8"/>
    <rect x="320" y="28" width="70" height="24" fill="#1e293b" stroke="#f8fafc" stroke-width="2"/>
    <text x="355" y="45" text-anchor="middle" class="txt">R_f = 100k</text>
    <path d="M 390 40 L 460 40 L 460 130" class="wire"/>

    <!-- Output -->
    <path d="M 420 130 L 520 130" class="wire"/>
    <circle cx="460" cy="130" r="4" fill="#38bdf8"/>
    <circle cx="525" cy="130" r="4" fill="#38bdf8"/>
    <text x="535" y="135" class="txt hilite">V_out</text>

    <text x="300" y="235" text-anchor="middle" class="lbl" fill="#94a3b8">Hình 1.2: Mạch khuếch đại đảo sử dụng Op-Amp lý tưởng</text>
  </svg>
  `;

  const bjtSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 260" width="100%" height="100%">
    <rect width="600" height="260" fill="#0f172a" rx="12"/>
    <style>
      .wire { stroke: #38bdf8; stroke-width: 2.5; fill: none; }
      .comp { stroke: #f8fafc; stroke-width: 2; fill: none; }
      .txt { fill: #f8fafc; font-family: 'JetBrains Mono', monospace; font-size: 13px; }
      .lbl { fill: #94a3b8; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
    </style>
    <!-- Vcc Rail -->
    <line x1="100" y1="30" x2="500" y2="30" stroke="#f59e0b" stroke-width="3"/>
    <text x="510" y="35" class="txt" fill="#f59e0b" font-weight="bold">+V_CC = 12V</text>

    <!-- Transistor NPN -->
    <circle cx="330" cy="130" r="32" stroke="#38bdf8" stroke-width="2" fill="#1e293b"/>
    <line x1="315" y1="110" x2="315" y2="150" stroke="#f8fafc" stroke-width="3"/>
    <!-- Collector -->
    <line x1="315" y1="120" x2="340" y2="105" stroke="#f8fafc" stroke-width="2"/>
    <line x1="340" y1="105" x2="340" y2="80" stroke="#38bdf8" stroke-width="2.5"/>
    <!-- Emitter with arrow -->
    <line x1="315" y1="140" x2="340" y2="155" stroke="#f8fafc" stroke-width="2"/>
    <polygon points="340,155 330,150 335,142" fill="#38bdf8"/>
    <line x1="340" y1="155" x2="340" y2="180" stroke="#38bdf8" stroke-width="2.5"/>
    <!-- Base -->
    <line x1="280" y1="130" x2="315" y2="130" stroke="#38bdf8" stroke-width="2.5"/>

    <!-- Resistors -->
    <rect x="325" y="45" width="30" height="35" fill="#1e293b" stroke="#f8fafc" stroke-width="2"/>
    <text x="365" y="65" class="txt">R_C = 2kΩ</text>
    <line x1="340" y1="30" x2="340" y2="45" stroke="#38bdf8" stroke-width="2.5"/>

    <rect x="325" y="180" width="30" height="35" fill="#1e293b" stroke="#f8fafc" stroke-width="2"/>
    <text x="365" y="200" class="txt">R_E = 500Ω</text>
    <line x1="340" y1="215" x2="340" y2="235" stroke="#38bdf8" stroke-width="2.5"/>
    <line x1="325" y1="235" x2="355" y2="235" stroke="#f8fafc" stroke-width="2.5"/>

    <text x="300" y="250" text-anchor="middle" class="lbl">Hình 1.3: Mạch khuếch đại phân cực BJT NPN kiểu phân áp</text>
  </svg>
  `;

  const plcSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200" width="100%" height="100%">
    <rect width="600" height="200" fill="#0f172a" rx="12"/>
    <style>
      .power-rail { stroke: #ef4444; stroke-width: 4; }
      .wire { stroke: #38bdf8; stroke-width: 2.5; fill: none; }
      .txt { fill: #f8fafc; font-family: 'JetBrains Mono', monospace; font-size: 13px; }
      .lbl { fill: #94a3b8; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
    </style>
    <!-- Rails -->
    <line x1="50" y1="20" x2="50" y2="180" class="power-rail" />
    <line x1="550" y1="20" x2="550" y2="180" class="power-rail" stroke="#3b82f6" />
    <text x="30" y="15" class="txt" fill="#ef4444">L1 (+24V)</text>
    <text x="530" y="15" class="txt" fill="#3b82f6">N (0V)</text>

    <!-- Rung 1: Start (NO), Stop (NC), Coil (M1) -->
    <line x1="50" y1="60" x2="140" y2="60" class="wire" />
    <!-- Start Contact NO -->
    <line x1="140" y1="50" x2="140" y2="70" stroke="#f8fafc" stroke-width="3"/>
    <line x1="155" y1="50" x2="155" y2="70" stroke="#f8fafc" stroke-width="3"/>
    <text x="148" y="40" text-anchor="middle" class="txt">I0.0 (Start)</text>
    <line x1="155" y1="60" x2="260" y2="60" class="wire" />

    <!-- Stop Contact NC -->
    <line x1="260" y1="50" x2="260" y2="70" stroke="#f8fafc" stroke-width="3"/>
    <line x1="275" y1="50" x2="275" y2="70" stroke="#f8fafc" stroke-width="3"/>
    <line x1="255" y1="72" x2="280" y2="48" stroke="#ef4444" stroke-width="2.5"/>
    <text x="268" y="40" text-anchor="middle" class="txt">I0.1 (Stop)</text>
    <line x1="275" y1="60" x2="440" y2="60" class="wire" />

    <!-- Latch Contact below Start -->
    <line x1="110" y1="60" x2="110" y2="120" class="wire"/>
    <line x1="110" y1="120" x2="140" y2="120" class="wire"/>
    <line x1="140" y1="110" x2="140" y2="130" stroke="#f8fafc" stroke-width="3"/>
    <line x1="155" y1="110" x2="155" y2="130" stroke="#f8fafc" stroke-width="3"/>
    <text x="148" y="145" text-anchor="middle" class="txt">Q0.0 (Self-latch)</text>
    <line x1="155" y1="120" x2="210" y2="120" class="wire"/>
    <line x1="210" y1="120" x2="210" y2="60" class="wire"/>

    <!-- Coil Q0.0 -->
    <path d="M 440 50 Q 455 60, 440 70" stroke="#f8fafc" stroke-width="3" fill="none"/>
    <path d="M 470 50 Q 455 60, 470 70" stroke="#f8fafc" stroke-width="3" fill="none"/>
    <text x="455" y="40" text-anchor="middle" class="txt" fill="#10b981">Q0.0 (Motor)</text>
    <line x1="470" y1="60" x2="550" y2="60" class="wire" />

    <text x="300" y="185" text-anchor="middle" class="lbl">Hình 1.4: Biểu đồ hình thang PLC (Ladder Logic) duy trì động cơ</text>
  </svg>
  `;

  // Write SVGs to disk
  createSvgAsset('fig_circuit_001.svg', rlcCircuitSvg);
  createSvgAsset('fig_opamp_002.svg', opAmpSvg);
  createSvgAsset('fig_bjt_003.svg', bjtSvg);
  createSvgAsset('fig_plc_004.svg', plcSvg);

  // 2. Insert Media Assets
  mediaRepository.create({
    media_key: 'fig_circuit_001',
    url: '/media/fig_circuit_001.svg',
    alt_text: 'Sơ đồ mạch điện RLC nối tiếp',
    caption: 'Mạch RLC nối tiếp mắc vào nguồn xoay chiều u(t) = U₀cos(ωt)'
  });

  mediaRepository.create({
    media_key: 'fig_opamp_002',
    url: '/media/fig_opamp_002.svg',
    alt_text: 'Mạch khuếch đại đảo dùng Op-Amp',
    caption: 'Cấu hình Op-Amp Inverting Amplifier với trở hồi tiếp Rf và trở đầu vào Rin'
  });

  mediaRepository.create({
    media_key: 'fig_bjt_003',
    url: '/media/fig_bjt_003.svg',
    alt_text: 'Sơ đồ khuếch đại phân áp BJT NPN',
    caption: 'Mạch phân cực transistor BJT kiểu phân áp emitter ổn định nhiệt'
  });

  mediaRepository.create({
    media_key: 'fig_plc_004',
    url: '/media/fig_plc_004.svg',
    alt_text: 'Giản đồ thang PLC điều khiển Start-Stop động cơ',
    caption: 'Lập trình Ladder Logic PLC S7-1200 cho mạch tự giữ (self-holding)'
  });

  // 3. Create 3-Level Hierarchy Topics
  // Level 1: Subjects
  const t1Id = topicRepository.create({
    name: 'Điện - Điện Tử',
    parent_id: null,
    level: 1,
    path: 'dien-dien-tu'
  });

  const t2Id = topicRepository.create({
    name: 'Kỹ Thuật Máy Tính & Lập Trình',
    parent_id: null,
    level: 1,
    path: 'ky-thuat-may-tinh'
  });

  // Level 2: Chapters
  const t1_1Id = topicRepository.create({
    name: 'Mạch Điện & Tín Hiệu',
    parent_id: t1Id,
    level: 2,
    path: 'dien-dien-tu/mach-dien-tin-hieu'
  });

  const t1_2Id = topicRepository.create({
    name: 'Linh Kiện Bán Dẫn & Vi Mạch',
    parent_id: t1Id,
    level: 2,
    path: 'dien-dien-tu/linh-kien-ban-dan'
  });

  const t1_3Id = topicRepository.create({
    name: 'Tự Động Hóa & PLC',
    parent_id: t1Id,
    level: 2,
    path: 'dien-dien-tu/tu-dong-hoa-plc'
  });

  const t2_1Id = topicRepository.create({
    name: 'Kiến Trúc Máy Tính',
    parent_id: t2Id,
    level: 2,
    path: 'ky-thuat-may-tinh/kien-truc-may-tinh'
  });

  // Level 3: Sub-topics
  const subRlcId = topicRepository.create({
    name: 'Hiện tượng cộng hưởng RLC',
    parent_id: t1_1Id,
    level: 3,
    path: 'dien-dien-tu/mach-dien-tin-hieu/cong-huong-rlc'
  });

  const subOpAmpId = topicRepository.create({
    name: 'Mạch khuếch đại thuật toán Op-Amp',
    parent_id: t1_2Id,
    level: 3,
    path: 'dien-dien-tu/linh-kien-ban-dan/khuech-dai-thuat-toan'
  });

  const subBjtId = topicRepository.create({
    name: 'Transistor BJT và Phân Cực',
    parent_id: t1_2Id,
    level: 3,
    path: 'dien-dien-tu/linh-kien-ban-dan/transistor-bjt'
  });

  const subPlcId = topicRepository.create({
    name: 'Lập trình PLC Ladder cơ bản',
    parent_id: t1_3Id,
    level: 3,
    path: 'dien-dien-tu/tu-dong-hoa-plc/ladder-logic'
  });

  const subMemoryId = topicRepository.create({
    name: 'Bộ nhớ Cache và Phân cấp',
    parent_id: t2_1Id,
    level: 3,
    path: 'ky-thuat-may-tinh/kien-truc-may-tinh/bo-nho-cache'
  });

  // 4. Create Rich Technical Questions with LaTeX & Media Tags
  // Question 1: RLC Resonant Circuit (with Context Media and LaTeX formulas)
  questionService.createQuestion({
    topic_id: subRlcId,
    difficulty_level: 2,
    question_type: 'SINGLE_CHOICE',
    tags: ['RLC', 'Cộng Hưởng', 'AC Circuit', 'Tần số góc'],
    context_text: `Xem xét mạch điện xoay chiều RLC nối tiếp như trong sơ đồ kỹ thuật dưới đây:

<!-- media:fig_circuit_001 -->

Biết rằng các thông số phần tử đo được gồm có: điện trở thuần $R = 50\\,\\Omega$, độ tự cảm $L = 200\\,\\text{mH}$ và điện dung $C = 10\\,\\mu\\text{F}$. Nguồn điện có phương trình $u(t) = 220\\sqrt{2}\\cos(\\omega t + \\varphi)\\,\\text{(V)}$.`,
    content: `Xác định tần số góc cộng hưởng $\\omega_0$ của đoạn mạch và tổng trở tương đương $Z$ tại thời điểm mạch xảy ra hiện tượng cộng hưởng điện?`,
    explanation: `**Hướng dẫn giải chi tiết:**
1. Điều kiện để mạch $RLC$ nối tiếp xảy ra hiện tượng cộng hưởng điện áp là cảm kháng bằng dung kháng:
   $$Z_L = Z_C \\iff \\omega_0 L = \\frac{1}{\\omega_0 C}$$
2. Suy ra tần số góc cộng hưởng:
   $$\\omega_0 = \\frac{1}{\\sqrt{LC}} = \\frac{1}{\\sqrt{200 \\times 10^{-3} \\times 10 \\times 10^{-6}}} = \\frac{1}{\\sqrt{2 \\times 10^{-6}}} = \\frac{10^3}{\\sqrt{2}} \\approx 707.1\\,\\text{rad/s}$$
3. Khi cộng hưởng, tổng trở toàn mạch đạt giá trị cực tiểu:
   $$Z_{\\min} = \\sqrt{R^2 + (Z_L - Z_C)^2} = R = 50\\,\\Omega$$`,
    options: [
      { content: '$\\omega_0 = 707.1\\,\\text{rad/s}$ và $Z = 50\\,\\Omega$', is_correct: true, order_index: 1 },
      { content: '$\\omega_0 = 1000\\,\\text{rad/s}$ và $Z = 0\\,\\Omega$', is_correct: false, order_index: 2 },
      { content: '$\\omega_0 = 500\\,\\text{rad/s}$ và $Z = 100\\,\\Omega$', is_correct: false, order_index: 3 },
      { content: '$\\omega_0 = 314\\,\\text{rad/s}$ và $Z = 50\\,\\Omega$', is_correct: false, order_index: 4 }
    ]
  });

  // Question 2: Inverting Op-Amp with Media in Content
  questionService.createQuestion({
    topic_id: subOpAmpId,
    difficulty_level: 2,
    question_type: 'SINGLE_CHOICE',
    tags: ['Op-Amp', 'Inverting Amplifier', 'Độ lợi điện áp', 'Khuếch đại thuật toán'],
    context_text: `Cho sơ đồ mạch khuếch đại đảo sử dụng vi mạch tích hợp Operational Amplifier (Op-Amp) lý tưởng:

<!-- media:fig_opamp_002 -->`,
    content: `Nếu điện trở đầu vào có giá trị $R_{in} = 10\\,\\text{k}\\Omega$ và điện trở hồi tiếp $R_f = 100\\,\\text{k}\\Omega$, với điện áp tín hiệu vào một chiều $V_{in} = 0.5\\,\\text{V}$, hãy tính hệ số khuếch đại điện áp $A_v$ và điện áp lối ra $V_{out}$ của mạch?`,
    explanation: `**Phân tích mạch khuếch đại đảo lý tưởng:**
1. Do Op-Amp lý tưởng có trở kháng vào vô cùng lớn ($R_{in} \\to \\infty$) và độ lợi hở mạch $A_{OL} \\to \\infty$, ta áp dụng nguyên lý **đất ảo (virtual ground)** tại cực đảo $(-)$:
   $$V_- \\approx V_+ = 0\\,\\text{V}$$
2. Dòng điện qua điện trở $R_{in}$ bằng dòng qua điện trở hồi tiếp $R_f$:
   $$I_{in} = \\frac{V_{in} - 0}{R_{in}} = \\frac{0 - V_{out}}{R_f} \\implies V_{out} = -\\frac{R_f}{R_{in}} V_{in}$$
3. Độ lợi điện áp $A_v$:
   $$A_v = -\\frac{R_f}{R_{in}} = -\\frac{100\\,\\text{k}\\Omega}{10\\,\\text{k}\\Omega} = -10$$
4. Điện áp ra $V_{out}$:
   $$V_{out} = -10 \\times 0.5\\,\\text{V} = -5.0\\,\\text{V}$$`,
    options: [
      { content: '$A_v = -10$ và $V_{out} = -5.0\\,\\text{V}$', is_correct: true, order_index: 1 },
      { content: '$A_v = +10$ và $V_{out} = +5.0\\,\\text{V}$', is_correct: false, order_index: 2 },
      { content: '$A_v = -11$ và $V_{out} = -5.5\\,\\text{V}$', is_correct: false, order_index: 3 },
      { content: '$A_v = -0.1$ và $V_{out} = -0.05\\,\\text{V}$', is_correct: false, order_index: 4 }
    ]
  });

  // Question 3: BJT Transistor Amplifier
  questionService.createQuestion({
    topic_id: subBjtId,
    difficulty_level: 3,
    question_type: 'SINGLE_CHOICE',
    tags: ['BJT', 'Transistor', 'Phân cực DC', 'Điểm làm việc Q'],
    context_text: `Xét mạch phân cực BJT NPN nối theo cấu hình Emittơ chung (CE) ổn định nhiệt độ:

<!-- media:fig_bjt_003 -->`,
    content: `Giả sử transistor có hệ số khuếch đại dòng $\\beta = 100$, điện áp tiếp giáp $V_{BE} = 0.7\\,\\text{V}$, và điện áp tại cực Bazơ đo được là $V_B = 2.2\\,\\text{V}$. Dòng điện tĩnh cực góp $I_C$ và điện áp cực góp-phát $V_{CE}$ xấp xỉ bằng bao nhiêu?`,
    explanation: `**Các bước tính toán phân cực một chiều:**
1. Điện áp tại cực phát $V_E$:
   $$V_E = V_B - V_{BE} = 2.2\\,\\text{V} - 0.7\\,\\text{V} = 1.5\\,\\text{V}$$
2. Dòng điện cực phát $I_E$:
   $$I_E = \\frac{V_E}{R_E} = \\frac{1.5\\,\\text{V}}{500\\,\\Omega} = 3\\,\\text{mA}$$
3. Vì $\\beta = 100 \\gg 1$, ta có thể xấp xỉ $I_C \\approx I_E = 3\\,\\text{mA}$.
4. Áp dụng định luật Kirchhoff về điện áp cho nhánh Collector-Emitter:
   $$V_{CC} = I_C R_C + V_{CE} + I_E R_E$$
   $$V_{CE} = V_{CC} - I_C R_C - V_E = 12\\,\\text{V} - (3\\,\\text{mA} \\times 2\\,\\text{k}\\Omega) - 1.5\\,\\text{V} = 12 - 6 - 1.5 = 4.5\\,\\text{V}$$`,
    options: [
      { content: '$I_C \\approx 3\\,\\text{mA},\\; V_{CE} \\approx 4.5\\,\\text{V}$', is_correct: true, order_index: 1 },
      { content: '$I_C \\approx 1.5\\,\\text{mA},\\; V_{CE} \\approx 6.0\\,\\text{V}$', is_correct: false, order_index: 2 },
      { content: '$I_C \\approx 4\\,\\text{mA},\\; V_{CE} \\approx 2.5\\,\\text{V}$', is_correct: false, order_index: 3 },
      { content: '$I_C \\approx 3\\,\\text{mA},\\; V_{CE} \\approx 9.0\\,\\text{V}$', is_correct: false, order_index: 4 }
    ]
  });

  // Question 4: PLC Ladder Logic
  questionService.createQuestion({
    topic_id: subPlcId,
    difficulty_level: 1,
    question_type: 'SINGLE_CHOICE',
    tags: ['PLC', 'Ladder Logic', 'Self-latch', 'Tự động hóa'],
    context_text: `Dưới đây là một đoạn chương trình điều khiển hình thang (Ladder Diagram) cơ bản của PLC:

<!-- media:fig_plc_004 -->`,
    content: `Trong sơ đồ trên, tiếp điểm thường mở mang địa chỉ $Q0.0$ mắc song song với nút nhấn khởi động $I0.0$ có chức năng kỹ thuật gì trong hệ thống điều khiển?`,
    explanation: `**Nguyên lý mạch tự giữ (Self-holding / Latch circuit):**
- Nút nhấn Start ($I0.0$) là nút nhấn nhả (momentary push button), tín hiệu chỉ ON trong khoảnh khắc người vận hành ấn nút.
- Khi cuộn dây $Q0.0$ có điện, tiếp điểm phụ $Q0.0$ đóng lại.
- Khi người vận hành nhả tay khỏi nút Start, dòng điện điều khiển tiếp tục chạy qua tiếp điểm $Q0.0$, duy trì trạng thái cấp điện cho tải cho đến khi nút Stop ($I0.1$) bị ngắt.
- Đây chính là chức năng **tự giữ (self-holding / latching)** kinh điển trong kỹ thuật điều khiển công nghiệp.`,
    options: [
      { content: 'Mạch tự giữ (Self-latching) để duy trì ngõ ra $Q0.0$ khi nhả nút $I0.0$', is_correct: true, order_index: 1 },
      { content: 'Bảo vệ quá nhiệt động cơ khi điện áp bị sụt áp đột ngột', is_correct: false, order_index: 2 },
      { content: 'Đảo chiều quay của động cơ khi nhấn nút Stop', is_correct: false, order_index: 3 },
      { content: 'Tạo trễ thời gian đóng tiếp điểm Timer On-Delay', is_correct: false, order_index: 4 }
    ]
  });

  // Question 5: Computer Architecture Cache Memory
  questionService.createQuestion({
    topic_id: subMemoryId,
    difficulty_level: 3,
    question_type: 'SINGLE_CHOICE',
    tags: ['Computer Architecture', 'Cache', 'AMAT', 'Memory Hierarchy'],
    context_text: `Một hệ thống vi xử lý hiện đại có cấu trúc phân cấp bộ nhớ với bộ đệm Cache L1. Thời gian truy cập bộ nhớ Cache L1 là $t_1 = 1\\,\\text{chu kỳ}$ xung nhịp với tỉ lệ trúng đích (Hit Rate) $h_1 = 95\\%$. Thời gian truy xuất vào bộ nhớ chính (DRAM) khi xảy ra Miss Penalty là $t_m = 100\\,\\text{chu kỳ}$.`,
    content: `Thời gian truy cập bộ nhớ trung bình (**AMAT - Average Memory Access Time**) của hệ thống vi xử lý này là bao nhiêu chu kỳ xung nhịp?`,
    explanation: `**Công thức tính AMAT:**
$$\\text{AMAT} = \\text{Hit Time} + (\\text{Miss Rate} \\times \\text{Miss Penalty})$$
Thay số:
- $\\text{Hit Time} = 1\\,\\text{cycle}$
- $\\text{Miss Rate} = 1 - h_1 = 1 - 0.95 = 0.05$ ($5\\%$)
- $\\text{Miss Penalty} = 100\\,\\text{cycles}$
$$\\text{AMAT} = 1 + (0.05 \\times 100) = 1 + 5 = 6.0\\,\\text{cycles}$$
Như vậy, dù Miss Rate chỉ $5\\%$, Miss Penalty cao khiến thời gian truy xuất trung bình tăng gấp 6 lần so với trường hợp Cache Hit.`,
    options: [
      { content: '$\\text{AMAT} = 6.0\\,\\text{chu kỳ}$', is_correct: true, order_index: 1 },
      { content: '$\\text{AMAT} = 5.0\\,\\text{chu kỳ}$', is_correct: false, order_index: 2 },
      { content: '$\\text{AMAT} = 1.05\\,\\text{chu kỳ}$', is_correct: false, order_index: 3 },
      { content: '$\\text{AMAT} = 10.0\\,\\text{chu kỳ}$', is_correct: false, order_index: 4 }
    ]
  });

  console.log('--- Database Seeding Completed Successfully! ---');
  return {
    topicsCount: topicRepository.count(),
    questionsCount: questionService.getQuestions().length,
    mediaCount: mediaRepository.count()
  };
}

// Allow direct CLI invocation: tsx src/server/db/seed.ts
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedTechnicalData().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}
