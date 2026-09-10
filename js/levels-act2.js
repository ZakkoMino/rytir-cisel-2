/* Rytíř Čísel – SVĚT „do 20“: Dračí hora
 *  Dračí vejce      – desítka a jednotky, čísla 11–20
 *  Skalní police    – 10–20 BEZ přechodu (13 + 4): desítka se nehýbe
 *  Hradní výtah     – sčítání a odčítání na ose do 20
 *  Lektvary         – sčítání s přechodem přes desítku (vidí se přetečení)
 *  Dračí poklad     – odčítání s přechodem přes desítku
 *  Desítkový schod  – přechod přes desítku na dva kroky, obě operace (7+8, 14−6)
 *  Souboj s drakem  – všechno dohromady do 20
 *
 * Úlohy se losují z generátorů (RC.bag = bez opakování), takže `kola` se dá
 * zvednout, aniž by se sahalo do dat, a druhé hraní není znak po znaku stejné.
 */
(function () {
  'use strict';
  var RC = window.RC;

  /* ---------- generátory úloh ---------- */

  /* Sčítání s přechodem přes desítku: 8 + 5, 7 + 6… */
  function paryScitani() {
    var out = [];
    for (var a = 5; a <= 9; a++) {
      for (var b = 3; b <= 9; b++) if (a + b >= 12 && a + b <= 18) out.push([a, b]);
    }
    return out;
  }
  /* Odčítání s přechodem: 13 − 5 (jednotek je málo, musí se sáhnout do desítky). */
  function paryOdcitani() {
    var out = [];
    for (var c = 12; c <= 19; c++) {
      for (var d = 3; d <= 9; d++) {
        var z = c - d;
        if (z >= 2 && z <= 9 && d > c - 10) out.push([c, d]);
      }
    }
    return out;
  }
  /* Bez přechodu, 10–20: jednotky si vystačí samy (13 + 4, 18 − 5). */
  function ulohyBezPrechodu() {
    var out = [];
    for (var s = 11; s <= 19; s++) {
      var j = s - 10;
      for (var k = 2; k <= 8; k++) {
        if (j + k <= 9) out.push([s, '+', k]);
        if (j - k >= 1) out.push([s, '−', k]);
      }
    }
    return out;
  }
  /* Boss míchá všechno, co se ve světě naučilo – pořadí druhů drží stejné
     (od nejlehčího), ale čísla se losují, ať souboj není naučený nazpaměť. */
  var BOSS_DRUHY = ['plusBez', 'plusPres', 'minusBez', 'minusPres', 'doplneni'];

  function bossUloha(druh) {
    var a, b, vysl, u;

    if (druh === 'plusBez') {                       // 12 + 5
      a = RC.rand(11, 16); b = RC.rand(2, 9 - (a - 10)); vysl = a + b;
      return {
        text: a + ' + ' + b, q: 'Kolik je <b>' + a + ' + ' + b + '</b>?',
        mluv: 'Kolik je ' + RC.cislo(a) + ' plus ' + RC.cislo(b) + '?', vysl: vysl, min: 10, max: 20,
        vetaVysledku: RC.cislo(a) + ' plus ' + RC.cislo(b) + ' je ' + RC.cislo(vysl) + '!',
        nap: RC.velke(RC.cislo(a)) + ' je deset a ' + RC.cislo(a - 10) +
             '. Desítka se nehýbe, přidávej k jednotkám.'
      };
    }
    if (druh === 'plusPres') {                      // 8 + 7
      u = RC.pick(paryScitani()); a = u[0]; b = u[1]; vysl = a + b;
      return {
        text: a + ' + ' + b, q: 'Kolik je <b>' + a + ' + ' + b + '</b>?',
        mluv: 'Kolik je ' + RC.cislo(a) + ' plus ' + RC.cislo(b) + '?', vysl: vysl, min: 10, max: 20,
        vetaVysledku: RC.cislo(a) + ' plus ' + RC.cislo(b) + ' je ' + RC.cislo(vysl) + '!',
        nap: 'Do desítky chybí ' + RC.cislo(10 - a) +
             '. Přidej je, jsi na deseti – a pak ještě ' + RC.cislo(vysl - 10) + '.'
      };
    }
    if (druh === 'minusBez') {                      // 18 − 5
      a = RC.rand(13, 19); b = RC.rand(2, a - 10); vysl = a - b;
      return {
        text: a + ' − ' + b, q: 'Kolik je <b>' + a + ' − ' + b + '</b>?',
        mluv: 'Kolik je ' + RC.cislo(a) + ' mínus ' + RC.cislo(b) + '?', vysl: vysl, min: 9, max: 20,
        vetaVysledku: RC.cislo(a) + ' mínus ' + RC.cislo(b) + ' je ' + RC.cislo(vysl) + '!',
        nap: RC.velke(RC.cislo(a)) + ' je deset a ' + RC.cislo(a - 10) +
             '. Uber jen z jednotek, desítka zůstává.'
      };
    }
    if (druh === 'minusPres') {                     // 15 − 8
      u = RC.pick(paryOdcitani()); a = u[0]; b = u[1]; vysl = a - b;
      return {
        text: a + ' − ' + b, q: 'Kolik je <b>' + a + ' − ' + b + '</b>?',
        mluv: 'Kolik je ' + RC.cislo(a) + ' mínus ' + RC.cislo(b) + '?', vysl: vysl, min: 2, max: 15,
        vetaVysledku: RC.cislo(a) + ' mínus ' + RC.cislo(b) + ' je ' + RC.cislo(vysl) + '!',
        nap: 'Nejdřív uber ' + RC.cislo(a - 10) + ' – jsi na desítce. Pak uber ještě ' +
             RC.cislo(b - (a - 10)) + '.'
      };
    }
    /* doplneni: 9 + ? = 16 */
    a = RC.rand(6, 9);
    vysl = RC.rand(3, 9);                            // hledané číslo
    var cil = a + vysl;
    if (cil <= 10) { vysl += 3; cil = a + vysl; }     // ať se doopravdy přechází přes desítku
    return {
      text: a + ' + ? = ' + cil, q: '<b>' + a + '</b> a kolik je <b>' + cil + '</b>?',
      mluv: RC.cislo(a) + ' a kolik je ' + RC.cislo(cil) + '?', vysl: vysl, min: 2, max: 14,
      vetaVysledku: RC.cislo(a) + ' a ' + RC.cislo(vysl) + ' je ' + RC.cislo(cil) + '!',
      nap: 'Do desítky chybí ' + RC.cislo(10 - a) + '. A z desítky nahoru ještě ' +
           RC.cislo(cil - 10) + '.'
    };
  }

  /* Losovátko drží zastávka v RC._pytle, ať se pořadí nemíchá v každém kole. */
  function pytel(jmeno, kolo, polozky) {
    RC._pytle = RC._pytle || {};
    if (kolo === 0 || !RC._pytle[jmeno]) RC._pytle[jmeno] = RC.bag(polozky);
    return RC._pytle[jmeno]();
  }

  /* ---------- 6. DRAČÍ VEJCE ---------- */

  RC.levels.push({
    id: 'vejce',
    svet: 'do20',
    nazev: 'Dračí vejce',
    ikona: '🥚',
    popis: 'Desítka a k tomu jednotky.',
    uvod: 'V hnízdech leží dračí vejce. Do jednoho hnízda se vejde přesně deset. Deset a ještě něco – tak se dělají čísla nad deset.',
    odmena: 'Čísla nad deset už čteš na první pohled. Deset a k tomu jednotky!',
    kola: 5,
    vytvor: function (api, i) {
      var n = pytel('vejce', i, RC.range(11, 20));
      var cti = i % 2 === 0;                    // sudá kola přečti, lichá naskládej
      var prvni = Math.min(n, 10);
      var druhe = n - prvni;

      var hnizda = RC.el('div', 'hnizda');
      var h1 = RC.el('div', 'hnizdo');
      var h2 = RC.el('div', 'hnizdo');
      var r1 = RC.Vis.desitkovyRamec(cti ? prvni : 0, 10);
      var r2 = RC.Vis.desitkovyRamec(cti ? druhe : 0, 10);
      h1.appendChild(r1); h1.appendChild(RC.el('div', 'hnizdo-titulek', 'první hnízdo'));
      h2.appendChild(r2); h2.appendChild(RC.el('div', 'hnizdo-titulek', 'druhé hnízdo'));
      hnizda.appendChild(h1); hnizda.appendChild(h2);
      api.telo.appendChild(hnizda);

      if (cti) {
        h1.classList.add('jenCist'); h2.classList.add('jenCist');
        r1.classList.add('plny');
        api.zadani('Kolik je vajec dohromady?');
        api.napoveda('První hnízdo je plné, to je <b>10</b>. Ve druhém ' +
                     RC.mn(druhe, 'je', 'jsou', 'je') + ' ještě ' + RC.cislo(druhe) +
                     '. Deset a ' + RC.cislo(druhe) + ' je…');
        api.telo.appendChild(api.volby(n, api.okoliVoleb(n, 4, 10, 20), {
          pauza: 800,
          pred: function () {
            api.rekni('Deset a ' + RC.cislo(druhe) + ' je ' + RC.cislo(n) + '.');
          }
        }));

      } else {
        api.zadani('Nasbírej do hnízd <b>' + n + '</b> vajec. Nejdřív naplň první hnízdo.',
                   'Nasbírej do hnízd ' + RC.cislo(n) + ' vajec. Nejdřív naplň první hnízdo.');
        api.napoveda(RC.cislo(n) + ' je deset a ještě ' + RC.cislo(druhe) +
                     '. Naplň celé první hnízdo a do druhého dej ' + RC.cislo(druhe) + '.');

        var pocet = 0;
        var citac = RC.el('div', 'pocitadlo', '0');
        api.telo.appendChild(citac);

        function nastav(k) {
          pocet = Math.max(0, Math.min(20, k));
          for (var j = 0; j < 10; j++) {
            r1.children[j].classList.toggle('plne', j < pocet);
            r2.children[j].classList.toggle('plne', j < pocet - 10);
          }
          r1.classList.toggle('plny', pocet >= 10);
          r2.classList.toggle('plny', pocet >= 20);
          citac.textContent = String(pocet);
          if (pocet === n) {
            api.rekni(RC.cislo(n) + ' vajec. To je deset a ' + RC.cislo(druhe) + '.',
                      { prerus: true });
            api.hotovo({ pauza: 800 });
          }
        }

        [r1, r2].forEach(function (ramec, ri) {
          Array.prototype.forEach.call(ramec.children, function (pole, pi) {
            pole.addEventListener('click', function () {
              if (RC.Engine.zamek) return;
              var index = ri * 10 + pi;
              api.pocitaciTon(Math.min(index + 1, 20));
              nastav(pocet === index + 1 ? index : index + 1);
            });
          });
        });

        var reset = RC.tlacitko('Vyklidit hnízda', 'duch', function () { nastav(0); });
        api.telo.appendChild(reset);
      }
    }
  });

  /* ---------- SKALNÍ POLICE (10–20 bez přechodu) ----------
   * Celý smysl zastávky: desítka se nehýbe, počítají se jen jednotky.
   * Proto je otep deseti kaštanů zamčená a klikat jde výhradně do volných —
   * a volných se schválně vejde jen devět, desátý už by byl nová otep.
   */

  RC.levels.push({
    id: 'police',
    svet: 'do20',
    nazev: 'Skalní police',
    ikona: '🪨',
    popis: 'Desítka se nehýbe, počítej jednotky.',
    uvod: 'Drak si na skalní police schovává kaštany. Deset jich má svázaných v otepi a ta se nehýbe. ' +
          'Přidávat a ubírat budeš jen ty volné.',
    odmena: 'Police jsou spočítané. Nad deseti počítáš jednotky a desítka zůstává!',
    kola: 6,
    vytvor: function (api, i) {
      var u = pytel('police', i, ulohyBezPrechodu());
      var start = u[0], znak = u[1], kolik = u[2];
      var cil = znak === '+' ? start + kolik : start - kolik;
      var volnychStart = start - 10;
      var volnychCil = cil - 10;

      api.zadani('Na polici je <b>' + start + '</b> kaštanů. ' +
                 (znak === '+' ? 'Přidej <b>' + kolik + '</b>.' : 'Uber <b>' + kolik + '</b>.') +
                 ' Kolik jich bude?',
                 'Na polici je ' + RC.cislo(start) + ' kaštanů. ' +
                 (znak === '+' ? 'Přidej ' : 'Uber ') + RC.cislo(kolik) +
                 '. Naskládej to na police.');
      api.napoveda('Otep deseti se nehýbe, počítej jen volné kaštany. Volných je ' +
                   RC.cislo(volnychStart) + (znak === '+' ? ' a přidáváš ' : ' a ubíráš ') +
                   RC.cislo(kolik) + '. Deset a k tomu tolik, kolik ti vyjde.');

      var scena = RC.el('div', 'police-scena');

      /* horní police – svázaná desítka, ta je jen na koukání */
      var horni = RC.el('div', 'police-radek');
      var otep = RC.Vis.desitkovyRamec(10, 10, { znak: '🌰', cls: 'otep plny' });
      horni.appendChild(otep);
      horni.appendChild(RC.el('div', 'police-titulek', 'svázaná otep · <b>10</b>'));
      scena.appendChild(horni);

      /* dolní police – volné kaštany, sem se klepe */
      var dolni = RC.el('div', 'police-radek');
      var volne = RC.Vis.desitkovyRamec(volnychStart, 9, { znak: '🌰', cls: 'volne' });
      dolni.appendChild(volne);
      var stitekVolne = RC.el('div', 'police-titulek', '');
      dolni.appendChild(stitekVolne);
      scena.appendChild(dolni);
      api.telo.appendChild(scena);

      var priklad = RC.el('div', 'priklad',
        '<b>' + start + '</b> ' + znak + ' <b>' + kolik + '</b> = ?');
      api.telo.appendChild(priklad);
      /* Kolik je na polici právě teď – zvlášť, ať v příkladu nikdy nesvítí
         nepravda typu „17 − 3 = 17“. */
      var citac = RC.el('div', 'pocitadlo', '');
      api.telo.appendChild(citac);

      var pocet = volnychStart;
      function nastav(k) {
        pocet = Math.max(0, Math.min(9, k));
        for (var j = 0; j < 9; j++) {
          volne.children[j].classList.toggle('plne', j < pocet);
          volne.children[j].textContent = j < pocet ? '🌰' : '';
        }
        stitekVolne.innerHTML = 'volné kaštany · <b>' + pocet + '</b>';
        citac.textContent = 'na polici: ' + (10 + pocet);
        if (pocet === volnychCil) {
          priklad.innerHTML = '<b>' + start + '</b> ' + znak + ' <b>' + kolik +
                              '</b> = <b class="miz">' + cil + '</b>';
        }

        if (pocet === volnychCil) {
          api.rekni(RC.cislo(start) + (znak === '+' ? ' plus ' : ' mínus ') + RC.cislo(kolik) +
                    ' je ' + RC.cislo(cil) + '. Otep se ani nehnula.', { prerus: true });
          api.hotovo({ pauza: 900 });
        }
      }
      nastav(volnychStart);

      Array.prototype.forEach.call(volne.children, function (pole, pi) {
        pole.addEventListener('click', function () {
          if (RC.Engine.zamek) return;
          api.pocitaciTon(10 + Math.min(pi + 1, 9));
          nastav(pocet === pi + 1 ? pi : pi + 1);
        });
      });

      /* Otep je zamčená – klepnutí do ní je typický pokus, tak ať to něco řekne. */
      Array.prototype.forEach.call(otep.children, function (pole) {
        pole.addEventListener('click', function () {
          if (RC.Engine.zamek) return;
          RC.FX.zatres(otep);
          api.rekni('Otep je svázaná, deset se nemění. Počítej ve spodní polici.',
                    { prerus: true });
        });
      });
    }
  });

  /* ---------- 7. HRADNÍ VÝTAH ---------- */

  RC.levels.push({
    id: 'vytah',
    svet: 'do20',
    nazev: 'Hradní výtah',
    ikona: '🛗',
    popis: 'Najdi správné patro.',
    uvod: 'Dračí hora má dvacet pater. Spočítej, kam výtah dojede, a klepni na to patro.',
    odmena: 'Výtah tě vyvezl vysoko. Do dvaceti se už neztratíš!',
    kola: 5,
    vytvor: function (api, i) {
      var MAX = 20;
      var nahoru = i % 2 === 0;
      var start, o, cil;
      if (nahoru) {
        start = RC.rand(3, 14);
        o = RC.rand(3, Math.min(9, MAX - start));
      } else {
        start = RC.rand(11, MAX);
        o = RC.rand(3, 9);
      }
      cil = nahoru ? start + o : start - o;

      var patraSlovo = RC.mn(o, 'patro', 'patra', 'pater');
      api.zadani('Jsi v <b>' + start + '.</b> patře. Vyjeď o <b>' + o + '</b> ' +
                 patraSlovo + ' ' + (nahoru ? 'výš' : 'níž') + '. Které patro to je?',
                 'Jsi v ' + start + '. patře. Vyjeď o ' + RC.cislo(o) + ' ' + patraSlovo + ' ' +
                 (nahoru ? 'výš' : 'níž') + '. Které patro to je?');
      /* Bez předložky – „z sedm“ by byl špatný pád a slovem se to nespraví. */
      api.napoveda(nahoru
        ? 'Přidávej po jednom: ' + RC.cislo(start + 1) + ', ' + RC.cislo(start + 2) + '…'
        : 'Ubírej po jednom: ' + RC.cislo(start - 1) + ', ' + RC.cislo(start - 2) + '…');

      var jede = false;
      var scena = RC.el('div', 'vytah-scena');
      var vez = RC.el('div', 'vez');
      var patra = [];
      for (var f = 0; f <= MAX; f++) {
        var b = RC.el('button', 'patro' + (f % 10 === 0 && f > 0 ? ' desitka' : ''),
                      '<span>' + f + '.</span><span>' + (f % 10 === 0 && f > 0 ? '★' : '') + '</span>');
        b.type = 'button';
        (function (cislo, node) {
          node.addEventListener('click', function () {
            if (RC.Engine.zamek || jede) return;   // během jízdy výtahu se neklikne
            if (cislo !== cil) { api.chyba(node); return; }
            node.classList.add('cil');
            jede = true;
            jed();
          });
        })(f, b);
        patra.push(b);
        vez.appendChild(b);
      }
      patra[start].classList.add('start');

      var kabina = RC.el('div', 'kabina', '🛗');
      kabina.style.fontSize = 'clamp(1.1rem, 3.6vh, 2rem)';
      vez.appendChild(kabina);
      function bottomProc(idx) { return ((idx + 0.5) / (MAX + 1) * 100) + '%'; }
      kabina.style.bottom = bottomProc(start);

      scena.appendChild(vez);
      var vedle = RC.el('div', 'vytah-info');
      vedle.innerHTML = '<div class="drak-maly">' + RC.Art.drak() + '</div>';
      scena.appendChild(vedle);
      api.telo.appendChild(scena);

      function jed() {
        var k = 0;
        (function dalsi() {
          k++;
          if (k > o) {
            api.rekni(RC.cislo(start) + ' ' + (nahoru ? 'plus' : 'mínus') + ' ' + RC.cislo(o) +
                      ' je ' + RC.cislo(cil) + '.', { prerus: true });
            api.hotovo({ pauza: 800 });
            return;
          }
          var idx = nahoru ? start + k : start - k;
          kabina.style.bottom = bottomProc(idx);
          api.pocitaciTon(k);
          setTimeout(dalsi, 190);
        })();
      }
    }
  });

  /* ---------- 8. LEKTVARY (sčítání přes desítku) ---------- */

  RC.levels.push({
    id: 'lektvary',
    svet: 'do20',
    nazev: 'Lektvary',
    ikona: '⚗️',
    popis: 'Přelij desítku a spočítej.',
    uvod: 'Do každé láhve se vejde deset kapek. Až první přeteče, přilévá se do druhé. Sleduj, co se stane.',
    odmena: 'Lektvar odvahy je hotový. Přes desítku už přeteče, ale ty počítáš dál!',
    kola: 5,
    vytvor: function (api, i) {
      var u = pytel('lektvary', i, paryScitani());
      var a = u[0], b = u[1];
      var soucet = a + b;

      api.zadani('<b>' + a + ' + ' + b + ' = ?</b> Přilévej kapky a dívej se.',
                 RC.velke(RC.cislo(a)) + ' plus ' + RC.cislo(b) +
                 '. Přilévej kapky a dívej se, co se stane.');
      api.napoveda('Do desítky chybí ' + RC.cislo(10 - a) + '. Přilij je a máš deset. ' +
                   'A pak ještě ' + RC.cislo(b - (10 - a)) + '.');

      var priklad = RC.el('div', 'priklad', '<b>' + a + '</b> + <b>' + b + '</b> = ?');
      api.telo.appendChild(priklad);

      var box = RC.el('div', 'lektvary');
      var lahve = [];
      [0, 1].forEach(function (li) {
        var l = RC.el('div', 'lahev' + (li ? ' druha' : ''));
        l.appendChild(RC.el('div', 'lahev-hrdlo'));
        var sklo = RC.el('div', 'lahev-sklo');
        for (var k = 0; k < 10; k++) sklo.appendChild(RC.el('i'));
        l.appendChild(sklo);
        l.appendChild(RC.el('div', 'lahev-stitek', li ? 'druhá láhev' : 'první láhev'));
        box.appendChild(l);
        lahve.push({ obal: l, sklo: sklo, stitek: l.lastChild });
      });
      api.telo.appendChild(box);

      var nalito = 0;
      function prekresli() {
        for (var k = 0; k < 10; k++) {
          lahve[0].sklo.children[k].classList.toggle('nalito', k < Math.min(nalito, 10));
          lahve[1].sklo.children[k].classList.toggle('nalito', k < Math.max(0, nalito - 10));
        }
        lahve[0].obal.classList.toggle('plna', nalito >= 10);
        lahve[0].stitek.innerHTML = 'první: <b>' + Math.min(nalito, 10) + '</b>';
        lahve[1].stitek.innerHTML = 'druhá: <b>' + Math.max(0, nalito - 10) + '</b>';
      }
      /* první sčítanec je v láhvi hned na začátku */
      nalito = a;
      prekresli();

      var zbyva = b;
      var kapatko = RC.tlacitko('💧 Přilij kapku (' + zbyva + ')', 'zelene velke', function (e, btn) {
        if (zbyva <= 0) return;
        nalito++; zbyva--;
        api.pocitaciTon(nalito);
        prekresli();
        if (nalito === 10) {
          api.sfx('odemk');
          api.rekni('Deset! První láhev je plná, přelévá se.', { prerus: true });
        }
        if (zbyva > 0) {
          btn.innerHTML = '💧 Přilij kapku (' + zbyva + ')';
        } else {
          btn.textContent = 'Nalito ✔';
          btn.disabled = true;
          api.telo.appendChild(otazka);
          api.zadani('Kolik kapek je v láhvích dohromady?');
        }
      });
      api.telo.appendChild(kapatko);

      var otazka = api.volby(soucet, api.okoliVoleb(soucet, 4, 10, 20), {
        pauza: 900,
        pred: function () {
          lahve[1].obal.classList.add('plna');
          api.rekni('Deset a ' + RC.cislo(soucet - 10) + ' je ' + RC.cislo(soucet) + '.');
        }
      });
    }
  });

  /* ---------- 9. DRAČÍ POKLAD (odčítání přes desítku) ---------- */

  RC.levels.push({
    id: 'poklad',
    svet: 'do20',
    nazev: 'Dračí poklad',
    ikona: '💰',
    popis: 'Uber mince přes desítku.',
    uvod: 'Drak platí mýtné. Vyndej z truhly tolik mincí, kolik si drak řekne, a spočítej, co zbylo.',
    odmena: 'Mýtné zaplaceno. Umíš ubírat i přes desítku!',
    kola: 5,
    vytvor: function (api, i) {
      var u = pytel('poklad', i, paryOdcitani());
      var celkem = u[0], uber = u[1];
      var zbytek = celkem - uber;

      api.zadani('V truhle je <b>' + celkem + '</b> mincí. Drak chce <b>' + uber +
                 '</b>. Vyndej mu je klepnutím.',
                 'V truhle je ' + RC.cislo(celkem) + ' mincí. Drak chce ' + RC.cislo(uber) +
                 '. Vyndej mu je klepnutím.');
      api.napoveda('Nejdřív uber ty volné mince – zůstane deset. ' +
                   'Pak uber z desítky ještě ' + RC.cislo(uber - (celkem - 10), 'z4') + '.');

      var scena = RC.el('div', 'poklad');
      var t1 = RC.el('div', 'truhla');
      var t2 = RC.el('div', 'truhla');
      var r1 = RC.Vis.desitkovyRamec(10, 10);
      var r2 = RC.Vis.desitkovyRamec(celkem - 10, 10);
      t1.appendChild(r1); t1.appendChild(RC.el('div', 'truhla-titulek', 'plná desítka'));
      t2.appendChild(r2); t2.appendChild(RC.el('div', 'truhla-titulek', 'volné mince'));
      r1.classList.add('plny');
      scena.appendChild(t1); scena.appendChild(t2);
      var d = RC.el('div', 'drak-maly');
      d.innerHTML = RC.Art.drak();
      scena.appendChild(d);
      api.telo.appendChild(scena);

      var citac = RC.el('div', 'pocitadlo', 'zbývá vyndat: ' + uber);
      api.telo.appendChild(citac);

      var vyndano = 0;
      var otazkaVlozena = false;

      function klik(pole) {
        if (RC.Engine.zamek) return;
        if (!pole.classList.contains('plne')) return;
        if (vyndano >= uber) { api.chyba(citac, RC.t('Už jsi vyndal{a} všechny. Teď spočítej, co zbylo.')); return; }
        vyndano++;
        pole.classList.add('utrata');
        api.pocitaciTon(12 - vyndano);
        setTimeout(function () { pole.classList.remove('plne', 'utrata'); }, 420);
        r1.classList.remove('plny');
        citac.textContent = vyndano < uber ? 'zbývá vyndat: ' + (uber - vyndano) : 'vyndáno ✔';
        if (vyndano === uber && !otazkaVlozena) {
          otazkaVlozena = true;
          api.zadani('Kolik mincí zbylo?', 'A kolik mincí zbylo v truhlách?');
          api.telo.appendChild(api.volby(zbytek, api.okoliVoleb(zbytek, 4, 0, 15), {
            pauza: 900,
            pred: function () {
              api.rekni(RC.cislo(celkem) + ' bez ' + RC.cislo(uber) + ' je ' +
                        RC.cislo(zbytek) + '.');
            }
          }));
        }
      }

      [r1, r2].forEach(function (ramec) {
        Array.prototype.forEach.call(ramec.children, function (pole) {
          pole.addEventListener('click', function () { klik(pole); });
        });
      });
    }
  });

  /* ---------- DESÍTKOVÝ SCHOD (přechod přes desítku na dva kroky) ----------
   * Lektvary a Poklad přechod ukazují (dítě přilévá a ubírá a vidí to).
   * Tady ho dítě musí samo rozdělit: 8 = 3 a 5, protože do desítky chybí 3.
   * Proto kolo běží na dva kroky – nejdřív rozdělení, teprve pak výsledek.
   */

  RC.levels.push({
    id: 'schod',
    svet: 'do20',
    nazev: 'Desítkový schod',
    ikona: '🪜',
    popis: 'Přes desítku na dva kroky.',
    uvod: 'Přes desítku se chodí po schodu. Nejdřív dojdi přesně na deset, a co zbyde, přidáš potom. ' +
          'Zpátky to funguje stejně.',
    odmena: 'Přes desítku umíš na dva kroky. Tenhle trik ti zůstane nadosmrti!',
    kola: 6,
    vytvor: function (api, i) {
      var scitani = i % 2 === 0;
      var a, b, prvni, druhy, vysl;

      if (scitani) {
        var us = pytel('schodPlus', i, paryScitani());
        a = us[0]; b = us[1];
        prvni = 10 - a;            // kolik chybí do desítky
        druhy = b - prvni;         // co zbude na druhý krok
        vysl = a + b;
      } else {
        var uo = pytel('schodMinus', i, paryOdcitani());
        a = uo[0]; b = uo[1];
        prvni = a - 10;            // jednotky, kterými se vrátíme na desítku
        druhy = b - prvni;
        vysl = a - b;
      }

      var scena = RC.el('div', 'schod-scena');

      var ramce = RC.el('div', 'ramce-radek');
      var rA = RC.Vis.desitkovyRamec(scitani ? a : 10, 10);
      var rB = RC.Vis.desitkovyRamec(scitani ? 0 : prvni, 10);
      var boxA = RC.el('div', 'schod-ramec');
      var boxB = RC.el('div', 'schod-ramec');
      boxA.appendChild(rA); boxA.appendChild(RC.el('div', 'police-titulek', 'desítka'));
      boxB.appendChild(rB); boxB.appendChild(RC.el('div', 'police-titulek', 'jednotky'));
      ramce.appendChild(boxA); ramce.appendChild(boxB);
      scena.appendChild(ramce);

      var priklad = RC.el('div', 'priklad',
        '<b>' + a + '</b> ' + (scitani ? '+' : '−') + ' <b>' + b + '</b> = ?');
      scena.appendChild(priklad);

      /* Pás ukazuje druhé číslo jako kostičky – ty se pak rozdělí na dvě části. */
      var pas = RC.el('div', 'schod-pas');
      for (var k = 0; k < b; k++) pas.appendChild(RC.el('i'));
      scena.appendChild(pas);
      scena.appendChild(RC.el('div', 'police-titulek',
        scitani ? 'tolik přidáváš' : 'tolik ubíráš'));
      api.telo.appendChild(scena);

      /* ---- krok 1: rozdělit druhé číslo ---- */
      api.zadani(scitani
        ? 'Nejdřív dojdi na desítku. Kolik z <b>' + b + '</b> tam dáš?'
        : 'Nejdřív se vrať na desítku. Kolik z <b>' + b + '</b> ubereš?',
        scitani
        ? 'Nejdřív dojdi na desítku. Kolik do ní dáš?'
        : 'Nejdřív se vrať na desítku. Kolik ubereš?');
      api.napoveda(scitani
        ? 'V desítce je ' + RC.cislo(a) + '. Kolik políček je ještě prázdných?'
        : 'Volných jednotek je ' + RC.cislo(prvni) + '. Uber přesně ty, ať jsi na desítce.');

      var krok1 = api.volbyKrok(prvni, api.okoliVoleb(prvni, 3, 1, 9), function () {
        api.rekni(scitani
          ? 'Do desítky chybí ' + RC.cislo(prvni) + '. A pak ještě ' + RC.cislo(druhy) + '.'
          : 'Ubereš ' + RC.cislo(prvni) + ' a jsi na desítce. Zbývá ubrat ' +
            RC.cislo(druhy) + '.');
        rozdelPas();
        setTimeout(function () { krok1.remove(); krok2(); }, 420);
      }, { cls: 'male' });
      api.telo.appendChild(krok1);

      function rozdelPas() {
        Array.prototype.forEach.call(pas.children, function (kus, idx) {
          kus.classList.add(idx < prvni ? 'doDesitky' : 'zbytek');
        });
        if (scitani) {
          for (var j = 0; j < 10; j++) rA.children[j].classList.add('plne');
          rA.classList.add('plny');
        } else {
          for (var m = 0; m < 10; m++) rB.children[m].classList.remove('plne');
        }
        priklad.innerHTML = '<b>' + a + '</b> ' + (scitani ? '+' : '−') +
          ' (<b>' + prvni + '</b> ' + (scitani ? '+' : '+') + ' <b>' + druhy + '</b>) = ?';
      }

      /* ---- krok 2: dopočítat výsledek ---- */
      function krok2() {
        api.zadani(scitani
          ? 'Deset a ještě <b>' + druhy + '</b>. Kolik to je?'
          : 'Na desítce jsi. Zbývá ubrat <b>' + druhy + '</b>. Kolik zůstane?',
          scitani
          ? 'Deset a ještě ' + RC.cislo(druhy) + '. Kolik to je?'
          : 'Na desítce jsi. Zbývá ubrat ' + RC.cislo(druhy) + '. Kolik zůstane?');
        api.napoveda(scitani
          ? 'Deset a ' + RC.cislo(druhy) + ' – to je jedna desítka a ' + RC.cislo(druhy) + '.'
          : 'Z deseti uber ' + RC.cislo(druhy) + '.');

        var min = scitani ? 10 : 2, max = scitani ? 20 : 10;
        api.telo.appendChild(api.volby(vysl, api.okoliVoleb(vysl, 4, min, max), {
          pauza: 1100,
          pred: function () {
            if (scitani) {
              for (var j = 0; j < druhy; j++) rB.children[j].classList.add('plne');
            } else {
              for (var m = 9; m >= 10 - druhy; m--) rA.children[m].classList.remove('plne');
              rA.classList.remove('plny');
            }
            priklad.innerHTML = '<b>' + a + '</b> ' + (scitani ? '+' : '−') + ' <b>' + b +
              '</b> = <b class="miz">' + vysl + '</b>';
            api.rekni(RC.cislo(a) + (scitani ? ' plus ' : ' mínus ') + RC.cislo(b) + ' je ' +
                      RC.cislo(vysl) + '. Přes desítku na dva kroky.');
          }
        }));
      }
    }
  });

  /* ---------- 10. SOUBOJ S DRAKEM ---------- */

  RC.levels.push({
    id: 'souboj',
    svet: 'do20',
    nazev: 'Souboj s drakem',
    ikona: '🐉',
    popis: 'Poraz draka v počítání.',
    uvod: 'Tak a je to tady. Drak má pět ohnivých štítů. Každý správný výpočet jeden rozbije. Do toho!',
    odmena: 'Drak Šupinář je poražen! Ale počkej – ještě něco chce říct…',
    kola: 5,
    boss: true,
    vytvor: function (api, i) {
      var u = bossUloha(BOSS_DRUHY[i % BOSS_DRUHY.length]);

      api.zadani(u.q + ' Rozbij drakovi štít!', u.mluv + ' Rozbij drakovi štít!');
      api.napoveda(u.nap);

      var boj = RC.el('div', 'boj');

      var r = RC.el('div', 'boj-rytir');
      r.innerHTML = RC.Art.rytir();
      boj.appendChild(r);

      var stred = RC.el('div', 'boj-stred');
      var priklad = RC.el('div', 'priklad', u.text + ' = ?');
      stred.appendChild(priklad);
      var volby = api.volby(u.vysl, api.okoliVoleb(u.vysl, 4, u.min, u.max), {
        pauza: 1500, bezNapisu: true,
        pred: function () {
          api.sfx('mec');
          rytirSvg.classList.add('utoci');
          /* Výsledek se řekne hned – pochvala se zařadí až za něj a hra počká,
             než se dopoví. Rozbití štítu je jen doprovodná animace. */
          api.rekni(u.vetaVysledku + ' Štít je rozbitý.');
          setTimeout(function () {
            drakSvg.classList.add('zasah');
            var zbyle = stity.querySelectorAll('i:not(.pryc)');
            if (zbyle.length) zbyle[zbyle.length - 1].classList.add('pryc');
            RC.FX.jiskry(drakSvg, 14);
          }, 280);
        }
      });
      stred.appendChild(volby);
      boj.appendChild(stred);

      var dBox = RC.el('div', 'boj-drak');
      var stity = RC.el('div', 'draci-stity');
      var kolaBoje = RC.Engine.uroven.kola;
      for (var s = 0; s < kolaBoje - i; s++) stity.appendChild(RC.el('i', null, '🔥'));
      dBox.appendChild(stity);
      dBox.insertAdjacentHTML('beforeend', RC.Art.drak());
      boj.appendChild(dBox);

      api.telo.appendChild(boj);

      var rytirSvg = r.querySelector('svg');
      var drakSvg = dBox.querySelector('svg.drak');

      /* Při chybě drak chrlí oheň a rytíř se schová za štít – nic se ale neodečítá. */
      var puvodniChyba = api.chyba;
      volby.addEventListener('click', function (e) {
        var b = e.target.closest('.volba');
        if (!b || RC.Engine.zamek) return;
        if (b.textContent !== String(u.vysl)) {
          drakSvg.classList.remove('chrli');
          rytirSvg.classList.remove('kryje');
          void drakSvg.offsetWidth;
          drakSvg.classList.add('chrli');
          rytirSvg.classList.add('kryje');
          api.sfx('ohen');
        }
      }, true);
      void puvodniChyba;
    }
  });

})();
