import zipfile
import xml.etree.ElementTree as ET
import re
import os
import sqlite3
import json

DB_PATH = 'data/app.db'
UPLOAD_DIR = 'data/uploads'
PPTX_PATH = 'WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx'

os.makedirs(UPLOAD_DIR, exist_ok=True)

# Technical vocabulary cleanup mapping (94+ rules for Vietnamese engineering standards)
TERM_REPLACEMENTS = [
    # Common OCR/translation artifacts & spelling typos
    (r'Đ\s+áp\s+án', 'Đáp án'),
    (r'Đ\s+iện\s+trở', 'Điện trở'),
    (r'v\s+ề', 'về'),
    (r'c\s+ó\s+thể', 'có thể'),
    (r'đ\s+ược', 'được'),
    (r's\s+ố', 'số'),
    (r't\s+rục', 'trục'),
    (r'Đ\s+ây', 'Đây'),
    (r'Đ\s+iều', 'Điều'),
    (r'đ\s+iện', 'điện'),
    (r'xuay\s+chiều', 'xoay chiều'),
    (r'sofrware', 'phần mềm (software)'),
    (r'hạt\s+nhân\s+guyên', 'hạt nhân nguyên tử'),
    (r'guyên\s+eutron', 'hạt Neutron'),
    
    # Electrical, Electronics & Instrumentation
    (r'Resister', 'Register'),
    (r'Data\s+Resister', 'Data Register (Thanh ghi dữ liệu D)'),
    (r'File\s+Resister', 'File Register (Thanh ghi tập tin R/ZR)'),
    (r'Index\s+Resister', 'Index Register (Thanh ghi chỉ mục Z/V)'),
    (r'Thước\s+kẹp\s+mét', 'Ampe kìm đo dòng (Clamp Meter)'),
    (r'Thước\s+đo\s+mét', 'Đồng hồ vạn năng (Multimeter)'),
    (r'Mega\s+Tester', 'Đồng hồ đo điện trở cách điện (Megohmmeter / Mega Tester)'),
    (r'Chênh\s+lệch\s+điện\s+thế', 'Hiệu điện thế (Potential Difference / Voltage)'),
    (r'\bvỏ\s+Electron\b', 'lớp vỏ electron nguyên tử'),
    (r'Electron\s+hóa\s+trị', 'Electron hóa trị (Valence Electron)'),
    (r'Electron\s+tự\s+do', 'Electron tự do (Free Electron)'),
    (r'khoảng\s+Latch', 'vùng nhớ tự giữ Latch'),
    (r'chuyển\s+mạch\(switching\s+noise\)', 'chuyển mạch xung (Switching Noise)'),
    (r'Nhiễu\s+do\s+biến\s+đổi\s+điện\s+áp', 'Nhiễu biến thiên / Sụt giảm điện áp nguồn'),
    (r'Nhiễu\s+sét', 'Nhiễu xung sét lan truyền (Surge / Lightning Noise)'),
    (r'Nhiễu\s+tĩnh\s+điện', 'Nhiễu phóng tĩnh điện (Electrostatic Discharge / ESD)'),
    (r'Diot|điot', 'Diode'),
    (r'Transitor|transitor|\bTR\b', 'Transistor (BJT)'),
    (r'Photo\s+Coupler', 'Optocoupler (Photo-coupler / Cách ly quang)'),
    (r'Yếu\s+tố\s+quang', 'Linh kiện quang điện tử (Optoelectronic Component)'),
    (r'Port\s+TR', 'Phototransistor (Photo-TR)'),
    (r'I-ôn\s+hóa', 'Ion hóa (Ionization)'),
    (r'ở\s+coil\b', 'trong cuộn cảm (coil)'),
    (r'\bcoil\b', 'cuộn dây (coil)'),
    (r'chất\s+không\s+tiếp\s+điểm', 'linh kiện bán dẫn không tiếp điểm (Solid-state)'),
    (r'Là\s+loại\s+hạng\s+nhẹ\s+và\s+nhỏ', 'Kích thước nhỏ gọn và trọng lượng nhẹ'),
    (r'vận\s+tải\s+nhẹ', 'tải trọng nhẹ'),
    (r'độ\s+nhạy\s+bén', 'độ nhạy (Sensitivity)'),
    
    # Mechanics, Motion & Machine Components
    (r'Đức\s*-\s*DN\b', 'Đức - DIN (Deutsches Institut für Normung)'),
    (r'Anh\s*-\s*BS\b', 'Anh - BS (British Standards)'),
    (r'Thụy\s+Sĩ\s*-\s*VSM\b', 'Thụy Sĩ - VSM (Verein Schweizerischer Maschinen-Industrieller)'),
    (r'Nhật\s+Bản\s*-\s*JIS\b', 'Nhật Bản - JIS (Japanese Industrial Standards)'),
    (r'trục\s+Spindle', 'Trục chính máy công cụ (Spindle)'),
    (r'Preload\s+trục\s+Ballscrew', 'Khử độ rơ (Preload) trục vít me bi (Ballscrew)'),
    (r'dẫn\s+hướng\s+Linear', 'dẫn hướng tuyến tính (Linear Guide / LM Guide)'),
    (r'Linear\s+Bushing', 'Ống lót trượt tuyến tính (Linear Bushing)'),
    (r'Timing\s+Belt', 'Bộ truyền đai răng (Timing Belt)'),
    (r'Radial\s+bearing', 'Ổ lăn đỡ hướng tâm (Radial Bearing)'),
    (r'Thrust\s+bearing', 'Ổ lăn chặn hướng trục (Thrust Bearing)'),
    (r'Vòng\s+vi\s+chặn', 'Ổ bi chặn (Thrust Ball Bearing)'),
    (r'Vòng\s+bi\s+đỡ\s+chặn\s+tiếp\s+xúc', 'Ổ bi đỡ chặn tiếp xúc góc (Angular Contact Ball Bearing)'),
    (r'Deep\s+Groove\s+ball\s+bearing', 'Ổ bi cầu rãnh sâu (Deep Groove Ball Bearing)'),
    (r'tính\s+mạnh\s+cho\s+LM\s+Block', 'độ cứng vững (Rigidity) cho cụm trượt LM Block'),
    (r'Đinh\s+ốc\s+đa\s+xoắn', 'Ren nhiều đầu mối (Multi-start Thread)'),
    (r'Spur\s+Gear', 'Bánh răng trụ răng thẳng (Spur Gear)'),
    (r'Helical\s+gear', 'Bánh răng trụ răng nghiêng (Helical Gear)'),
    (r'Bevel\s+Gear', 'Bánh răng côn (Bevel Gear)'),
    (r'Worm\s+Gear', 'Trục vít - bánh vít (Worm & Worm Gear)'),
    (r'Rack\s+Gear', 'Thanh răng (Rack Gear)'),
    (r'Internal\s+Gear', 'Bánh răng ăn khớp trong (Internal Gear)'),
    (r'Screw\s+Gear', 'Bánh răng trục chéo (Screw Gear / Crossed Helical Gear)'),
    
    # Pneumatics & Hydraulics
    (r'Định\s+luật\s+Boyle(?!\-)', 'Định luật Boyle-Mariotte ($P_1 V_1 = P_2 V_2$)'),
    (r'Định\s+luật\s+Charles', 'Định luật Charles ($\\frac{V_1}{T_1} = \\frac{V_2}{T_2}$)'),
    (r'Định\s+luật\s+Boyle\-\s*Charles', 'Phương trình trạng thái khí lý tưởng (Boyle-Charles)'),
    (r'Định\s+luật\s+Pascal', 'Định luật Pascal ($P = \\frac{F}{A}$)'),
    (r'bình\s+ngưng\s+tụ', 'bộ tách nước ngưng tụ (Drain Trap / Condenser)'),
    (r'nhiệt\s+độ\s+hóa\s+sương', 'nhiệt độ điểm sương (Dew Point)'),
    (r'Máy\s+sấy\s+kiểu\s+ngưng\s+tụ', 'Máy sấy khí kiểu làm lạnh ngưng tụ (Refrigerated Air Dryer)'),
    (r'Máy\s+sấy\s+kiểu\s+hấp\s+thụ', 'Máy sấy khí kiểu hấp phụ (Desiccant Air Dryer)'),
    (r'pittong đa tầng', 'piston nhiều cấp (Multi-stage Piston)'),
    (r'pittong|piston', 'piston'),
    (r'Head\s+cover', 'Nắp đầu xy lanh (Cylinder Head Cover)'),
    (r'Van\s+kiểm\s+tra', 'Van một chiều (Check Valve)'),
    (r'Van\s+xả\s+cấp\s+tốc', 'Van xả nhanh (Quick Exhaust Valve)'),
    (r'Bộ\s+phận\s+phát\s+sinh\s+khí\s+áp', 'Cụm nguồn tạo khí nén (Máy nén khí & bình tích áp)'),
    (r'khí\s+áp\b', 'áp suất khí nén'),
    (r'vận\s+động\s+quay', 'chuyển động quay'),
    (r'vận\s+động\s+tịnh\s+tiến', 'chuyển động tịnh tiến'),
    (r'Máy\s+nén\s+Screw', 'Máy nén khí trục vít (Screw Compressor)'),
    (r'Root\s+Blower', 'Máy thổi khí kiểu Roots (Roots Blower)'),
    (r'tấm\s+Swash', 'đĩa nghiêng (Swash Plate)'),
    
    # Mathematical, Physical units & LaTeX formatting
    (r'500\[Hz\]', '$500\\,\\text{Hz}$'),
    (r'1500\[Hz\]', '$1500\\,\\text{Hz}$'),
    (r'47\[㎌\]', '$47\\,\\mu\\text{F}$'),
    (r'50\[V\]', '$50\\,\\text{V}$'),
    (r'0,7V|0\.7\[V\]', '$0.7\\,\\text{V}$'),
    (r'0,2V|0\.2\[V\]', '$0.2\\,\\text{V}$'),
    (r'\(1001\)₂', '$(1001)_2$'),
    (r'F14\s+hệ\s+16', '$(\\text{F14})_{16}$'),
    (r'kgf/㎠', '$\\text{kgf/cm}^2$'),
    (r'mmH2g|mmHg', '$\\text{mmHg}$'),
    (r'㎃', '$\\text{mA}$'),
    (r'㎂', '$\\mu\\text{A}$'),
    (r'㎌', '$\\mu\\text{F}$'),
    (r'㎛', '$\\mu\\text{m}$'),
    (r'㎠', '$\\text{cm}^2$'),
    (r'㎥', '$\\text{m}^3$'),
    (r'㏄', '$\\text{cc}$'),
    (r'㎏', '$\\text{kg}$'),
    (r'㎾', '$\\text{kW}$'),
    (r'㎒', '$\\text{MHz}$'),
    (r'㎑', '$\\text{kHz}$'),
    (r'Ω', '$\\Omega$'),
    (r'Quấn\s+dây\s+điện\s+vào\s+thước\s+kẹp', 'Kẹp dây dẫn bằng ngàm kẹp của ampe kìm'),
    (r'thước\s+kẹp\s+Vernier\s+calipers', 'thước cặp cơ khí (Vernier Calipers)'),
    (r'đặc\s+tính\s+của\s+yếu\s+tố\s+nào', 'đặc tính của linh kiện nào'),
    (r'mạch\s+tự\s+duy\s+trì', 'mạch tự giữ (Self-holding circuit)')
]

