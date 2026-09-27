import zipfile
import xml.etree.ElementTree as ET

path = 'WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx'

with zipfile.ZipFile(path, 'r') as z:
    rels_name = 'ppt/slides/_rels/slide2.xml.rels'
    rels = {}
    if rels_name in z.namelist():
        root_rels = ET.fromstring(z.read(rels_name))
        for rel in root_rels:
            rels[rel.attrib.get('Id')] = rel.attrib.get('Target')
            
    slide_xml = z.read('ppt/slides/slide2.xml')
    root_slide = ET.fromstring(slide_xml)
    
    print("--- Pictures on Slide 2 ---")
    for pic in root_slide.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}pic'):
        blip = pic.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
        embed = blip.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed') if blip is not None else None
        
        xfrm = pic.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}xfrm')
        off = xfrm.find('{http://schemas.openxmlformats.org/drawingml/2006/main}off') if xfrm is not None else None
        ext = xfrm.find('{http://schemas.openxmlformats.org/drawingml/2006/main}ext') if xfrm is not None else None
        
        x = int(off.attrib.get('x', 0)) if off is not None else 0
        y = int(off.attrib.get('y', 0)) if off is not None else 0
        cx = int(ext.attrib.get('cx', 0)) if ext is not None else 0
        cy = int(ext.attrib.get('cy', 0)) if ext is not None else 0
        
        target = rels.get(embed, '')
        print(f"Pic: target={target}, x={x}, y={y}, cx={cx}, cy={cy}")

    print("\n--- Question Shapes on Slide 2 ---")
    for sp in root_slide.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
        xfrm = sp.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}xfrm')
        off = xfrm.find('{http://schemas.openxmlformats.org/drawingml/2006/main}off') if xfrm is not None else None
        x = int(off.attrib.get('x', 0)) if off is not None else 0
        y = int(off.attrib.get('y', 0)) if off is not None else 0
        
        t_text = "".join(t.text for t in sp.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if t.text).strip()
        if t_text:
            print(f"Shape at (x={x}, y={y}): {t_text[:50]}...")
