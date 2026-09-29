"""Olaf-ADC item plan: Hydra first, bruiser-or-crit second, full damage from item 3."""
def option(i,why):return {'id':i,'why':why}

def apply(entry,magic):
    """Rewrite core/alternatives/situational of one olaf-adc loadout in place."""
    second=3156 if magic else 6333
    entry['core']=[
        option(3074,'Immer erstes Item: Waveclear, Sustain und Cleave für Trades und Zugriff.'),
        option(second,'Bruiser-Variante für das 2. Item: hält dich im Kontakt am Leben, bis die Autos landen. Alternativ schon Crit (siehe Alternativen).' if not magic else 'Bruiser-Variante für das 2. Item gegen AP-Burst. Alternativ schon Crit (siehe Alternativen).')]
    entry['coreNote']=('1. Item immer Ravenous Hydra. 2. Item ist eine Abwägung: noch ein Bruiser-Item ('+('Maw of Malmortius gegen AP' if magic else 'Death’s Dance, alternativ Sterak’s')+') oder schon Crit. Ab dem 3. Item volle Kanone: Infinity Edge, Crit oder High-Damage wie Bloodthirster – Hauptsache ins Gesicht.')
    entry['alternatives']=[
        option(2512,'Alternative als 2. Item: schon Crit und Angriffstempo, wenn dein Zugriff sicher ist und du vor den Autos nicht stirbst.'),
        option(3046,'Alternative als 2. Item: Crit, Angriffstempo und Bewegungstempo für Zugriff und Kiting-Verfolgung.'),
        option(3053,'Alternative als 2. Item: weiteres Bruiser-Item, wenn du zu schnell gebursted wirst.') if second!=3156 else option(3053,'Alternative als 2. Item statt Maw bei gemischtem Schaden und Burst-Risiko.')]
    entry['situational']=[
        {'slot':3,'options':[option(3031,'Volle Kanone: Schaden und Crit ins Gesicht ab dem 3. Item.'),option(3072,'High-Damage ohne Crit: AD plus Lebensraub und Schild, gut wenn Autos lange landen.'),option(3036,'Gegen Frontline mit viel Leben: Rüstungsdurchdringung und Bonusschaden.')]},
        {'slot':4,'options':[option(3072,'High-Damage-Alternative ohne Crit; gibt Lebensraub im Kampf.'),option(3046,'Crit und Angriffstempo für längere Auto-Serien.'),option(3036,'Gegen Tanks und Frontlines als Damage-Option.'),option(3031,'Wenn noch kein Infinity Edge im Build ist.')]},
        {'slot':5,'options':[option(3033,'Anti-Heal und Penetration bei entscheidender gegnerischer Heilung.'),option(3026,'Nur wenn du im späten Kampf regelmäßig als Erstes fällst.'),option(6695,'Gegen wiederholte Schilde, wenn du die geschützten Ziele tatsächlich triffst.'),option(3031,'Wenn noch kein Infinity Edge im Build ist.')]}]
    core={o['id'] for o in entry['core']}
    for g in entry['situational']:
        seen=set();g['options']=[o for o in g['options'] if o['id'] not in core and not (o['id'] in seen or seen.add(o['id']))]