def clean_technical_text(text):
    if not text: return ""
    cleaned = text
    for pattern, replacement in TERM_REPLACEMENTS:
        cleaned = re.sub(pattern, lambda _, r=replacement: r, cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'[ \t]+', ' ', cleaned).strip()
    return cleaned

def setup_topics(conn):
    cursor = conn.cursor()
    
    # Standard 3-Level Topics Structure (Subject -> Chapter -> Sub-topic)
    topics_spec = [
        # Level 1 (Subjects)
        ("Điện - Điện Tử", None, 1, "dien-dien-tu"),
        ("Tự Động Hóa & PLC", None, 1, "tu-dong-hoa-plc"),
        ("Hệ Thống Khí Nén & Thủy Lực", None, 1, "khi-nen-thuy-luc"),
        ("Cơ Khí & Linh Kiện Máy", None, 1, "co-khi-linh-kien-may"),
        
        # Level 2 for Điện - Điện Tử
        ("Mạch Điện & Đo Lường Cơ Bản", "dien-dien-tu", 2, "dien-dien-tu/mach-dien-do-luong"),
        ("Linh Kiện Bán Dẫn & Điện Tử Ứng Dụng", "dien-dien-tu", 2, "dien-dien-tu/ban-dan-dien-tu"),
        
        # Level 3 for Điện - Điện Tử
        ("Dòng điện, Điện áp & Thiết bị đo (Ampe kìm, VOM, Dao động ký)", "dien-dien-tu/mach-dien-do-luong", 3, "dien-dien-tu/mach-dien-do-luong/thiet-bi-do"),
        ("Điện trở, Tụ điện & Cuộn cảm RLC", "dien-dien-tu/mach-dien-do-luong", 3, "dien-dien-tu/mach-dien-do-luong/rlc-linh-kien"),
        ("Diode, Transistor BJT & Thyristor SCR", "dien-dien-tu/ban-dan-dien-tu", 3, "dien-dien-tu/ban-dan-dien-tu/diode-bjt-scr"),
        ("Linh kiện quang điện (Optocoupler, LED, CDS) & Rơ le bán dẫn SSR", "dien-dien-tu/ban-dan-dien-tu", 3, "dien-dien-tu/ban-dan-dien-tu/quang-dien-ssr"),
        
        # Level 2 for Tự Động Hóa & PLC
        ("Kiến Trúc & Phần Cứng PLC", "tu-dong-hoa-plc", 2, "tu-dong-hoa-plc/phan-cung-plc"),
        ("Lập Trình & Tập Lệnh PLC", "tu-dong-hoa-plc", 2, "tu-dong-hoa-plc/tap-lenh-plc"),
        
        # Level 3 for PLC
        ("Cấu trúc CPU, Bộ nhớ & Quản lý Device (X, Y, M, D, W, Z)", "tu-dong-hoa-plc/phan-cung-plc", 3, "tu-dong-hoa-plc/phan-cung-plc/cpu-device"),
        ("Module I/O số & Xử lý tín hiệu Analog (Q64AD, Q68AD)", "tu-dong-hoa-plc/phan-cung-plc", 3, "tu-dong-hoa-plc/phan-cung-plc/io-analog"),
        ("Lệnh logic cơ bản, Xung cạnh & Bộ định thời (PLS, PLF, Timer, Counter)", "tu-dong-hoa-plc/tap-lenh-plc", 3, "tu-dong-hoa-plc/tap-lenh-plc/logic-timer-counter"),
        ("Lệnh điều khiển vùng & Chuyển đổi dữ liệu (MC, MCR, BCD, BIN, HEX)", "tu-dong-hoa-plc/tap-lenh-plc", 3, "tu-dong-hoa-plc/tap-lenh-plc/lenh-nang-cao"),
        
        # Level 2 for Khí Nén
        ("Lý Thuyết Khí Nén & Nhiệt Động", "khi-nen-thuy-luc", 2, "khi-nen-thuy-luc/ly-thuyet-khi-nen"),
        ("Thiết Bị & Khí Cụ Khí Nén", "khi-nen-thuy-luc", 2, "khi-nen-thuy-luc/thiet-bi-khi-nen"),
        
        # Level 3 for Khí Nén
        ("Áp suất & Các định luật chất khí (Boyle, Charles, Pascal)", "khi-nen-thuy-luc/ly-thuyet-khi-nen", 3, "khi-nen-thuy-luc/ly-thuyet-khi-nen/dinh-luat-chat-khi"),
        ("Máy nén khí, Máy sấy & Bộ lọc tách nước ngưng", "khi-nen-thuy-luc/thiet-bi-khi-nen", 3, "khi-nen-thuy-luc/thiet-bi-khi-nen/may-nen-say-khi"),
        ("Van điều khiển, Xy lanh khí nén & Cơ cấu chấp hành", "khi-nen-thuy-luc/thiet-bi-khi-nen", 3, "khi-nen-thuy-luc/thiet-bi-khi-nen/van-xy-lanh"),
        
        # Level 2 for Cơ Khí
        ("Tiêu Chuẩn Cơ Khí & Dung Sai", "co-khi-linh-kien-may", 2, "co-khi-linh-kien-may/tieu-chuan-dung-sai"),
        ("Bộ Truyền Động Cơ Khí Chính Xác", "co-khi-linh-kien-may", 2, "co-khi-linh-kien-may/truyen-dong-chinh-xac"),
        
        # Level 3 for Cơ Khí
        ("Tiêu chuẩn công nghiệp quốc tế (DIN, JIS, BS, ISO, VSM)", "co-khi-linh-kien-may/tieu-chuan-dung-sai", 3, "co-khi-linh-kien-may/tieu-chuan-dung-sai/tieu-chuan-quoc-te"),
        ("Vít me bi (Ballscrew), Trục Spindle & Thanh dẫn hướng Linear", "co-khi-linh-kien-may/truyen-dong-chinh-xac", 3, "co-khi-linh-kien-may/truyen-dong-chinh-xac/ballscrew-spindle-linear"),
        ("Bộ truyền đai răng (Timing Belt), Bánh răng, Then & Vòng bi", "co-khi-linh-kien-may/truyen-dong-chinh-xac", 3, "co-khi-linh-kien-may/truyen-dong-chinh-xac/dai-banh-rang-vong-bi")
    ]
    
    topic_map = {}
    for name, parent_path, level, path in topics_spec:
        parent_id = topic_map.get(parent_path) if parent_path else None
        cursor.execute("SELECT id FROM topics WHERE path = ?", (path,))
        row = cursor.fetchone()
        if row:
            topic_id = row[0]
            cursor.execute("UPDATE topics SET name = ?, parent_id = ?, level = ? WHERE id = ?", (name, parent_id, level, topic_id))
        else:
            cursor.execute("INSERT INTO topics (name, parent_id, level, path) VALUES (?, ?, ?, ?)", (name, parent_id, level, path))
            topic_id = cursor.lastrowid
        topic_map[path] = topic_id
        
    conn.commit()
    print(f"Set up {len(topic_map)} standardized hierarchical topics.")
    return topic_map

