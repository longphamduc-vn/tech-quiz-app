import zipfile
import xml.etree.ElementTree as ET
import re

z = zipfile.ZipFile('WS/03. De on tap & Ngan hang cau hoi/Ngan hang cau hoi on tap White Star - Dap an.pptx', 'r')
slides = [s for s in z.namelist() if s.startswith('ppt/slides/slide') and s.endswith('.xml')]

all_texts = []
for s in slides:
    root = ET.fromstring(z.read(s))
    for t in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t'):
        if t.text and len(t.text.strip()) > 3:
            all_texts.append(t.text.strip())

comb = " ".join(all_texts)

# Look for awkward translated patterns
keywords = ['tính mạnh', 'hạng nhẹ', 'bộ phận', 'lệch', 'đổi pha', 'chảy', 'dưới đây', 'loại nào', 'đặc tính', 'nguyên nhân', 'phương thức', 'hút', 'xả', 'áp lực', 'cuộn', 'tiếp điểm', 'rơ le', 'cảm biến']
for kw in keywords:
    matches = re.findall(rf'[^.!?\n]*{kw}[^.!?\n]*', comb, flags=re.IGNORECASE)
    print(f"Keyword '{kw}': {len(matches)} occurrences. Sample: {matches[0][:80] if matches else ''}")
