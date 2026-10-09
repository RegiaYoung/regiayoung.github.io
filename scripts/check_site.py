"""Check the generated site's navigation, internal links, images and domain metadata."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links = []
        self.ids = set()
        self.canonical = None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href")
        for attr in ("href", "src"):
            value = attrs.get(attr)
            if value:
                self.links.append(value)
        if attrs.get("srcset"):
            self.links += [entry.strip().split()[0] for entry in attrs["srcset"].split(",")]


root = Path("_site")
assert root.is_dir(), "Build the site first"
pages = {p: Page(p.read_text()) for p in root.rglob("*.html")}
errors = []
for path, page in pages.items():
    html = path.read_text()
    if "arclight.top" in html or "Arclight" in html:
        errors.append(f"Old branding: {path}")
    if not page.canonical or not page.canonical.startswith("https://regia.me/"):
        errors.append(f"Missing or incorrect canonical: {path}")
    base = "https://regia.me/" + path.relative_to(root).as_posix()
    for href in page.links:
        url = urlsplit(urljoin(base, href))
        if url.scheme not in ("https", "http") or url.netloc != "regia.me":
            continue
        dest = root / unquote(url.path).lstrip("/")
        if dest.is_dir():
            dest /= "index.html"
        if not dest.exists():
            errors.append(f"Missing local target: {path} → {href}")
        elif url.fragment and dest in pages and unquote(url.fragment) not in pages[dest].ids:
            errors.append(f"Missing anchor: {path} → {href}")

for route in ["index.html", "publications/index.html", "repo/index.html", "notes/index.html", "cv/index.html", "post/教程-硬刷biosx370主板成功进化/index.html"]:
    if root / route not in pages:
        errors.append(f"Missing page: {route}")

assert (root / "CNAME").read_text().strip() == "regia.me"
assert "arclight.top" not in (root / "sitemap.xml").read_text()
assert (root / "publications/index.html").read_text().count('class="title"') == 3, "Expected three publications"
if errors:
    raise SystemExit("\n".join(errors))
print(f"Checked {len(pages)} pages: internal links, anchors, assets and regia.me metadata passed.")