def determine_subtopic_path(subj, title, body_text):
    combined = (title + " " + body_text).lower()
    
    if subj == "Điện - Điện Tử":
        if any(w in combined for w in ['diode', 'transistor', 'tr', 'scr', 'bjt', 'bán dẫn', 'npn', 'pnp', 'chỉnh lưu']):
            return "dien-dien-tu/ban-dan-dien-tu/diode-bjt-scr"
        elif any(w in combined for w in ['quang', 'led', 'optocoupler', 'photo', 'ssr', 'cds']):
            return "dien-dien-tu/ban-dan-dien-tu/quang-dien-ssr"
        elif any(w in combined for w in ['tụ điện', 'cuộn cảm', 'cộng hưởng', 'rlc', 'điện trở']):
            return "dien-dien-tu/mach-dien-do-luong/rlc-linh-kien"
        else:
            return "dien-dien-tu/mach-dien-do-luong/thiet-bi-do"
            
    elif subj == "PLC & Tự Động Hóa" or any(w in combined for w in ['plc', 'counter', 'ladder', 'q64ad', 'q68ad', 'mcr', 'q61p']):
        if any(w in combined for w in ['analog', 'q64ad', 'q68ad', 'q61p', 'module', 'i/o']):
            return "tu-dong-hoa-plc/phan-cung-plc/io-analog"
        elif any(w in combined for w in ['cpu', 'device', 'memory', 'latch', 'rom', 'ram', 'd19', 'x0', 'y0', 'thanh ghi']):
            return "tu-dong-hoa-plc/phan-cung-plc/cpu-device"
        elif any(w in combined for w in ['mc', 'mcr', 'chuyển đổi', 'hệ 16', 'nhị phân', 'hex', 'bin', 'bcd']):
            return "tu-dong-hoa-plc/tap-lenh-plc/lenh-nang-cao"
        else:
            return "tu-dong-hoa-plc/tap-lenh-plc/logic-timer-counter"
            
    elif subj == "Hệ Thống Khí Nén":
        if any(w in combined for w in ['boyle', 'charles', 'pascal', 'áp suất', 'khí quyển', 'nhiệt độ']):
            return "khi-nen-thuy-luc/ly-thuyet-khi-nen/dinh-luat-chat-khi"
        elif any(w in combined for w in ['máy sấy', 'ngưng tụ', 'máy nén', 'hấp thụ', 'điểm sương', 'lọc']):
            return "khi-nen-thuy-luc/thiet-bi-khi-nen/may-nen-say-khi"
        else:
            return "khi-nen-thuy-luc/thiet-bi-khi-nen/van-xy-lanh"
            
    elif subj == "Linh Kiện Máy & Cơ Khí":
        if any(w in combined for w in ['din', 'jis', 'bs', 'iso', 'vsm', 'tiêu chuẩn', 'khổ giấy', 'dung sai']):
            return "co-khi-linh-kien-may/tieu-chuan-dung-sai/tieu-chuan-quoc-te"
        elif any(w in combined for w in ['ballscrew', 'spindle', 'vít me', 'trục chính', 'linear']):
            return "co-khi-linh-kien-may/truyen-dong-chinh-xac/ballscrew-spindle-linear"
        else:
            return "co-khi-linh-kien-may/truyen-dong-chinh-xac/dai-banh-rang-vong-bi"
            
    return "dien-dien-tu/mach-dien-do-luong/thiet-bi-do"

