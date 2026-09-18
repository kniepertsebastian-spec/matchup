export const traitLabels={healing:'Heilung',shielding:'Schilde',attacks:'Autoattacks',crit:'Crit-Build',tank:'Tank-Build',cc:'Reduzierbare Kontrolle',airborne:'Knock-ups / Verdrängung',suppression:'Unterdrückung',trueDamage:'Absoluter Schaden',access:'Kiting / Abstand'};
const members=(list,id)=>list.split(' ').includes(id);
// Explicit kit interpretation on top of Riot's abbreviated descriptions.
// Build-dependent properties remain assumptions and can be changed in the UI.
export function profile(c){
 const text=c.abilities.map(a=>a.text.replace(/<[^>]*>/g,' ')).join(' ').toLowerCase();
 let damage=c.tags.includes('Mage')?'magic':c.tags.includes('Marksman')?'physical':'mixed';
 if(members('aatrox ambessa camille darius draven fiora garen illaoi irelia jarvaniv jayce jhin jinx kalista kayn khazix kled ksante leesin masteryi missfortune naafiri nasus nilah nocturne olaf pantheon qiyana quinn reksai renekton rengar riven samira senna sett sivir talon trundle tryndamere twitch urgot vi viego wukong xinzhao yasuo yone yorick zed zaahen',c.id))damage='physical';
 if(members('akali amumu chogath diana ekko elise evelynn fizz galio gragas gwen kennen lillia malphite maokai mordekaiser nunu rammus rumble sejuani shen shyvana singed skarner tahmkench teemo zac',c.id))damage='magic';
 if(members('corki ezreal jax kaisa kayle kogmaw udyr varus volibear warwick yunara',c.id))damage='mixed';
 const traits={
  healing:/\bheals?\b|\bhealing\b|life steal|lifesteal|restor\w* health|recovers health/.test(text),
  shielding:/\bshield(?:s|ed|ing)?\b/.test(text),
  attacks:c.tags.includes('Marksman')||members('fiora irelia jax kayle masteryi nasus olaf trundle tryndamere udyr viego volibear warwick xinzhao yasuo yone',c.id),
  crit:members('aphelios caitlyn draven jhin jinx missfortune nilah samira sivir smolder tristana tryndamere xayah yasuo yone yunara zeri',c.id),
  tank:c.tags[0]==='Tank'||members('chogath mundo drmundo ornn sion tahmkench',c.id),
  cc:/stun|root|snare|charm|taunt|fear|flee|silenc|sleep|polymorph/.test(text),
  airborne:/knock|airborne|into the air/.test(text),
  suppression:/suppress/.test(text),
  trueDamage:/true damage/.test(text),
  access:c.tags.includes('Marksman')||c.tags.includes('Mage')
 };
  if(c.id==='aatrox')traits.cc=false; // R fear affects minions, not champions.
 if(members('garen pyke evelynn',c.id))traits.healing=false; // Mostly recovery outside the damage window; don't force antiheal.
 if(c.id==='lulu')traits.cc=true;
 if(c.id==='morgana')traits.shielding=false; // Black Shield is not reduced by Serpent's Fang.
 if(members('sivir nocturne malzahar',c.id))traits.shielding=false; // Spell shields aren't ordinary damage shields.
 return {id:c.id,name:c.name,damage,traits,source:c.source,confidence:'Kit-Heuristik; Build-Annahmen prüfen'};
}
