"""
Export SQLite database (data/app.db) to static JavaScript bundles
compatible with White Star Quiz Pro (GitHub Pages / tech-ws-app).
"""

import sqlite3
import json
import os
import sys

# Determine project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
DB_PATH = os.path.join(PROJECT_ROOT, 'data/app.db')
OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'data-pipeline/exporters/dist')

def export_data():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. Fetch Topics
    cursor.execute("SELECT id, name, parent_id, level, path FROM topics")
    topics = [dict(row) for row in cursor.fetchall()]
    topic_map = {t['id']: t['name'] for t in topics}

    # 2. Fetch Questions & Options
    cursor.execute("""
        SELECT id, topic_id, difficulty_level, question_type, tags, 
               context_text, has_context_image, content, has_media, 
               media_keys, explanation, created_at
        FROM questions
        ORDER BY id ASC
    """)
    question_rows = cursor.fetchall()

    questions = []
    for q_row in question_rows:
        q = dict(q_row)
        q_id = q['id']

        # Parse tags and media_keys
        try:
            q['tags'] = json.loads(q['tags']) if q['tags'] else []
        except:
            q['tags'] = []

        try:
            q['media_keys'] = json.loads(q['media_keys']) if q['media_keys'] else []
        except:
            q['media_keys'] = []

        # Fetch options
        cursor.execute("""
            SELECT id, content, is_correct, has_image, image_url, order_index
            FROM options
            WHERE question_id = ?
            ORDER BY order_index ASC
        """, (q_id,))
        opt_rows = cursor.fetchall()
        
        options = []
        option_letters = ['A', 'B', 'C', 'D', 'E', 'F']
        correct_answer = 'A'
        for idx, opt_row in enumerate(opt_rows):
            opt = dict(opt_row)
            key = option_letters[idx] if idx < len(option_letters) else str(idx + 1)
            options.append({
                'key': key,
                'text': opt['content'],
                'has_image': bool(opt['has_image']),
                'image_url': opt['image_url']
            })
            if opt['is_correct']:
                correct_answer = key

        q_item = {
            'id': f"Q_{q_id:04d}",
            'topic_id': q['topic_id'],
            'subject': topic_map.get(q['topic_id'], 'Chuyên đề kỹ thuật'),
            'difficulty': 'Dễ' if q['difficulty_level'] == 1 else ('Khó' if q['difficulty_level'] == 3 else 'Trung bình'),
            'question': q['content'],
            'context': q['context_text'],
            'options': options,
            'correct_answer': correct_answer,
            'images': [f"images/{k}.png" for k in q['media_keys']],
            'explanation': {
                'overview': q['explanation'] or 'Không có giải thích chi tiết.',
                'correct_answer': correct_answer
            }
        }
        questions.append(q_item)

    # 3. Generate summary
    summary = {
        'total_questions': len(questions),
        'topics_count': len(topics),
        'generated_at': '2026-11-10'
    }

    # 4. Write files
    # summary.js
    with open(os.path.join(OUTPUT_DIR, 'summary.js'), 'w', encoding='utf-8') as f:
        f.write(f"window.APP_SUMMARY = {json.dumps(summary, ensure_ascii=False, indent=2)};\n")

    # questions_master.js
    with open(os.path.join(OUTPUT_DIR, 'questions_master.js'), 'w', encoding='utf-8') as f:
        f.write(f"window.QUESTIONS_MASTER = {json.dumps(questions, ensure_ascii=False, indent=2)};\n")

    print(f"--- Export Completed Successfully! ---")
    print(f"Exported {len(questions)} questions to {OUTPUT_DIR}")
    conn.close()

if __name__ == '__main__':
    export_data()

