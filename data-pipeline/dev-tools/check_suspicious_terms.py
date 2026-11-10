import zipfile
import xml.etree.ElementTree as ET
import re

z = zipfile.ZipFile('WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx', 'r')
slides = [s for s in z.namelist() if s.startswith('ppt/slides/slide') and s.endswith('.xml')]
def get_num(s):
    m = re.search(r'slide(\d+)\.xml', s)
    return int(m.group(1)) if m else 0
slides.sort(key=get_num)

all_q = []
for s_idx, s in enumerate(slides, 1):
    root = ET.fromstring(z.read(s))
    for sp in root.iter('{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
        paras = []
        for p in sp.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}p'):
            txt = ''.join(t.text for t in p.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if t.text)
            if txt.strip(): paras.append(txt.strip())
        if paras and len(paras) >= 2 and re.match(r'^\s*(\d+)[\.\,\s]', paras[0]):
            m = re.match(r'^\s*(\d+)[\.\,\s]\s*(.+)', paras[0])
            all_q.append((s_idx, int(m.group(1)), m.group(2), paras[1:]))

print(f"Total extracted candidate questions: {len(all_q)}")

# Check for spelling errors or bad translate phrasing
suspicious_patterns = [
    r'tính mạnh', r'hạng nhẹ', r'xuay', r'sofrware', r'vận động', r'pittong',
    r'độ nhạy bén', r'tiết\b', r'bình ngưng', r'hiệu T', r'coil', r'I-ôn',
    r'chất không tiếp điểm', r'yếu tố quang', r'phần tử quang', r'vòng vi',
    r'bộ phận', r'tấm swash', r'bơm vane', r'bơm gear', r'trục vít me',
    r'khe hở', r'tải trọng', r'chịu tải', r'lệch pha', r'đột biến'
]

for pat in suspicious_patterns:
    found = [q for q in all_q if re.search(pat, q[2] + " " + " ".join(q[3]), re.IGNORECASE)]
    if found:
        print(f"Pattern '{pat}': {len(found)} matches. Example (Slide {found[0][0]} Q#{found[0][1]}):")
        print(f"   Q: {found[0][2][:90]}")
        print(f"   Opts: {found[0][3][:2]}")
