import zipfile
import xml.etree.ElementTree as ET
import re

path = 'WS/03. De on tap & Ngan hang cau hoi/Tong hop de thi va dap an on ky 2023.pptx'
z = zipfile.ZipFile(path, 'r')
slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
def get_num(s):
    m = re.search(r'slide(\d+)\.xml', s)
    return int(m.group(1)) if m else 0
slides.sort(key=get_num)

# Check slides in intervals
for idx in [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160]:
    s_name = f'ppt/slides/slide{idx}.xml'
    if s_name not in z.namelist(): continue
    root = ET.fromstring(z.read(s_name))
    texts = [t.text.strip() for t in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if t.text and t.text.strip()]
    header = " ".join(texts[:5]) if texts else "EMPTY"
    
    # Check red or highlights
    colors = set()
    for rPr in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}rPr'):
        sf = rPr.find('{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill')
        if sf is not None:
            srgb = sf.find('{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr')
            if srgb is not None:
                colors.add(srgb.attrib.get('val'))
    print(f"Slide {idx}: {header[:60]} | Colors: {list(colors)[:4]}")
