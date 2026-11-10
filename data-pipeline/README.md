# Data Pipeline & ETL Tools

Thư mục chứa các công cụ bóc tách, tiền xử lý, làm sạch và xuất bản dữ liệu câu hỏi trắc nghiệm kỹ thuật từ tài liệu thô (`raw-sources/`).

## 📁 Cấu Trúc

- **`core/`**:
  - `import_ws_questions.py`: Script trích xuất câu hỏi và hình ảnh từ slide PowerPoint (`.pptx`) và nạp trực tiếp vào SQLite database (`data/app.db`).
  - `enrich_technical_explanations.py`: Tự động phân tích ngữ cảnh câu hỏi kỹ thuật để sinh cấu trúc giải thích chuyên sâu (tại sao đúng, tại sao sai, kiến thức cốt lõi).
  - `specialized_rules.py`: Bộ từ điển 94+ quy tắc chuẩn hóa thuật ngữ kỹ thuật, chính tả tiếng Việt và từ vựng kỹ thuật Điện/Điện tử/PLC/Cơ khí.
- **`dev-tools/`**: Tập hợp 30 script kiểm tra, phân tích cấu trúc slide, debug OCR và kiểm thử tính toàn vẹn dữ liệu.
- **`exporters/`**:
  - `export_to_static.py`: Xuất dữ liệu từ SQLite `data/app.db` thành các tệp JavaScript bundle tĩnh (`questions_master.js`, `summary.js`) tương thích hoàn toàn với nền tảng GitHub Pages [tech-ws-app](https://longphamduc-vn.github.io/tech-ws-app/).

## 🚀 Cách Sử Dụng

### 1. Bóc tách & nạp vào SQLite:
```bash
python3 data-pipeline/core/import_ws_questions.py
```

### 2. Xuất dữ liệu tĩnh cho GitHub Pages:
```bash
python3 data-pipeline/exporters/export_to_static.py
```
File xuất ra sẽ nằm trong thư mục `data-pipeline/exporters/dist/`.

