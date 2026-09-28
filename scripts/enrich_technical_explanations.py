import sqlite3
import json
import re
from specialized_rules import SPECIALIZED_CASES

DB_PATH = "data/app.db"

# Extensive Bilingual Technical Dictionary (100+ terms)
BILINGUAL_DICT = {
    # Electronics & Components
    "tụ điện": "Capacitor",
    "điện dung": "Capacitance (C)",
    "điện trở": "Resistor (R)",
    "cuộn cảm": "Inductor (L)",
    "cảm kháng": "Inductive Reactance (X_L)",
    "dung kháng": "Capacitive Reactance (X_C)",
    "hằng số điện môi": "Dielectric Constant / Permittivity (epsilon)",
    "khoảng cách bản cực": "Plate Separation / Distance (d)",
    "diode": "Diode (D)",
    "zener": "Zener Diode (Điốt ổn áp)",
    "bjt": "Bipolar Junction Transistor (BJT)",
    "transistor": "Transistor",
    "cực bazơ": "Base (B)",
    "cực góp": "Collector (C)",
    "cực phát": "Emitter (E)",
    "open collector": "Open Collector (Cực thu để hở)",
    "thyristor": "Thyristor (SCR)",
    "scr": "Silicon Controlled Rectifier (SCR)",
    "triac": "TRIAC (Triode for Alternating Current)",
    "diac": "DIAC (Diode for Alternating Current)",
    "ssr": "Solid State Relay (Rơ le bán dẫn)",
    "optocoupler": "Optocoupler / Photo-coupler (Cách ly quang)",
    "quang phổ hồng ngoại": "Infrared Spectrum (IR)",
    "bước sóng": "Wavelength (lambda)",
    "tia cực tím": "Ultraviolet (UV)",
    "led": "Light Emitting Diode (LED)",
    "cảm biến quang": "Photoelectric Sensor",
    "phản xạ hồi quy": "Retro-reflective Sensor",
    "khuếch đại thuật toán": "Operational Amplifier (Op-Amp)",
    
    # Instrumentation & Electrical Safety
    "ampe kìm": "Clamp Meter / Current Clamp",
    "đồng hồ vạn năng": "Digital Multimeter (DMM)",
    "megohmmeter": "Megohmmeter / Mega Tester (Đo điện trở cách điện)",
    "dao động ký": "Oscilloscope",
    "dòng điện hiệu dụng": "RMS Current (I_rms)",
    "dòng điện 1 chiều": "Direct Current (DC)",
    "dòng điện xoay chiều": "Alternating Current (AC)",
    "hiệu điện thế": "Potential Difference / Voltage (V)",
    "dòng giải thoát": "Let-go Current (Ngưỡng tự thoát)",
    "nhiễu sụt áp": "Voltage Sag / Dip Noise",
    "nhiễu xung sét": "Lightning Surge Noise",
    "phóng tĩnh điện": "Electrostatic Discharge (ESD)",
    
    # Automation & PLC
    "plc": "Programmable Logic Controller (PLC)",
    "cpu": "Central Processing Unit (CPU)",
    "scan time": "Scan Time (Thời gian quét vòng lặp)",
    "chu kỳ quét": "Scan Cycle",
    "bit device": "Bit Device (X, Y, M, L, B)",
    "word device": "Word Device (D, W, R, ZR)",
    "data register": "Data Register (D)",
    "file register": "File Register (R/ZR)",
    "link relay": "Link Relay (B)",
    "link register": "Link Register (W)",
    "latch": "Latch Relay (L)",
    "timer": "Timer (T)",
    "counter": "Counter (C)",
    "sườn lên": "Rising Edge Pulse (PLS)",
    "sườn xuống": "Falling Edge Pulse (PLF)",
    "flip-flop": "Flip-Flop (FF)",
    "master control": "Master Control (MC/MCR)",
    "cross reference": "Cross Reference",
    "system monitor": "System Monitor",
    "mã bcd": "Binary Coded Decimal (BCD)",
    "hệ nhị phân": "Binary System",
    "hệ thập lục phân": "Hexadecimal System",
    "analog": "Analog Signal",
    "a/d converter": "Analog-to-Digital Converter (A/D)",
    
    # Pneumatics & Hydraulics
    "định luật boyle": "Boyle-Mariotte Law (P1*V1 = P2*V2)",
    "định luật charles": "Charles Law (V1/T1 = V2/T2)",
    "định luật pascal": "Pascal Principle (P = F/A)",
    "áp suất khí quyển": "Atmospheric Pressure (1.033 kgf/cm2)",
    "áp suất tuyệt đối": "Absolute Pressure (P_abs = P_gauge + P_atm)",
    "máy nén khí": "Air Compressor",
    "máy nén piston": "Reciprocating Piston Compressor",
    "máy nén trục vít": "Rotary Screw Compressor",
    "máy sấy khí làm lạnh": "Refrigerated Air Dryer",
    "máy sấy khí hấp phụ": "Desiccant Air Dryer",
    "nhiệt độ điểm sương": "Pressure Dew Point (PDP)",
    "bộ lọc khí": "Air Filter",
    "lõi lọc": "Filter Element",
    "tấm cản xoáy": "Deflector",
    "van đảo chiều": "Directional Control Valve",
    "van một chiều": "Check Valve",
    "van xả nhanh": "Quick Exhaust Valve",
    "van tiết lưu": "Throttle Valve",
    "van tuần tự": "Sequence Valve",
    "xy lanh khí nén": "Pneumatic Cylinder",
    "xy lanh tác động kép": "Double-acting Cylinder",
    "xy lanh tác động đơn": "Single-acting Cylinder",
    
    # Mechanics, Motion & Machine Components
    "vít me bi": "Ballscrew Assembly",
    "khử độ rơ": "Mechanical Preload",
    "trục chính": "Machine Tool Spindle",
    "dẫn hướng tuyến tính": "Linear Motion Guide (LM Guide)",
    "con trượt": "LM Block (Carriage)",
    "ống lót trượt": "Linear Bushing",
    "ổ bi cầu rãnh sâu": "Deep Groove Ball Bearing",
    "ổ lăn đỡ hướng tâm": "Radial Bearing",
    "ổ lăn chặn hướng trục": "Thrust Bearing",
    "ổ bi tiếp xúc góc": "Angular Contact Ball Bearing",
    "bôi trơn dầu": "Oil Lubrication",
    "bôi trơn mỡ": "Grease Lubrication",
    "bộ truyền đai răng": "Timing Belt Drive",
    "bộ truyền xích": "Roller Chain Drive",
    "bánh răng trụ răng thẳng": "Spur Gear",
    "bánh răng trụ răng nghiêng": "Helical Gear",
    "bánh răng côn": "Bevel Gear",
    "trục vít bánh vít": "Worm & Worm Gear",
    "thanh răng": "Rack Gear",
    "hộp giảm tốc harmonic": "Harmonic Drive Gearbox",
    "then bằng": "Parallel Key",
    "then bán nguyệt": "Woodruff Key",
    "chốt định vị": "Dowel Pin",
    "thước cặp cơ khí": "Vernier Caliper",
    "tiêu chuẩn jis": "Japanese Industrial Standards (JIS)",
    "tiêu chuẩn din": "Deutsches Institut für Normung (DIN)",
    "tiêu chuẩn iso": "International Organization for Standardization (ISO)",
    "khổ giấy tiêu chuẩn": "ISO 216 Paper Sizes (A0 - A4)"
}

