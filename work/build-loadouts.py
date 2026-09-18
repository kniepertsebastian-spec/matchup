"""Build local, patch-pinned Riot asset catalog and explicit matchup loadouts."""
from pathlib import Path
import json, urllib.request, re, html, concurrent.futures

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'olaf-local/dist'
VERSION='16.18.1'
PATCH='26.18'
CDN='https://ddragon.leagueoflegends.com'
CACHE=ROOT/'work'/('riot-'+VERSION)
CACHE.mkdir(exist_ok=True)
def download(url,path):
    path.parent.mkdir(parents=True,exist_ok=True)
    if not path.exists():path.write_bytes(urllib.request.urlopen(url,timeout=30).read())
def datafile(name,locale):
    p=CACHE/(locale+'-'+name)
    download(f'{CDN}/cdn/{VERSION}/data/{locale}/{name}',p)
    return json.loads(p.read_text(encoding='utf-8'))
en=datafile('item.json','en_US')['data']
de=datafile('item.json','de_DE')['data']
trees=datafile('runesReforged.json','de_DE')
ids=[1001,2003,1054,1055,3047,3111,3009,3077,3074,6631,3153,3071,6333,3053,3156,3065,3143,3075,3072,3031,3032,2512,3073,3748,3026,3033,6609,3139,3036,3046,3161,3123,3211,3155,3006,6695]
ids=[i for i in ids if str(i) in en]
catalog={'patch':PATCH,'version':VERSION,'checked':'18.09.2026','source':f'{CDN}/cdn/{VERSION}/data/de_DE/item.json','items':{},'trees':trees,'runes':{}}
jobs=[]
def plain(s):
    return html.unescape(re.sub('<[^>]+>','',re.sub(r'<br\s*/?>','\n',s))).strip()
for i in ids:
    item=en[str(i)];local=de.get(str(i),item)
    desc=plain(local['description'])
    # Riot's runtime-only placeholders are not calculable from Data Dragon.
    missing=bool(re.search(r'(?<!\d)%|\{\{|@',desc))
    if i==3073:
        desc=plain(local['description'].split('<passive>')[0])+'\n\nHexgeladen: 30 ultimatives Fähigkeitstempo.\nOverdrive: Nach dem Einsatz der ultimativen Fähigkeit für Nahkämpfer 50 % zusätzliches Angriffstempo und 20 % zusätzliches Lauftempo für 8 Sekunden. Für Fernkämpfer 35 % / 14 %.'
        missing=False
    catalog['items'][str(i)]={'id':i,'name':item['name'],'localName':local['name'],'description':desc,'gold':item['gold']['total'],'image':f'/assets/items/{i}.png','source':catalog['source'],'note':'Riot-Kurzbeschreibung; dynamische Schadens-, Schild- und Skalierungswerte sind nicht immer enthalten.'}
    if missing:catalog['items'][str(i)]['note']='Diese Riot-Beschreibung enthält unaufgelöste dynamische Werte. Verbindliche skalierte Zahlen stehen im Spiel-Tooltip.'
    if i==3073:catalog['items'][str(i)]['source']='https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-11-notes/'
    jobs.append((f'{CDN}/cdn/{VERSION}/img/item/{item["image"]["full"]}',OUT/f'assets/items/{i}.png'))
for tree in trees:
    tree['image']=f'/assets/runes/tree-{tree["id"]}.png'
    jobs.append((f'{CDN}/cdn/img/{tree["icon"]}',OUT/tree['image'].lstrip('/')))
    for slot in tree['slots']:
        for r in slot['runes']:
            r['image']=f'/assets/runes/{r["id"]}.png'
            catalog['runes'][str(r['id'])]={**r,'description':plain(r['longDesc'])}
            jobs.append((f'{CDN}/cdn/img/{r["icon"]}',OUT/r['image'].lstrip('/')))
shards=[('attack-speed','StatModsAttackSpeedIcon','10 % Angriffstempo'),('adaptive','StatModsAdaptiveForceIcon','Adaptive Kraft'),('health','StatModsHealthScalingIcon','Leben pro Level')]
catalog['shards']=[]
for key,icon,label in shards:
    p=f'/assets/runes/shard-{key}.png'
    jobs.append((f'{CDN}/cdn/img/perk-images/StatMods/{icon}.png',OUT/p.lstrip('/')))
    catalog['shards'].append({'id':key,'name':label,'image':p})
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    list(pool.map(lambda job:download(*job),jobs))

