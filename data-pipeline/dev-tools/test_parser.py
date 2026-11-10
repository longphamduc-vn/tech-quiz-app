import re

def parse_question_shape(raw_lines, red_text):
    # Separate question title/context from options
    # Check if lines have options like A., B., C., D. or ①, ②, ③, ④
    opt_regex = r'(?:^|\s+)([A-D|①-④a-d1-4][\.\:\)\s])'
    
    # Clean OCR/Translate glitches
    def clean_text(s):
        s = re.sub(r'Đ\s+áp\s+án', 'Đáp án', s)
        s = re.sub(r'Đ\s+iện\s+trở', 'Điện trở', s)
        s = re.sub(r'v\s+ề', 'về', s)
        s = re.sub(r'c\s+ó\s+thể', 'có thể', s)
        s = re.sub(r'sofrware', 'software', s)
        s = re.sub(r'Resister', 'Register', s)
        s = re.sub(r'Thước kẹp mét', 'Ampe kìm (Clamp meter)', s)
        s = re.sub(r'vỏ Electron', 'lớp vỏ electron', s)
        s = re.sub(r'Electron\s+hóa\s+trị', 'Electron hóa trị', s)
        s = re.sub(r'\s+', ' ', s).strip()
        return s

    # Combine text lines
    full_text = "\n".join(raw_lines)
    
    # Check if options are embedded on same lines (A. ... B. ... or ① ... ② ...)
    # Let's inspect splitting
    options = []
    
    # Check pattern A. ... B. ...
    # e.g. A. Kích thích    B. Ion hóa
    all_options_text = "\n".join(raw_lines[1:])
    
    # If lines start with A. B. C. D. or ① ② ③ ④
    # or if all_options_text contains A. B. C. D.
    if re.search(r'[A-D]\.\s*', all_options_text) or re.search(r'[①-④]', all_options_text):
        # Split by A. / B. / C. / D. or ① / ② / ③ / ④
        parts = re.split(r'(?:^|\s+)([A-D]\.|\([A-D]\)|[①-④])\s*', all_options_text)
        # parts will have [prefix, marker1, text1, marker2, text2, ...]
        prefix = parts[0].strip()
        context_extra = prefix if prefix else ""
        
        i = 1
        while i < len(parts) - 1:
            marker = parts[i]
            opt_val = clean_text(parts[i+1])
            if opt_val:
                options.append(opt_val)
            i += 2
    else:
        # Each line might be an option, but some lines may be context
        context_extra = ""
        candidate_options = []
        for line in raw_lines[1:]:
            line_c = clean_text(line)
            if not line_c: continue
            if line_c.startswith('[') or '※' in line_c or 'dưới đây' in line_c:
                context_extra += " " + line_c
            else:
                candidate_options.append(line_c)
        options = candidate_options

    return {
        'cleaned_title': clean_text(raw_lines[0]),
        'context_extra': clean_text(context_extra),
        'options': options,
        'red_text': clean_text(red_text)
    }

# Test sample
test_lines = [
    "12. Hiện tượng electron quỹ đạo nhận được năng lượng mạnh hơn rồi trở thành electron tự do trong nguyên tử gọi là?",
    "A. Kích thích    B. Ion hóa",
    "C. photon        D. phóng bức xạ điện từ"
]
print("Test 1:", parse_question_shape(test_lines, "B. Ion hóa"))

test_lines2 = [
    "17. Đâu không phải là đặc điểm của  Đ iện trở  nhiệt ?",
    "① Do hệ số nhiệt độ điện trở nhỏ so với nhiệt độ,  nên việc đo  nhiệt độ nhỏ và chính xác tốt.",
    "② Cấu trúc đơn giản , có thể  thu nhỏ",
    "③ Sản xuất  đại trà , c ó thể  cung cấp  số lượng lớn  với giá  thành    ổn định",
    "④  Độ bền cơ khí và tính gia công tốt"
]
print("Test 2:", parse_question_shape(test_lines2, "① Do hệ số nhiệt độ..."))
