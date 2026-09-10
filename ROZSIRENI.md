# Kam s hrou dál

Zápis z revize hry ze 10. 9. 2026. Vzniklo to ze čtyř nezávislých revizí kódu
(Claude, druhý Claude bez kontextu, Codex, Grok 4.6) a body níž jsou ty, na
kterých se shodly. Odkazy `soubor:řádek` míří na stav v době revize.

Cíl: z pilotu na jedno odpoledne udělat hru, která dítě baví měsíce a roste
s ním — od počítání do deseti až po malou násobilku.

## Kde to stojí dnes

10 zastávek, 53 kol. Pět zastávek má úlohy natvrdo (kovárna, vejce, lektvary,
poklad, souboj), takže druhý průchod je u nich stejný. Postup se ukládá jen
jako „hotovo / nehotovo“ — nikde se neměří, co dítě umí a kde tápe.

## 1. Tvrdé blokátory (bez nich nejde přidat 11. zastávku)

| Co | Proč to blokuje | Velikost |
|---|---|---|
| `js/story.js` — `BODY` = 10 pevných souřadnic mapy, `BODY[idx]` bez kontroly | **11. zastávka mapu shodí** (`b[0]` na `undefined`) | S |
| `css/main.css` — `.mapa-cesta { width: max(100%, 46rem) }`, popisky aktů na pevných `left` | 20+ uzlů se slepí na sebe | S |
| `js/core.js` — `odemcena(index)` je lineární přes celý `RC.levels` | nejde vybrat svět podle věku dítěte | M |
| `js/main.js` — `POSLEDNI_AKT1 = 'brana'`, `BOSS = 'souboj'` | mezihry a finále přišpendlené ke konkrétním id | S |
| `js/core.js` — jediný klíč `postup-v1`, plochý seznam `hotovo[]`, `hvezdy` navíc | jeden profil, žádná statistika, žádná migrace | M |
| pevné banky úloh v `vytvor` | `kola` nejde zvýšit, opakování je identické | M |
| `js/engine.js` — `okoliVoleb` dává rozptyly ±1 | do 20 stačí, pro stovky a násobilku ne | S |

## 2. Datový model světů

```js
RC.svety = [
  { id: 'do10',      nazev: 'Cesta do deseti',    vek: 'po 1. třídě' },
  { id: 'do20',      nazev: 'Dračí hora',         vek: '1.–2. třída' },
  { id: 'do100',     nazev: 'Království',         vek: '2. třída' },
  { id: 'nasobilka', nazev: 'Šupinářova tabulka', vek: '2.–3. třída' }
];
// úroveň dostane  svet: 'do10'  (dnes  akt: 1)
```

Čtyři návazné změny:

1. **Mapa po jednom světě** — 10 uzlů na obrazovku, přesně to, co dnes funguje;
   mezi světy se přepíná. Souřadnice generovat vzorcem (serpentina) z počtu
   uzlů, šířku stezky taky. Nikdy neindexovat pevné pole.
2. **Odemykání po světech** — uvnitř světa lineárně jako dnes, svět se otevře
   dokončením předchozího **nebo** volbou rodiče („kde chceš začít“). Věk brát
   jako doporučení, ne jako zámek — sedmiletých s velmi různou úrovní je plno.
3. **Mezihry a bossové do dat světa** (`svet.uvodniKomiks`, `u.boss`), ne do
   `main.js`. Texty o „deseti hvězdách“ počítat z `RC.levels.length`.
4. **Postup v2** — `schemaVersion`, profily (`postup-v1` zmigrovat), a k tomu
   statistika po zastávkách: pokusy, chyby, nápovědy, kdy naposledy. Bez těch
   dat nejde udělat ani adaptivita, ani přehled pro rodiče.

## 3. Obsah nových světů

### Svět „do 20“ — dotáhnout, co chybí

Zdvojení a blízké zdvojení (7+7, 7+8 — největší pákový efekt a dnes v hře
není vůbec), doplňování (`7 + ? = 15`), odčítání jako **rozdíl** („o kolik
víc“), rozklad dvaceti na Mostě.

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

1. **S** — mapa generovaná z počtu uzlů (odemkne všechno ostatní).
2. **S** — datový model světů, odemykání po světech, pevná id ven z `main.js`.
3. **S** — testovací základ (viz výše).
4. **S/M** — postup v2: profily, statistika, migrace `postup-v1`; zabránit
   proklikání voleb.
5. **M** — generátory úloh ve stávajících deseti zastávkách → nekonečné
   procvičování bez nového obsahu.
6. **M** — cíle ve výtahu, odstupňované nápovědy, štítky u lektvarů, model
   u pokladu, přístupnost.
7. **L** — svět do 100.
8. **L** — svět malé násobilky.
9. **M** — adaptivita a Dračí rozcvička (až nad statistikou).
10. **M** — přehled pro rodiče, sbírání.

Body 1–3 jsou vstupenka ke všemu dalšímu; do té doby se nemá cenu pouštět do
nového obsahu.
