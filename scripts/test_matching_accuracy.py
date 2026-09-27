import zipfile
import xml.etree.ElementTree as ET
import re
import sys
sys.path.insert(0, '.')
from scripts.import_ws_questions import (
    PPTX_PATH, clean_technical_text,
    separate_content_and_options, parse_option_strings
)

z = zipfile.ZipFile(PPTX_PATH, 'r')
slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
def get_num(s):
    m = re.search(r'slide(\d+)\.xml', s)
    return int(m.group(1)) if m else 0
slides.sort(key=get_num)

def normalize_for_match(text):
    if not text: return ""
    # Remove leading marker like A. B. 1. (1) ① etc.
    text = re.sub(r'^(?:[A-D①-④]|\(\s*[A-D①-④]\s*\))[\.\:\)\s]*', '', text.strip())
    # Remove all punctuation and whitespace
    text = re.sub(r'[^a-zA-Z0-9\u00C0-\u1EF9]', '', text.lower())
    return text

def find_correct_option_index(red_raw, options_raw):
    if not red_raw or not options_raw:
        return -1, "no_data"
        
    clean_red = clean_technical_text(red_raw).strip()
    
    # Check 1: Does red_raw explicitly start with a letter marker?
    # e.g., 'D.Ngăn...', 'B. Ion hóa', '(C) LED', '① ...'
    m_marker = re.match(r'^(?:([A-D①-④])[\.\:\)\s]|\(\s*([A-D①-④])\s*\))', red_raw.strip())
    if m_marker:
        char = m_marker.group(1) or m_marker.group(2)
        char_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3, '①': 0, '②': 1, '③': 2, '④': 3}
        if char in char_map:
            idx = char_map[char]
            if idx < len(options_raw):
                return idx, "explicit_marker"
    
    # Check 2: Exact or normalized match against options
    norm_red = normalize_for_match(clean_red)
    norm_red_raw = normalize_for_match(red_raw)
    
    norm_opts = [normalize_for_match(opt) for opt in options_raw]
    
    # 2a. Exact normalized match
    for idx, no in enumerate(norm_opts):
        if no and (no == norm_red or no == norm_red_raw):
            return idx, "exact_norm"
            
    # 2b. One is substring of the other (with minimum length check to avoid false positives)
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
        
    return -1, "unmatched"

matched = 0
unmatched = 0
unmatched_details = []

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
            options_raw = parse_option_strings(opt_lines)
            
            idx, method = find_correct_option_index(red_answer, options_raw)
            if idx != -1:
                matched += 1
            else:
                unmatched += 1
                unmatched_details.append({
                    'slide': s_idx,
                    'q_num': int(m.group(1)),
                    'red': red_answer,
                    'opts': options_raw,
                    'paras': paras
                })

print(f"Total evaluated: {matched + unmatched}")
print(f"Matched successfully: {matched} ({matched/(matched+unmatched)*100:.1f}%)")
print(f"Unmatched: {unmatched}")
if unmatched_details:
    print("\nSample unmatched:")
    for d in unmatched_details[:10]:
        print(f"Slide {d['slide']} Q#{d['q_num']}:")
        print(f"  red: {repr(d['red'])}")
        print(f"  opts: {d['opts']}")
