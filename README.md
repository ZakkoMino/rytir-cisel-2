# Rytíř Čísel — Souboj s drakem

Příběhová hra na **počítání do 10 a do 20** pro dítě, které právě dokončilo první třídu
(≈ 7 let). Dvanáct zastávek ve dvou světech, hraje se prstem na tabletu.

Inspirováno českým **Matemágem** — tedy: příběh nese celou hru, dabovaný komiks
na začátku i na konci, zastávky na mapě a hlavně **za chybu se nic neodečítá**.
Dítě zkouší, jak dlouho potřebuje, a po druhé chybě mu nápověda naskočí sama.

---

## Zahrát si

> ### 🛡️ **https://zakkomino.github.io/rytir-cisel-2/**

### Nainstalovat na tablet

Hra je **PWA**, takže se dá nainstalovat jako aplikace — spustí se na celou
obrazovku bez adresního řádku a funguje i bez internetu.

- **Android (Chrome):** menu ⋮ → *Nainstalovat aplikaci* (nebo *Přidat na
  plochu* → nabídne *Instalovat*).
- **iPad (Safari):** tlačítko Sdílet → *Přidat na plochu*.

Bez `manifest.json` dělal Android jen zástupce, který se otevřel v prohlížeči
s adresním řádkem. O celou obrazovku se stará `manifest.json`
(`display: fullscreen`, ikony) a o offline běh `sw.js`.

**Při nasazení, které přidá nebo přejmenuje soubor hry, zvedni `VERZE`
v `sw.js`.** Service worker podle ní pojmenovává svou cache: nová verze se
předcachuje celá (včetně nového souboru) a stará se smaže. Bez zvednutí verze
by první offline spuštění po takovém nasazení nový soubor nemělo.
Změny v už existujících souborech se stáhnou na pozadí samy — dítě je uvidí
**při dalším spuštění**, protože hra odpovídá nejdřív z cache a nikdy nečeká
na síť.

Nasazuje se samo z `main`. Nic se nebuilduje, soubory jdou nahoru jak leží
(`.nojekyll` je v repu proto, aby do nich nesahal Jekyll).

Pozn.: teď na každý push běží nasazení **dvakrát** — GitHubův vlastní
`pages build and deployment` (to dělá `Source: Deploy from a branch`)
a k tomu `.github/workflows/pages.yml`. Publikují to samé, takže to nevadí,
jen je to zbytečné. Zbavit se toho jde dvěma způsoby:

- **Settings → Pages → Source: `GitHub Actions`** → GitHubův builder přestane
  běhat a zůstane jen workflow z repa; nebo
- ponechat `Deploy from a branch` a smazat `.github/workflows/pages.yml`.

## Jak to spustit lokálně

Nic se nekompiluje, nejsou žádné závislosti.

**Nejrychleji:** otevřít `index.html` v prohlížeči (funguje i z `file://`).

Nebo servírovat po síti a otevřít z tabletu bez GitHub Pages:

```bash
cd rytir-cisel-2
python3 -m http.server 8000        # nebo: npx http-server -p 8000
```

Na tabletu pak `http://<ip-počítače>:8000`.

Postup se ukládá do `localStorage` prohlížeče. Offline běh drží service
worker — ten se registruje jen přes `http(s)://`, takže z `file://` hra
funguje taky, jen bez cache.

---

## Příběh

Drak **Šupinář** ukradl z království Desítkova **Zlatý počet** — knihu,
ve které jsou schovaná všechna čísla. Od té doby se v království čísla pletou.
Rytíř (nebo rytířka — dítě si vybere) se vydá přes deset zastávek na Dračí horu.

Pointa je řečená hned v úvodu: **draka neporazíš mečem, porazíš ho počítáním.**
A na konci se ukáže, proč drak knihu ukradl — chtěl si spočítat svůj poklad
a nikdo ho nikdy počítat nenaučil. Rytíř ho to naučí. Žádné zabíjení draka.