def option(i,why):return {'id':i,'why':why}
ap=set('akali gragas gwen heimerdinger kennen mordekaiser rumble singed sylas teemo vladimir'.split())
ranged=set('gangplank gnar jayce kayle kennen quinn teemo vayne vladimir heimerdinger'.split())
armor=set('chogath ksante malphite ornn poppy shen sion tahmkench'.split())
hp=set('drmundo nasus ornn shen sion tahmkench volibear zaahen'.split())
apbot=set('ziggs seraphine hwei swain veigar'.split())
loadouts={}
for file,key,champ,lane in [('data.json','olaf-top','olaf','top'),('warwick.json','warwick-top','warwick','top'),('olaf-adc.json','olaf-adc','olaf','adc')]:
    source=json.loads((OUT/file).read_text(encoding='utf-8'))
    loadouts[key]={}
    for m in source['matchups']:
        slug=m['slug'];magic=slug in (apbot if lane=='adc' else ap)
        poke=lane=='adc' or 'Shield' in m['start']
        # Olaf ADC needs contact more often than a top-lane Olaf. Inspiration with
        # Biscuit + Approach Velocity is therefore the default secondary page;
        # Resolve remains a documented poke fallback.
        secondary=[8345,8410] if lane=='adc' else [8444 if poke else 8473,8453]
        primary=[{'PTA':8005,'Conqueror':8010,'Lethal Tempo':8008}[m['rune']],9111,9104,8299]
        start=1054 if 'Shield' in m['start'] else 1055
        if lane=='adc':first,second=3074,3156 if magic else 6333
        elif champ=='olaf':
            first=6631 if m['items'].startswith('Stridebreaker') else 3074
            second=3156 if magic else 3071 if slug in armor else 3153 if slug=='drmundo' else 3053 if slug=='garen' else 3073 if slug in ['gnar','kayle'] else 6333
        else:
            first=3748 if slug in ['akali','jax'] else 6631 if slug in ranged or slug=='singed' else 3153
            second=3065 if magic or slug in ['chogath','malphite'] else 3748 if slug in hp else 3153 if first==6631 and slug!='gangplank' else 6333
        boots=3111 if magic else 3047
        bootsWhy='Bei relevantem Magieschaden; Tenacity hilft nur gegen reduzierbare Kontrolle.' if magic else 'Wenn gegnerische Autos den Rückschaden bestimmen; bei AP-/Poke-Support neu abwägen.'
        if second==3156:secondWhy='Gegen AP-Burst; bei rein physischer Bedrohung stattdessen AD-Defensive.'
        elif second==3065:secondWhy='Bei anhaltendem Magieschaden und relevantem Wert eigener Heilung/Schilde.'
        elif second==6333:secondWhy='Gegen physischen Rückschaden. Kein Schutz vor beliebigem True Damage.'
        elif second==3071:secondWhy='Bei relevanter Rüstung; im langen Kampf stapeln. Sonst Defensive vorziehen.'
        elif second==3153:secondWhy='Für verlässliche Auto-Zeit; gegen HP besonders interessant, Rüstung bleibt relevant.'
        elif second==3748:secondWhy='Für HP und Waveclear; bei akuter Gefahr passende Resistenz vorziehen.'
        elif second==3073:secondWhy='Wenn wiederholter R-Zugriff und Chase den Kampf entscheiden.'
        else:secondWhy='Schildpuffer gegen Burst; nicht gemeinsam mit Maw als doppelte Lifeline planen.'
        firstWhy={3074:'Sustain zwischen Trades und Waveclear.',6631:'Nach Erstkontakt dranbleiben; kein Dash und kein Lebensraub.',3153:'Anhaltender Einzelzielkontakt und Lebensraub.',3748:'HP und Waveclear für kontrollierte Resets.'}[first]
        alternatives=[]
        if champ=='olaf':
            alternatives.append(option(3073,'Alternative als 1. Item: gesunder R-All-in, wenn Zugang fehlt. Dann Tiamat nicht automatisch vorschalten.'))
            alternatives.append(option(6631 if first==3074 else 3074,'Alternative als 1. Item: Kontakt priorisieren.' if first==3074 else 'Alternative als 1. Item: Sustain und Waveclear priorisieren.'))
        else:alternatives.append(option(3748 if first!=3748 else 3153,'Alternative als 1. Item: Waveclear/HP gegen sicheren Einzelzielkontakt abwägen.'))
        defensive=3156 if second!=3156 else 3065
        third=[option(3053 if second!=3156 else 3065,'Burstpuffer; Sterak’s nicht mit Maw kombinieren.' if second!=3156 else 'Bei anhaltendem AP-Druck und Heilwert.')]
        if champ=='olaf':third.append(option(2512,'Offensive R-/Crit-Abzweigung nur, wenn du drei Autos zuverlässig anbringen und den Rückschaden überleben kannst.'))
        else:third.append(option(3065 if second!=3065 else 6333,'Passende Defensive nach tatsächlichem Magie- bzw. physischem Druck wählen.'))
        fourth=[option(3143,'Gegen bedrohlichen Crit-Schaden.'),option(defensive,'Gegen AP-Burst (Maw) oder anhaltende Magie (Visage). Maw ersetzt Sterak’s, nicht ergänzen.')]
        if champ=='olaf':fourth.append(option(3031,'Nur als Fortsetzung eines begonnenen Crit-Builds; nicht allein als defensive Lösung.'))
        fifth=[option(3026,'Für entscheidende späte Kämpfe; Wiederbelebung braucht eine rettbare Position.'),option(6695,'Gegen wiederholte Schilde, wenn du die geschützten Ziele tatsächlich triffst.'),option(3033,'Bei entscheidender Heilung und sinnvoller Crit-/AD-Ausrichtung; sonst günstigere Antiheal-Komponente erwägen.')]
        # A conditional option is never a second copy of an already chosen core item.
        for group in [third,fourth,fifth]:group[:]=[o for o in group if o['id'] not in [first,second]]
        loadouts[key][slug]={
            'primary':primary,'secondary':secondary,'primaryTree':8000,'secondaryTree':8300 if lane=='adc' else 8400,
            'runeNote':(('Zweiter Baum: Inspiration mit Biscuit Delivery und Approach Velocity. Approach Velocity nutzt Olafs Q-Slow, um die erste Auto-Serie zu erreichen und den Kontakt zu halten. Resolve mit Second Wind/Revitalize bleibt gegen harte Poke-Lanes die defensivere Alternative.' if lane=='adc' else ( 'Zweiter Baum: Second Wind gegen wiederholten Poke, Revitalize für Heilung und Schilde.' if poke else 'Zweiter Baum: Bone Plating gegen gebündelte Trades, Revitalize für Heilung und Schilde.'))+' Die Keystone folgt dem Matchup. Nebenrunen und Shards sind eine empfohlene Basis, kein statistisch bewiesenes Optimum.'),
            'runeAlternative':('Resolve mit Second Wind + Revitalize gegen wiederholten Poke, wenn du ohne Lane-Sustain nicht gesund bis zum All-in kommst.' if lane=='adc' else 'Gegen häufigen Poke Second Wind statt Bone Plating; gegen kompakte All-ins umgekehrt.'),
            'start':[option(start,'Standardstart für dieses Matchup.'),option(2003,'Ein Heiltrank zum Start.')],
            'startNote':m['start'], 'boots':[option(boots,bootsWhy)],
            'core':[option(first,firstWhy),option(second,secondWhy)],'coreNote':m['items'],
            'alternatives':alternatives,'situational':[{'slot':3,'options':third},{'slot':4,'options':fourth},{'slot':5,'options':fifth}],
            'shards':['attack-speed','adaptive','health'],
        }
payload={'patch':PATCH,'checked':'18.09.2026','note':'Visuelle Empfehlungen ergänzen die bestehenden Matchuptexte; keine erneute Tier-Bewertung. Slots zählen fertige Items ohne Boots. Alternativen sind bedingte Optionen, kein fester Sechs-Item-Build.','collections':loadouts}
(OUT/'equipment.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'loadouts.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(catalog["items"])} items, {len(catalog["runes"])} runes, {sum(map(len,loadouts.values()))} loadouts; patch {PATCH}')
