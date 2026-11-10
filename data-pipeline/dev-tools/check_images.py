import sys
sys.path.insert(0, '.')
from scripts.check_unique_results import unique_questions

with_imgs = [q for q in unique_questions if any(kw in q[2].lower() for kw in ['hình', 'sơ đồ', 'mạch', 'dưới đây', 'bên dưới'])]
print(f"Unique questions referring to figures/diagrams: {len(with_imgs)}")