---

## Světy a zastávky

Obsah je rozdělený na **světy** podle toho, co dítě právě umí. Svět se otevře
dokončením předchozího — nebo ho rodič otevře v nastavení (*Otevřít všechny
světy*), když dítě umí víc, než kde je v příběhu.

### Svět „do 10“ — Cesta do deseti *(po první třídě)*

| # | Zastávka | Co se procvičuje | Jak se to hraje |
|---|----------|------------------|-----------------|
| 1 | Kovárna | sčítání a odčítání do 10 na věcech | vtipná kovářská zakázka se odehraje na kovadlině (učedník přinese, koza sní) a vedle se skládá příklad `3 + 4 = ?`; poslední dvě kola mají tři členy |
| 2 | Most přes rokli | rozklad čísel do 10 | mezeru široké *N* je nutné vyplnit **dvěma** prkny; prkno je přesně tak dlouhé, kolik políček zaplní |
| 3 | Číselná stezka | sčítání a odčítání do 10 **zpaměti** | „Stojíš na 3, udělej 4 kroky vpřed“ — dítě klepne na cílový kámen, rytíř tam odskáče krok po kroku |
| 4 | Kouzelný štít | dvojice do deseti | na štítu svítí 7 nýtů, kolik chybí do 10; vedle je desítkový rámec |
| 5 | Strážná brána | porovnávání `<` `=` `>` | dvě stráže na váhách, dítě vybere znaménko, váhy se překlopí |

### Svět „do 20“ — Dračí hora *(1.–2. třída)*

| # | Zastávka | Co se procvičuje | Jak se to hraje |
|---|----------|------------------|-----------------|
| 1 | Dračí vejce | desítka a jednotky, 11–20 | do hnízda se vejde přesně 10 vajec; kola se střídají: *přečti počet* / *naskládej daný počet* |
| 2 | Skalní police | 10–20 **bez přechodu** (13 + 4) | otep deseti kaštanů je svázaná a nehýbe se, klepat jde jen do volných — a volných se vejde nejvýš devět |
| 3 | Hradní výtah | sčítání a odčítání do 20 | 21 pater, „jsi v 7., vyjeď o 6 výš“; každá desítka je označená |
| 4 | Lektvary | sčítání **s přechodem** — vidět | do láhve se vejde 10 kapek; dítě přilévá po jedné a vidí, jak první přeteče do druhé |
| 5 | Dračí poklad | odčítání **s přechodem** — vidět | plná desítka + volné mince; dítě mince vyndává klepnutím a pak spočítá zbytek |
| 6 | Desítkový schod | přechod přes desítku **na dva kroky** (7 + 8, 14 − 6) | dítě samo rozdělí druhé číslo: nejdřív dojde přesně na deset, pak zbytek — a vidí to na pásu, který se rozdělí na dvě barvy |
| 7 | Souboj s drakem | všechno do 20 | drak má ohnivé štíty, každý správný výpočet jeden rozbije; příklady se losují |

Rozdíl mezi 4/5 a 6 je záměrný: **Lektvary a Poklad přechod ukazují** (dítě
přilévá a ubírá a vidí, co se s desítkou děje), **Desítkový schod ho po dítěti
chce** — musí samo říct, že 8 je 3 a 5, protože do desítky chybí 3.

## Co je v tom pro dítě udělané schválně

- **Chyba nic nebere.** Žádné životy, žádný časomíra, žádné skóre.
  Špatná odpověď = jemné zatřesení, povzbuzení nahlas, a zkoušej dál.
- **Nápověda po druhé chybě naskočí sama** — a nedává výsledek, dává postup
  („Do desítky chybí 2. Přidej 2, máš 10, a ještě zbývá 5.“).
- **Čte to nahlas česky** (Web Speech API). Sedmileté dítě po první třídě
  čte pomalu, takže každé zadání se dá kdykoli přehrát znovu 🔊.
  Když v systému není český hlas, hra funguje dál jen s textem.
