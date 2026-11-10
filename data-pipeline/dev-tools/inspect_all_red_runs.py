import zipfile
import xml.etree.ElementTree as ET
import re

PPTX_PATH = 'WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx'

z = zipfile.ZipFile(PPTX_PATH, 'r')
slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
def get_num(s):
    m = re.search(r'slide(\d+)\.xml', s)
    return int(m.group(1)) if m else 0
slides.sort(key=get_num)

total_q = 0
red_found = 0
no_red = 0
red_examples = []

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
            total_q += 1
            if red_runs:
                red_found += 1
                if len(red_examples) < 15:
                    red_examples.append("".join(red_runs).strip())
            else:
                no_red += 1

print(f"Total question boxes: {total_q}")
print(f"Red marked boxes: {red_found}")
print(f"No red markings: {no_red}")
print("Sample red runs:")
for ex in red_examples:
    print(f"  - {repr(ex)}")
