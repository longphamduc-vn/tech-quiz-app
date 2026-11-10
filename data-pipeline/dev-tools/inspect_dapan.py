import zipfile
import xml.etree.ElementTree as ET

path = 'WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx'

with zipfile.ZipFile(path, 'r') as z:
    slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
    def get_num(s):
        import re
        m = re.search(r'slide(\d+)\.xml', s)
        return int(m.group(1)) if m else 0
    slides.sort(key=get_num)
    
    print(f"Total slides in {path}: {len(slides)}")
    for s in slides[:6]:
        xml_data = z.read(s)
        root = ET.fromstring(xml_data)
        
        # Check text and formatting/colors
        paragraphs = []
        for p in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}p'):
            p_text = "".join(t.text for t in p.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if t.text)
            if p_text.strip():
                paragraphs.append(p_text.strip())
        
        print(f"\n--- {s} ---")
        for p in paragraphs[:10]:
            print("  *", p)
