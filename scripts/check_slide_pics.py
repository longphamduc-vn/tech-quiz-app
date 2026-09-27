import zipfile
import xml.etree.ElementTree as ET

path = 'WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx'

with zipfile.ZipFile(path, 'r') as z:
    rels_name = 'ppt/slides/_rels/slide1.xml.rels'
    if rels_name in z.namelist():
        rels_xml = z.read(rels_name)
        root_rels = ET.fromstring(rels_xml)
        for rel in root_rels:
            print("Rel ID:", rel.attrib.get('Id'), "Type:", rel.attrib.get('Type'), "Target:", rel.attrib.get('Target'))
            
    slide_xml = z.read('ppt/slides/slide1.xml')
    root_slide = ET.fromstring(slide_xml)
    for pic in root_slide.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}pic'):
        blip = pic.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
        embed = blip.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed') if blip is not None else None
        
        # Position
        xfrm = pic.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}xfrm')
        off = xfrm.find('{http://schemas.openxmlformats.org/drawingml/2006/main}off') if xfrm is not None else None
        x = off.attrib.get('x') if off is not None else None
        y = off.attrib.get('y') if off is not None else None
        print(f"Picture: embed={embed}, x={x}, y={y}")
