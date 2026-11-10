import zipfile
import xml.etree.ElementTree as ET
import re

path = 'WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx'

def analyze_all_questions():
    with zipfile.ZipFile(path, 'r') as z:
        slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
        def get_num(s):
            m = re.search(r'slide(\d+)\.xml', s)
            return int(m.group(1)) if m else 0
        slides.sort(key=get_num)
        
        total_questions = 0
        questions_by_subject = {}
        
        for s_idx, s in enumerate(slides, 1):
            xml_data = z.read(s)
            root = ET.fromstring(xml_data)
            
            # Detect slide subject
            slide_subject = "Chung"
            for t in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t'):
                if t.text:
                    if 'Điện' in t.text or 'Điện tử' in t.text:
                        slide_subject = "Điện - Điện Tử"
                        break
                    elif 'PLC' in t.text:
                        slide_subject = "PLC & Tự Động Hóa"
                        break
                    elif 'Khí nén' in t.text:
                        slide_subject = "Hệ Thống Khí Nén"
                        break
                    elif 'Máy' in t.text or 'Linh kiện máy' in t.text or 'Cơ khí' in t.text:
                        slide_subject = "Linh Kiện Máy & Cơ Khí"
                        break
            
            # Count question shapes
            for sp in root.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
                paras = []
                for p in sp.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}p'):
                    p_text = "".join(t.text for t in p.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if t.text)
                    if p_text.strip():
                        paras.append(p_text.strip())
                if paras:
                    first_line = paras[0]
                    # Check if starts with a number like "1.", "22.", "15.", etc.
                    m = re.match(r'^\s*(\d+)[\.\,\s]', first_line)
                    if m and len(paras) >= 2:
                        q_num = int(m.group(1))
                        total_questions += 1
                        questions_by_subject[slide_subject] = questions_by_subject.get(slide_subject, 0) + 1
        
        print(f"Total candidate questions extracted: {total_questions}")
        for subj, count in questions_by_subject.items():
            print(f"  * {subj}: {count} questions")

if __name__ == '__main__':
    analyze_all_questions()