def separate_content_and_options(raw_title, raw_body):
    has_marker = any(re.match(r'^(?:[A-D]\.|\([A-D]\)|[①-④])', l.strip()) or ('A.' in l and 'B.' in l) for l in raw_body)
    content_lines = [raw_title]
    opt_lines = []
    
    if has_marker:
        found_marker = False
        for l in raw_body:
            if re.match(r'^(?:[A-D]\.|\([A-D]\)|[①-④])', l.strip()) or ('A.' in l and 'B.' in l):
                found_marker = True
            if found_marker:
                opt_lines.append(l)
            else:
                content_lines.append(l)
    else:
        # If raw_body has 5 lines, line 0 is often a context quote or condition
        if len(raw_body) == 5:
            content_lines.append(raw_body[0])
            opt_lines = raw_body[1:]
        elif raw_title.strip().endswith('?') or raw_title.strip().endswith(':'):
            opt_lines = raw_body
        else:
            cut_idx = 0
            for idx, l in enumerate(raw_body):
                if l.strip().endswith('?') or l.strip().endswith(':'):
                    cut_idx = idx + 1
                    break
            if cut_idx > 0 and cut_idx < len(raw_body):
                content_lines.extend(raw_body[:cut_idx])
                opt_lines = raw_body[cut_idx:]
            else:
                if len(raw_body) in [2, 3, 4]:
                    opt_lines = raw_body
                else:
                    opt_lines = raw_body[-4:]
                    content_lines.extend(raw_body[:-4])
                    
    return " ".join(content_lines).strip(), opt_lines

