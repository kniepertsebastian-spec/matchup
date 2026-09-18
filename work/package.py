from pathlib import Path
import json, re, zipfile, xml.etree.ElementTree as ET, html, shutil, math
from PIL import Image, ImageOps, ImageDraw

root=Path.cwd().resolve()
out=(root/'outputs/Olaf_Top_26.18_Revision').resolve()
work=root/'work'
data=json.loads((work/'data-revision.json').read_text(encoding='utf-8'))
ms=data['matchups']
assert len(ms)==51 and len({m['slug'] for m in ms})==51
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
# Artifact tool cannot calculate/export HYPERLINK reliably. Add only the missing
# native hyperlink feature to otherwise fully artifact-authored workbooks.
def add_native_links(f):
    sns=ns['s'];rns='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
    pns='http://schemas.openxmlformats.org/package/2006/relationships'
    ET.register_namespace('',sns);ET.register_namespace('r',rns)
    with zipfile.ZipFile(f) as z: contents={n:z.read(n) for n in z.namelist()}
    shared=ET.fromstring(contents['xl/sharedStrings.xml']) if 'xl/sharedStrings.xml' in contents else []
    strings=[''.join(el.itertext()) for el in shared]
    changed=False
    for name,blob in list(contents.items()):
        if not re.fullmatch(r'xl/worksheets/sheet\d+\.xml',name):continue
        sheet=ET.fromstring(blob)
        if sheet.find('s:hyperlinks',ns) is not None:continue
        links=[]
        for c in sheet.findall('.//s:c',ns):
            v=c.findtext('s:v',namespaces=ns)
            if c.attrib.get('t')=='s':v=strings[int(v)]
            if c.attrib.get('t')=='inlineStr':v=''.join(c.find('s:is',ns).itertext())
            if v and (v.startswith('https://') or v.startswith('Matchups/Olaf_vs_')):links.append((c.attrib['r'],v))
        if not links:continue
        relname='xl/worksheets/_rels/'+Path(name).name+'.rels'
        rels=ET.fromstring(contents[relname]) if relname in contents else ET.Element('{'+pns+'}Relationships')
        used={x.attrib['Id'] for x in rels};hl=ET.Element('{'+sns+'}hyperlinks')
        for i,(ref,target) in enumerate(links):
            rid='rIdMatchupLink'+str(i+1)
            assert rid not in used
            ET.SubElement(rels,'{'+pns+'}Relationship',{'Id':rid,'Type':rns+'/hyperlink','Target':target,'TargetMode':'External'})
            ET.SubElement(hl,'{'+sns+'}hyperlink',{'ref':ref,'{'+rns+'}id':rid})
        # Insert before the later worksheet elements as required by OOXML order.
        later={'printOptions','pageMargins','pageSetup','headerFooter','rowBreaks','colBreaks','customProperties','cellWatches','ignoredErrors','smartTags','drawing','legacyDrawing','legacyDrawingHF','picture','oleObjects','controls','webPublishItems','tableParts','extLst'}
        pos=next((i for i,x in enumerate(sheet) if x.tag.split('}')[-1] in later),len(sheet))
        sheet.insert(pos,hl)
        contents[name]=ET.tostring(sheet,encoding='utf-8',xml_declaration=True)
        contents[relname]=ET.tostring(rels,encoding='utf-8',xml_declaration=True)
        changed=True
    if changed:
        target=work/(f.name+'.linked.tmp')
        with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
            for n,b in contents.items():z.writestr(n,b)
        target.replace(f)
