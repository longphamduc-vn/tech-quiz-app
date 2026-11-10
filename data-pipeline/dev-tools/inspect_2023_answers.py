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

print(f"Total slides in 2023 file: {len(slides)}")

red_boxes = 0
total_boxes = 0
sample_matches = []

for s_name in slides:
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
            total_boxes += 1
            if red_runs:
                red_boxes += 1
                if len(sample_matches) < 5:
                    sample_matches.append((paras[0][:60], "".join(red_runs)))

print(f"Total question boxes: {total_boxes}")
print(f"Red boxes: {red_boxes}")
for q, r in sample_matches:
    print(f"  Q: {q}")
    print(f"  A (red): {r}")