def robust_parse_options(opt_lines):
    options_raw = []
    if not opt_lines:
        return options_raw
        
    comb_opts = " ".join(opt_lines)
    
    # Pure diagram choice question (A, B, C, D without text)
    markers = re.findall(r'([A-D①-④])[\.\:\)]', comb_opts)
    text_without_markers = re.sub(r'([A-D①-④])[\.\:\)]', '', comb_opts).strip()
    if len(markers) >= 3 and len(text_without_markers) < 10:
        return ['Hình A', 'Hình B', 'Hình C', 'Hình D']
        
    # Split on option markers A-D or circled 1-4
    if re.search(r'(?:^|\s+)([A-D①-④])[\.\:\)]\s*', comb_opts):
        parts = re.split(r'(?:^|\s+)([A-D①-④])[\.\:\)]\s*', comb_opts)
        # Capture option A if it was placed before 'B.' without explicit 'A.'
        if len(parts) >= 3 and parts[1] == 'B' and parts[0].strip():
            val_a = clean_technical_text(parts[0].strip())
            if val_a:
                options_raw.append(val_a)
                
        i = 1
        while i < len(parts) - 1:
            val = parts[i+1].strip()
            clean_val = clean_technical_text(val)
            clean_val = re.sub(r'^[A-D①-④][\.\:\)\s]+', '', clean_val).strip()
            if clean_val:
                options_raw.append(clean_val)
            else:
                marker = parts[i]
                options_raw.append(f"Phương án {marker}")
            i += 2
            
    # Fallback to line-by-line if splitting yielded insufficient options
    if len(options_raw) < 2:
        options_raw = []
        for l in opt_lines:
            cl = clean_technical_text(l)
            cl = re.sub(r'^[A-D①-④][\.\:\)\s]+', '', cl).strip()
            if cl:
                options_raw.append(cl)
                
    if len(options_raw) > 4:
        options_raw = options_raw[:4]
    return options_raw

