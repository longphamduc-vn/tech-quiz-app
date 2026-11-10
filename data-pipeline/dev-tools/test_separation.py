import re

def separate_content_and_options(raw_title, raw_body):
    # Check if any line has A. B. C. D. or ① ② ③ ④
    has_marker = any(re.match(r'^(?:[A-D]\.|\([A-D]\)|[①-④])', l.strip()) or ('A.' in l and 'B.' in l) for l in raw_body)
    
    content_lines = [raw_title]
    opt_lines = []
    
    if has_marker:
        found_marker = False
        for l in raw_body:
            if re.match(r'^(?:[A-D]\.|\([A-D]\)|[①-④])', l.strip()) or ('A.' in l and 'B.' in l):
                found_marker = True
            if found_marker:
                opt_lines.append(l)
            else:
                content_lines.append(l)
    else:
        # No marker: options are lines in raw_body
        # Check if first lines of raw_body are actually prompt continuation
        # (e.g. raw_title doesn't end with ? or :, but line ends with ? or :)
        if raw_title.strip().endswith('?') or raw_title.strip().endswith(':'):
            opt_lines = raw_body
        else:
            # Find the line that ends with ? or contains question ending
            cut_idx = 0
            for idx, l in enumerate(raw_body):
                if l.strip().endswith('?') or l.strip().endswith(':'):
                    cut_idx = idx + 1
                    break
            if cut_idx > 0 and cut_idx < len(raw_body):
                content_lines.extend(raw_body[:cut_idx])
                opt_lines = raw_body[cut_idx:]
            else:
                # If raw_body has 4 lines, they are options
                if len(raw_body) in [2, 3, 4, 5]:
                    opt_lines = raw_body
                else:
                    opt_lines = raw_body[-4:]
                    content_lines.extend(raw_body[:-4])
                    
    return " ".join(content_lines).strip(), opt_lines

# Test samples
t1 = "6. Hiện tượng mất đi 1 phần pha của dòng điện xoay chiều là loại nào sau đây?"
b1 = ["Nhiễu sét", "Nhiễu do biến đổi điện áp", "Nhiễu tĩnh điện", "Nhiễu chuyển mạch(switching noise)"]
print("Test 1:")
c, opts = separate_content_and_options(t1, b1)
print("  Content:", c)
print("  Options:", opts)

t2 = "Chọn đáp án sai với giải thích về tụ điện"
b2 = ["trong hình dưới đây?", "A. Là tụ điện...", "B. Điện dung..."]
print("\nTest 2:")
c2, opts2 = separate_content_and_options(t2, b2)
print("  Content:", c2)
print("  Options:", opts2)
