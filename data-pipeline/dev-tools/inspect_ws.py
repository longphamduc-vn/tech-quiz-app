import zipfile
import os
import glob
import xml.etree.ElementTree as ET

def inspect_pptx(filepath):
    print(f"\n======================================")
    print(f"Inspecting: {filepath}")
    if not zipfile.is_zipfile(filepath):
        print("  -> NOT a standard zip/pptx (might be binary .ppt or encrypted)")
        return
    try:
        with zipfile.ZipFile(filepath, 'r') as z:
            slides = [name for name in z.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
            print(f"  -> Total slides: {len(slides)}")
            media = [name for name in z.namelist() if name.startswith('ppt/media/')]
            print(f"  -> Total media assets: {len(media)}")

            # Extract sample text from first 3 slides
            for slide_name in sorted(slides, key=lambda s: int(''.join(filter(str.isdigit, s)) or 0))[:4]:
                slide_xml = z.read(slide_name)
                root = ET.fromstring(slide_xml)
                texts = []
                for elem in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t'):
                    if elem.text:
                        texts.append(elem.text)
                print(f"  --- {slide_name} ---")
                slide_content = " ".join(texts).strip()
                print("   ", slide_content[:300])
    except Exception as e:
        print(f"  -> Error: {e}")

if __name__ == '__main__':
    pptx_files = glob.glob('WS/**/*.pptx', recursive=True)
    print(f"Found {len(pptx_files)} .pptx files")
    for f in pptx_files:
        inspect_pptx(f)
