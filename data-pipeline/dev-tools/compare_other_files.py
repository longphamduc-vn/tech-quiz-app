import zipfile
import xml.etree.ElementTree as ET
import re
import glob

bank_path = 'WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx'

def get_titles_from_pptx(pptx_file):
    titles = set()
    try:
        with zipfile.ZipFile(pptx_file, 'r') as z:
            slides = [s for s in z.namelist() if s.startswith('ppt/slides/slide') and s.endswith('.xml')]
            for s in slides:
                root = ET.fromstring(z.read(s))
                for sp in root.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
                    paras = []
                    for p in sp.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}p'):
                        txt = ''.join(t.text for t in p.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if t.text)
                        if txt.strip(): paras.append(txt.strip())
                    if paras and len(paras) >= 2 and re.match(r'^\s*(\d+)[\.\,\s]', paras[0]):
                        m = re.match(r'^\s*(\d+)[\.\,\s]\s*(.+)', paras[0])
                        if m:
                            clean_t = re.sub(r'[^a-zA-Z0-9\u00C0-\u1EF9]', '', m.group(2).lower())
                            if len(clean_t) >= 10:
                                titles.add(clean_t)
    except Exception as e:
        print(f"Error {pptx_file}: {e}")
    return titles

bank_titles = get_titles_from_pptx(bank_path)
print(f"Main Question Bank ({bank_path}): {len(bank_titles)} unique question titles found.")

other_pptx = glob.glob('WS/**/*.pptx', recursive=True)
for f in sorted(other_pptx):
    if f == bank_path: continue
    other_titles = get_titles_from_pptx(f)
    if not other_titles: continue
    new_titles = other_titles - bank_titles
    print(f"{f}: {len(other_titles)} questions total, {len(new_titles)} NOT in bank ({len(other_titles) - len(new_titles)} already in bank)")
