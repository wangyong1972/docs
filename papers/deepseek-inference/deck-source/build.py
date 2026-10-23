#!/usr/bin/env python3
"""Rebuild the self-contained HTML deck from slides.json and the repository template."""
from pathlib import Path
import json, html, re
ROOT=Path(__file__).resolve().parent.parent
slides=json.loads((ROOT/'deck-source/slides.json').read_text())
template=(ROOT/'deck-source/template.html').read_text()
def esc(s): return html.escape(s)
sections=[]
for i,s in enumerate(slides):
    body=''
    if s.get('lead'): body+=f'<p class="lede">{esc(s["lead"])}</p>'
    for b in s.get('blocks',[]):
        if b['type']=='bullets': body+='<ul>'+''.join(f'<li>{x}</li>' for x in b['items'])+'</ul>'
        elif b['type']=='code': body+=f'<pre><code>{esc(b["text"])}</code></pre>'
        elif b['type']=='table':
            body+='<table><thead><tr>'+''.join(f'<th>{esc(x)}</th>' for x in b['headers'])+'</tr></thead><tbody>'
            body+=''.join('<tr>'+''.join(f'<td>{x}</td>' for x in row)+'</tr>' for row in b['rows'])+'</tbody></table>'
        elif b['type']=='text': body+=f'<p>{b["text"]}</p>'
    if s.get('note'): body+=f'<aside class="notes" lang="zh">{esc(s["note"])}</aside>'
    refs=' &nbsp; '.join(f'<a href="{r[1]}" target="_blank" rel="noopener">{esc(r[0])}</a>' for r in s['refs'])
    body+=f'<footer class="sources">{refs}</footer>'
    sections.append(f'<section class="slide {"active" if i==0 else ""}" data-deck="v1" data-section="{esc(s["section"])}" data-title="{esc(s["title"])}"><h2>{esc(s["title"])}</h2>{body}</section>')
start=template.index('      <!-- ============================================================',template.index('<div id="stage">'))
end=template.index('</section>',template.rindex('<section class="slide'))+len('</section>')
template=template[:start]+'\n'.join(sections)+template[end:]
template=re.sub(r'<title>.*?</title>','<title>DeepSeek DeepInfer: Source Review</title>',template)
css='''
.slide {padding:58px 72px 54px; gap:22px;}
.slide h2 {font-size:40px; max-width:1150px;}
.slide p,.slide ul,.slide ol {font-size:25px;line-height:1.48;}
.slide li {margin-bottom:12px;}
.slide .lede {font-size:28px;color:var(--fg);}
.slide pre {font-size:20px;line-height:1.42;padding:20px 24px;border-radius:0;flex-shrink:0;overflow:hidden;}
.slide table {border-collapse:collapse;width:100%;font-size:22px;line-height:1.38;}
.slide th,.slide td {text-align:left;vertical-align:top;border-bottom:1px solid var(--border);padding:12px 14px;}
.slide th {color:var(--accent);font-weight:600;}
.slide code {color:var(--accent);font-family:var(--font-mono);}
.slide pre code {color:var(--fg);}
.slide .notes {font-size:20px;line-height:1.5;color:var(--fg-dim);border-left:3px solid var(--accent);padding-left:17px;margin-top:auto;}
.slide .sources {font-size:15px;line-height:1.5;min-height:34px;}
.sources a {color:var(--accent);text-decoration:none;margin-right:14px;}
@media print {
 @page {size:1400px 900px;margin:0;}
 html,body {display:block!important;width:1400px!important;height:auto!important;overflow:visible!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
 #stage-wrap,#stage {display:block!important;width:1400px!important;height:auto!important;overflow:visible!important;transform:none!important;break-after:auto!important;}
 .slide {width:1400px!important;height:900px!important;display:flex!important;position:relative!important;break-after:page;page-break-after:always;overflow:hidden!important;}
 .slide:last-child {break-after:auto;page-break-after:auto;}
 #pdf-modal,#modeSwitcher {display:none!important;}
}
'''
template=template.replace('</style>',css+'\n</style>',1)
(ROOT/'deck.html').write_text('\n'.join(line.rstrip() for line in template.splitlines())+'\n')
(ROOT/'index.html').write_text('<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=deck.html"><a href="deck.html">Open DeepInfer source review</a>')
sources=['# Source index','', 'Reviewed 2026-10-23. Static inspection only. Claims marked as deployment documentation do not imply released implementation.','', '## Reviewed snapshots','', '- DeepInfer: `9bd9cf243fc53ef9afbf8f04d391d989117d6ab9` (2026-10-21)', '- deepseek-harness: `687f282e8625c6b8d11ff58211a90524be2e4317`', '- deepseek-recipe: `935817c66f5d6e64838f419692545f06787e485f`','', 'The companion inventory is contextual, not a claim of deep review of every library. Vendor gitlink commits appear in slide 21.','']
for i,s in enumerate(slides,1):
 sources += [f'## {i:02d}. {s["title"]}', '',s.get('lead',''), '']
 for b in s.get('blocks',[]):
  if b['type']=='bullets':sources += ['- '+re.sub('<[^>]+>','',x) for x in b['items']]+['']
 for label,url in s['refs']: sources.append(f'- [{label}]({url})')
 sources+=['', '**中文讲解：** '+s.get('note',''),'']
(ROOT/'sources.md').write_text('\n'.join(sources))
print(f'Built {len(slides)} slides')
