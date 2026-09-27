import zipfile
import xml.etree.ElementTree as ET
import re
import sys
sys.path.insert(0, '.')
from scripts.import_ws_questions import (
    PPTX_PATH, clean_technical_text, separate_content_and_options
)

z = zipfile.ZipFile(PPTX_PATH, 'r')
slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
def get_num(s):
    m = re.search(r'slide(\d+)\.xml', s)
    return int(m.group(1)) if m else 0
slides.sort(key=get_num)

def robust_parse_options(opt_lines):
    options_raw = []
    if not opt_lines:
        return options_raw
        
    comb_opts = " ".join(opt_lines)
    
    # Check if this is an image-choice question where lines are just markers A. B. C. D.
    markers = re.findall(r'([A-D①-④])[\.\:\)]', comb_opts)
    # Check if there is actual descriptive text
    text_without_markers = re.sub(r'([A-D①-④])[\.\:\)]', '', comb_opts).strip()
    
    if len(markers) >= 3 and len(text_without_markers) < 10:
        # Pure diagram options (A, B, C, D)
        return ['Hình A', 'Hình B', 'Hình C', 'Hình D']
        
    # Standard marker-based splitting
    if re.search(r'(?:^|\s+)([A-D①-④])[\.\:\)]\s*', comb_opts):
        parts = re.split(r'(?:^|\s+)([A-D①-④])[\.\:\)]\s*', comb_opts)
        # parts: [pre, marker1, text1, marker2, text2, ...]
        i = 1
        while i < len(parts) - 1:
            val = parts[i+1].strip()
            # If the option text is non-empty
            clean_val = clean_technical_text(val)
            clean_val = re.sub(r'^[A-D①-④][\.\:\)\s]+', '', clean_val).strip()
            if clean_val:
                options_raw.append(clean_val)
            else:
                marker = parts[i]
                options_raw.append(f"Phương án {marker}")
            i += 2
            
    # Fallback to line-by-line if splitting didn't yield enough options
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

def robust_find_answer(red_raw, options_raw):
    if not red_raw or not options_raw:
        return -1, "no_data"
        
    clean_red = clean_technical_text(red_raw).strip()
    char_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3, '①': 0, '②': 1, '③': 2, '④': 3}
    
    # 1. Check if red contains an isolated or prefixed marker
    # e.g. "D.", "B. Ion hóa", "(C)", "A", "①", ". D."
    m_marker = re.search(r'(?:^|[\s\.\,\(\[])([A-D①-④])(?:$|[\s\.\:\)\]])', red_raw.strip())
    # Only use marker if the options themselves correspond to A,B,C,D or start with A,B,C,D
    if m_marker:
        char = m_marker.group(1)
        if char in char_map:
            idx = char_map[char]
            if idx < len(options_raw):
                # Also verify if red_raw is short (mostly just the marker or marker + answer)
                if len(red_raw.strip()) < 50 or red_raw.strip().startswith(char):
                    return idx, "isolated_marker"

    # 2. Text normalization match
    norm_red = normalize_for_match(clean_red)
    norm_red_raw = normalize_for_match(red_raw)
    norm_opts = [normalize_for_match(opt) for opt in options_raw]
    
    # 2a. Exact match
    for idx, no in enumerate(norm_opts):
        if no and (no == norm_red or no == norm_red_raw):
            return idx, "exact_norm"
            
    # 2b. Substring match (prefer longer matches)
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
        return best_idx, "substring_norm"
        
    # 3. Fallback: if red has ANY marker character A-D anywhere
    m_any = re.search(r'([A-D①-④])', red_raw)
    if m_any:
        char = m_any.group(1)
        if char in char_map and char_map[char] < len(options_raw):
            return char_map[char], "fallback_marker"
            
    return -1, "unmatched"

matched = 0
unmatched = 0
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
            options_raw = robust_parse_options(opt_lines)
            
            idx, method = robust_find_answer(red_answer, options_raw)
            if idx != -1:
                matched += 1
            else:
                unmatched += 1
                results.append((s_idx, int(m.group(1)), red_answer, options_raw))

print(f"Total evaluated: {matched + unmatched}")
print(f"Matched successfully: {matched} ({matched/(matched+unmatched)*100:.1f}%)")
print(f"Unmatched: {unmatched}")
if results:
    print("\nRemaining unmatched:")
    for r in results:
        print(f"Slide {r[0]} Q#{r[1]}: red={repr(r[2])} | opts={r[3]}")
