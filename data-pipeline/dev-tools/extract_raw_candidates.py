import zipfile
import xml.etree.ElementTree as ET
import re
import json

path = 'WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx'

def extract_raw_questions():
    with zipfile.ZipFile(path, 'r') as z:
        slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
        def get_num(s):
            m = re.search(r'slide(\d+)\.xml', s)
            return int(m.group(1)) if m else 0
        slides.sort(key=get_num)
        
        extracted_list = []
        
        for slide_idx, s in enumerate(slides, 1):
            xml_data = z.read(s)
            root = ET.fromstring(xml_data)
            
            # Determine subject
            all_text_on_slide = " ".join("".join(t.text for t in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if t.text).split())
            subj = "Chung"
            if "Điện" in all_text_on_slide or "Điện tử" in all_text_on_slide:
                subj = "Điện - Điện Tử"
            elif "PLC" in all_text_on_slide:
                subj = "PLC & Tự Động Hóa"
            elif "Khí nén" in all_text_on_slide:
                subj = "Hệ Thống Khí Nén"
            elif "Máy" in all_text_on_slide or "Cơ khí" in all_text_on_slide:
                subj = "Linh Kiện Máy & Cơ Khí"
                
            for sp in root.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
                paras = []
                red_runs = []
                for p in sp.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}p'):
                    p_text = ""
                    for r in p.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}r'):
                        t_elem = r.find('{http://schemas.openxmlformats.org/drawingml/2006/main}t')
                        if t_elem is None or not t_elem.text:
                            continue
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
                    first = paras[0]
                    m = re.match(r'^\s*(\d+)[\.\,\s]\s*(.+)', first)
                    if m:
                        q_num = int(m.group(1))
                        q_title = m.group(2).strip()
                        raw_body = paras[1:]
                        red_ans = "".join(red_runs).strip()
                        extracted_list.append({
                            'slide': slide_idx,
                            'subject': subj,
                            'number': q_num,
                            'title': q_title,
                            'body_lines': raw_body,
                            'red_ans': red_ans
                        })
        
        print(f"Total extracted question shapes: {len(extracted_list)}")
        with open('extracted_raw.json', 'w', encoding='utf-8') as f:
            json.dump(extracted_list[:50], f, ensure_ascii=False, indent=2)
        print("Sample saved to extracted_raw.json")

if __name__ == '__main__':
    extract_raw_questions()
