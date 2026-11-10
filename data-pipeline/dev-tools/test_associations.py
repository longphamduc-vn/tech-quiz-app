import zipfile
import xml.etree.ElementTree as ET
import re
import os

path = 'WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx'

def inspect_slide_associations(slide_nums=[1, 2, 3, 5, 7]):
    with zipfile.ZipFile(path, 'r') as z:
        for s_idx in slide_nums:
            s_name = f'ppt/slides/slide{s_idx}.xml'
            rels_name = f'ppt/slides/_rels/slide{s_idx}.xml.rels'
            
            rels = {}
            if rels_name in z.namelist():
                root_rels = ET.fromstring(z.read(rels_name))
                for rel in root_rels:
                    rels[rel.attrib.get('Id')] = rel.attrib.get('Target')
                    
            root_slide = ET.fromstring(z.read(s_name))
            
            # Find pics
            pics = []
            for pic in root_slide.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}pic'):
                blip = pic.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
                embed = blip.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed') if blip is not None else None
                xfrm = pic.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}xfrm')
                off = xfrm.find('{http://schemas.openxmlformats.org/drawingml/2006/main}off') if xfrm is not None else None
                x = int(off.attrib.get('x', 0)) if off is not None else 0
                y = int(off.attrib.get('y', 0)) if off is not None else 0
                pics.append({'target': rels.get(embed, ''), 'x': x, 'y': y})
                
            # Find shapes
            shapes = []
            for sp in root_slide.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
                xfrm = sp.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}xfrm')
                off = xfrm.find('{http://schemas.openxmlformats.org/drawingml/2006/main}off') if xfrm is not None else None
                x = int(off.attrib.get('x', 0)) if off is not None else 0
                y = int(off.attrib.get('y', 0)) if off is not None else 0
                
                paras = []
                red_runs = []
                for p in sp.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}p'):
                    p_text = ""
                    for r in p.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}r'):
                        t_elem = r.find('{http://schemas.openxmlformats.org/drawingml/2006/main}t')
                        if t_elem is None or not t_elem.text: continue
                        p_text += t_elem.text
                        rPr = r.find('{http://schemas.openxmlformats.org/drawingml/2006/main}rPr')
                        if rPr is not None:
                            solidFill = rPr.find('{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill')
                            if solidFill is not None:
                                srgb = solidFill.find('{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr')
                                if srgb is not None and 'FF0000' in srgb.attrib.get('val', ''):
                                    red_runs.append(t_elem.text)
                    if p_text.strip():
                        paras.append(p_text.strip())
                if paras:
                    m = re.match(r'^\s*(\d+)[\.\,\s]\s*(.+)', paras[0])
                    if m:
                        shapes.append({
                            'num': int(m.group(1)),
                            'title': m.group(2),
                            'lines': paras[1:],
                            'red': "".join(red_runs),
                            'x': x,
                            'y': y
                        })
            
            print(f"\n=================== SLIDE {s_idx} ===================")
            print(f"Pics ({len(pics)}):", pics)
            print(f"Questions ({len(shapes)}):")
            for q in shapes:
                # Find closest pic
                closest_pic = None
                min_dist = float('inf')
                for p in pics:
                    # Euclidean distance in EMUs (1 cm = 360000 EMUs)
                    dist = ((q['x'] - p['x'])**2 + (q['y'] - p['y'])**2)**0.5
                    # Typically pics are within ~2,500,000 EMUs (~7cm)
                    if dist < min_dist:
                        min_dist = dist
                        closest_pic = p
                has_img_word = any(kw in q['title'].lower() or any(kw in l.lower() for l in q['lines']) for kw in ['hình', 'mạch', 'biểu đồ', 'sơ đồ', 'kí hiệu', 'dưới đây', 'sau đây'])
                attached = closest_pic['target'] if (closest_pic and (min_dist < 3500000 or has_img_word)) else None
                print(f"  Q#{q['num']}: {q['title'][:45]}... | Red: {q['red'][:20]} | Pic: {attached} (dist: {int(min_dist) if closest_pic else -1})")

if __name__ == '__main__':
    inspect_slide_associations()
