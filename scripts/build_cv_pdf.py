"""Render the shared CV JSON from export_cv.rb; do not maintain another paper list."""
import html
import json
import re
import sys
from pathlib import Path
import reportlab
from reportlab import rl_config
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, KeepTogether
from pypdf import PdfReader

rl_config.invariant = 1
font_dir = Path(reportlab.__file__).parent / "fonts"
pdfmetrics.registerFont(TTFont("CVSans", str(font_dir / "Vera.ttf")))
pdfmetrics.registerFont(TTFont("CVSans-Bold", str(font_dir / "VeraBd.ttf")))
pdfmetrics.registerFontFamily("CVSans", normal="CVSans", bold="CVSans-Bold")
cv = json.load(sys.stdin)
output = Path(sys.argv[1] if len(sys.argv) > 1 else "assets/pdf/Ruijia-Yang-CV.pdf")
output.parent.mkdir(parents=True, exist_ok=True)
ink = colors.HexColor("#233f4e")
body = ParagraphStyle("body", fontName="CVSans", fontSize=9.2, leading=12, spaceAfter=4, textColor=colors.HexColor("#222222"))
small = ParagraphStyle("small", parent=body, fontSize=8.5, leading=11, spaceAfter=3)
heading = ParagraphStyle("heading", parent=body, fontName="CVSans-Bold", fontSize=11, textColor=ink, spaceBefore=10, spaceAfter=5, keepWithNext=True)
name = ParagraphStyle("name", parent=body, fontSize=25, leading=29, textColor=ink, spaceAfter=5)

def clean(s):
    return str(s).replace("–", "-").replace("—", "-").replace("\u2011", "-")

def rich(s):
    s = html.escape(clean(s))
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    return s.replace("Summer 2026", "Summer&nbsp;2026").replace("Fall 2025", "Fall&nbsp;2025")

def link(label, url):
    return '<a href="'+html.escape(url, quote=True)+'" color="#233f4e">'+html.escape(label)+'</a>'

def p(s, style=body): return Paragraph(s, style)

story = [p(html.escape(cv['name']), name), p(rich(cv['label']+' | '+cv['location']), small),
    p(link(cv['email'], 'mailto:'+cv['email'])+' &nbsp; | &nbsp; '+link('regia.me', cv['website'])+' &nbsp; | &nbsp; '+link('GitHub', 'https://github.com/RegiaYoung'), small)]

for section, items in cv['sections'].items():
    story.append(p(section.upper(), heading))
    for item in items:
        if section == 'Education':
            dates = clean(item['start_date']+' - '+item['end_date'].title())
            story.append(p('<b>'+html.escape(item['institution'])+'</b> &nbsp; | &nbsp; '+dates))
            text = item['studyType']+' in '+item['area']
            if item.get('highlights'): text += '. '+ '; '.join(item['highlights'])
            story.append(p(rich(text)))
        elif section == 'Publications':
            authors = ', '.join('<b>'+html.escape(a)+'</b>' if a==cv['name'] else html.escape(a) for a in item['authors'])
            links = re.findall(r'\[([^]]+)\]\(<([^>]+)>\)',item['summary'])
            source = ('arXiv preprint' if item['publisher']=='Preprint' else item['publisher'])+', '+item['releaseDate']
            story.append(KeepTogether([p('<b>'+html.escape(item['title'])+'</b>'), p(authors+'.',small), p(html.escape(source)+' &nbsp; | &nbsp; '+' · '.join(link(label,url) for label,url in links),small)]))
        elif section == 'Honors and Awards':
            story.append(p('<b>'+html.escape(clean(item['title']))+'</b> &nbsp; ('+clean(item['date'])+')<br/>'+rich(item['summary'])))
        elif 'bullet' in item:
            story.append(p(rich(item['bullet'])))
        else:
            raise ValueError('Unsupported CV entry: '+repr(item))

def footer(canvas, doc):
    canvas.saveState();canvas.setFont('CVSans',8);canvas.setFillColor(ink)
    canvas.drawString(42,25,'Ruijia Yang  |  regia.me/cv/');canvas.drawRightString(A4[0]-42,25,str(doc.page));canvas.restoreState()

doc = SimpleDocTemplate(str(output), pagesize=A4, leftMargin=42, rightMargin=42, topMargin=32, bottomMargin=38,
    title='Ruijia Yang - Curriculum Vitae', author=cv['name'])
doc.build(story,onFirstPage=footer,onLaterPages=footer)
# Check the generated document's real text, not just whether a file was written.
reader = PdfReader(output)
text = " ".join(" ".join(page.extract_text().split()) for page in reader.pages)
for section in cv['sections']:
    assert section.upper() in text, section
for entry in cv['sections']['Publications']:
    assert " ".join(entry['title'].split()) in text, entry['title']
    assert all(author in text for author in entry['authors']), entry['authors']
assert cv['email'] in text and 'Sun Yat-sen University' in text
print('Generated and verified '+str(output),file=sys.stderr)
