"""Remove Sterak's Gage and Mercury's Treads from every lane's text and loadouts; Sundered Sky is the bruiser alternative."""
import re, json, glob, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SS='Sundered Sky als Bruiser-Alternative (Leben und AD, erster Angriff trifft kritisch und heilt)'
SS_WHY='Bruiser-Alternative: Leben und AD, der erste Angriff gegen einen Champion trifft kritisch und heilt.'
BOOT='Boots of Swiftness oder Omnivamp-Stiefel'
Q="[’']"
SPECIAL=[
 (rf"Maw und Sterak{Q}s sind alternative Lifeline-Käufe, kein gemeinsamer Standard","Maw ist der Lifeline-Kauf gegen AP-Burst, Sundered Sky die Bruiser-Alternative ohne Lifeline"),
 (rf"Maw und Sterak{Q}s als alternative Lifeline-Käufe behandeln","Maw als Lifeline-Kauf und Sundered Sky als Bruiser-Alternative ohne Lifeline behandeln"),
 (rf"(statt|zu) Sterak{Q}s(?: Gage)?",r"\1 Sundered Sky"),
 (rf"Maw ersetzt Sterak{Q}s, nicht ergänzen","Maw und Visage nicht doppelt als Lifeline planen"),
 (rf"Burstpuffer; Sterak{Q}s nicht mit Maw kombinieren",SS_WHY.rstrip('.')),
 (rf"Sterak{Q}s(?: Gage)?(?=[^.;'\"`\\\n]*?, Quicksilver)",SS),
 (rf"Sterak{Q}s gegen Burst, bei zusätzlichem AP-Druck MR statt mehr Armor",SS+". Bei zusätzlichem AP-Druck MR statt mehr Armor"),
 (rf"Maw und Sterak{Q}s ersetzen einander","Maw ist der Lifeline-Kauf, Sundered Sky die Bruiser-Alternative"),
 (rf"Sterak{Q}s(?: Gage)?[^.;'\"`\\\n]*?(?=, Quicksilver|[.;'\"`\\\n]|$)",SS),
 (rf"Mercury{Q}s Treads bei relevantem Magieschaden und reduzierbarer Kontrolle",BOOT+" bei relevantem Magieschaden"),
 (rf"Mercury{Q}s nicht allein wegen eines mit R übergehbaren Stuns kaufen: MR und die Phasen ohne R zählen","Zähigkeitsstiefel sind auf Olaf verschenkt (Ragnarok gibt CC-Immunität); bei AP-Druck "+BOOT),
 (rf"Mercury{Q}s-Treads-Priorisierung","Swiftness-Priorisierung"),
 (rf"Mercury-Kauf","Swiftness-Kauf"),
 (rf"Mercury{Q}s(?: Treads)?",BOOT),
]
def scrub(t):
    for a,b in SPECIAL: t=re.sub(a,b,t)
    return t
def fix_loadouts(d):
    for coll in d['collections'].values():
        for e in coll.values():
            for grp in ([e['core'],e['alternatives'],e['boots'],e['start']]+[g['options'] for g in e['situational']]):
                for o in grp:
                    if o['id']==3053:o['id']=6610;o['why']=SS_WHY if 'Alternative' not in o['why'] else o['why'].replace('weiteres Bruiser-Item','Bruiser mit Leben und AD')
                    if o['id']==3111:o['id']=3009;o['why']='Bei viel AP-Schaden Swiftness statt Zähigkeitsstiefeln: Ragnarok gibt CC-Immunität, Zähigkeit ist verschenkt. Alternativ Omnivamp-Stiefel.'
            for g in e['situational']:
                seen=set();g['options']=[o for o in g['options'] if o['id'] not in {c['id'] for c in e['core']} and not(o['id'] in seen or seen.add(o['id']))]
            seen=set();e['alternatives']=[o for o in e['alternatives'] if not(o['id'] in seen or seen.add(o['id']))]
targets=[p for pat in ['olaf-local/dist/*.json','olaf-local/dist/downloads/*/*.json','work/*.mjs','work/*.py','work/content-*.json','work/data*.json','olaf-local/lib/*.mjs','docs/*.md','README.md','olaf-local/README.md'] for p in ROOT.glob(pat)]
changed=0
for p in targets:
    if p.name in ('scrub_items.py','equipment.json'):continue
    s=p.read_text(encoding='utf-8');n=scrub(s)
    if p.name=='loadouts.json':
        d=json.loads(n);fix_loadouts(d);n=json.dumps(d,ensure_ascii=False,indent=2)
    if n!=s:p.write_text(n,encoding='utf-8');changed+=1;print('changed',p.relative_to(ROOT))
print(changed,'files')
