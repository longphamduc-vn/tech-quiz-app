import zipfile
import xml.etree.ElementTree as ET
import re
import sys
sys.path.insert(0, '.')
from scripts.test_expanded_vocab import clean_technical_text, TERM_REPLACEMENTS

z = zipfile.ZipFile('WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx', 'r')
slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
def get_num(s):
    m = re.search(r'slide(\d+)\.xml', s)
    return int(m.group(1)) if m else 0
slides.sort(key=get_num)

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

def parse_option_strings(opt_lines):
    options_raw = []
    if not opt_lines:
        return options_raw
        
    comb_opts = " ".join(opt_lines)
    
    # Check if pure diagram choices
    markers = re.findall(r'([A-D①-④])[\.\:\)]', comb_opts)
    text_without_markers = re.sub(r'([A-D①-④])[\.\:\)]', '', comb_opts).strip()
    if len(markers) >= 3 and len(text_without_markers) < 10:
        return ['Hình A', 'Hình B', 'Hình C', 'Hình D']
        
    if re.search(r'(?:^|\s+)([A-D①-④])[\.\:\)]\s*', comb_opts):
        parts = re.split(r'(?:^|\s+)([A-D①-④])[\.\:\)]\s*', comb_opts)
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

total = 0
results = []
for s_idx, s_name in enumerate(slides, 1):
    root = ET.fromstring(z.read(s_name))
    for sp in root.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
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
                    sf = rPr.find('{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill')
                    if sf is not None:
                        srgb = sf.find('{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr')
                        if srgb is not None and 'FF0000' in srgb.attrib.get('val', ''):
                            red_runs.append(text)
            if p_text.strip(): paras.append(p_text.strip())
            
        if len(paras) >= 2 and re.match(r'^\s*(\d+)[\.\,\s]', paras[0]):
            m = re.match(r'^\s*(\d+)[\.\,\s]\s*(.+)', paras[0])
            raw_title = m.group(2).strip()
            raw_body = paras[1:]
            red_answer = "".join(red_runs).strip()
            
            full_raw_content, opt_lines = separate_content_and_options(raw_title, raw_body)
            full_content = clean_technical_text(full_raw_content)
            options_raw = parse_option_strings(opt_lines)
            
            if len(options_raw) >= 2:
                total += 1
                c_idx = find_correct_option_index(red_answer, options_raw, full_content)
                results.append((s_idx, int(m.group(1)), full_content, options_raw, c_idx, red_answer))

print(f"Total valid multiple-choice questions parsed: {total}")
print("Checking slide 1 questions:")
for r in [x for x in results if x[0] == 1]:
    print(f"  Q#{r[1]}: Ans[{r[4]}] = {r[3][r[4]]} (Red was: {repr(r[5])})")
