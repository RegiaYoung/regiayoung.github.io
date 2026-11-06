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
from reportlab.platypus import SimpleDocTemplate, Paragraph, KeepTogether, Image, Table, TableStyle
from pypdf import PdfReader

rl_config.invariant = 1
font_dir = Path(reportlab.__file__).parent / "fonts"
pdfmetrics.registerFont(TTFont("CVSans", str(font_dir / "Vera.ttf")))
pdfmetrics.registerFont(TTFont("CVSans-Bold", str(font_dir / "VeraBd.ttf")))
pdfmetrics.registerFontFamily("CVSans", normal="CVSans", bold="CVSans-Bold")
cv = json.load(sys.stdin)
excluded_sections = set(cv.get('pdf_options', {}).get('exclude_sections', []))
unknown_sections = excluded_sections.difference(cv['sections'])
if unknown_sections:
    raise ValueError('Unknown PDF exclusions: '+repr(sorted(unknown_sections)))
sections = {key: value for key, value in cv['sections'].items() if key not in excluded_sections}
output = Path(sys.argv[1] if len(sys.argv) > 1 else "assets/pdf/Ruijia-Yang-CV.pdf")
output.parent.mkdir(parents=True, exist_ok=True)
ink = colors.HexColor("#233f4e")
body = ParagraphStyle("body", fontName="CVSans", fontSize=8.8, leading=11.6, spaceAfter=1.8, textColor=colors.HexColor("#222222"))
small = ParagraphStyle("small", parent=body, fontSize=8.1, leading=10.8, spaceAfter=2)
heading = ParagraphStyle("heading", parent=body, fontName="CVSans-Bold", fontSize=10.8, leading=14, textColor=ink, spaceBefore=5, spaceAfter=3, keepWithNext=True)
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

portrait = Image(str(Path(__file__).resolve().parents[1] / 'assets/img/ruijia-cv.jpg'), width=39, height=52)
header = Table([[story, portrait]], colWidths=[A4[0]-84-66, 66])
header.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0),('ALIGN',(1,0),(1,0),'RIGHT')]))
story = [header]

for section, items in sections.items():
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
            author_line = authors+'.' if authors else html.escape(item.get('author_note', ''))
            links = re.findall(r'\[([^]]+)\]\(<([^>]+)>\)',item['summary'])
            source = ('arXiv preprint' if item['publisher']=='Preprint' else item['publisher'])+', '+item['releaseDate']
            story.append(KeepTogether([p('<b>'+html.escape(item['title'])+'</b>'), p(author_line,small), p(html.escape(source)+(' &nbsp; | &nbsp; '+' · '.join(link(label,url) for label,url in links) if links else ''),small)]))
        elif section == 'Honors and Awards':
            story.append(p('<b>'+html.escape(clean(item['title']))+'</b> ('+clean(item['date'])+'). '+rich(item['summary'])))
        elif 'bullet' in item:
            story.append(p(rich(item['bullet'])))
        else:
            raise ValueError('Unsupported CV entry: '+repr(item))

def footer(canvas, doc):
    canvas.saveState();canvas.setFont('CVSans',8);canvas.setFillColor(ink)
    canvas.drawString(42,25,'Ruijia Yang  |  regia.me/cv/');canvas.drawRightString(A4[0]-42,25,str(doc.page));canvas.restoreState()

doc = SimpleDocTemplate(str(output), pagesize=A4, leftMargin=40, rightMargin=40, topMargin=26, bottomMargin=34,
    title='Ruijia Yang - Curriculum Vitae', author=cv['name'])
doc.build(story,onFirstPage=footer,onLaterPages=footer)
# Check the generated document's real text, not just whether a file was written.
reader = PdfReader(output)
text = " ".join(" ".join(page.extract_text().split()) for page in reader.pages)
for section in sections:
    assert section.upper() in text, section
for section in excluded_sections:
    assert section.upper() not in text, 'Excluded section appeared in PDF: '+section
for entry in cv['sections']['Publications']:
    assert " ".join(entry['title'].split()) in text, entry['title']
    assert all(author in text for author in entry['authors']), entry['authors']
assert cv['email'] in text and 'Sun Yat-sen University' in text
print('Generated and verified '+str(output),file=sys.stderr)
