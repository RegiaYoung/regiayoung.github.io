"""Rasterize the existing ry. mark and the editable social SVG; requires CairoSVG/Pillow."""
from pathlib import Path
import cairosvg
from PIL import Image

root = Path(__file__).resolve().parents[1]
assets = root / "assets/img"
for size in [16, 32, 48, 192, 180]:
    filename = "apple-touch-icon.png" if size == 180 else f"favicon-{size}.png"
    cairosvg.svg2png(url=str(assets/'favicon.svg'), write_to=str(assets/filename), output_width=size, output_height=size)
cairosvg.svg2png(url=str(assets/'favicon.svg'),write_to=str(assets/'favicon-source.png'),output_width=256,output_height=256)
with Image.open(assets/'favicon-source.png') as im:
    im.save(root/'favicon.ico',sizes=[(16,16),(32,32),(48,48)])
(assets/'favicon-source.png').unlink()
cairosvg.svg2png(url=str(assets/'social-preview.svg'),write_to=str(assets/'social-preview.png'),output_width=1200,output_height=630)
