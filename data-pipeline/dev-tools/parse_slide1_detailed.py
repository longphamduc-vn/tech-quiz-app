import zipfile
import xml.etree.ElementTree as ET
import re

path = 'WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx'

def parse_slide_shapes(slide_xml):
    root = ET.fromstring(slide_xml)
    shapes_data = []
    
    # Namespace mappings
    ns = {
        'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
        'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
        'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
    }
    
    for sp in root.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
        paras = []
        for p in sp.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}p'):
            runs = []
            for r in p.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}r'):
                t_elem = r.find('{http://schemas.openxmlformats.org/drawingml/2006/main}t')
                if t_elem is None or not t_elem.text:
                    continue
                color = None
                rPr = r.find('{http://schemas.openxmlformats.org/drawingml/2006/main}rPr')
                if rPr is not None:
                    solidFill = rPr.find('{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill')
                    if solidFill is not None:
                        srgb = solidFill.find('{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr')
                        if srgb is not None:
                            color = srgb.attrib.get('val')
                runs.append({'text': t_elem.text, 'color': color})
            if runs:
                paras.append(runs)
        if paras:
            shapes_data.append(paras)
    return shapes_data

with zipfile.ZipFile(path, 'r') as z:
    xml_data = z.read('ppt/slides/slide1.xml')
    shapes = parse_slide_shapes(xml_data)
    for s_idx, shape in enumerate(shapes):
        print(f"\n--- Shape {s_idx} ---")
        full_text = "\n".join("".join(r['text'] for r in p) for p in shape)
        red_parts = []
        for p in shape:
            for r in p:
                if r['color'] and ('FF0000' in r['color'] or 'red' in r['color'].lower()):
                    red_parts.append(r['text'])
        print("Text:\n", full_text)
        if red_parts:
            print("RED ANSWER:", "".join(red_parts))
