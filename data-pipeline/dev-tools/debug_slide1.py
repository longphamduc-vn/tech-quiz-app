import zipfile
import xml.etree.ElementTree as ET
import re
import sys
sys.path.insert(0, '.')
from scripts.import_ws_questions import (
    PPTX_PATH, TERM_REPLACEMENTS, clean_technical_text,
    separate_content_and_options, parse_option_strings
)

z = zipfile.ZipFile(PPTX_PATH, 'r')
root = ET.fromstring(z.read('ppt/slides/slide1.xml'))

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
        
    if len(paras) >= 2:
        m = re.match(r'^\s*(\d+)[\.\,\s]\s*(.+)', paras[0])
        if m:
            q_num = int(m.group(1))
            raw_title = m.group(2).strip()
            raw_body = paras[1:]
            red_answer = "".join(red_runs).strip()
            
            full_raw_content, opt_lines = separate_content_and_options(raw_title, raw_body)
            full_content = clean_technical_text(full_raw_content)
            options_raw = parse_option_strings(opt_lines)
            
            correct_idx = -1
            clean_red = clean_technical_text(red_answer)
            if clean_red:
                for idx, opt_text in enumerate(options_raw):
                    if clean_red.lower() in opt_text.lower() or opt_text.lower() in clean_red.lower():
                        correct_idx = idx
                        break
                    m_marker = re.match(r'^([A-D①-④])', clean_red)
                    if m_marker:
                        m_char = m_marker.group(1)
                        char_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3, '①': 0, '②': 1, '③': 2, '④': 3}
                        if m_char in char_map:
                            correct_idx = char_map[m_char]
                            break
            print(f"Slide 1 Q#{q_num}:")
            print(f"  red_answer: {repr(red_answer)} -> clean_red: {repr(clean_red)}")
            print(f"  options: {options_raw}")
            print(f"  correct_idx: {correct_idx}")
