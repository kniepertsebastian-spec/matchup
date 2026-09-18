from pathlib import Path
p=Path('olaf-local/dist/app.js')
s=p.read_text(encoding='utf-8')
s=s.replace('let active="olaf";', 'let active="olaf";\nlet lane="top";\nlet previousCollection;\nconst isADC=()=>lane===\'adc\';\nconst laneLabel=()=>isADC()?\'ADC / Botlane\':\'Toplane\';')
s=s.replace("const home=()=>active==='olaf'?'#':'#warwick';", "const home=()=>isADC()?'#olaf/adc':active==='olaf'?'#':'#warwick';")
s=s.replace("const matchLink=slug=>active==='olaf'?", "const matchLink=slug=>isADC()?`#olaf/adc/matchup/${slug}`:active==='olaf'?")
s=s.replace('DEIN NÄCHSTER LANE-GEGNER','${laneLabel().toUpperCase()} · DEIN NÄCHSTER GEGNER')
s=s.replace('vor dem ersten Minion.</p>', 'vor dem ersten Minion.</p>${isADC()?`<p class="lane-note">Vorläufige Kit-Tiers · Botlane ist ein 2v2. Lies den Support-Einfluss im Matchup; keine belastbaren Olaf-ADC-Paarungswinrates.</p>`:\'\'}')
s=s.replace('placeholder="z. B. Volibear, Fiora, Jax"', 'placeholder="${isADC()?\'z. B. Caitlyn, Jinx, Yunara\':\'z. B. Volibear, Fiora, Jax\'}"')
s=s.replace('${champion().toUpperCase()} VS.', '${champion().toUpperCase()} · ${laneLabel().toUpperCase()} VS.')
s=s.replace('Gesamt-Matchup</small>', '${isADC()?\'Vorläufig · Support abhängig\':\'Gesamt-Matchup\'}</small>')
s=s.replace('<small>LANE</small>', '<small>LANE-TIER</small>')
s=s.replace('<nav class="sectionnav">', '${isADC()?`<section class="support-note"><h2>Support-Einfluss im 2v2</h2><p>${esc(m.support)}</p></section>`:\'\'}<nav class="sectionnav">')
s=s.replace('<a href="/downloads/Matchups/${champion()}_vs_${m.slug}.xlsx" download>Matchup als Excel ↗</a>', '${isADC()?`<a href="/downloads/adc/Olaf_ADC_vs_${m.slug}.json" download>Matchup-Daten ↗</a>`:`<a href="/downloads/Matchups/${champion()}_vs_${m.slug}.xlsx" download>Matchup als Excel ↗</a>`}')
s=s.replace('<div class="statgrid">', '${isADC()?\'\':`<div class="statgrid">')
s=s.replace('nach der Methode des Anbieters.</p><ul', 'nach der Methode des Anbieters.</p>`}<ul')
s=s.replace("if(active==='warwick')return", "if(active==='warwick'||isADC())return")
s=s.replace('active=parsed.champion;data=roster[active];', '''active=parsed.champion;lane=parsed.role||'top';
 if(lane==='adc'&&active!=='olaf'){location.hash='#olaf/adc';return;}
 const collection=active+(isADC()?'-adc':'');
 if(previousCollection&&previousCollection!==collection)for(const k in filters)filters[k]='';
 previousCollection=collection;data=roster[collection];
 document.querySelectorAll('[data-lane]').forEach(a=>{a.setAttribute('aria-current',a.dataset.lane===lane?'page':'false');a.href=a.dataset.lane==='adc'?'#olaf/adc':active==='warwick'?'#warwick':'#';});
 document.querySelector('footer').innerHTML='Ranked Solo Queue · '+laneLabel()+' <span>Lokale Sammlung · keine automatische Patch-Aktualisierung</span>';''')
s=s.replace("nav.children[1].href=active==='olaf'?'#leitfaden':'#warwick/leitfaden';nav.children[2].href='/downloads/'+champion()+'_Top_Sammlung.xlsx';", "nav.children[1].href=isADC()?'#olaf/adc/leitfaden':active==='olaf'?'#leitfaden':'#warwick/leitfaden';nav.children[2].href=isADC()?'/olaf-adc.json':'/downloads/'+champion()+'_Top_Sammlung.xlsx';nav.children[2].textContent=isADC()?'Daten ↗':'Excel ↗';")
s=s.replace("const id=a.dataset.champion;", "const id=a.dataset.champion;\n  a.textContent=id==='warwick'&&isADC()?'Warwick · Toplane':id==='warwick'?'Warwick':'Olaf';\n  if(isADC()){a.href=id==='olaf'?home():'#warwick';return;}")
s=s.replace("['/data.json','/warwick.json']", "['/data.json','/warwick.json','/olaf-adc.json']")
s=s.replace('warwick:datasets[1]', "warwick:datasets[1],'olaf-adc':datasets[2]")
s=s.replace("champion()+' · Matchup-Buch'", "champion()+' · '+laneLabel()+' · Matchup-Buch'")
p.write_text(s,encoding='utf-8')
p=Path('olaf-local/dist/index.html');s=p.read_text(encoding='utf-8')
s=s.replace('<div class="championbar"', '<div class="championbar lanebar" aria-label="Lane auswählen"><span>DEINE LANE</span><a href="#" data-lane="top" aria-current="page">Toplane</a><a href="#olaf/adc" data-lane="adc">ADC / Botlane</a></div>\n<div class="championbar"',1)
s=s.replace('Lokale Olaf und Warwick Top Matchup-Sammlung', 'Lokale Olaf Top und ADC sowie Warwick Top Matchup-Sammlung')
p.write_text(s,encoding='utf-8')
with Path('olaf-local/dist/style.css').open('a',encoding='utf-8') as f:f.write('\n.lanebar{border-bottom:1px solid var(--line)}.lane-note{max-width:780px;font-size:14px}.support-note{margin:24px 0;padding:24px;background:var(--panel);border:1px solid var(--line);border-radius:6px}.support-note h2{margin-top:0}.support-note p{margin-bottom:0;color:var(--muted)}\n')
