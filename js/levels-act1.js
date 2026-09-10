/* Rytíř Čísel – AKT I: Cesta do deseti
 * 1. Kovárna       – sčítání a odčítání do 10 na věcech (kovářské zakázky)
 * 2. Most přes rokli – rozklad čísel do 10
 * 3. Číselná stezka  – sčítání a odčítání do 10 na číselné ose
 * 4. Kouzelný štít   – dvojice do deseti
 * 5. Strážná brána   – porovnávání <, =, >
 */
(function () {
  'use strict';
  var RC = window.RC;

  /* ---------- 1. KOVÁRNA ----------
   * Kovářské zakázky: krátký vtipný příběh se před dítětem odehraje na kovadlině
   * (věci přiletí, koza je sežere) a zároveň se vedle skládá příklad – 3 + 4 = ?
   * Poslední dvě kola jsou o třech členech, ať to má kam růst.
   * Jiné zastávky počítají jinak: 3 na číselné ose, 4 dvojice do deseti.
   */

  var ZAKAZKY = [
    { znak: '🗝️', cisla: [3, 4], znamenka: ['+'],
      pribeh: 'Kovář ukoval tři klíče a učedník mu přinesl další čtyři.',
      otazka: 'Kolik mají klíčů dohromady?',
      napoveda: 'Máš 3 a přidáváš 4. Počítej od tří dál: čtyři, pět, šest…' },

    { znak: '🔔', cisla: [9, 4], znamenka: ['−'], host: '🙋',
      pribeh: 'Na stojanu viselo devět zvonů. Čtyři si odnesl zvoník.',
      otazka: 'Kolik zvonů zůstalo na stojanu?',
      napoveda: 'Ubírej po jednom od devíti: osm, sedm… a takhle čtyřikrát.' },

    { znak: '🛡️', cisla: [5, 3], znamenka: ['+'],
      pribeh: 'Kovář vyleštil pět štítů a po svačině ještě tři.',
      otazka: 'Kolik štítů vyleštil?',
      napoveda: 'Od pěti přidávej po jednom: šest, sedm…' },

    { znak: '🍎', cisla: [10, 3], znamenka: ['−'], host: '🐐',
      pribeh: 'Kovář si nachystal deset jablek. Tři mu slupla koza Bekana.',
      otazka: 'Kolik jablek kovářovi zbylo?',
      napoveda: 'Od desíti uber po jednom: devět, osm…' },

    { znak: '⚔️', cisla: [4, 3, 2], znamenka: ['+', '+'],
      pribeh: 'Do bedny dal kovář čtyři meče, pak tři a nakonec ještě dva.',
      otazka: 'Kolik mečů je v bedně?',
      napoveda: 'Sečti nejdřív 4 a 3. K tomu, co ti vyjde, přidej ještě 2.' },

    { znak: '🔩', cisla: [8, 2, 3], znamenka: ['−', '−'], host: '🔥',
      pribeh: 'Kovář měl osm nýtů. Dva mu spadly do ohně a tři zatloukl do štítu.',
      otazka: 'Kolik nýtů mu zbylo?',
      napoveda: 'Nejdřív uber z osmi dva. A z toho, co zbude, uber ještě tři.' }
  ];

  RC.levels.push({
    id: 'kovarna',
    akt: 1,
    nazev: 'Kovárna',
    ikona: '⚒️',
    popis: 'Spočítej kovářovy zakázky.',
    uvod: 'Vítej v kovárně. Kovář kuje, učedník nosí a koza Bekana všechno sní. ' +
          'Dívej se, co se na kovadlině stane, a spočítej to za ně.',
    odmena: 'Kovář ti dal meč a štít. Umíš přidávat i ubírat!',
    kola: 6,
    vytvor: function (api, i) {
      /* Pořadí zakázek se pro každé hraní zamíchá, ať druhý průchod není
         znak po znaku stejný. Volí se při prvním kole a drží celou zastávku. */
      if (i === 0 || !RC._zakazky) RC._zakazky = RC.shuffle(ZAKAZKY);
      var z = RC._zakazky[i % RC._zakazky.length];

      /* Výsledek se dopočítá z příkladu, ať se dá zakázka přidat jedním řádkem. */
      var vysledek = z.cisla[0];
      z.znamenka.forEach(function (zn, k) {
        vysledek = zn === '+' ? vysledek + z.cisla[k + 1] : vysledek - z.cisla[k + 1];
      });

      api.zadani(z.pribeh + ' <b>' + z.otazka + '</b>', z.pribeh + ' ' + z.otazka);
      api.napoveda(z.napoveda);

      /* ---- kovárna ---- */
      var dilna = RC.el('div', 'kovarna-dilna');
      dilna.appendChild(RC.el('div', 'kovar', '🧑‍🏭'));

      var pult = RC.el('div', 'kovarna-pult');
      var veci = RC.Vis.hromada(0, z.znak, { cls: 'staticka' });
      var host = RC.el('div', 'kovarna-host', z.host || '');
      pult.appendChild(veci);
      pult.appendChild(host);
      dilna.appendChild(pult);
      api.telo.appendChild(dilna);

      var priklad = RC.el('div', 'priklad', '<b>?</b>');
      api.telo.appendChild(priklad);

      var znovu = RC.tlacitko('▶ Ukázat znovu', 'duch', function () {
        if (!bezi && !RC.Engine.zamek) prehraj();
      });
      api.telo.appendChild(znovu);

      /* Příklad se skládá spolu s příběhem: 3 → 3 + 4 → 3 + 4 = ? */
      function zapis(clenu, sVysledkem) {
        var s = '<b>' + z.cisla[0] + '</b>';
        for (var k = 0; k < clenu - 1; k++) {
          s += ' ' + z.znamenka[k] + ' <b>' + z.cisla[k + 1] + '</b>';
        }
        return s + (sVysledkem ? ' = ' + sVysledkem : '');
      }
      function mluvenyPriklad() {
        var s = String(z.cisla[0]);
        z.znamenka.forEach(function (zn, k) {
          s += (zn === '+' ? ' plus ' : ' mínus ') + z.cisla[k + 1];
        });
        return s;
      }

      /* Každá skupina má svou barvu podložky, ať je „3 a 4“ vidět na první pohled. */
      function pridej(n, hotovo, skupina) {
        var k = 0;
        (function dalsi() {
          if (k >= n) { setTimeout(hotovo, 280); return; }
          var v = RC.el('span', 'vec sk' + ((skupina || 0) % 3), z.znak);
          veci.appendChild(v);
          api.pocitaciTon(veci.children.length);
          k++;
          setTimeout(dalsi, 240);
        })();
      }

      function uber(n, hotovo) {
        if (z.host) host.classList.add('vidi');
        var k = 0;
        (function dalsi() {
          if (k >= n) {
            setTimeout(function () { host.classList.remove('vidi'); hotovo(); }, 300);
            return;
          }
          var zbyle = veci.querySelectorAll('.vec:not(.pryc)');
          var posledni = zbyle[zbyle.length - 1];
          if (posledni) {
            posledni.classList.add('pryc');
            api.sfx('pop');
            (function (uzel) { setTimeout(function () { uzel.remove(); }, 440); })(posledni);
          }
          k++;
          setTimeout(dalsi, 300);
        })();
      }

      var bezi = false;
      var volby = null;

      function prehraj() {
        bezi = true;
        znovu.disabled = true;
        veci.innerHTML = '';
        host.classList.remove('vidi');
        priklad.innerHTML = '<b>?</b>';

        var krok = 0;
        pridej(z.cisla[0], function () {
          priklad.innerHTML = zapis(1);
          pokracuj();
        }, 0);

        function pokracuj() {
          if (krok >= z.znamenka.length) return dokonci();
          var zn = z.znamenka[krok];
          var kolik = z.cisla[krok + 1];
          krok++;
          priklad.innerHTML = zapis(krok + 1);
          if (zn === '+') pridej(kolik, pokracuj, krok);
          else uber(kolik, pokracuj);
        }

        function dokonci() {
          bezi = false;
          znovu.disabled = false;
          priklad.innerHTML = zapis(z.cisla.length, '<b>?</b>');
          if (volby) return;              // při opakovaném přehrání už tlačítka jsou
          volby = api.volby(vysledek, api.okoliVoleb(vysledek, 4, 0, 10), {
            pauza: 1000,
            pred: function () {
              priklad.innerHTML = zapis(z.cisla.length, '<b class="miz">' + vysledek + '</b>');
              api.rekni(mluvenyPriklad() + ' je ' + vysledek + '.');
            }
          });
          api.telo.appendChild(volby);
        }
      }

      prehraj();
    }
  });

  /* ---------- 2. MOST PŘES ROKLI ---------- */

  RC.levels.push({
    id: 'most',
    akt: 1,
    nazev: 'Most přes rokli',
    ikona: '🌉',
    popis: 'Slož most ze dvou prken.',
    uvod: 'Před tebou je rokle. Slož most vždycky ze dvou prken tak, aby přesně vyplnila mezeru.',
    odmena: 'Rokle je za tebou. Umíš rozdělit číslo na dvě části!',
    kola: 5,
    vytvor: function (api, i) {
      var sirky = [5, 7, 6, 9, 10];
      var N = sirky[i];
      var a = RC.rand(1, N - 1);
      var b = N - a;

      /* Prkna: správná dvojice + dvě, které se nehodí. Nikdy ne prkno dlouhé
         přesně jako mezera – tím by se dala mezera zaplnit jedním prknem,
         most by se ale nedostavěl (potřebuje dvě) a dítě by nedostalo
         žádnou zpětnou vazbu. */
      var nabidka = [a, b];
      var zkousky = RC.shuffle(RC.range(1, N - 1));
      for (var z = 0; z < zkousky.length && nabidka.length < 4; z++) {
        var v = zkousky[z];
        if (nabidka.indexOf(v) < 0) nabidka.push(v);
      }
      nabidka = RC.shuffle(nabidka);

      api.zadani('Mezera je široká <b>' + N + '</b>. Vyber dvě prkna, která ji přesně vyplní.',
                 'Mezera je široká ' + N + '. Vyber dvě prkna, která ji přesně vyplní.');
      api.napoveda('Když položíš prkno za ' + a + ', kolik ještě chybí do ' + N + '? Právě tolik musí mít druhé prkno.');

      var scena = RC.el('div', 'most-scena');

      var rokle = RC.el('div', 'rokle');
      rokle.appendChild(RC.el('div', 'utes levy'));
      var mezera = RC.el('div', 'mezera');
      var pas = RC.el('div', 'slot-pas');
      for (var s = 0; s < N; s++) pas.appendChild(RC.el('i', 'slot'));
      mezera.appendChild(RC.el('div', 'propadne'));
      mezera.appendChild(pas);
      var rytirNaMoste = RC.el('div', 'mezera-rytir');
      rytirNaMoste.innerHTML = RC.Art.rytir();
      mezera.appendChild(rytirNaMoste);
      rokle.appendChild(mezera);
      rokle.appendChild(RC.el('div', 'utes'));
      scena.appendChild(rokle);

      var lista = RC.el('div', 'most-lista');
      var rovnice = RC.el('div', 'priklad', '? + ? = <b>' + N + '</b>');
      lista.appendChild(rovnice);
      scena.appendChild(lista);

      var prkna = RC.el('div', 'prkna');
      scena.appendChild(prkna);
      api.telo.appendChild(scena);

      var polozeno = [];
      function soucet() { return polozeno.reduce(function (x, y) { return x + y; }, 0); }

      function prekresli() {
        var sum = soucet();
        for (var k = 0; k < pas.children.length; k++) {
          pas.children[k].classList.toggle('zaplneno', k < sum);
        }
        rovnice.innerHTML = (polozeno.length ? polozeno.join(' + ') : '?') +
          (polozeno.length < 2 ? ' + ?' : '') + ' = <b>' + N + '</b>';
        rytirNaMoste.style.left = (sum / N * 100) + '%';
      }

      nabidka.forEach(function (delka) {
        var p = RC.el('button', 'prkno', String(delka));
        p.type = 'button';
        /* Mezera zabírá 68 % šířky scény (útesy po 16 %), takže prkno je přesně
           tak dlouhé, kolik políček ve mezeře zaplní. */
        p.style.width = 'calc(' + (68 * delka / N).toFixed(2) + '% - .45rem)';
        p.style.minWidth = '2.4rem';
        p.addEventListener('click', function () {
          if (RC.Engine.zamek) return;

          if (p.classList.contains('pouzito')) {       // sundat zpátky
            p.classList.remove('pouzito');
            polozeno.splice(polozeno.indexOf(delka), 1);
            api.sfx('tap');
            prekresli();
            return;
          }
          if (polozeno.length >= 2) {
            api.chyba(p, 'Most se skládá jen ze dvou prken. Nejdřív jedno sundej.');
            return;
          }
          if (soucet() + delka > N) {
            api.chyba(p, 'Tohle prkno je moc dlouhé, přečnívalo by.');
            return;
          }

          polozeno.push(delka);
          p.classList.add('pouzito');
          api.sfx('pop');
          prekresli();

          if (soucet() === N && polozeno.length === 2) {
            api.rekni(polozeno[0] + ' a ' + polozeno[1] + ' je ' + N + '. Most drží!',
                      { prerus: true });
            rytirNaMoste.style.left = '100%';
            api.hotovo({ pauza: 1100 });
          } else if (polozeno.length === 2) {
            api.chyba(p, 'Ještě chybí ' + (N - soucet()) + '. Prkna spadla, zkus jiná.');
            /* Dvojice nesedí – prkna spadnou do rokle, ať se dá hned zkusit jiná. */
            setTimeout(function () {
              if (RC.Engine.zamek) return;
              polozeno.length = 0;
              Array.prototype.forEach.call(prkna.children, function (c) { c.classList.remove('pouzito'); });
              prekresli();
            }, 1300);
          }
        });
        prkna.appendChild(p);
      });

      prekresli();
    }
  });

  /* ---------- 3. ČÍSELNÁ STEZKA ---------- */

  RC.levels.push({
    id: 'stezka',
    akt: 1,
    nazev: 'Číselná stezka',
    ikona: '👣',
    popis: 'Odkrokuj kameny na stezce.',
    uvod: 'Stezka je z číselných kamenů. Spočítej v hlavě, kam dojdeš, a klepni na ten kámen.',
    odmena: 'Stezku znáš nazpaměť. Umíš přidávat i ubírat!',
    kola: 5,
    vytvor: function (api, i) {
      var MAX = 10;
      var vpred = i % 2 === 0;
      var start, kroku, cil;
      if (vpred) {
        start = RC.rand(0, 6);
        kroku = RC.rand(2, MAX - start);
      } else {
        start = RC.rand(4, MAX);
        kroku = RC.rand(2, start);
      }
      cil = vpred ? start + kroku : start - kroku;

      api.zadani('Stojíš na kameni <b>' + start + '</b>. Udělej <b>' + kroku + '</b> ' +
                 (kroku < 5 ? 'kroky' : 'kroků') + ' ' + (vpred ? 'vpřed' : 'vzad') +
                 '. Na který kámen dojdeš?');
      api.napoveda(vpred
        ? 'Počítej po jednom nahoru: ' + (start + 1) + ', ' + (start + 2) + '…'
        : 'Počítej po jednom dolů: ' + (start - 1) + ', ' + (start - 2) + '…');

      var bezi = false;                     // během skákání se další klepnutí ignoruje
      var obal = RC.el('div', 'osa-obal');
      var osa = RC.Vis.osa(0, MAX, {
        klik: function (cislo, node) {
          if (RC.Engine.zamek || bezi) return;
          if (cislo !== cil) { api.chyba(node); return; }
          node.classList.add('cil');
          bezi = true;
          skakej();
        }
      });
      obal.appendChild(osa);

      var rytir = RC.el('div', 'osa-rytir');
      rytir.innerHTML = RC.Art.rytir();
      obal.appendChild(rytir);
      api.telo.appendChild(obal);

      var pocetKamenu = MAX + 1;
      function pozice(idx) { return ((idx + 0.5) / pocetKamenu * 100) + '%'; }
      rytir.style.left = pozice(start);
      osa.children[start].classList.add('start');

      function skakej() {
        var k = 0;
        (function dalsi() {
          k++;
          if (k > kroku) {
            api.rekni('Jsi na ' + cil + '. ' + start + ' ' + (vpred ? 'plus' : 'minus') +
                      ' ' + kroku + ' je ' + cil + '.', { prerus: true });
            api.hotovo({ pauza: 800 });
            return;
          }
          var idx = vpred ? start + k : start - k;
          rytir.style.left = pozice(idx);
          rytir.classList.remove('skace');
          void rytir.offsetWidth;
          rytir.classList.add('skace');
          api.pocitaciTon(k);
          setTimeout(dalsi, 330);
        })();
      }
    }
  });

  /* ---------- 4. KOUZELNÝ ŠTÍT ---------- */

  function stitSvg() {
    var nyty = '';
    var xs = [26, 44, 62, 80, 98];
    [40, 70].forEach(function (y, r) {
      xs.forEach(function (x, c) {
        nyty += '<circle class="nyt zhasly" data-i="' + (r * 5 + c) + '" cx="' + x + '" cy="' + y + '" r="7" fill="#3f3a58"/>';
      });
    });
    return '' +
    '<svg viewBox="0 0 124 146" aria-hidden="true">' +
      '<path d="M8 14 L62 3 L116 14 L116 80 Q62 134 8 80 Z" fill="#3f6bd8" stroke="#f2b544" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M8 14 L62 3 L116 14 L116 24 Q62 34 8 24 Z" fill="rgba(255,255,255,.16)"/>' +
      nyty +
    '</svg>';
  }

  RC.levels.push({
    id: 'stit',
    akt: 1,
    nazev: 'Kouzelný štít',
    ikona: '🛡️',
    popis: 'Dopočítej nýty do deseti.',
    uvod: 'Kouzelný štít má deset nýtů. Rozsvítí se celý, až doplníš ty, které chybí.',
    odmena: 'Štít září. Dvojice do deseti už umíš zpaměti!',
    kola: 6,
    vytvor: function (api, i) {
      /* Sedmičkou se začíná (je nejnázornější), zbytek se losuje – dřív bylo
         pořadí pevné a dvojice 5 + 5 ani krajní případy nepřišly vůbec. */
      if (i === 0 || !RC._stit) RC._stit = [7].concat(RC.shuffle([1, 2, 3, 4, 5, 6, 8, 9]));
      var sviti = RC._stit[i % RC._stit.length];
      var chybi = 10 - sviti;

      api.zadani('Na štítu svítí <b>' + sviti + '</b> ' + RC.mn(sviti, 'nýt', 'nýty', 'nýtů') +
                 '. Kolik jich chybí do <b>10</b>?');
      api.napoveda(sviti + ' a kolik je 10? Zkus si to na prstech: schovej ' + sviti + ' ' +
                   RC.mn(sviti, 'prst', 'prsty', 'prstů') + ', kolik ti zůstalo?');

      var scena = RC.el('div', 'stit-scena');
      var obal = RC.el('div', 'stit-obal');
      obal.innerHTML = stitSvg();
      scena.appendChild(obal);

      var vpravo = RC.el('div', 'stit-info');
      var ramec = RC.Vis.desitkovyRamec(sviti, 10);
      vpravo.appendChild(ramec);
      vpravo.appendChild(RC.el('div', 'ramec-stitek', 'svítí ' + sviti + ' z 10'));
      scena.appendChild(vpravo);
      api.telo.appendChild(scena);

      var nyty = obal.querySelectorAll('.nyt');
      for (var n = 0; n < sviti; n++) {
        nyty[n].classList.remove('zhasly');
        nyty[n].classList.add('rozsviceny');
      }

      api.telo.appendChild(api.volby(chybi, api.okoliVoleb(chybi, 4, 0, 10), {
        pauza: 1500,
        pred: function () {
          /* Výsledek se řekne hned, ať se stihne zařadit před pochvalu
             a hra na něj počkala; nýty se mezitím rozsvěcují. */
          api.rekni(sviti + ' a ' + chybi + ' je deset.');
          var k = sviti;
          (function dalsi() {
            if (k >= 10) {
              obal.classList.add('hotovo');
              RC.FX.jiskry(obal, 16);
              return;
            }
            nyty[k].classList.remove('zhasly');
            nyty[k].classList.add('rozsviceny');
            ramec.children[k].classList.add('plne');
            api.pocitaciTon(k + 1);
            k++;
            setTimeout(dalsi, 170);
          })();
        }
      }));
    }
  });

  /* ---------- 5. STRÁŽNÁ BRÁNA ---------- */

  RC.levels.push({
    id: 'brana',
    akt: 1,
    nazev: 'Strážná brána',
    ikona: '🏰',
    popis: 'Porovnej, kde je víc.',
    uvod: 'U brány stojí dvě stráže. Řekni, která je silnější – vyber správné znaménko.',
    odmena: 'Stráže tě pustily dál. Před tebou je Dračí hora.',
    kola: 6,
    vytvor: function (api, i) {
      var l, p;
      if (i === 2 || i === 5) {                 // dvakrát rovnost, ať se dá čekat
        l = p = RC.rand(3, 9);
      } else {
        l = RC.rand(1, 10);
        do { p = RC.rand(1, 10); } while (p === l);
      }
      var spravne = l > p ? '>' : (l < p ? '<' : '=');

      api.zadani('Vlevo <b>' + l + '</b> vojáků, vpravo <b>' + p + '</b>. Vyber znaménko.',
                 'Vlevo ' + l + ' vojáků, vpravo ' + p + '. Vyber správné znaménko.');
      api.napoveda('Otevřená strana znaménka ukazuje k většímu číslu. ' +
                   (spravne === '=' ? 'Když je jich stejně, patří tam rovná se.' : ''));

      var vahy = RC.el('div', 'vahy');
      var ramena = RC.el('div', 'vahy-ramena');

      function strana(pocet) {
        var s = RC.el('div', 'vaha-strana');
        var voj = RC.el('div', 'vaha-vojaci');
        for (var k = 0; k < pocet; k++) {
          var v = RC.el('span', null, '💪');
          v.style.animationDelay = (k * 0.05).toFixed(2) + 's';
          voj.appendChild(v);
        }
        s.appendChild(voj);
        s.appendChild(RC.el('div', 'vaha-cislo', String(pocet)));
        return s;
      }
      ramena.appendChild(strana(l));
      ramena.appendChild(RC.el('div', 'vahy-sloup'));
      ramena.appendChild(strana(p));
      vahy.appendChild(ramena);
      api.telo.appendChild(vahy);

      api.telo.appendChild(api.volby(spravne, ['<', '=', '>'], {
        cls: 'znamenka',
        pauza: 1100,
        pred: function () {
          vahy.classList.add(l > p ? 'vlevo' : (l < p ? 'vpravo' : 'rovnost'));
          api.rekni(spravne === '=' ? l + ' je stejně jako ' + p
                  : (l > p ? l + ' je více než ' + p : l + ' je méně než ' + p));
        }
      }));
    }
  });

})();
