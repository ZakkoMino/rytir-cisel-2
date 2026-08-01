/* Rytíř Čísel – AKT I: Cesta do deseti
 * 1. Kovárna       – počítání předmětů do 10 (jeden předmět = jedno číslo)
 * 2. Most přes rokli – rozklad čísel do 10
 * 3. Číselná stezka  – sčítání a odčítání do 10 na číselné ose
 * 4. Kouzelný štít   – dvojice do deseti
 * 5. Strážná brána   – porovnávání <, =, >
 */
(function () {
  'use strict';
  var RC = window.RC;

  /* ---------- 1. KOVÁRNA ---------- */

  var VECI = [
    { znak: '⚔️', kolik: 'mečů',   jeden: 'meč' },
    { znak: '🛡️', kolik: 'štítů',  jeden: 'štít' },
    { znak: '🗝️', kolik: 'klíčů',  jeden: 'klíč' },
    { znak: '🔔', kolik: 'zvonů',  jeden: 'zvon' },
    { znak: '🍎', kolik: 'jablek', jeden: 'jablko' },
    { znak: '👑', kolik: 'korunek', jeden: 'korunka' }
  ];

  RC.levels.push({
    id: 'kovarna',
    akt: 1,
    nazev: 'Kovárna',
    ikona: '⚒️',
    popis: 'Spočítej, co kovář nakoval.',
    uvod: 'Vítej v kovárně. Kovář ti dá výzbroj, ale nejdřív mu pomoz spočítat, co nakoval.',
    odmena: 'Kovář ti dal meč a štít. Můžeš vyrazit na cestu!',
    kola: 5,
    vytvor: function (api, i) {
      var pocty = [4, 7, 6, 9, 10];
      var n = pocty[i];
      var vec = VECI[i % VECI.length];

      api.zadani('Kolik je <b>' + vec.kolik + '</b>? Klepej na ně a počítej.',
                 'Kolik je ' + vec.kolik + '? Klepej na ně a počítej.');
      api.napoveda('Klepni na každý ' + vec.jeden + ' jen jednou a nahlas počítej: jeden, dva, tři…');

      var dilna = RC.el('div', 'kovarna-dilna');
      dilna.appendChild(RC.el('div', 'kovar', '🧑‍🏭'));

      var vitrina = RC.el('div', 'kovarna-vitrina');
      var hromada = RC.Vis.hromada(n, vec.znak);
      vitrina.appendChild(hromada);
      dilna.appendChild(vitrina);
      api.telo.appendChild(dilna);

      var citac = RC.el('div', 'pocitadlo', '– –');
      api.telo.appendChild(citac);

      var spocitano = 0;
      Array.prototype.forEach.call(hromada.children, function (v) {
        v.addEventListener('click', function () {
          if (v.classList.contains('spocitana')) return;
          spocitano++;
          v.classList.add('spocitana');
          v.dataset.n = String(spocitano);
          api.pocitaciTon(spocitano);
          api.rekni(String(spocitano));
          citac.textContent = String(spocitano);
        });
      });

      api.telo.appendChild(api.volby(n, api.okoliVoleb(n, 4, 1, 12), {
        pred: function () { citac.textContent = String(n); }
      }));
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

      /* Prkna: správná dvojice + dvě, které se nehodí (nikdy delší než mezera). */
      var nabidka = [a, b];
      var zkousky = RC.shuffle(RC.range(1, N));
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
            api.rekni(polozeno[0] + ' a ' + polozeno[1] + ' je ' + N + '. Most drží!');
            rytirNaMoste.style.left = '100%';
            api.hotovo({ pauza: 1500 });
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
            api.rekni('Jsi na ' + cil + '. ' + start + ' ' + (vpred ? 'plus' : 'minus') + ' ' + kroku + ' je ' + cil + '.');
            api.hotovo({ pauza: 1400 });
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
      var poradi = [7, 4, 8, 3, 6, 9];
      var sviti = poradi[i];
      var chybi = 10 - sviti;

      api.zadani('Na štítu svítí <b>' + sviti + '</b> nýtů. Kolik jich chybí do <b>10</b>?');
      api.napoveda(sviti + ' a kolik je 10? Zkus si to na prstech: schovej ' + sviti + ' prstů, kolik ti zůstalo?');

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
        pauza: 1600,
        pred: function () {
          var k = sviti;
          (function dalsi() {
            if (k >= 10) {
              obal.classList.add('hotovo');
              RC.FX.jiskry(obal, 16);
              api.rekni(sviti + ' a ' + chybi + ' je deset.');
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
        pauza: 1500,
        pred: function () {
          vahy.classList.add(l > p ? 'vlevo' : (l < p ? 'vpravo' : 'rovnost'));
          api.rekni(spravne === '=' ? l + ' je stejně jako ' + p
                  : (l > p ? l + ' je více než ' + p : l + ' je méně než ' + p));
        }
      }));
    }
  });

})();
