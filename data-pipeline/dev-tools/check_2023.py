import zipfile
import xml.etree.ElementTree as ET

path = 'WS/03. De on tap & Ngan hang cau hoi/Tong hop de thi va dap an on ky 2023.pptx'

with zipfile.ZipFile(path, 'r') as z:
    slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
    print(f"Total slides in 2023 file: {len(slides)}")
    
    # Check slide 1 and 2
    for s_num in [1, 2, 3]:
        s_name = f'ppt/slides/slide{s_num}.xml'
        root = ET.fromstring(z.read(s_name))
        texts = [t.text.strip() for t in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if t.text and t.text.strip()]
        print(f"Slide {s_num}: {' '.join(texts[:15])}...")
