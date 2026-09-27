import zipfile
import xml.etree.ElementTree as ET
import re

path = 'WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx'

def count_unique_questions():
    with zipfile.ZipFile(path, 'r') as z:
        slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
        def get_num(s):
            m = re.search(r'slide(\d+)\.xml', s)
            return int(m.group(1)) if m else 0
        slides.sort(key=get_num)
        
        seen_titles = set()
        unique_questions = []
        
        for s_idx, s in enumerate(slides, 1):
            root = ET.fromstring(z.read(s))
            for sp in root.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
                paras = []
                for p in sp.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}p'):
                    p_text = "".join(t.text for t in p.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if t.text)
                    if p_text.strip():
                        paras.append(p_text.strip())
                if len(paras) >= 2:
                    m = re.match(r'^\s*(\d+)[\.\,\s]\s*(.+)', paras[0])
                    if m:
                        title_clean = re.sub(r'\s+', ' ', m.group(2)).strip().lower()
                        if title_clean not in seen_titles:
                            seen_titles.add(title_clean)
                            unique_questions.append({
                                'slide': s_idx,
                                'num': int(m.group(1)),
                                'title': m.group(2)
                            })
        
        print(f"Total unique questions found: {len(unique_questions)}")
        print(f"Duplicates removed: {628 - len(unique_questions)}")

if __name__ == '__main__':
    count_unique_questions()
