from pathlib import Path
p=Path('olaf-local/dist/index.html');s=p.read_text(encoding='utf-8')
s=s.replace('<link rel="stylesheet" href="/style.css">','<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/equipment.css">')
p.write_text(s,encoding='utf-8')
p=Path('olaf-local/dist/app.js');s=p.read_text(encoding='utf-8')
s=s.replace("app.querySelectorAll('.item-card').forEach(card=>card.addEventListener('keydown',e=>{if(e.key==='Escape')card.open=false;}));", """app.querySelectorAll('.item-card').forEach(card=>{
  card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')card.open=true;});
  card.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')card.open=false;});
  card.addEventListener('keydown',e=>{if(e.key==='Escape'){card.open=false;card.querySelector('summary').focus();}});
 });""")
p.write_text(s,encoding='utf-8')
p=Path('olaf-local/test.mjs');s=p.read_text(encoding='utf-8')
s="import {runePage,buildPanel} from './dist/equipment-view.js';\n"+s
s=s.replace("'tiers','filterMatchups','groups','parseRoute','document'", "'runePage','buildPanel','tiers','filterMatchups','groups','parseRoute','document'")
s=s.replace("source.replace(/^import[^\\n]+\\n/,'')", "source.replace(/^import[^\\n]+\\n/gm,'')")
s=s.replace(")(tiers,filterMatchups,groups,parseRoute,document", ")(runePage,buildPanel,tiers,filterMatchups,groups,parseRoute,document")
p.write_text(s,encoding='utf-8')
