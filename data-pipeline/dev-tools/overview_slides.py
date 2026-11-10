import zipfile
import xml.etree.ElementTree as ET
import re

path = 'WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx'

with zipfile.ZipFile(path, 'r') as z:
    slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
    def get_num(s):
        m = re.search(r'slide(\d+)\.xml', s)
        return int(m.group(1)) if m else 0
    slides.sort(key=get_num)
    
    print(f"Total slides: {len(slides)}")
    for idx, s in enumerate(slides, 1):
        xml_data = z.read(s)
        root = ET.fromstring(xml_data)
        
        texts = []
        for elem in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t'):
            if elem.text and elem.text.strip():
                texts.append(elem.text.strip())
        
        title = texts[0] if texts else "Empty"
        second = texts[1] if len(texts) > 1 else ""
        print(f"Slide {idx:02d} ({s}): {title} | {second} (total words/tokens: {len(texts)})")
