from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont


DOCS = Path(__file__).resolve().parent
ASSETS = DOCS / "report-assets"
PDF = ASSETS / "Bao_Cao_Tieu_Luan_TMDT-preview-final.pdf"
PAGES = ASSETS / "rendered-pages"
CONTACTS = ASSETS / "qa-contact"


def main() -> None:
    PAGES.mkdir(parents=True, exist_ok=True)
    CONTACTS.mkdir(parents=True, exist_ok=True)
    pdf = pdfium.PdfDocument(str(PDF))
    page_paths = []
    for index in range(len(pdf)):
        image = pdf[index].render(scale=1.65).to_pil().convert("RGB")
        path = PAGES / f"page-{index + 1:03d}.png"
        image.save(path, optimize=True)
        page_paths.append(path)

    label_font = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 24)
    for start in range(0, len(page_paths), 9):
        group = page_paths[start : start + 9]
        sheet = Image.new("RGB", (2280, 3240), (220, 224, 220))
        for offset, path in enumerate(group):
            image = Image.open(path).convert("RGB")
            image.thumbnail((720, 1018))
            tile = Image.new("RGB", (760, 1080), "white")
            tile.paste(image, ((760 - image.width) // 2, 42))
            draw = ImageDraw.Draw(tile)
            draw.text((24, 10), f"Trang {start + offset + 1}", font=label_font, fill="black")
            sheet.paste(tile, ((offset % 3) * 760, (offset // 3) * 1080))
        end = start + len(group)
        sheet.save(CONTACTS / f"contact-{start + 1:03d}-{end:03d}.png", optimize=True)

    print(f"Rendered {len(page_paths)} pages into {len(list(CONTACTS.glob('*.png')))} contact sheets")


if __name__ == "__main__":
    main()
