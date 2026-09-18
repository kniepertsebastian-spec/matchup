import fs from 'node:fs/promises';
import path from 'node:path';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const d=JSON.parse(await fs.readFile('olaf-local/dist/warwick.json','utf8'));
const out=path.resolve('outputs/Warwick_Top_26.18');
const previews=path.resolve('work/previews-warwick');
await fs.mkdir(out+'/Matchups',{recursive:true});await fs.mkdir(previews,{recursive:true});
const cols=[['name','1 · Champion'],['tier','2 · Tier'],['reason','3 · Tier-Begründung'],['rune','4 · Keystone'],['runeReason','5 · Rune: Fight Pattern'],['start','6 · Startitem'],['sums','7 · Summoner Spells'],['boots','8 · Frühe Boots'],['l1','9 · Level 1'],['l25','10 · Level 2–5'],['l6','11 · Ab Level 6'],['threats','12 · Gefährliche Fähigkeiten'],['window','13 · Kill Window'],['errors','14 · Unbedingt vermeiden'],['wave','15 · Wave-Management'],['trade','16 · Trading Pattern'],['items','17 · Erste 1–2 Items'],['situ','18 · Situative Items'],['side','19 · Side bei 1/2/3 Items'],['plan','20 · Gameplan'],['override','Comp Override'],['uncertainty','Unsicherheit']];
const colors={Z:'#B8E0D2',A:'#D6EAD4',B:'#EAF2CD',C:'#FFF0BD',D:'#FADCAE',E:'#F3C5BA',F:'#E5B6C8'};
function col(i){let x='';for(i++;i>0;i=Math.floor((i-1)/26))x=String.fromCharCode(65+(i-1)%26)+x;return x;}
function base(w,name,last){const s=w.worksheets.add(name);s.showGridLines=false;s.getRange('A1:'+last).format={font:{name:'Arial',size:11,color:'#202B3B'},verticalAlignment:'top',wrapText:true};return s;}
function title(s,t){s.getRange('B2').values=[[t]];s.getRange('B2').format={font:{name:'Arial',size:16,bold:true,color:'#243B61'},rowHeight:28,wrapText:false};s.getRange('B3').values=[['Top · Ranked Solo Queue · Patch 26.18 · geprüft 14.09.2026']];s.getRange('B3').format={rowHeight:26,wrapText:false};}
function texts(s,rows){s.getRange(`A5:B${rows.length+4}`).values=rows;rows.forEach(([label,text],i)=>{const r=i+5;s.getRange(`A${r}:B${r}`).format.rowHeight=Math.max(30,(Math.ceil(String(text).length/105)+1)*15);s.getRange(`A${r}`).format.font={name:'Arial',size:11,bold:true,color:'#33445D'};if(i%2===0)s.getRange(`A${r}:B${r}`).format.fill='#F3F5F8';});}
function table(s,headers,values,name,widths){const end=col(headers.length-1),last=values.length+5;s.getRange(`A5:${end}${last}`).values=[headers,...values];s.getRange(`A5:${end}5`).format={fill:'#243B61',font:{name:'Arial',size:11,bold:true,color:'#FFFFFF'},rowHeight:36,wrapText:true};const t=s.tables.add(`A5:${end}${last}`,true,name);t.style='TableStyleLight1';t.showFilterButton=true;headers.forEach((_,i)=>s.getRange(`${col(i)}1:${col(i)}${last}`).format.columnWidth=widths[i]||50);s.getRange(`A6:${end}${last}`).format.rowHeight=115;s.freezePanes.freezeRows(5);s.freezePanes.freezeColumns(1);}
function stat(m){const p=m.stats;return `U.GG: ${p.n===null?'keine extrahierte Paarung':`${(100-p.opponentWR).toFixed(1)} % Warwick-WR, n=${p.n}`}. LoLalytics: ${p.ln===null?'keine extrahierte Paarung':`${p.rawWR.toFixed(2)} % rohe Warwick-WR, n=${p.ln}, Delta 2 ${p.delta2} PP`}. Patch 26.18/16.18. ${m.statsNote}`;}
async function render(w,s,name,range){const b=await w.render({sheetName:s,range,scale:1,format:'png'});await fs.writeFile(`${previews}/${name}.png`,new Uint8Array(await b.arrayBuffer()));}
async function save(w,file){w.recalculate();await(await SpreadsheetFile.exportXlsx(w)).save(file);}
for(const m of d.matchups){
 const w=Workbook.create(),s=base(w,'Matchup','B48');s.getRange('A1:A48').format.columnWidth=29;s.getRange('B1:B48').format.columnWidth=114;title(s,`Warwick vs ${m.name}`);
 const order=['plan','name','tier','rune','sums','start','boots','reason','runeReason','l1','l25','l6','threats','window','errors','wave','trade','items','situ','side','override','uncertainty'];
 const rows=order.map(k=>[cols.find(c=>c[0]===k)[1],m[k]]);
 rows.push(['Lane-Tier',m.lane],['Späte Sidelane',m.late],['Revision',m.revision],['Patch-Prüfung',m.note],['Statistik: Einordnung',stat(m)],['Quelle: Gegner-Kit',m.official],...m.sources,['Quelle: Live-Patch','https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-18-notes/'],['Zur Sammlung','../Warwick_Top_Sammlung.xlsx · Web-App: http://localhost:8080/#warwick']);
 texts(s,rows);s.getRange('A5:B5').format.fill='#E9EEF6';s.getRange('B7').format.fill=colors[m.tier];s.freezePanes.freezeRows(3);
 await save(w,`${out}/Matchups/${m.file}`);await render(w,'Matchup',m.slug,'A1:B13');
 if(['jax','olaf','volibear','urgot','zaahen'].includes(m.slug))await render(w,'Matchup',m.slug+'-details','A14:B27');
}
const w=Workbook.create();
const overview=base(w,'Übersicht','M56');title(overview,'Warwick Top · Matchup-Sammlung');
table(overview,['Champion','Tier','Keystone','Summoners','Startitem','Frühe Boots','Gameplan','Patch','Einzeldatei','Lane-Tier','Späte Side','Bisheriges Tier','Revision'],d.matchups.map(m=>[m.name,m.tier,m.rune,m.sums,m.start,m.boots,m.plan,d.patch,'Matchups/'+m.file,m.lane,m.late,'Neu',m.revision]),'WWOverview',[20,9,20,23,38,55,95,12,40,12,12,16,80]);
for(let i=0;i<d.matchups.length;i++)overview.getRange(`B${i+6}`).format.fill=colors[d.matchups[i].tier];
const detail=base(w,'Alle Details','AB56');title(detail,'Warwick · Alle Matchup-Details');
const fields=[...cols,['patch','Patch'],['checked','Geprüft'],['lane','Lane-Tier'],['late','Späte Side'],['oldTier','Bisheriges Tier'],['revision','Revision']];
table(detail,fields.map(x=>x[1]),d.matchups.map(m=>fields.map(([k])=>k==='patch'?d.patch:k==='checked'?d.checked:k==='oldTier'?'Neu':m[k])),'WWDetails',fields.map(([k])=>['name','tier','rune','patch','checked','lane','late','oldTier'].includes(k)?20:80));detail.getRange('A6:AB56').format.rowHeight=170;
const pool=base(w,'Championpool','G56');title(pool,'Warwick · Derselbe Toplane-Pool');
table(pool,['Champion','Kategorie','Top-Pickrate (historisch)','Spiele (historisch)','Datenpatch','Quelle','Einordnung'],d.matchups.map(m=>[m.name,m.category,m.pool?.pick??null,m.pool?.games??null,m.pool?.patch??null,m.pool?.url??m.official,m.slug==='olaf'?'Olaf ergänzt statt Warwick-Mirror. Keine neue Pool-Pickrate erhoben.':'Bestehender Olaf-Pool übernommen; kein neu vermessener 26.18-Pool.']),'WWPool',[20,25,18,20,15,65,65]);pool.getRange('C6:C56').setNumberFormat('0.00%');pool.getRange('D6:D56').setNumberFormat('#,##0');
const stats=base(w,'Statistik','J56');title(stats,'Warwick · Paarungsdaten mit Lücken');
table(stats,['Gegner','U.GG Warwick-WR','U.GG Spiele','LoLalytics rohe WW-WR','LoLalytics Spiele','Delta 2 (PP)','Patch','Einordnung','Quellen'],d.matchups.map(m=>[m.name,m.stats.n===null?null:(100-m.stats.opponentWR)/100,m.stats.n,m.stats.rawWR===null?null:m.stats.rawWR/100,m.stats.ln,m.stats.delta2,d.statsPatch,m.statsNote,'https://u.gg/lol/champions/Warwick/build/top | https://lolalytics.com/lol/warwick/counters/?lane=top']),'WWStats',[20,20,15,23,20,18,20,85,90]);stats.getRange('B6:B56').setNumberFormat('0.0%');stats.getRange('D6:D56').setNumberFormat('0.00%');stats.getRange('F6:F56').setNumberFormat('0.00');
const guide=base(w,'Leitfaden','B32');guide.getRange('A1:A32').format.columnWidth=29;guide.getRange('B1:B32').format.columnWidth=114;title(guide,'Warwick · Leitfaden und Methodik');texts(guide,d.method);
overview.getRange('A6:M56').format.rowHeight=85;
pool.getRange('A6:G56').format.rowHeight=65;
stats.getRange('A6:I56').format.rowHeight=60;
w.recalculate();console.log((await w.inspect({kind:'table',range:'Übersicht!A5:D8',maxChars:1000,tableMaxRows:4,tableMaxCols:4})).ndjson);
await save(w,`${out}/Warwick_Top_Sammlung.xlsx`);
for(const sheet of ['Übersicht','Alle Details','Championpool','Statistik','Leitfaden'])await render(w,sheet,'master-'+sheet,sheet==='Leitfaden'?'A1:B10':sheet==='Statistik'?'A1:H9':sheet==='Championpool'?'A1:G9':sheet==='Alle Details'?'A1:E8':'A1:D10');
await fs.cp(out,'olaf-local/dist/downloads',{recursive:true});
console.log('Exported 52 Warwick workbooks and previews');