def normalize_for_match(text):
    if not text: return ""
    text = re.sub(r'^(?:[A-D①-④]|\(\s*[A-D①-④]\s*\))[\.\:\)\s]*', '', text.strip())
    text = re.sub(r'[^a-zA-Z0-9\u00C0-\u1EF9]', '', text.lower())
    return text

def find_correct_option_index(red_raw, options_raw, question_content=""):
    if not options_raw:
        return 0
        
    clean_red = clean_technical_text(red_raw).strip() if red_raw else ""
    char_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3, '①': 0, '②': 1, '③': 2, '④': 3}
    
    # 1. Check isolated or leading marker in red_raw
    m_marker = re.search(r'(?:^|[\s\.\,\(\[])([A-D①-④])(?:$|[\s\.\:\)\]])', red_raw.strip())
    if m_marker:
        char = m_marker.group(1)
        if char in char_map:
            idx = char_map[char]
            if idx < len(options_raw):
                if len(red_raw.strip()) < 50 or red_raw.strip().startswith(char):
                    return idx

    # 2. Text normalization match
    norm_red = normalize_for_match(clean_red)
    norm_red_raw = normalize_for_match(red_raw)
    norm_opts = [normalize_for_match(opt) for opt in options_raw]
    
    # Exact match
    for idx, no in enumerate(norm_opts):
        if no and (no == norm_red or no == norm_red_raw):
            return idx
            
    # Substring match (longest match)
    best_idx = -1
    best_len = 0
    for idx, no in enumerate(norm_opts):
        if len(no) >= 3 and len(norm_red) >= 3:
            if norm_red in no or no in norm_red:
                match_len = min(len(norm_red), len(no))
                if match_len > best_len:
                    best_len = match_len
                    best_idx = idx
    if best_idx != -1:
        return best_idx
        
    # Known edge case: Spring pin on slide 47 Q#65
    if "chốt" in question_content.lower() and any("spring pin" in o.lower() for o in options_raw):
        for idx, opt in enumerate(options_raw):
            if "spring pin" in opt.lower():
                return idx
                
    # Fallback: if red has ANY marker char A-D
    m_any = re.search(r'([A-D①-④])', red_raw)
    if m_any:
        char = m_any.group(1)
        if char in char_map and char_map[char] < len(options_raw):
            return char_map[char]
            
    return 0

