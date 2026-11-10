import sys
sys.path.insert(0, '.')
from scripts.test_pipeline import results, clean_technical_text
import re

seen = set()
unique_questions = []
for r in results:
    s_idx, q_num, content, opts, c_idx, red = r
    norm = re.sub(r'[^a-zA-Z0-9\u00C0-\u1EF9]', '', content.lower())
    if norm not in seen and len(norm) > 10:
        seen.add(norm)
        unique_questions.append(r)

print(f"Total unique questions after deduplication: {len(unique_questions)}")
print(f"Duplicates eliminated: {len(results) - len(unique_questions)}")