- **Věta se vždycky dopoví.** „Pět plus pět je deset“ doběhne celé a teprve
  potom začne další úloha — věty stojí ve frontě a hra na ně čeká.
  Přeruší se jen to, co si vyžádá dítě samo: klepnutí na 🔊, další panel
  komiksu, odchod ze zastávky a odpověď (rozečtené zadání už nepotřebuje slyšet).
  Kdyby prohlížeč konec věty neohlásil, pojistka hru po chvilce pustí dál
  a po třech takových větách se dabing sám vypne — text zůstává.
- **Desítkový rámec** (2 × 5 okýnek) se opakuje přes všechny zastávky,
  ať si dítě zvykne vidět deset na první pohled.
- **Dotyk, ne přesnost.** Všechny cíle jsou velké, nikde není drag & drop
  ani nic, co by vyžadovalo jemnou motoriku nebo myš.
- **Rytíř / rytířka** — texty se ohýbají v rodě podle výběru.
- **Víc dětí na jednom tabletu.** Každý profil má svůj postup, svého hrdinu
  i svoje hvězdy; přepíná se na úvodní obrazovce nebo v nastavení.
- **Přehled pro rodiče** (⚙️ → *Jak to jde*): u každé zastávky kolik kol,
  kolik chyb a kolikrát si dítě vzalo nápovědu. Zastávka, kde chybovalo víc
  než v polovině kol, je červeně — tam se vyplatí zahrát si to spolu.

---

## Technicky

- Čistý HTML + CSS + JS, žádný build, žádné závislosti, žádná externí data.
- Postavy a kulisy jsou **inline SVG** s CSS animacemi
  (rytíř se pohupuje a seká mečem, drak mává křídly a chrlí oheň).
- Zvuky jsou **syntetizované ve Web Audio** — žádné zvukové soubory.
- `prefers-reduced-motion` se respektuje.

```
index.html
manifest.json       PWA: jméno, ikony, celá obrazovka (instalace na plochu)
sw.js               service worker: instalovatelnost a offline běh
ikony/              ikony aplikace (192/512 + maskable) a náhled pro instalaci
css/main.css        kulisy, tlačítka, mapa, komiks, efekty
css/levels.css      skořápka úrovně a jednotlivé minihry
js/core.js          stav, zvuk, český hlas, SVG postavy, efekty
js/engine.js        skořápka úrovně: kola, nápovědy, oslava
js/levels-act1.js   zastávky 1–5 (do 10)
js/levels-act2.js   zastávky 6–10 (do 20)
js/story.js         komiksy, mapa výpravy, nastavení
js/main.js          propojení příběhu a úrovní
```

Přidat zastávku = jeden `RC.levels.push({...})` s `svet: '<id>'` a
`vytvor(api, kolo)`. Přidat svět = jeden řádek do `RC.svety` v `js/core.js`.
Mapa (souřadnice i šířka stezky), odemykání, přepínač světů i příběhové
přechody se dopočítají z dat — na počtu zastávek nezáleží.

Plán, kam s hrou dál — světy do 10 / 20 / 100 a malá násobilka, co je v cestě
a v jakém pořadí to dělat: **[ROZSIRENI.md](ROZSIRENI.md)**.

---

## Co pilot ještě nemá

- Obtížnost se nepřizpůsobuje — úlohy se losují, ale nezvedají se podle toho,
  jak dítěti jde (statistika se už sbírá, adaptivita z ní ještě nečerpá).
- Není denní procvičování ani sbírání, takže po dohrání chybí důvod se vracet.
- Světy do 100 a malá násobilka jsou zatím jen v plánu.
- Hlas je systémový, ne nadabovaný — v Chrome na Androidu a v Safari na iPadu
  český hlas je, na desktop Linuxu často není.
- Cílená je krajina **na šířku**; na výšku to funguje, ale je to těsnější.