for f in out.rglob('*.xlsx'):add_native_links(f)
results=[]
for f in sorted(out.rglob('*.xlsx')):
    with zipfile.ZipFile(f) as z:
        assert z.testzip() is None, f
        errors=[]
        for name in z.namelist():
            if name.startswith('xl/worksheets/sheet') and name.endswith('.xml'):
                el=ET.fromstring(z.read(name))
                errors.extend((name,c.attrib['r'],c.findtext('s:v',namespaces=ns)) for c in el.findall('.//s:c',ns) if c.attrib.get('t')=='e')
        assert not errors,(f,errors)
        w=ET.fromstring(z.read('xl/workbook.xml'))
        sheets=w.findall('s:sheets/s:sheet',ns)
        if f.parent.name=='Matchups':
            assert len(sheets)==1
            ss=ET.fromstring(z.read('xl/sharedStrings.xml')) if 'xl/sharedStrings.xml' in z.namelist() else None
            strings=[''.join(el.itertext()) for el in ss] if ss is not None else []
            sheet=ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
            vals={}
            for c in sheet.findall('.//s:c',ns):
                v=c.findtext('s:v',namespaces=ns)
                if c.attrib.get('t')=='s':v=strings[int(v)]
                if c.attrib.get('t')=='inlineStr':v=''.join(c.find('s:is',ns).itertext())
                vals[c.attrib['r']]=v
            labels=[v for k,v in vals.items() if k.startswith('A') and v]
            nums={int(re.match(r'(\d+) ·',v).group(1)) for v in labels if re.match(r'(\d+) ·',v)}
            assert nums==set(range(1,21)),(f,nums)
            assert vals.get('B5') and len(vals['B5'])>60
            assert '26.18' in vals['B3']
        else:
            assert len(sheets)==5
            tables=[n for n in z.namelist() if n.startswith('xl/tables/table') and n.endswith('.xml')]
            assert len(tables)==5
            for n in tables: assert ET.fromstring(z.read(n)).find('s:autoFilter',ns) is not None,n
            sheet=ET.fromstring(z.read('xl/worksheets/sheet4.xml'))
            assert len([c for c in sheet.findall('.//s:c',ns) if c.find('s:f',ns) is not None])==94
        results.append({'file':str(f.relative_to(out)),'sheets':len(sheets),'bytes':f.stat().st_size})
assert len(results)==52
for m in ms:assert (out/'Matchups'/m['file']).is_file()

