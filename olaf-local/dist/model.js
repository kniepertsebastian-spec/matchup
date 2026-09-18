export const tiers={Z:'Nahezu ideal',A:'Deutlich günstig',B:'Leicht günstig',C:'Ausgeglichen',D:'Leicht schwierig',E:'Deutlich schwierig',F:'Extrem schwierig'};
export const roles=['adc','mid','jungle'];
export function parseRoute(hash){
 const parts=hash.replace(/^#/,'').split('/').filter(Boolean);
 const champion=parts[0]==='warwick'?'warwick':'olaf';
 if(parts[0]==='warwick'||parts[0]==='olaf')parts.shift();
 const role=roles.includes(parts[0])?parts.shift():undefined;
 return {champion,...(role?{role}:{}),page:parts[0]==='leitfaden'?'guide':parts[0]==='matchup'?'matchup':'list',slug:parts[0]==='matchup'?parts[1]:undefined};
}
export function filterMatchups(rows,{q='',tier='',rune='',sums=''}={}){
 const normalize=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\s’'.-]/g,'');
 return rows.filter(m=>normalize(m.name).includes(normalize(q))&&(!tier||m.tier===tier)&&(!rune||m.rune===rune)&&(!sums||m.sums===sums));
}
export const groups=[['Lane & Kampf',[['l1','Level 1'],['l25','Level 2–5'],['l6','Ab Level 6'],['threats','Gegnerische Schlüssel-Fähigkeiten'],['window','Dein Kill Window'],['errors','Unbedingt vermeiden'],['wave','Wave-Management'],['trade','Trading Pattern']]],['Runen & Ausrüstung',[['runeReason','Warum diese Keystone?'],['start','Startitem'],['sums','Summoner Spells'],['boots','Frühe Boots'],['items','Erste 1–2 Items'],['situ','Situative Items'],['override','Comp Override']]],['Sidelane & Einordnung',[['side','Bei 1, 2 und 3 Items'],['reason','Begründung des Gesamt-Tiers'],['revision','Was wurde geändert?'],['note','Patch-Abgleich'],['uncertainty','Grenzen der Einschätzung']]]];
export const jungleGroups=[['Jungle & Kampf',[['l1','Erster Kontakt'],['l25','Frühe Camps & Ganks'],['l6','Ab Level 6'],['threats','Gegnerische Schlüssel-Fähigkeiten'],['window','Dein Kill Window'],['errors','Unbedingt vermeiden'],['wave','Pathing & Konter-Jungle'],['trade','Duell-Pattern']]],['Runen & Ausrüstung',[['runeReason','Warum diese Keystone?'],['start','Startitem'],['sums','Summoner Spells'],['boots','Frühe Boots'],['items','Erste 1–2 Items'],['situ','Situative Items'],['override','Comp Override']]],['Sidelane & Einordnung',[['side','Bei 1, 2 und 3 Items'],['reason','Begründung des Gesamt-Tiers'],['revision','Was wurde geändert?'],['note','Patch-Abgleich'],['uncertainty','Grenzen der Einschätzung']]]];
