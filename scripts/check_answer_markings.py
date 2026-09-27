import zipfile
import xml.etree.ElementTree as ET

path = 'WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx'

with zipfile.ZipFile(path, 'r') as z:
    for slide_idx in [1, 2, 3]:
        s = f'ppt/slides/slide{slide_idx}.xml'
        xml_data = z.read(s)
        root = ET.fromstring(xml_data)
        
        print(f"\n==================== SLIDE {slide_idx} ====================")
        # Check shapes, text, colors (highlight, font color, red color)
        for sp in root.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
            texts_with_color = []
            for r in sp.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}r'):
                t_elem = r.find('{http://schemas.openxmlformats.org/drawingml/2006/main}t')
                if t_elem is None or not t_elem.text:
                    continue
                # check color
                color = None
                rPr = r.find('{http://schemas.openxmlformats.org/drawingml/2006/main}rPr')
                if rPr is not None:
                    solidFill = rPr.find('{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill')
                    if solidFill is not None:
                        srgb = solidFill.find('{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr')
                        if srgb is not None:
                            color = srgb.attrib.get('val')
                        scheme = solidFill.find('{http://schemas.openxmlformats.org/drawingml/2006/main}schemeClr')
                        if scheme is not None:
                            color = 'scheme:' + scheme.attrib.get('val', '')
                    highlight = rPr.find('{http://schemas.openxmlformats.org/drawingml/2006/main}highlight')
                    if highlight is not None:
                        color = 'hl:' + str(highlight.attrib)
                texts_with_color.append((t_elem.text, color))
            if texts_with_color:
                full_text = "".join(t[0] for t in texts_with_color)
                colored = [t for t in texts_with_color if t[1] is not None and ('FF0000' in str(t[1]) or 'red' in str(t[1]).lower() or 'accent' in str(t[1]) or 'hl' in str(t[1]))]
                print(f"Shape: {full_text[:80]}...")
                if colored:
                    print(f"  Colored/Marked: {colored}")
        
        # Also check circle or oval overlays
        for shape in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}prstGeom'):
            geom = shape.attrib.get('prst')
            if 'oval' in geom.lower() or 'ellipse' in geom.lower() or 'circle' in geom.lower():
                print(f"  -> Found Oval/Circle shape in slide {slide_idx}")
