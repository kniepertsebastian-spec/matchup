from pathlib import Path
p=Path('olaf-local/dist/app.js');s=p.read_text(encoding='utf-8')
s="import {runePage,buildPanel} from './equipment-view.js';\n"+s
s=s.replace('let data;', 'let data;\nlet equipment;\nlet loadouts;')
s=s.replace('const stats=m.stats;', "const stats=m.stats;\n const build=loadouts.collections[active+'-'+lane][m.slug];")
plan='<section class="gameplan"><p class="eyebrow">VOR DEM SPIEL LESEN</p><p>${esc(m.plan)}</p></section>'
s=s.replace(plan,'')
s=s.replace('<div class="loadout"><div><small>KEYSTONE</small><strong>${esc(m.rune)}</strong></div>', '<div class="loadout visual-loadout"><div class="keystone-panel"><small>KEYSTONE</small><strong>${esc(m.rune)}</strong>${runePage(build,equipment)}</div>')
s=s.replace("${isADC()?`<section class=\"support-note\">", "${buildPanel(build,equipment)}${isADC()?`<section class=\"support-note\">")
s=s.replace('<nav class="sectionnav">',plan+'<nav class="sectionnav">')
s=s.replace("['/data.json','/warwick.json','/olaf-adc.json']", "['/data.json','/warwick.json','/olaf-adc.json','/equipment.json','/loadouts.json']")
s=s.replace("roster={olaf:", "equipment=datasets[3];loadouts=datasets[4];\n roster={olaf:")
# Native details supports keyboard and touch; Escape dismisses pinned item descriptions.
s=s.replace("app.querySelectorAll('[data-section]')", "app.querySelectorAll('.item-card').forEach(card=>card.addEventListener('keydown',e=>{if(e.key==='Escape')card.open=false;}));\n app.querySelectorAll('[data-section]')")
p.write_text(s,encoding='utf-8')
p=Path('olaf-local/server.mjs');s=p.read_text(encoding='utf-8').replace("const mime={", "const mime={'.png':'image/png','.svg':'image/svg+xml',")
p.write_text(s,encoding='utf-8')
