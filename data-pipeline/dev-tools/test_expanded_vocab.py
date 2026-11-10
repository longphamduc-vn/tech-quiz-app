import zipfile
import xml.etree.ElementTree as ET
import re

TERM_REPLACEMENTS = [
    # Typos and spacing artifacts
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
    
    # Electrical & Electronics Terminology
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
    
    # Mechanics & Machine Components Terminology
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
    
    # Pneumatics & Hydraulics Terminology
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
    
    # Mathematical units & LaTeX Formatting
    (r'500\[Hz\]', '$500\\,\\text{Hz}$'),
    (r'1500\[Hz\]', '$1500\\,\\text{Hz}$'),
    (r'47\[㎌\]', '$47\\,\\mu\\text{F}$'),
    (r'50\[V\]', '$50\\,\\text{V}$'),
    (r'0,7V|0\.7\[V\]', '$0.7\\,\\text{V}$'),
    (r'0,2V|0\.2\[V\]', '$0.2\\,\\text{V}$'),
    (r'\(1001\)₂', '$(1001)_2$'),
    (r'F14\s+hệ\s+16', '$(\\text{F14})_{16}$'),
    (r'kgf/㎠', '$\\text{kgf/cm}^2$'),
    (r'mmH2g|mmHg', '$\\text{mmHg}$')
]

def clean_technical_text(text):
    if not text: return ""
    cleaned = text
    for pattern, replacement in TERM_REPLACEMENTS:
        cleaned = re.sub(pattern, lambda _, r=replacement: r, cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'[ \t]+', ' ', cleaned).strip()
    return cleaned

print(f"Total technical replacement rules defined: {len(TERM_REPLACEMENTS)}")