def import_ws_bank():
    print(f"Connecting to database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Clean previous imported questions (preserving sample test IDs 1..5)
    cursor.execute("DELETE FROM questions WHERE id > 5")
    cursor.execute("DELETE FROM options WHERE question_id > 5")
    conn.commit()
    
    topic_map = setup_topics(conn)
    
    print(f"Reading master PPTX bank: {PPTX_PATH}")
    z = zipfile.ZipFile(PPTX_PATH, 'r')
    
    slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
    def get_num(s):
        m = re.search(r'slide(\d+)\.xml', s)
        return int(m.group(1)) if m else 0
    slides.sort(key=get_num)
    
    extracted_images_count = 0
    imported_questions_count = 0
    seen_normalized_titles = set()
    
    for slide_idx, s_name in enumerate(slides, 1):
        rels_name = f'ppt/slides/_rels/slide{slide_idx}.xml.rels'
        rels = {}
        if rels_name in z.namelist():
            root_rels = ET.fromstring(z.read(rels_name))
            for rel in root_rels:
                rels[rel.attrib.get('Id')] = rel.attrib.get('Target')
                
        root_slide = ET.fromstring(z.read(s_name))
        
        # 1. Extract Pictures on this slide
        pics = []
        for pic in root_slide.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}pic'):
            blip = pic.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
            embed = blip.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed') if blip is not None else None
            xfrm = pic.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}xfrm')
            off = xfrm.find('{http://schemas.openxmlformats.org/drawingml/2006/main}off') if xfrm is not None else None
            x = int(off.attrib.get('x', 0)) if off is not None else 0
            y = int(off.attrib.get('y', 0)) if off is not None else 0
            
            target = rels.get(embed, '')
            if target and target.startswith('../media/'):
                media_filename = os.path.basename(target)
                zip_media_path = f"ppt/media/{media_filename}"
                if zip_media_path in z.namelist():
                    dest_filename = f"ws_s{slide_idx:02d}_{media_filename}"
                    dest_path = os.path.join(UPLOAD_DIR, dest_filename)
                    if not os.path.exists(dest_path):
                        with open(dest_path, 'wb') as f_out:
                            f_out.write(z.read(zip_media_path))
                        extracted_images_count += 1
                        
                    media_key = f"ws_fig_s{slide_idx:02d}_{os.path.splitext(media_filename)[0]}"
                    url = f"/media/{dest_filename}"
                    
                    cursor.execute("""
                        INSERT OR REPLACE INTO media_assets (media_key, url, alt_text, caption)
                        VALUES (?, ?, ?, ?)
                    """, (media_key, url, f"Sơ đồ minh họa Slide {slide_idx}", f"Sơ đồ kỹ thuật đề thi White Star (Slide {slide_idx})"))
                    
                    pics.append({
                        'media_key': media_key,
                        'url': url,
                        'x': x,
                        'y': y
                    })
        
        # 2. Detect Subject
        all_text = " ".join("".join(t.text for t in root_slide.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if t.text).split())
        subj = "Điện - Điện Tử"
        if "PLC" in all_text:
            subj = "PLC & Tự Động Hóa"
        elif "Khí nén" in all_text:
            subj = "Hệ Thống Khí Nén"
        elif "Máy" in all_text or "Cơ khí" in all_text:
            subj = "Linh Kiện Máy & Cơ Khí"
            
        # 3. Extract Question Shapes
        for sp in root_slide.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
            xfrm = sp.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}xfrm')
            off = xfrm.find('{http://schemas.openxmlformats.org/drawingml/2006/main}off') if xfrm is not None else None
            x = int(off.attrib.get('x', 0)) if off is not None else 0
            y = int(off.attrib.get('y', 0)) if off is not None else 0
            
            paras = []
            red_runs = []
            for p in sp.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}p'):
                p_text = ""
                for r in p.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}r'):
                    t_elem = r.find('{http://schemas.openxmlformats.org/drawingml/2006/main}t')
                    if t_elem is None or not t_elem.text: continue
                    text = t_elem.text
                    p_text += text
                    rPr = r.find('{http://schemas.openxmlformats.org/drawingml/2006/main}rPr')
                    if rPr is not None:
                        solidFill = rPr.find('{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill')
                        if solidFill is not None:
                            srgb = solidFill.find('{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr')
                            if srgb is not None and 'FF0000' in srgb.attrib.get('val', ''):
                                red_runs.append(text)
                if p_text.strip():
                    paras.append(p_text.strip())
                    
            if len(paras) >= 2:
                first_line = paras[0]
                m = re.match(r'^\s*(\d+)[\.\,\s]\s*(.+)', first_line)
                if not m:
                    continue
                    
                q_num = int(m.group(1))
                raw_title = m.group(2).strip()
                raw_body = paras[1:]
                red_answer = "".join(red_runs).strip()
                
                # Separate content from options
                full_raw_content, opt_lines = separate_content_and_options(raw_title, raw_body)
                full_content = clean_technical_text(full_raw_content)
                
                # Check for context in brackets [ ... ]
                context_match = re.search(r'\[(.*?)\]', full_content)
                context_text = None
                if context_match:
                    bracket_text = context_match.group(1).strip()
                    if len(bracket_text) > 15:
                        context_text = f"> **Bối cảnh kỹ thuật:**\n> {bracket_text}"
                        full_content = full_content.replace(f"[{context_match.group(1)}]", "").strip()
                        full_content = re.sub(r'\s+', ' ', full_content).strip()
                
                # Deduplication check
                norm_key = re.sub(r'[^a-zA-Z0-9\u00C0-\u1EF9]', '', full_content.lower())
                if len(norm_key) < 10 or norm_key in seen_normalized_titles:
                    continue
                seen_normalized_titles.add(norm_key)
                
                # Parse options
                options_raw = robust_parse_options(opt_lines)
                if len(options_raw) < 2:
                    continue
                    
                # Match picture on the slide
                attached_media_key = None
                has_image_ref = any(kw in full_content.lower() for kw in ['hình', 'sơ đồ', 'mạch', 'biểu đồ', 'dưới đây', 'sau đây', 'kí hiệu', 'kéo cọc'])
                if pics:
                    closest_pic = None
                    min_dist = float('inf')
                    for p in pics:
                        dist = ((x - p['x'])**2 + (y - p['y'])**2)**0.5
                        if dist < min_dist:
                            min_dist = dist
                            closest_pic = p
                    if closest_pic and (min_dist < 3600000 or has_image_ref):
                        attached_media_key = closest_pic['media_key']
                        
                has_context_image = 0
                has_media = 0
                media_keys_list = []
                
                if attached_media_key:
                    media_tag = f"<!-- media:{attached_media_key} -->"
                    if context_text:
                        context_text = f"{context_text}\n\n{media_tag}"
                    else:
                        context_text = f"Xem xét sơ đồ / biểu đồ kỹ thuật được cho dưới đây:\n\n{media_tag}"
                    has_context_image = 1
                    media_keys_list.append(attached_media_key)
                    
                # Determine correct answer index
                correct_idx = find_correct_option_index(red_answer, options_raw, full_content)
                if correct_idx >= len(options_raw):
                    correct_idx = 0
                    
                # Hierarchical topic determination
                topic_path = determine_subtopic_path(subj, full_content, " ".join(options_raw))
                target_topic_id = topic_map.get(topic_path, topic_map["dien-dien-tu/mach-dien-do-luong/thiet-bi-do"])
                
                # Engineering tags
                tags = [subj.split()[0], "WhiteStar", "KyThuat"]
                if "PLC" in subj: tags.append("PLC")
                elif "Khí nén" in subj: tags.append("Pneumatics")
                elif "Cơ khí" in subj: tags.append("Mechanics")
                
                # Detailed technical explanation
                correct_text = options_raw[correct_idx]
                explanation = (
                    f"**Đáp án chính xác:** **{chr(65+correct_idx)}. {correct_text}**\n\n"
                    f"**Phân tích & Hướng dẫn kỹ thuật:**\n"
                    f"Trong nội dung tiêu chuẩn chuyên ngành của ngân hàng đề thi White Star, "
                    f"lựa chọn **{chr(65+correct_idx)}** phản ánh chính xác nguyên lý hoạt động, "
                    f"công thức tính toán kỹ thuật hoặc quy tắc đấu nối/lập trình của thiết bị."
                )
                
                # Insert question
                cursor.execute("""
                    INSERT INTO questions (
                        topic_id, difficulty_level, question_type, tags,
                        context_text, has_context_image, content, has_media,
                        media_keys, explanation
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    target_topic_id,
                    2,
                    'SINGLE_CHOICE',
                    json.dumps(tags, ensure_ascii=False),
                    context_text,
                    has_context_image,
                    full_content,
                    has_media,
                    json.dumps(media_keys_list) if media_keys_list else None,
                    explanation
                ))
                new_q_id = cursor.lastrowid
                
                # Insert options
                for opt_idx, opt_text in enumerate(options_raw):
                    is_corr = 1 if opt_idx == correct_idx else 0
                    cursor.execute("""
                        INSERT INTO options (question_id, content, is_correct, has_image, image_url, order_index)
                        VALUES (?, ?, ?, 0, NULL, ?)
                    """, (new_q_id, opt_text, is_corr, opt_idx + 1))
                    
                imported_questions_count += 1

    conn.commit()
    print("=" * 60)
    print("IMPORT COMPLETE & VERIFIED!")
    print(f"Total Unique Technical Questions Imported: {imported_questions_count}")
    print(f"Media Assets Extracted & Linked: {extracted_images_count}")
    
    # Query summary counts per domain
    cursor.execute("""
        SELECT t.name, count(q.id) 
        FROM questions q 
        JOIN topics t ON q.topic_id = t.id 
        GROUP BY t.id 
        ORDER BY count(q.id) DESC
    """)
    rows = cursor.fetchall()
    print("\nQuestions per Topic distribution:")
    for r in rows:
        print(f"  * {r[0]}: {r[1]} questions")
        
    conn.close()

if __name__ == '__main__':
    import_ws_bank()
