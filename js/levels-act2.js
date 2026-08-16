/* Rytíř Čísel – AKT II: Dračí hora
 *  6. Dračí vejce   – desítka a jednotky, čísla 11–20
 *  7. Hradní výtah  – sčítání a odčítání na ose do 20
 *  8. Lektvary      – sčítání s přechodem přes desítku
 *  9. Dračí poklad  – odčítání s přechodem přes desítku
 * 10. Souboj s drakem – všechno dohromady do 20
 */
(function () {
  'use strict';
  var RC = window.RC;

  /* ---------- 6. DRAČÍ VEJCE ---------- */

  RC.levels.push({
    id: 'vejce',
    akt: 2,
    nazev: 'Dračí vejce',
    ikona: '🥚',
    popis: 'Desítka a k tomu jednotky.',
    uvod: 'V hnízdech leží dračí vejce. Do jednoho hnízda se vejde přesně deset. Deset a ještě něco – tak se dělají čísla nad deset.',
    odmena: 'Čísla nad deset už čteš na první pohled. Deset a k tomu jednotky!',
    kola: 5,
    vytvor: function (api, i) {
      var cisla = [12, 15, 17, 11, 20];
      var n = cisla[i];
      var cti = i % 2 === 0;                    // 0,2,4 = přečti; 1,3 = naskládej
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
        api.napoveda('První hnízdo je plné, to je <b>10</b>. Ve druhém jsou ještě ' + druhe +
                     '. Deset a ' + druhe + ' je…');
        api.telo.appendChild(api.volby(n, api.okoliVoleb(n, 4, 10, 20), {
          pauza: 800,
          pred: function () { api.rekni('Deset a ' + druhe + ' je ' + n + '.'); }
        }));

      } else {
        api.zadani('Nasbírej do hnízd <b>' + n + '</b> vajec. Nejdřív naplň první hnízdo.',
                   'Nasbírej do hnízd ' + n + ' vajec. Nejdřív naplň první hnízdo.');
        api.napoveda(n + ' je deset a ještě ' + druhe + '. Naplň celé první hnízdo a do druhého dej ' + druhe + '.');

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
            api.rekni(n + ' vajec. To je deset a ' + druhe + '.', { prerus: true });
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

  /* ---------- 7. HRADNÍ VÝTAH ---------- */

  RC.levels.push({
    id: 'vytah',
    akt: 2,
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

      api.zadani('Jsi v <b>' + start + '.</b> patře. Vyjeď o <b>' + o + '</b> ' +
                 (nahoru ? 'pater výš' : 'pater níž') + '. Které patro to je?',
                 'Jsi v ' + start + '. patře. Vyjeď o ' + o + ' pater ' + (nahoru ? 'výš' : 'níž') +
                 '. Které patro to je?');
      api.napoveda(nahoru
        ? 'Z ' + start + ' přidávej po jednom: ' + (start + 1) + ', ' + (start + 2) + '…'
        : 'Z ' + start + ' ubírej po jednom: ' + (start - 1) + ', ' + (start - 2) + '…');

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
            api.rekni(start + ' ' + (nahoru ? 'plus' : 'minus') + ' ' + o + ' je ' + cil + '.',
                      { prerus: true });
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
    akt: 2,
    nazev: 'Lektvary',
    ikona: '⚗️',
    popis: 'Přelij desítku a spočítej.',
    uvod: 'Do každé láhve se vejde deset kapek. Až první přeteče, přilévá se do druhé. Sleduj, co se stane.',
    odmena: 'Lektvar odvahy je hotový. Přes desítku už přeteče, ale ty počítáš dál!',
    kola: 5,
    vytvor: function (api, i) {
      var ulohy = [[8, 5], [7, 6], [9, 4], [6, 8], [8, 7]];
      var a = ulohy[i][0], b = ulohy[i][1];
      var soucet = a + b;

      api.zadani('<b>' + a + ' + ' + b + ' = ?</b> Přilévej kapky a dívej se.',
                 a + ' plus ' + b + '. Přilévej kapky a dívej se, co se stane.');
      api.napoveda('Do desítky chybí ' + (10 - a) + '. Přilij ' + (10 - a) + ' – máš 10. ' +
                   'A zbylo ti ještě ' + (b - (10 - a)) + '. Tak je to ' + soucet + '.');

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
          api.rekni('Deset a ' + (soucet - 10) + ' je ' + soucet + '.');
        }
      });
    }
  });

  /* ---------- 9. DRAČÍ POKLAD (odčítání přes desítku) ---------- */

  RC.levels.push({
    id: 'poklad',
    akt: 2,
    nazev: 'Dračí poklad',
    ikona: '💰',
    popis: 'Uber mince přes desítku.',
    uvod: 'Drak platí mýtné. Vyndej z truhly tolik mincí, kolik si drak řekne, a spočítej, co zbylo.',
    odmena: 'Mýtné zaplaceno. Umíš ubírat i přes desítku!',
    kola: 5,
    vytvor: function (api, i) {
      var ulohy = [[13, 5], [15, 7], [12, 4], [17, 9], [14, 6]];
      var celkem = ulohy[i][0], uber = ulohy[i][1];
      var zbytek = celkem - uber;

      api.zadani('V truhle je <b>' + celkem + '</b> mincí. Drak chce <b>' + uber +
                 '</b>. Vyndej mu je klepnutím.',
                 'V truhle je ' + celkem + ' mincí. Drak chce ' + uber + '. Vyndej mu je klepnutím.');
      api.napoveda('Nejdřív uber ' + (celkem - 10) + ' volných mincí – zůstane 10. ' +
                   'Pak uber ještě ' + (uber - (celkem - 10)) + ' z desítky. Zbyde ' + zbytek + '.');

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
            pred: function () { api.rekni(celkem + ' bez ' + uber + ' je ' + zbytek + '.'); }
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

  /* ---------- 10. SOUBOJ S DRAKEM ---------- */

  RC.levels.push({
    id: 'souboj',
    akt: 2,
    nazev: 'Souboj s drakem',
    ikona: '🐉',
    popis: 'Poraz draka v počítání.',
    uvod: 'Tak a je to tady. Drak má pět ohnivých štítů. Každý správný výpočet jeden rozbije. Do toho!',
    odmena: 'Drak Šupinář je poražen! Ale počkej – ještě něco chce říct…',
    kola: 5,
    boss: true,
    vytvor: function (api, i) {
      var u = [
        { text: '12 + 5', q: 'Kolik je <b>12 + 5</b>?', mluv: 'Kolik je dvanáct plus pět?',
          vysl: 17, min: 10, max: 20,
          nap: '12 je 10 a 2. K dvěma přidej 5, to je 7. A ještě ta desítka.' },
        { text: '8 + 7', q: 'Kolik je <b>8 + 7</b>?', mluv: 'Kolik je osm plus sedm?',
          vysl: 15, min: 10, max: 20,
          nap: 'Do desítky chybí 2. Přidej 2, máš 10, a ještě zbývá 5.' },
        { text: '18 − 5', q: 'Kolik je <b>18 − 5</b>?', mluv: 'Kolik je osmnáct mínus pět?',
          vysl: 13, min: 5, max: 20,
          nap: '18 je 10 a 8. Z osmi uber 5, zbydou 3. A desítka zůstává.' },
        { text: '15 − 8', q: 'Kolik je <b>15 − 8</b>?', mluv: 'Kolik je patnáct mínus osm?',
          vysl: 7, min: 2, max: 15,
          nap: 'Nejdřív uber 5 – zůstane 10. Pak uber ještě 3 z desítky.' },
        { text: '9 + ? = 16', q: 'Devět a kolik je <b>16</b>?', mluv: 'Devět a kolik je šestnáct?',
          vysl: 7, min: 2, max: 14,
          nap: 'Z 9 do 10 chybí 1. A z 10 do 16 ještě 6. Jedna a šest je sedm.' }
      ][i];

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
          api.rekni(i === 4 ? 'Devět a sedm je šestnáct! Štít je rozbitý.'
                            : u.text.replace('−', 'mínus').replace('+', 'plus') +
                              ' je ' + u.vysl + '! Štít je rozbitý.');
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
      for (var s = 0; s < 5 - i; s++) stity.appendChild(RC.el('i', null, '🔥'));
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