e=html.escape
tiernames={'Z':'Extrem günstig','A':'Deutlich günstig','B':'Leicht günstig','C':'Ausgeglichen','D':'Leicht ungünstig','E':'Deutlich ungünstig','F':'Extrem schwierig'}
cards=[]
for m in ms:
    fields=[('Lane-Tier',m['lane']),('Späte Side',m['late']),('Änderung',m['revision']),('Level 1',m['l1']),('Level 2–5',m['l25']),('Ab Level 6',m['l6']),('Kill Window',m['window']),('Trading Pattern',m['trade']),('Wave-Management',m['wave']),('Erste 1–2 Items',m['items']),('Situative Items',m['situ']),('Comp Override',m['override'])]
    cards.append(f'''<article class="card" data-name="{e(m['name'].lower())}" data-tier="{m['tier']}" data-rune="{m['rune']}" data-sums="{e(m['sums'])}">
<div class="top"><h2>Olaf vs {e(m['name'])}</h2><span class="tier t{m['tier']}" title="{tiernames[m['tier']]}">{m['tier']}</span></div>
<p class="loadout">{e(m['rune'])} · {e(m['sums'])}</p><p>{e(m['plan'])}</p>
<a class="button" href="Matchups/{e(m['file'])}">Matchup-Spreadsheet öffnen ↗</a>
<details><summary>Schnell nachlesen</summary><p><b>Start:</b> {e(m['start'])}<br><b>Boots:</b> {e(m['boots'])}</p><p><b>Tier:</b> {e(m['reason'])}</p><p><b>Rune:</b> {e(m['runeReason'])}</p>{''.join('<p><b>'+e(k)+':</b> '+e(v)+'</p>' for k,v in fields)}<p class="muted">{e(m['uncertainty'])}</p></details></article>''')
doc='''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Olaf Top · Matchup-Sammlung 26.18</title><style>
:root{font-family:Arial,sans-serif;color:#203047;background:#f3f5f8;line-height:1.55}*{box-sizing:border-box}body{margin:0}main{max-width:1400px;margin:auto;padding:36px 28px}h1{font-size:34px;line-height:1.18;margin:8px 0 18px}h2{font-size:21px;margin:0}p{margin:12px 0}.eyebrow{color:#61748e;font-size:13px;letter-spacing:.06em;font-weight:700}.intro{max-width:920px}.links{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0}.button{display:inline-block;color:#244c81;border:1px solid #b6c5da;background:white;border-radius:6px;padding:9px 14px;text-decoration:none;font-weight:700;font-size:14px}.button:hover{background:#e9eff8}.filters{display:flex;flex-wrap:wrap;gap:14px;padding:18px;background:#e5ebf4;border-radius:8px;margin:26px 0 10px}.filters label{display:flex;flex-direction:column;font-size:13px;font-weight:700;gap:5px}input,select{font:inherit;font-size:15px;background:white;border:1px solid #acbbcf;border-radius:5px;padding:9px;min-width:150px}input{min-width:230px}.count,.muted{color:#67758b;font-size:13px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:18px;margin-top:16px}.card{background:white;border:1px solid #dbe2ec;border-radius:8px;padding:22px;align-self:start}.top{display:flex;align-items:center;justify-content:space-between;gap:12px}.tier{display:inline-flex;justify-content:center;align-items:center;min-width:34px;height:34px;border-radius:6px;font-weight:800}.tZ,.tA{background:#d6ead4}.tB{background:#eaf2cd}.tC{background:#fff0bd}.tD{background:#fadcae}.tE{background:#f3c5ba}.tF{background:#e5b6c8}.loadout{color:#475e7d;font-size:14px;font-weight:700}details{border-top:1px solid #e4e8ee;margin-top:18px;padding-top:12px;font-size:14px}summary{cursor:pointer;color:#244c81;font-weight:700}.legend{display:flex;gap:15px;flex-wrap:wrap;font-size:13px}.note{max-width:950px}footer{margin-top:35px;border-top:1px solid #ccd6e4;padding-top:20px}a{color:#244c81}[hidden]{display:none!important}@media(max-width:600px){main{padding:24px 14px}.grid{grid-template-columns:1fr}h1{font-size:28px}.filters label,input,select{width:100%}}
</style><main><div class="eyebrow">RANKED SOLO QUEUE · PATCH 26.18 · REVISION 10.09.2026</div><h1>Olaf Top<br>51 Matchups, einzeln griffbereit.</h1><p class="intro">Wähle deinen Lane-Gegner und öffne sein eigenes Spreadsheet. Jede Datei enthält alle 20 gewünschten Punkte, Comp Override, Patchstand und Quellen. Die Tier-Wertungen bewerten Olafs Spielbarkeit über Lane und Gesamtspiel; sie sind keine kopierten Winrates.</p><div class="links"><a class="button" href="Olaf_Top_Sammlung.xlsx">Filterbare Excel-Gesamtsammlung ↗</a><a class="button" href="LESEN.txt">Hinweise zur Sammlung</a></div><div class="legend">'''+''.join(f'<span><b>{k}</b> {v}</span>' for k,v in tiernames.items())+'''</div><p class="muted">Z und F bleiben mangels belastbarer Extrembewertung unbesetzt. Datenrahmen: Emerald+, weltweit. Reguläre Toplaner ab ca. 0,5 % Top-Pickrate; zusätzliche Flex-Picks ab 1 %. Paarungsdaten: Patch 26.17, abgerufen am 10.09.2026. Keine gemessenen 26.18-Winrates.</p>
<div class="filters"><label>Champion<input id="search" type="search" placeholder="z. B. Aatrox, Fiora, Riven"></label><label>Tier<select id="tier"><option value="">Alle Tiers</option>'''+''.join(f'<option>{k}</option>' for k in tiernames)+'''</select></label><label>Keystone<select id="rune"><option value="">Alle Runen</option><option>PTA</option><option>Conqueror</option></select></label><label>Summoner Spells<select id="sums"><option value="">Alle Spells</option>'''+''.join('<option>'+e(s)+'</option>' for s in sorted({m['sums'] for m in ms}))+'''</select></label></div><p class="count" id="count" aria-live="polite">51 Matchups</p><div class="grid">'''+''.join(cards)+'''</div><p id="empty" hidden>Kein Matchup passt zu diesen Filtern.</p><footer><p class="note"><b>Jungle ohne Ravenous:</b> Conqueror; Stridebreaker → passende Boots → Death’s Dance → BotRK bei längeren Auto-Fights und viel gegnerischer HP. Maw statt DD bei AP-Burst. Das ist eine mechanische Sustain-Option, kein statistisch nachgewiesener Optimalbuild für 26.18.</p><p class="muted">Riot, U.GG und LoLalytics ersetzen die bisherigen Quellen. Lane und späte Side stehen getrennt in jeder Detailansicht. Quellen, Datenlücken und Änderungsgründe stehen in den Excel-Dateien. Die Bewertungen wurden nicht durch eigene Ingame-Testreihen validiert. Nach einem neuen Patch zuerst betroffene Kits, Items und den Championpool prüfen. Für den lokalen Katalog den gesamten Ordner gemeinsam behalten.</p></footer></main><script>
const fields=['search','tier','rune','sums'].map(id=>document.getElementById(id));
function filter(){const [q,t,r,s]=fields.map(x=>x.value.trim().toLocaleLowerCase('de'));let n=0;document.querySelectorAll('.card').forEach(c=>{const d=c.dataset;const yes=d.name.includes(q)&&(!t||d.tier.toLowerCase()===t)&&(!r||d.rune.toLowerCase()===r)&&(!s||d.sums.toLowerCase()===s);c.hidden=!yes;if(yes)n++;});document.getElementById('count').textContent=n+' von 51 Matchups';document.getElementById('empty').hidden=n!==0;}fields.forEach(f=>f.addEventListener('input',filter));
</script></html>'''
(out/'START.html').write_text(doc,encoding='utf-8')
changes=[f"{m['name']}: {m['oldTier']} -> {m['tier']}" for m in ms if m['oldTier']!=m['tier']]
(out/'LESEN.txt').write_text("""OLAF TOP — REVISION FÜR PATCH 26.18
Geprüft: 10.09.2026 | Ranked Solo Queue | Emerald+, global

START.html öffnet den filterbaren Katalog mit allen 51 Gegnern.
Olaf_Top_Sammlung.xlsx enthält Übersicht, alle Details, Championpool, Statistik und Leitfaden.
Matchups/ enthält die 51 einzelnen, eigenständig lesbaren Excel-Dateien.

Die Paarungsstatistik stammt von U.GG und LoLalytics, Datenpatch 26.17/16.17,
abgerufen am 10.09.2026. Diese Werte sind keine 26.18-Winrates.
Der Championpool basiert auf gekennzeichneten 26.17-Snapshots. Der neue Patch ist
noch zu jung für einen belastbaren vollständigen Statistikwechsel.

Mobalytics und Mobafire sind keine Belegquellen dieser Revision.
Alle 51 Einträge wurden auf Konsistenz überprüft. Die Tiers bleiben qualitative
Einschätzungen mit Unsicherheit. Es wurde keine eigene Ingame-Testreihe durchgeführt.
Lane-Tier, späte Side und Gesamt-Tier sind getrennt. Die Quellen beweisen nicht,
dass eine konkrete Rune, Skillorder oder Itemfolge jedes Matchups optimal ist.

Inhaltliche Korrekturen: Volibear-W2 kein automatischer Rückzugsbefehl; Volibear-E
gibt Schild statt Heilung. Olafs W selbst gibt keinen Lebensraub. Beide Tiamat-
Buildrichtungen können Freezes erschweren. Kayles zusätzliche Range kommt auf 16.
Zaahens 26.18-Q-/Revive-Änderung ist berücksichtigt. Classic/ARAM wurden ausgeschlossen.

Geänderte Gesamt-Tiers:
"""+'\n'.join(changes)+"""

Der alte 26.17-Ordner bleibt als historische Version erhalten. Verwende für die
überarbeiteten Einschätzungen diesen 26.18_Revision-Ordner.
ZIP vollständig entpacken und Ordnerstruktur beibehalten, damit die Links funktionieren.
""",encoding='utf-8')

