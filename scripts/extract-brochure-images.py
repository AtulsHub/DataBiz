import fitz
from pathlib import Path

pdf_path = Path(r"DataBiz Brochure (2).pdf")
out_dir = Path("public/brochure/images")
out_dir.mkdir(parents=True, exist_ok=True)

# Clear previous extracts
for old in out_dir.glob("*.png"):
    old.unlink()

doc = fitz.open(pdf_path)
saved = []

for page_index, page in enumerate(doc):
    images = page.get_images(full=True)
    for img_index, img in enumerate(images):
        xref = img[0]
        try:
            pix = fitz.Pixmap(doc, xref)
        except Exception as e:
            print(f"skip p{page_index} i{img_index}: {e}")
            continue

        if pix.n - pix.alpha > 3:  # CMYK etc
            pix = fitz.Pixmap(fitz.csRGB, pix)

        if pix.width < 120 or pix.height < 120:
            continue

        if pix.alpha:
            pix = fitz.Pixmap(fitz.csRGB, pix)

        name = f"page{page_index + 1:02d}-{img_index + 1:02d}-{pix.width}x{pix.height}.png"
        path = out_dir / name
        pix.save(str(path))
        size = path.stat().st_size
        saved.append(
            {
                "page": page_index + 1,
                "name": name,
                "width": pix.width,
                "height": pix.height,
                "bytes": size,
            }
        )
        print(f"saved {name} ({size // 1024}kb)")

# Also render full page previews for pages that are visually rich
preview_dir = Path("public/brochure/pages")
preview_dir.mkdir(parents=True, exist_ok=True)
for old in preview_dir.glob("*.jpg"):
    old.unlink()

for page_index, page in enumerate(doc):
    # 1.5x zoom for web use
    mat = fitz.Matrix(1.6, 1.6)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    name = f"page-{page_index + 1:02d}.jpg"
    path = preview_dir / name
    pix.save(str(path))
    print(f"page render {name} ({path.stat().st_size // 1024}kb)")

print(f"IMAGES {len(saved)}")
for row in saved:
    print(row)
