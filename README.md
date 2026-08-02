# Rytíř Čísel — Souboj s drakem

Příběhová hra na **počítání do 10 a do 20** pro dítě, které právě dokončilo první třídu
(≈ 7 let). Pilot / POC ve webové formě, hraje se prstem na tabletu.

Inspirováno českým **Matemágem** — tedy: příběh nese celou hru, dabovaný komiks
na začátku i na konci, zastávky na mapě a hlavně **za chybu se nic neodečítá**.
Dítě zkouší, jak dlouho potřebuje, a po druhé chybě mu nápověda naskočí sama.

---

## Zahrát si

> ### 🛡️ **https://zakkomino.github.io/rytir-cisel-2/**

Na iPadu doporučuju v Safari *Přidat na plochu* — hra se pak spustí
na celou obrazovku bez adresního řádku.

Nasazuje se samo: každý push do `main` spustí
`.github/workflows/pages.yml`, který obsah repa zabalí a pošle na Pages
(Pages jsou nastavené na `Source: GitHub Actions`). Nic se nebuilduje,
soubory jdou nahoru jak leží.

## Jak to spustit lokálně

Nic se nekompiluje, nejsou žádné závislosti.

**Nejrychleji:** otevřít `index.html` v prohlížeči (funguje i z `file://`).

Nebo servírovat po síti a otevřít z tabletu bez GitHub Pages:

```bash
cd rytir-cisel-2
python3 -m http.server 8000        # nebo: npx http-server -p 8000
```

Na tabletu pak `http://<ip-počítače>:8000`.

Funguje offline, postup se ukládá do `localStorage` prohlížeče.

---

## Příběh

Drak **Šupinář** ukradl z království Desítkova **Zlatý počet** — knihu,
ve které jsou schovaná všechna čísla. Od té doby se v království čísla pletou.
Rytíř (nebo rytířka — dítě si vybere) se vydá přes deset zastávek na Dračí horu.

Pointa je řečená hned v úvodu: **draka neporazíš mečem, porazíš ho počítáním.**
A na konci se ukáže, proč drak knihu ukradl — chtěl si spočítat svůj poklad
a nikdo ho nikdy počítat nenaučil. Rytíř ho to naučí. Žádné zabíjení draka.

---

## Zastávky

### Akt I — Cesta do deseti

| # | Zastávka | Co se procvičuje | Jak se to hraje |
|---|----------|------------------|-----------------|
| 1 | Kovárna | počítání předmětů do 10 | dítě klepe na každý předmět, ten se očísluje a cinkne — jeden předmět = jedno číslo |
| 2 | Most přes rokli | rozklad čísel do 10 | mezeru široké *N* je nutné vyplnit **dvěma** prkny; prkno je přesně tak dlouhé, kolik políček zaplní |
| 3 | Číselná stezka | sčítání a odčítání do 10 | „Stojíš na 3, udělej 4 kroky vpřed“ — dítě klepne na cílový kámen, rytíř tam odskáče krok po kroku |
| 4 | Kouzelný štít | dvojice do deseti | na štítu svítí 7 nýtů, kolik chybí do 10; vedle je desítkový rámec |
| 5 | Strážná brána | porovnávání `<` `=` `>` | dvě stráže na váhách, dítě vybere znaménko, váhy se překlopí |

### Akt II — Dračí hora

| # | Zastávka | Co se procvičuje | Jak se to hraje |
|---|----------|------------------|-----------------|
| 6 | Dračí vejce | desítka a jednotky, 11–20 | do hnízda se vejde přesně 10 vajec; kola se střídají: *přečti počet* / *naskládej daný počet* |
| 7 | Hradní výtah | sčítání a odčítání do 20 | 21 pater, „jsi v 7., vyjeď o 6 výš“; každá desítka je označená |
| 8 | Lektvary | sčítání **s přechodem přes desítku** | do láhve se vejde 10 kapek; dítě přilévá po jedné a vidí, jak první přeteče do druhé |
| 9 | Dračí poklad | odčítání **s přechodem přes desítku** | plná desítka + volné mince; dítě mince vyndává klepnutím a pak spočítá zbytek |
| 10 | Souboj s drakem | všechno do 20 | drak má 5 ohnivých štítů, každý správný výpočet jeden rozbije |

Přechod přes desítku (8. a 9. zastávka) je záměrně postavený **vizuálně** —
dítě nejdřív uvidí, co se s desítkou děje, a teprve pak odpovídá.

---

## Co je v tom pro dítě udělané schválně

- **Chyba nic nebere.** Žádné životy, žádný časomíra, žádné skóre.
  Špatná odpověď = jemné zatřesení, povzbuzení nahlas, a zkoušej dál.
- **Nápověda po druhé chybě naskočí sama** — a nedává výsledek, dává postup
  („Do desítky chybí 2. Přidej 2, máš 10, a ještě zbývá 5.“).
- **Čte to nahlas česky** (Web Speech API). Sedmileté dítě po první třídě
  čte pomalu, takže každé zadání se dá kdykoli přehrát znovu 🔊.
  Když v systému není český hlas, hra funguje dál jen s textem.
- **Desítkový rámec** (2 × 5 okýnek) se opakuje přes všechny zastávky,
  ať si dítě zvykne vidět deset na první pohled.
- **Dotyk, ne přesnost.** Všechny cíle jsou velké, nikde není drag & drop
  ani nic, co by vyžadovalo jemnou motoriku nebo myš.
- **Rytíř / rytířka** — texty se ohýbají v rodě podle výběru.

---

## Technicky

- Čistý HTML + CSS + JS, žádný build, žádné závislosti, žádná externí data.
- Postavy a kulisy jsou **inline SVG** s CSS animacemi
  (rytíř se pohupuje a seká mečem, drak mává křídly a chrlí oheň).
- Zvuky jsou **syntetizované ve Web Audio** — žádné zvukové soubory.
- `prefers-reduced-motion` se respektuje.

```
index.html
css/main.css        kulisy, tlačítka, mapa, komiks, efekty
css/levels.css      skořápka úrovně a jednotlivé minihry
js/core.js          stav, zvuk, český hlas, SVG postavy, efekty
js/engine.js        skořápka úrovně: kola, nápovědy, oslava
js/levels-act1.js   zastávky 1–5 (do 10)
js/levels-act2.js   zastávky 6–10 (do 20)
js/story.js         komiksy, mapa výpravy, nastavení
js/main.js          propojení příběhu a úrovní
```

Přidat zastávku = jeden `RC.levels.push({...})` s `vytvor(api, kolo)`.
Mapa i odemykání se dopočítají samy.

---

## Co pilot ještě nemá

- Obtížnost se nepřizpůsobuje — čísla v každé zastávce jsou dané.
- Není přehled pro rodiče (co dítěti dělá potíže).
- Není víc profilů pro víc dětí.
- Hlas je systémový, ne nadabovaný — v Chrome na Androidu a v Safari na iPadu
  český hlas je, na desktop Linuxu často není.
- Cílená je krajina **na šířku**; na výšku to funguje, ale je to těsnější.