# Keep generation diagnostics out of deliverables.
inspectdir=work/'inspection-revision';inspectdir.mkdir(exist_ok=True)
for f in out.rglob('*.inspect.ndjson'):
    f.resolve().relative_to(out)
    shutil.move(str(f),str(inspectdir/f.name))

# Contact sheets provide a visual inventory of every individual workbook.
thumbdir=work/'contacts-revision';thumbdir.mkdir(exist_ok=True)
for part in (1,3,4):
    images=[(m['name'],work/'previews-revision'/f"{m['slug']}-{part}.png") for m in ms]
    for start in range(0,len(images),6):
        group=images[start:start+6]
        tiles=[]
        for label,f in group:
            im=Image.open(f).convert('RGB');im.thumbnail((570,850))
            tile=Image.new('RGB',(590,im.height+36),'white');tile.paste(im,((590-im.width)//2,30));ImageDraw.Draw(tile).text((10,7),label,fill='#203047');tiles.append(tile)
        heights=[max(t.height for t in tiles[i:i+2]) for i in range(0,len(tiles),2)]
        canvas=Image.new('RGB',(1180,sum(heights)+20*len(heights)),'#d7dfea');y=0
        for row,h in enumerate(heights):
            for c,t in enumerate(tiles[row*2:row*2+2]):canvas.paste(t,(c*590,y))
            y+=h+20
        canvas.save(thumbdir/f'part{part}-{start//6+1}.png')

(work/'validation-revision.json').write_text(json.dumps({'workbooks':results,'count':len(results),'required_fields_per_matchup':20,'xlsx_errors':0,'local_targets_checked':51},indent=2),encoding='utf-8')
zip_path=root/'outputs/Olaf_Top_26.18_Revision_Komplett.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
    for f in sorted(out.rglob('*')):
        if f.is_file():z.write(f,f.relative_to(out.parent))
with zipfile.ZipFile(zip_path) as z:assert z.testzip() is None
print(json.dumps({'xlsx':len(results),'zip_bytes':zip_path.stat().st_size,'contact_sheets':len(list(thumbdir.glob('*.png')))},indent=2))
