#!/usr/bin/env python3
"""Assemble dist/olaf-mid.json, dist/olaf-jungle.json, loadouts.json entries and
per-matchup downloads from the agent-written content files in work/content-*.json.

Run from the repo root: python3 work/generate_mid_jungle.py
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(ROOT, 'olaf-local')
WORK = os.path.join(ROOT, 'work')

RUNE_TEMPLATES = {
    'conqueror_boneplating': dict(rune='Conqueror', primary=[8010, 9111, 9104, 8299], secondary=[8473, 8453],
        primaryTree=8000, secondaryTree=8400,
        runeNote="Zweiter Baum: Bone Plating gegen gebündelte Trades, Revitalize für Heilung und Schilde. Die Keystone folgt dem Matchup. Nebenrunen und Shards sind eine empfohlene Basis, kein statistisch bewiesenes Optimum.",
        runeAlternative="Gegen häufigen Poke Second Wind statt Bone Plating; gegen kompakte All-ins umgekehrt."),
    'conqueror_secondwind': dict(rune='Conqueror', primary=[8010, 9111, 9104, 8299], secondary=[8444, 8453],
        primaryTree=8000, secondaryTree=8400,
        runeNote="Zweiter Baum: Second Wind gegen wiederholten Poke, Revitalize für Heilung und Schilde. Die Keystone folgt dem Matchup. Nebenrunen und Shards sind eine empfohlene Basis, kein statistisch bewiesenes Optimum.",
        runeAlternative="Gegen häufigen Poke Second Wind statt Bone Plating; gegen kompakte All-ins umgekehrt."),
    'conqueror_inspiration': dict(rune='Conqueror', primary=[8010, 9111, 9104, 8299], secondary=[8345, 8410],
        primaryTree=8000, secondaryTree=8300,
        runeNote="Zweiter Baum: Inspiration mit Biscuit Delivery und Approach Velocity. Approach Velocity nutzt Olafs Q-Slow, um die erste Auto-Serie zu erreichen und den Kontakt zu halten. Resolve mit Second Wind/Revitalize bleibt gegen harte Poke-Lanes die defensivere Alternative. Die Keystone folgt dem Matchup. Nebenrunen und Shards sind eine empfohlene Basis, kein statistisch bewiesenes Optimum.",
        runeAlternative="Resolve mit Second Wind + Revitalize gegen wiederholten Poke, wenn du ohne Lane-Sustain nicht gesund bis zum All-in kommst."),
    'pta_boneplating': dict(rune='PTA', primary=[8005, 9111, 9104, 8299], secondary=[8473, 8453],
        primaryTree=8000, secondaryTree=8400,
        runeNote="Zweiter Baum: Bone Plating gegen gebündelte Trades, Revitalize für Heilung und Schilde. Die Keystone folgt dem Matchup. Nebenrunen und Shards sind eine empfohlene Basis, kein statistisch bewiesenes Optimum.",
        runeAlternative="Gegen häufigen Poke Second Wind statt Bone Plating; gegen kompakte All-ins umgekehrt."),
    'pta_secondwind': dict(rune='PTA', primary=[8005, 9111, 9104, 8299], secondary=[8444, 8453],
        primaryTree=8000, secondaryTree=8400,
        runeNote="Zweiter Baum: Second Wind gegen wiederholten Poke, Revitalize für Heilung und Schilde. Die Keystone folgt dem Matchup. Nebenrunen und Shards sind eine empfohlene Basis, kein statistisch bewiesenes Optimum.",
        runeAlternative="Gegen häufigen Poke Second Wind statt Bone Plating; gegen kompakte All-ins umgekehrt."),
    'pta_inspiration': dict(rune='PTA', primary=[8005, 9111, 9104, 8299], secondary=[8345, 8410],
        primaryTree=8000, secondaryTree=8300,
        runeNote="Zweiter Baum: Inspiration mit Biscuit Delivery und Approach Velocity. Approach Velocity nutzt Olafs Q-Slow, um die erste Auto-Serie zu erreichen und den Kontakt zu halten. Resolve mit Second Wind/Revitalize bleibt gegen harte Poke-Lanes die defensivere Alternative. Die Keystone folgt dem Matchup. Nebenrunen und Shards sind eine empfohlene Basis, kein statistisch bewiesenes Optimum.",
        runeAlternative="Resolve mit Second Wind + Revitalize gegen wiederholten Poke, wenn du ohne Lane-Sustain nicht gesund bis zum All-in kommst."),
}
SHARDS = ['attack-speed', 'adaptive', 'health']

CORE_TEMPLATES = {
    'hydra_dd': [(3074, "Sustain zwischen Trades und Waveclear."), (6333, "Gegen physischen Rückschaden. Kein Schutz vor beliebigem True Damage.")],
    'hydra_maw': [(3074, "Sustain zwischen Trades und Waveclear."), (3156, "Gegen AP-Burst; bei rein physischer Bedrohung stattdessen AD-Defensive.")],
    'hydra_cleaver': [(3074, "Sustain zwischen Trades und Waveclear."), (3071, "Bei relevanter Rüstung; im langen Kampf stapeln. Sonst Defensive vorziehen.")],
    'stride_dd': [(6631, "Nach Erstkontakt dranbleiben; kein Dash und kein Lebensraub."), (6333, "Gegen physischen Rückschaden. Kein Schutz vor beliebigem True Damage.")],
    'stride_maw': [(6631, "Nach Erstkontakt dranbleiben; kein Dash und kein Lebensraub."), (3156, "Gegen AP-Burst; bei rein physischer Bedrohung stattdessen AD-Defensive.")],
    'stride_hexplate': [(6631, "Nach Erstkontakt dranbleiben; kein Dash und kein Lebensraub."), (3073, "Wenn wiederholter R-Zugriff und Chase den Kampf entscheiden.")],
}

SITU5 = [(3026, "Für entscheidende späte Kämpfe; Wiederbelebung braucht eine rettbare Position."),
         (6695, "Gegen wiederholte Schilde, wenn du die geschützten Ziele tatsächlich triffst."),
         (3033, "Bei entscheidender Heilung und sinnvoller Crit-/AD-Ausrichtung; sonst günstigere Antiheal-Komponente erwägen.")]

BOOTS_WHY = {
    'mid': {'steelcaps': "Wenn gegnerischer Auto-/Poke-Schaden überwiegt; bei zusätzlichem AP-Druck neu abwägen.",
            'mercs': "Bei relevantem Magieschaden; Tenacity hilft nur gegen reduzierbare Kontrolle."},
    'jungle': {'steelcaps': "Wenn gegnerischer Auto-/Invade-Schaden überwiegt; bei zusätzlichem CC/AP neu abwägen.",
               'mercs': "Bei relevantem Magieschaden; Tenacity hilft nur gegen reduzierbare Kontrolle."},
}
BOOTS_ID = {'steelcaps': 3047, 'mercs': 3111}

START_ITEM = {'shield': (1054, "Doran's Shield + Health Potion"), 'blade': (1055, "Doran's Blade + Health Potion")}

METHOD = {
    'jungle': [
        ["Geltungsbereich", "Olaf als Jungler in Ranked Solo Queue. Eigenständige Jungle-Liste. Gleicher Z–F-Maßstab, aber eigene qualitative Kit-Einschätzung ohne verifizierte Jungle-Paarungsstatistik für diesen Patch."],
        ["Bewertungsannahme", "Ähnlicher Gold-/Erfahrungsstand, vergleichbares Jungle-Tempo und kein bestimmter Lane-Matchup als Standardumfeld vorausgesetzt. Tier beschreibt die grundsätzliche Spielbarkeit des Jungle-vs-Jungle-Duells (Invade, Scuttle, Konter-Jungle, Objective-Fights), nicht Ganks auf andere Lanes."],
        ["Championpool", "28 aktuell verbreitete Jungler entlang der METAsrc-Jungle-Tierliste 26.18 (u. a. Master Yi, Lee Sin, Viego, Kayn, Briar, Shyvana, Graves als S/S+-Tier) plus etablierte Flex- und Duell-relevante Jungler. Für seltenere Picks keine einheitlich verifizierte aktuelle Pickrate; ihre Aufnahme ist redaktionell."],
        ["Statistik", "Keine belastbaren Olaf-Jungle-Paarungswinrates extrahiert (Netzwerkzugriff auf Statistikseiten in dieser Build-Umgebung nicht verfügbar). Toplane-Winrates werden nicht übertragen. Fehlend heißt nicht 0 %."],
        ["Quellen und Tiers", "Riot-Kits und Summoner's-Rift-Änderungen 26.18 sind die mechanische Grundlage. Poolseiten dienen nur der Rollenauswahl. Sämtliche Tiers, Runenentscheidungen und Spielpläne sind eigene qualitative Ableitungen; keine Quelle bestätigt diese Liste als fertige Empfehlung."],
        ["Invade & Level 1-2", "Olafs frühe Autoreichweite und Q-Slow erlauben aggressive Scuttle-/Invade-Kontakte, aber ohne Smite-Timing-Vorteil ist ein 1v1 am Krebs riskant. Level-2-Duellstärke hängt stark vom Gegner-Kit ab."],
        ["Pathing & Ganks", "Vollclear vs. drei Camps und Gank ist eine laufende Matchup-Entscheidung, keine feste Regel. Gegen starke Invader eher sicherer, kontrollierter Clear; gegen schwache frühe Duellanten aktives Konter-Jungle."],
        ["R und Zugang", "Ragnarok hebt gegnerisches CC auf und heilt über Schaden, hilft aber nicht gegen reinen Rückschaden, Stealth oder Distanz. Erst aktivieren, wenn danach zeitnah Autos/E auf ein Ziel möglich sind."],
        ["Rune", "PTA für ein durch schnellen Kontakt gesichertes Fenster mit mindestens drei Autos. Conqueror bei langen Objective-/Duell-Phasen und Gegnern mit Sustain oder Tankiness. Der Nebenbaum folgt dem Bedrohungstyp (Poke vs. Burst vs. Zugang)."],
        ["Jungle-Startitem im Icon-Katalog", "Das Jungle-Rollenitem selbst ist im lokalen Icon-Katalog dieser App nicht hinterlegt, weil diese Build-Umgebung keinen Netzwerkzugriff auf Riots Datenquelle hatte. Die Start-Kachel zeigt daher nur Health Potions; kaufe das reguläre Jungle-Startitem in der Praxis dennoch zuerst."],
        ["Hydra/Stridebreaker als Core", "Ravenous Hydra für Sustain zwischen Camps/Duellen und Waveclear bei Lane-Ganks. Stridebreaker/Hexplate als Alternative, wenn Zugang zu einem mobilen oder Stealth-Ziel das Hauptproblem ist, nicht Sustain."],
        ["Sidelane und Team", "Bei 1/2/3 Items sind gleiche Itemzahlen nur eine grobe Annahme: Level, Gold, Summoners und Objective-Timer zählen. Olafs Wert als Jungler hängt stark von Invade-Erfolg, Scuttle-Kontrolle und Dive-/Duell-Potenzial um Drake/Herald/Baron ab."],
        ["Patchprüfung", "18.09.2026: 26.18. Nur Summoner's Rift, keine League-Classic-/ARAM-Änderungen. Die Matchup-Tiers sind keine vollständige numerische Simulation."],
        ["Quelle: Live-Patch", "https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-18-notes/"],
        ["Quelle: Pool", "https://www.metasrc.com/lol/tier-list/jungle"],
        ["Quelle: Olaf", "https://www.leagueoflegends.com/en-us/champions/olaf/"],
    ],
    'mid': [
        ["Geltungsbereich", "Olaf als Mid-Laner in Ranked Solo Queue, ein off-meta aber spielbarer AD-Skirmisher-Pick. Eigenständige Mid-Liste. Gleicher Z–F-Maßstab, aber eigene qualitative Kit-Einschätzung ohne verifizierte Mid-Paarungsstatistik für diesen Patch."],
        ["Bewertungsannahme", "Ähnlicher Gold-/Erfahrungsstand und kein bestimmter Jungler als Standardpartner vorausgesetzt. Tier beschreibt die grundsätzliche 1v1-Spielbarkeit der Lane; Ganks und Roams können sie in beide Richtungen verschieben."],
        ["Championpool", "28 aktuell verbreitete Mid-Champions entlang der METAsrc-Mid-Tierliste 26.18 (u. a. Yasuo, Yone, Ahri, Zed, Sylas, Akali, Viktor als S/S+-Tier) plus etablierte Flex- und Duell-relevante Mid-Picks. Für seltenere Picks keine einheitlich verifizierte aktuelle Pickrate; ihre Aufnahme ist redaktionell."],
        ["Statistik", "Keine belastbaren Olaf-Mid-Paarungswinrates extrahiert (Netzwerkzugriff auf Statistikseiten in dieser Build-Umgebung nicht verfügbar). Toplane-Winrates werden nicht übertragen. Fehlend heißt nicht 0 %."],
        ["Quellen und Tiers", "Riot-Kits und Summoner's-Rift-Änderungen 26.18 sind die mechanische Grundlage. Poolseiten dienen nur der Rollenauswahl. Sämtliche Tiers, Runenentscheidungen und Spielpläne sind eigene qualitative Ableitungen; keine Quelle bestätigt diese Liste als fertige Empfehlung."],
        ["Erste Waves", "Olaf hat auf Level 1-2 durch Autoreichweite und Q-Slow reales Trade-Potenzial gegen viele Mage-Matchups, verliert aber gegen reinen Range-Poke ohne Deckung schnell HP. CS-Verlust gegen überlegene Reichweite ist manchmal die richtige Entscheidung."],
        ["Wave und Roam", "Freeze nur, wenn der eigene Jungler den Bereich absichern kann. Slowpush/Crash vor Recall abwägen; Olafs fehlende Mobilität macht ihn als Roamer schwächer als viele Mid-Meta-Picks – Teleport statt Ghost erwägen, wenn Side-Präsenz wichtiger ist als der zweite Summonerzauber für den Chase."],
        ["R und Zugang", "Ragnarok hebt gegnerisches CC auf und heilt über Schaden, hilft aber nicht gegen reine Distanz, Dashes oder Unsichtbarkeit. Erst aktivieren, wenn danach zeitnah Autos/E auf einen Champion möglich sind."],
        ["Rune", "PTA für ein durch Kontakt gesichertes Fenster mit mindestens drei Autos gegen fragile Gegner. Conqueror bei langen Duellen gegen Sustain/Scaling wie Nasus oder Kayle. Der Nebenbaum folgt dem Bedrohungstyp (Poke vs. Burst vs. Zugang)."],
        ["Hydra/Stridebreaker als Core", "Ravenous Hydra für Sustain und Waveclear gegen die meisten Gegner. Stridebreaker/Hexplate, wenn Zugang zu einem hochmobilen oder Reset-starken Gegner (Yasuo, Zed, Akali, Ekko, Fizz) das Hauptproblem ist, nicht Sustain."],
        ["Sidelane und Team", "Bei 1/2/3 Items sind gleiche Itemzahlen nur eine grobe Annahme: Level, Gold, Summoners und Teamcomp zählen. Als Mid-Laner fehlt Olaf oft die reine Range-Poke- oder Waveclear-Stärke der Mage-Meta; sein Wert liegt stärker in erzwungenen All-ins und späten Duellen."],
        ["Patchprüfung", "18.09.2026: 26.18. Nur Summoner's Rift, keine League-Classic-/ARAM-Änderungen. Die Matchup-Tiers sind keine vollständige numerische Itemsimulation."],
        ["Quelle: Live-Patch", "https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-18-notes/"],
        ["Quelle: Pool", "https://www.metasrc.com/lol/tier-list/mid"],
        ["Quelle: Olaf", "https://www.leagueoflegends.com/en-us/champions/olaf/"],
    ],
}

REQUIRED_FIELDS = ['slug', 'name', 'tier', 'lane', 'late', 'keystoneKey', 'coreKey', 'bootsKey',
    'reason', 'runeReason', 'l1', 'l25', 'l6', 'threats', 'window', 'errors', 'wave', 'trade',
    'items', 'situ', 'side', 'plan', 'override', 'uncertainty', 'start', 'sums', 'boots', 'note', 'revision']
TIERS = set('ZABCDEF')


def load_content(paths):
    out = []
    for p in paths:
        with open(p, encoding='utf-8') as f:
            arr = json.load(f)
        assert isinstance(arr, list), f"{p} is not a JSON array"
        out.extend(arr)
    return out


def build_items(pairs):
    return [{"id": i, "why": w} for i, w in pairs]


def make_loadout(entry, lane):
    core_key = entry['coreKey']
    core = CORE_TEMPLATES[core_key]
    core_ids = {i for i, _ in core}
    alt = [(3073, "Alternative als 1. Item: gesunder R-All-in, wenn Zugang fehlt. Dann Tiamat nicht automatisch vorschalten.")]
    if 3074 in core_ids:
        alt.append((6631, "Alternative als 1. Item: Kontakt priorisieren."))
    else:
        alt.append((3074, "Alternative als 1. Item: Sustain und Waveclear priorisieren."))
    if 3156 in core_ids:
        situ3 = [(3065, "Bei anhaltendem AP-Druck und Heilwert."),
                  (2512, "Offensive R-/Crit-Abzweigung nur, wenn du drei Autos zuverlässig anbringen und den Rückschaden überleben kannst.")]
        situ4 = [(3143, "Gegen bedrohlichen Crit-Schaden."),
                  (3065, "Gegen AP-Burst (Maw) oder anhaltende Magie (Visage). Maw ersetzt Sterak's, nicht ergänzen."),
                  (3031, "Nur als Fortsetzung eines begonnenen Crit-Builds; nicht allein als defensive Lösung.")]
    else:
        situ3 = [(3053, "Burstpuffer; Sterak's nicht mit Maw kombinieren."),
                  (2512, "Offensive R-/Crit-Abzweigung nur, wenn du drei Autos zuverlässig anbringen und den Rückschaden überleben kannst.")]
        situ4 = [(3143, "Gegen bedrohlichen Crit-Schaden."),
                  (3156, "Gegen AP-Burst (Maw) oder anhaltende Magie (Visage). Maw ersetzt Sterak's, nicht ergänzen."),
                  (3031, "Nur als Fortsetzung eines begonnenen Crit-Builds; nicht allein als defensive Lösung.")]

    boots_key = entry['bootsKey']
    boots = [{"id": BOOTS_ID[boots_key], "why": BOOTS_WHY[lane][boots_key]}]

    if lane == 'jungle':
        start = [{"id": 2003, "why": "Health Potion als Basis; das Jungle-Rollenitem ist im lokalen Icon-Katalog dieser App nicht hinterlegt (Netzwerkbeschränkung bei der Erstellung) – in der Praxis zuerst kaufen."}]
        start_note = entry['start']
    else:
        key = 'blade' if 'blade' in entry['start'].lower() else 'shield'
        item_id, _ = START_ITEM[key]
        start = [{"id": item_id, "why": "Standardstart für dieses Matchup."}, {"id": 2003, "why": "Ein Heiltrank zum Start."}]
        start_note = entry['start']

    rt = RUNE_TEMPLATES[entry['keystoneKey']]
    return {
        "primary": rt['primary'], "secondary": rt['secondary'],
        "primaryTree": rt['primaryTree'], "secondaryTree": rt['secondaryTree'],
        "runeNote": rt['runeNote'], "runeAlternative": rt['runeAlternative'],
        "start": start, "startNote": start_note,
        "boots": boots,
        "core": build_items(core), "coreNote": entry['items'],
        "alternatives": build_items(alt),
        "situational": [
            {"slot": 3, "options": build_items(situ3)},
            {"slot": 4, "options": build_items(situ4)},
            {"slot": 5, "options": build_items(SITU5)},
        ],
        "shards": SHARDS,
    }


def make_matchup(entry, lane):
    rt = RUNE_TEMPLATES[entry['keystoneKey']]
    label = 'Jungle' if lane == 'jungle' else 'Mid'
    m = {k: entry[k] for k in ['slug', 'name', 'tier', 'reason', 'runeReason', 'l1', 'l25', 'l6', 'threats',
                                'window', 'errors', 'wave', 'trade', 'items', 'situ', 'side', 'plan', 'override',
                                'uncertainty', 'start', 'sums', 'boots', 'note', 'revision', 'lane', 'late']}
    m['rune'] = rt['rune']
    m['role'] = lane
    m['stats'] = {"opponentWR": None, "n": None, "opponentGD": None, "rawWR": None, "ln": None, "delta2": None}
    m['statsNote'] = f"Keine ausreichend belastbare Olaf-{label}-Paarungsstatistik verifiziert (Netzwerkzugriff auf Statistikseiten in dieser Build-Umgebung nicht verfügbar). Deshalb keine numerische Winrate und keine Übernahme von Toplane-Statistiken."
    m['official'] = f"https://www.leagueoflegends.com/en-us/champions/{entry['slug']}/"
    m['sources'] = [
        ["Riot · Olaf", "https://www.leagueoflegends.com/en-us/champions/olaf/"],
        [f"METAsrc · {label}-Pool (keine Olaf-Matchupwertung)", f"https://www.metasrc.com/lol/tier-list/{lane}"],
    ]
    return m


def validate(entry, lane):
    for field in REQUIRED_FIELDS:
        v = entry.get(field)
        assert isinstance(v, str) and v.strip(), f"{lane}/{entry.get('slug')}: missing/empty field {field}"
    assert entry['tier'] in TIERS, f"{lane}/{entry['slug']}: bad tier {entry['tier']}"
    assert entry['lane'] in TIERS, f"{lane}/{entry['slug']}: bad lane tier {entry['lane']}"
    assert entry['late'] in TIERS, f"{lane}/{entry['slug']}: bad late tier {entry['late']}"
    assert entry['keystoneKey'] in RUNE_TEMPLATES, f"{lane}/{entry['slug']}: bad keystoneKey {entry['keystoneKey']}"
    assert entry['coreKey'] in CORE_TEMPLATES, f"{lane}/{entry['slug']}: bad coreKey {entry['coreKey']}"
    assert entry['bootsKey'] in BOOTS_ID, f"{lane}/{entry['slug']}: bad bootsKey {entry['bootsKey']}"
    if lane == 'jungle':
        entry['sums'] = 'Flash + Smite'
    else:
        if entry['sums'] not in ('Flash + Ghost', 'Flash + Ignite', 'Flash + Teleport'):
            entry['sums'] = 'Flash + Ghost'


def run():
    jobs = [
        ('jungle', [os.path.join(WORK, 'content-jungle-1.json'), os.path.join(WORK, 'content-jungle-2.json')]),
        ('mid', [os.path.join(WORK, 'content-mid-1.json'), os.path.join(WORK, 'content-mid-2.json')]),
    ]
    for lane, paths in jobs:
        entries = load_content(paths)
        slugs = [e['slug'] for e in entries]
        assert len(entries) == 28, f"{lane}: expected 28 entries, got {len(entries)}"
        assert len(set(slugs)) == 28, f"{lane}: duplicate slugs {slugs}"
        for e in entries:
            validate(e, lane)

        doc = {
            "champion": "Olaf", "role": lane, "patch": "26.18", "checked": "18.09.2026",
            "statsPatch": f"Keine belastbaren Olaf-{'Jungle' if lane=='jungle' else 'Mid'}-Paarungsdaten",
            "method": METHOD[lane],
            "matchups": [make_matchup(e, lane) for e in entries],
        }
        out_path = os.path.join(APP, 'dist', f'olaf-{lane}.json')
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(doc, f, ensure_ascii=False, indent=2)
            f.write('\n')
        print(f"wrote {out_path} ({len(doc['matchups'])} matchups)")

        # loadouts
        loadouts_path = os.path.join(APP, 'dist', 'loadouts.json')
        with open(loadouts_path, encoding='utf-8') as f:
            loadouts = json.load(f)
        loadouts['collections'][f'olaf-{lane}'] = {e['slug']: make_loadout(e, lane) for e in entries}
        with open(loadouts_path, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(loadouts, f, ensure_ascii=False, indent=1)
            f.write('\n')
        print(f"updated loadouts.json collection olaf-{lane}")

        # per-matchup downloads
        dl_dir = os.path.join(APP, 'dist', 'downloads', lane)
        os.makedirs(dl_dir, exist_ok=True)
        label = 'Jungle' if lane == 'jungle' else 'Mid'
        for m in doc['matchups']:
            with open(os.path.join(dl_dir, f"Olaf_{label}_vs_{m['slug']}.json"), 'w', encoding='utf-8') as f:
                json.dump(m, f, ensure_ascii=False, indent=2)
                f.write('\n')
        print(f"wrote {len(doc['matchups'])} download files to {dl_dir}")


if __name__ == '__main__':
    run()
