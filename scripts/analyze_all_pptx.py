import zipfile
import glob
import re
import xml.etree.ElementTree as ET

def analyze_all_pptx():
    files = glob.glob('WS/**/*.pptx', recursive=True)
    for f in sorted(files):
        try:
            with zipfile.ZipFile(f, 'r') as z:
                slides = [s for s in z.namelist() if s.startswith('ppt/slides/slide') and s.endswith('.xml')]
                media = [m for m in z.namelist() if m.startswith('ppt/media/')]
                print(f"{f}: {len(slides)} slides, {len(media)} media files")
        except Exception as e:
            print(f"{f}: Error - {e}")

if __name__ == '__main__':
    analyze_all_pptx()