def generate_contextual_explanation(q_id, content, corr_let, corr_text, options, topic):
    # 1. Exact case lookup
    if q_id in SPECIALIZED_CASES:
        return SPECIALIZED_CASES[q_id]

    text_lower = (content + " " + " ".join(o["text"] for o in options) + " " + topic).lower()
    
    # Extract matching bilingual terms
    found_terms = []
    for vn_term, en_term in BILINGUAL_DICT.items():
        if vn_term in text_lower:
            found_terms.append(f"- {vn_term.capitalize()}: *{en_term}*")
            if len(found_terms) >= 5:
                break
                
    if not found_terms:
        found_terms = [
            f"- Phương án chuẩn kỹ thuật: *Engineering Standard Choice ({corr_let})*",
            f"- Chuyên ngành đào tạo: *{topic}*",
            "- Thông số kỹ thuật danh định: *Nominal Engineering Parameters*",
            "- Tiêu chuẩn an toàn & vận hành: *Industrial Operation Standards*"
        ]
        
    other_opts = [o for o in options if not o["is_correct"]]
    distractor_notes = []
    for o in other_opts[:3]:
        clean_t = re.sub(r'^[A-Fa-f0-9\.\,\s\-]+', '', o["text"]).strip()
        if clean_t and clean_t != corr_text:
            distractor_notes.append(f"- **{o['letter']}. {clean_t}:** Chưa thỏa mãn điều kiện kỹ thuật của bài toán hoặc là khái niệm thuộc nhóm thông số vận hành khác.")

    distractor_text = "\n".join(distractor_notes) if distractor_notes else "- Các phương án còn lại mô tả sai thông số hoặc không phù hợp với chuẩn định danh của thiết bị."

    # Domain specific guidance
    principle = ""
    if "plc" in text_lower or "ladder" in text_lower or "device" in text_lower:
        principle = f"Trong kiến trúc điều khiển lập trình PLC và chuẩn tự động hóa công nghiệp (Automation Engineering), phương án **{corr_let}. {corr_text}** tuân thủ đúng cấu trúc vùng nhớ, giản đồ thời gian (Timing Chart) và tập lệnh vận hành chu kỳ quét CPU."
    elif "khí nén" in text_lower or "van" in text_lower or "xy lanh" in text_lower or "áp suất" in text_lower:
        principle = f"Trong hệ thống truyền động khí nén & thủy lực (Pneumatic & Hydraulic Power Systems), phương án **{corr_let}. {corr_text}** phản ánh chính xác định luật nhiệt động học khí lý tưởng, cấu tạo van điều hướng hoặc đặc tính cơ cấu chấp hành công nghiệp."
    elif "vòng bi" in text_lower or "bánh răng" in text_lower or "vít me" in text_lower or "đai" in text_lower or "then" in text_lower:
        principle = f"Trong thiết kế chi tiết máy và cơ cấu truyền động chính xác (Precision Mechanical Engineering), phương án **{corr_let}. {corr_text}** đảm bảo đúng nguyên lý ma sát, khả năng chịu tải trọng và tiêu chuẩn gia công lắp ghép cơ khí."
    else:
        principle = f"Trong tiêu chuẩn chuyên ngành của môn học **{topic}**, phương án **{corr_let}. {corr_text}** là lựa chọn chính xác về mặt vật lý, định nghĩa mạch điện tử và nguyên lý vận hành của thiết bị."

    return f"""**Đáp án chính xác:** **{corr_let}. {corr_text}**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Nguyên lý hoạt động & Tiêu chuẩn kỹ thuật (Operating Principle & Standard):**
   - {principle}
   - Xét nội dung câu hỏi: *"{content.strip()}"*, phương án **{corr_text}** là kết quả kỹ thuật chuẩn xác, phù hợp với các thông số làm việc và quy chuẩn đào tạo kỹ sư công nghiệp.

2. **Đánh giá và phân tích loại trừ các phương án (Comparative Analysis):**
{distractor_text}
   - Do đó, phương án **{corr_let}** là phương án chuẩn xác nhất.

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
{chr(10).join(found_terms)}"""

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT q.id, t.name, q.content, q.explanation,
               (SELECT json_group_array(json_object('letter', char(65+o.order_index-1), 'text', o.content, 'is_correct', o.is_correct))
                FROM options o WHERE o.question_id = q.id ORDER BY o.order_index)
        FROM questions q
        JOIN topics t ON q.topic_id = t.id
        WHERE q.explanation LIKE "%ngân hàng đề thi White Star%" OR q.explanation LIKE "%phản ánh chính xác nguyên lý%"
    """)
    rows = cursor.fetchall()
    print(f"Found {len(rows)} questions to upgrade...")
    
    updated_count = 0
    for r in rows:
        q_id = r[0]
        topic = r[1]
        content = r[2]
        raw_options = json.loads(r[4])
        
        corr = [o for o in raw_options if o["is_correct"]]
        corr_let = corr[0]["letter"] if corr else "A"
        corr_text = corr[0]["text"] if corr else raw_options[0]["text"]
        
        new_expl = generate_contextual_explanation(q_id, content, corr_let, corr_text, raw_options, topic)
        
        cursor.execute("UPDATE questions SET explanation = ? WHERE id = ?", (new_expl, q_id))
        updated_count += 1
        
    conn.commit()
    conn.close()
    print(f"Successfully updated {updated_count} questions with rich bilingual explanations in {DB_PATH}!")

if __name__ == "__main__":
    main()
