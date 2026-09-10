# Kam s hrou dál

Zápis z revize hry ze 10. 9. 2026. Vzniklo to ze čtyř nezávislých revizí kódu
(Claude, druhý Claude bez kontextu, Codex, Grok 4.6) a body níž jsou ty, na
kterých se shodly. Odkazy `soubor:řádek` míří na stav v době revize.

Cíl: z pilotu na jedno odpoledne udělat hru, která dítě baví měsíce a roste
s ním — od počítání do deseti až po malou násobilku.

## Kde to stojí dnes

**Aktualizováno 10. 9. 2026:** oblast *Blokátory* je hotová a svět „do 20“ má
dvě nové zastávky (Skalní police — bez přechodu, Desítkový schod — přechod na
dva kroky). Hra má **dva světy a 12 zastávek**, úlohy se losují z generátorů,
postup drží profily se statistikou a mapa se počítá z počtu zastávek.
Podrobně u jednotlivých bodů níž.

Co ještě chybí: adaptivní obtížnost (statistika se sbírá, ale nikdo z ní
nečerpá), denní procvičování, sbírání a světy do 100 a malé násobilky.

## 1. Tvrdé blokátory — ✅ hotovo

| Co bylo | Jak je to teď |
|---|---|
| `BODY` = 10 pevných souřadnic mapy, 11. zastávka mapu shodila | `bodMapy(i, n)` v `js/story.js` počítá souřadnice ze počtu uzlů (had, poslední nejvýš) |
| pevná šířka `.mapa-cesta` | šířka se nastavuje inline z počtu zastávek |
| `odemcena(index)` lineárně přes celý `RC.levels` | `odemcena(uroven)` řeší pořadí **uvnitř světa**, svět otevírá `svetOdemcen()` |
| `POSLEDNI_AKT1`, `BOSS` pevně v `main.js` | komiksy a boss jsou v datech světa (`komiksPo`, `posledni`, `u.boss`) |
| jediný profil, plochý `hotovo[]`, `hvezdy` navíc | postup v2: profily, statistika po zastávkách, `hvezdy()` se dopočítá, migrace z `postup-v1` |
| pevné banky úloh, `kola` svázané s délkou pole | generátory + `RC.bag`; `kola` se dá zvednout bez sahání do dat |
| rozptyly voleb jen ±1 | `okoliVoleb` nabízí i typické chyby: o desítku vedle, prohozené číslice, ±2 |

Zbylo z téhle oblasti: **adaptivní obtížnost** (statistika je, pravidlo „dvě
správně bez nápovědy → nahoru“ ještě ne) a **anti-hádání** (po druhé chybě
odebrat jednu špatnou volbu).

## 2. Datový model světů — ✅ hotovo

```js
// js/core.js
RC.svety = [
  { id: 'do10', nazev: 'Cesta do deseti', kratce: 'do 10', vek: 'po první třídě',
    kulisa: '',     komiksPo: 'MEZIHRA' },
  { id: 'do20', nazev: 'Dračí hora',      kratce: 'do 20', vek: '1.–2. třída',
    kulisa: 'hora', komiksPo: 'KONEC', posledni: true }
];
// zastávka nese  svet: 'do10'
```

Přidat svět = řádek sem + zastávky s jeho `svet`. Mapa, přepínač světů,
odemykání i příběhové přechody se dopočítají. Nový svět tedy znamená
**napsat jen minihry**, nic jiného.

Postup v `localStorage` (klíč `rytir-cisel-2/postup-v2`):

```js
{ schemaVersion: 2, aktivniProfil: 'p1', zvuk, hlas, odemcenoVse,
  profily: { p1: { jmeno, hrdina, hotovo: [], videlUvod, videlKomiks: {},
                   startSvet,
                   staty: { kovarna: { dokonceno, kola, chyby, napovedy, naposledy } } } } }
```

## 3. Obsah nových světů

### Svět „do 20“ — ✅ rozšířený

Přidané zastávky:

- **Skalní police** — 10–20 *bez* přechodu (13 + 4, 18 − 5). Otep deseti je
  svázaná a nehýbe se, klepat jde jen do volných kaštanů, a volných se vejde
  nejvýš devět. Celé sdělení zastávky: *desítka se nemění, počítám jednotky.*
- **Desítkový schod** — přechod *přes* desítku na dva kroky, obě operace
  (7 + 8, 14 − 6). Dítě samo rozdělí druhé číslo (8 = 3 a 5) a pás se
  rozdělí na dvě barvy. Lektvary a Poklad přechod ukazují, tady ho dítě dělá.

Co ve světě „do 20“ ještě chybí: **zdvojení a blízké zdvojení** (7+7, 7+8 —
velký pákový efekt), **doplňování** (`7 + ? = 15`) mimo bosse a odčítání jako
**rozdíl** („o kolik víc“).

### Svět „do 100“ — svazky desítek, stovková tabulka, otevřená osa

1. **Sklad sena** — svazky po 10 a jednotlivá stébla: 40 + 30, 70 − 20.
2. **Zámecká zeď** — stovková tabulka 10×10 (deset desítkových rámců pod
   sebou): řádek = ±10, dlaždice = ±1. „Stojíš na 34, o dva řádky výš.“
3. **Kupecká cesta** — osa se značkami jen po desítkách: kam patří 47?
   Orientace a zaokrouhlování; žádné tlačítko na každé číslo.
4. **Velké kádě** — dvojciferné ± jednociferné, nejdřív bez přechodu (34 + 5),
   pak s přechodem (38 + 7) vizuálně přes doplnění do desítky.
5. **Trhovec** — mince 1/2/5/10/20/50: zaplať, dopočítej. Nejsilnější reálný
   kontext, patří na konec světa.

