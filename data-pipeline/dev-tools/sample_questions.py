import zipfile
import xml.etree.ElementTree as ET
import re

path = 'WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx'

def sample_questions():
    with zipfile.ZipFile(path, 'r') as z:
        slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
        def get_num(s):
            m = re.search(r'slide(\d+)\.xml', s)
            return int(m.group(1)) if m else 0
        slides.sort(key=get_num)
        
        sample_indices = [1, 2, 3, 4, 5, 6, 7, 8, 17, 18, 19, 20]
        
        for s_num in sample_indices:
            s_name = f'ppt/slides/slide{s_num}.xml'
            xml_data = z.read(s_name)
            root = ET.fromstring(xml_data)
            
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
                
                if paras:
                    m = re.match(r'^\s*(\d+)[\.\,\s]', paras[0])
                    if m and len(paras) >= 2:
                        print(f"\n[Slide {s_num}] Q#{m.group(1)}:")
                        print("  Raw Question:", paras[0])
                        print("  Raw Options/Lines:", paras[1:])
                        print("  Red Answer:", "".join(red_runs) if red_runs else "NONE")

if __name__ == '__main__':
    sample_questions()
