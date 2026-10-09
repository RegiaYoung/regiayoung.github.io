#!/usr/bin/env python3
"""Generate a GitHub Pages site with Python's standard library."""
from pathlib import Path
from html import escape
from datetime import date
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
POST_PATH = 'post/教程-硬刷biosx370主板成功进化/'
SITE = json.loads((ROOT / 'content/site.json').read_text(encoding='utf-8'))
BASE_URL = SITE['base_url'].rstrip('/')

def render(template, replacements):
    page = (ROOT / 'templates' / template).read_text(encoding='utf-8')
    for key, value in replacements.items():
        page = page.replace(f'@@{key}@@', value)
    if re.search(r'@@[A-Z_]+@@', page):
        raise ValueError(f'Unresolved template token in {template}')
    return page

def write(path, content):
    destination = ROOT / path
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(content, encoding='utf-8')

def publications():
    result = []
    for item in SITE['publications']:
        authors = ', '.join(f'<strong>{escape(a)}</strong>' if a == SITE['name'] else escape(a) for a in item['authors'])
        title_url = item.get('paper', item.get('doi', item['pdf']))
        links = []
        for key, label in [('paper', 'arXiv'), ('pdf', 'PDF'), ('code', item.get('code_label', 'Code')), ('doi', 'DOI')]:
            if item.get(key):
                links.append(f'<a href="{escape(item[key], quote=True)}">{label} <span aria-hidden="true">↗</span></a>')
        code_note = f'<p class="code-note">{escape(item["code_note"])}</p>' if item.get('code_note') else ''
        result.append(f'''<article class="publication" data-category="{escape(item['category'])}" id="{escape(item['id'])}">
          <div class="pub-meta"><span class="pub-year">{escape(item['year'])}</span><span class="mini-tag {'neutral' if item['venue'] == 'Preprint' else ''}">{escape(item['venue'])}</span><span class="pub-year">{escape(item['project'])}</span></div>
          <h3><a href="{escape(title_url, quote=True)}">{escape(item['title'])}</a></h3>
          <p class="pub-authors">{authors}</p><p class="pub-description">{escape(item['description'])}</p>
          <div class="pub-links">{''.join(links)}</div>{code_note}
          <details class="bibtex"><summary>BibTeX</summary><pre><code>{escape(item['bibtex'])}</code></pre><button class="copy-citation" type="button" hidden>Copy BibTeX</button></details>
        </article>''')
    return '\n'.join(result)

def news():
    return '\n'.join(f'<li><time>{escape(n["date"])}</time><a href="{escape(n["url"], quote=True)}">{escape(n["text"])}</a></li>' for n in SITE['news'])

def article_body():
    body = (ROOT / 'content/archive-body.html').read_text(encoding='utf-8')
    # Preserve the original text, headings and source image links. Use existing,
    # smaller 480px images for display, with paths relative to the old post URL.
    body = re.sub(r' srcset="[^"]*"', '', body)
    body = re.sub(r'(/post/[^"\s]+/)([^"/]+)', r'\2', body)
    image_names = {p.name.split('_hu')[0]: p.name for p in (ROOT / POST_PATH).glob('*_480x0_*')}
    def smaller(match):
        original = match.group(1)
        stem = original.rsplit('.', 1)[0]
        return f'src="{image_names.get(stem, original)}"'
    body = re.sub(r'src="([^"]+)"', smaller, body)
    # Old Hugo markup wrapped block-level figures in paragraphs. Keep content
    # while correcting this so the rebuilt article has valid block structure.
    body = re.sub(r'<p>(\s*<figure[\s\S]*?</figure>)</p>', r'\1', body)
    return body

def main():
    common = {'BASE_URL': escape(BASE_URL, quote=True), 'POST_PATH': POST_PATH}
    person = {'@context': 'https://schema.org', '@type': 'Person', 'name': SITE['name'], 'alternateName': SITE['name_zh'], 'url': BASE_URL + '/', 'email': SITE['email'], 'sameAs': [SITE['github']], 'affiliation': {'@type': 'CollegeOrUniversity', 'name': 'The Hong Kong University of Science and Technology (Guangzhou)'}}
    home = render('home.html', {**common, 'GITHUB': escape(SITE['github'], quote=True), 'EMAIL': escape(SITE['email'], quote=True), 'NEWS': news(), 'PUBLICATIONS': publications(), 'PUBLICATION_COUNT': str(len(SITE['publications'])), 'UPDATE_DATE': date.fromisoformat(SITE['updated']).strftime('%B %Y'), 'PERSON_JSON': json.dumps(person, ensure_ascii=False).replace('<', '\\u003c')})
    write('index.html', home)
    write('notes/index.html', render('notes.html', common))
    write(POST_PATH + 'index.html', render('article.html', {**common, 'ARTICLE_BODY': article_body()}))
    write('404.html', f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found · Ruijia Yang</title><style>{(ROOT / 'assets/site.css').read_text(encoding='utf-8')}</style></head><body><main class="wrap error-page"><p class="eyebrow">RUIJIA YANG</p><h1>404.</h1><p>This page could not be found.</p><a href="{escape(BASE_URL, quote=True)}/">Back to home →</a></main></body></html>''')
    # Keep the previous /about/ entry point useful under both custom domains
    # and GitHub Pages project paths.
    write('about/index.html', '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0; url=../#about"><title>About · Ruijia Yang</title></head><body><a href="../#about">About Ruijia Yang</a></body></html>')
    write('.nojekyll', '')
    urls = [BASE_URL + '/', BASE_URL + '/notes/', BASE_URL + '/' + POST_PATH]
    write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(f'<url><loc>{escape(u)}</loc><lastmod>{SITE["updated"]}</lastmod></url>' for u in urls) + '\n</urlset>\n')
    print('Built home, notes, archived article, about redirect, 404, and sitemap.')

if __name__ == '__main__':
    main()