Postup: čtení a místní hodnota → ±1/±10 → porovnání → kulaté desítky →
dvojciferné bez přechodu → s přechodem → smíšeně. Stovkovou tabulku
nepoužívat jako jedinou metaforu, ať dítě nechápe čísla jen jako pozice
v mřížce.

### Svět „malá násobilka“ — pole, ne jen skupiny

1. **Stáje / hnízda** — stejně velké skupiny: 4 ohrady po 3; rozlišit počet
   skupin a velikost skupiny.
2. **Královská mozaika** — obdélníkové pole; **otočením se ukáže, že
   3×4 = 4×3**. Bez toho bere dítě každý spoj jako dvě různá fakta.
3. **Skoky obra** — násobky jako skoky po ose (3, 6, 9…), tedy násobení jako
   opakované sčítání.
4. **Dílna triků** — odvozování: ×4 jako dvakrát dvojnásobek, ×6 jako ×5 a
   ještě jedna skupina, ×9 jako ×10 bez jedné.
5. **Hostina** — dělení jako spravedlivé dělení a jako seskupování; teprve
   potom, a bez formálního algoritmu.
6. **Drakova pole** — boss: zvol vhodnou reprezentaci, ne rychlé vybavení.

Pořadí spojů: **×2 → ×10 → ×5 → ×3 → ×4 → druhé mocniny → ×6, ×7, ×8, ×9**.
Nikdy nezačínat memorováním tabulky a nikdy netlačit na čas — čas je
diagnostika pro rodiče, ne trest pro dítě.

## 4. Delší hratelnost bez nového obsahu

| Věc | Přínos | Námaha |
|---|---|---|
| Generátory úloh místo pevných bank + `RC.bag` na neopakování | největší — hra přestane být „dohraná“ | M |
| Adaptivní obtížnost (2× správně bez nápovědy → nahoru, 2 chyby → dolů) | vysoký | M |
| **Dračí rozcvička** — 8–10 mísených úloh denně ze zvládnutých zastávek, s opakováním toho, co dítě zkazilo | vysoký, buduje návyk | M |
| Sbírání (výzbroj rytíře, dračí skořápky) za hvězdy | vysoký u sedmiletých | S–M |
| Víc profilů | nutné pro dvě děti nebo dva věky | S |
| Přehled pro rodiče (co dělá potíže) | vysoký pro rodiče | M |
| Hvězdy 1–3 za kolo | sporný — nesmí z toho být trest za chyby | S |

## 5. Menší nálezy z revizí

- **Výtah má malé dotykové cíle** — 21 pater do jedné výšky, patro klesá až na
  `min-height: .8rem` (`css/levels.css`). Chce to okno kolem start/cíl, ne 21
  stlačených tlačítek. Jediná zastávka, která porušuje pravidlo velkých cílů.
- **Proklikání voleb se odměňuje stejně** — čtyři možnosti, chyba nic nekostuje
  a špatná volba se nezablokuje, takže dítě může naklikat všechny čtyři a
  dostat hvězdu. Po druhé chybě odebrat jednu špatnou volbu a počítat pokusy.
- **Lektvary prozradí výsledek** — štítky u láhví ukazují „první: 10 /
  druhá: 5“ ještě před otázkou; 15 se dá přečíst.
- **Poklad nevynucuje model přechodu** — klikat se dá i do plné desítky, pak
  popisek „plná desítka“ lže a rozklad se neukáže.
- **Nápovědy někdy dají výsledek** místo postupu (lektvary, poklad) — v rozporu
  s tím, co slibuje README. Udělat je odstupňované.
- **Brána měla rovnost vždy ve 3. a 6. kole** — pravidelnost se dítě naučí jako
  vzorec (v ostatních zastávkách už losování opravené je).
- **Přístupnost:** `user-scalable=no` zakazuje přiblížení; `aria-live` je na
  celém `#app`, takže čtečka předčítá celou scénu při každé změně.
- **Mrtvý kód:** `.hromada .vec.spocitana` a `.ramce-radek` v `css/levels.css`,
  překlep `.drací-stity`, `puvodniChyba` v `js/levels-act2.js`, podpora
  nápovědy jako funkce v `js/engine.js`.
- **Žádné testy.** U desíti zastávek to jde, u třiceti ne. Minimum: unikátní id,
  rozsahy generátorů, počet uzlů mapy, migrace postupu, proklikání každé
  zastávky do konce.

## 6. Doporučené pořadí

Hotovo (10. 9. 2026): mapa z počtu uzlů, datový model světů, odemykání po
světech, příběh v datech, postup v2 s profily a statistikou, generátory úloh,
lepší rozptyly voleb, dvě nové zastávky ve světě „do 20“.

Dál:

1. **S** — testovací základ: unikátní id, rozsahy generátorů, počet uzlů mapy,
   migrace postupu, proklikání každé zastávky do konce (harness existuje,
   patří do repa).
2. **S** — anti-hádání (po druhé chybě odebrat jednu špatnou volbu).
3. **M** — adaptivní obtížnost ze statistiky, která se už sbírá.
4. **M** — cíle ve výtahu, odstupňované nápovědy, štítky u lektvarů, model
   u pokladu, přístupnost (zoom, live region).
5. **M** — Dračí rozcvička: denní mix ze zvládnutých zastávek.
6. **L** — svět **do 100** (sklad desítek → stovková tabulka → osa po
   desítkách → přechod → mince).
7. **L** — svět **malé násobilky** (pole a komutativita otočením → skoky po
   ose → strategie → dělení).
8. **S/M** — sbírání a rozšířený přehled pro rodiče.

Nový svět už nic neblokuje — stačí `RC.svety` a minihry.
