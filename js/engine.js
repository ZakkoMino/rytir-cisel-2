/* Rytíř Čísel – skořápka úrovně
 * Drží lištu, zadání, postup v kolech, nápovědu a oslavu.
 * Zásada převzatá z Matemága: chyba nic nebere. Dítě může zkoušet, jak dlouho chce,
 * po druhé chybě se nápověda ukáže sama.
 */
(function () {
  'use strict';
  var RC = window.RC;

  var POCHVALY = ['Výborně!', 'Přesně tak!', 'Skvěle!', 'Máš to!', 'Trefa!', 'Bezva!', 'Správně!'];
  var POVZBUZENI = [
    'Nic se nestalo, zkus to znovu.',
    'Skoro. Zkus to ještě jednou.',
    'To nic. Zkusíme to spolu.',
    'Ještě jednou, jde ti to.'
  ];

  var Engine = (RC.Engine = {
    uroven: null,
    kolo: 0,
    chybyVKole: 0,
    beh: 0,              // číslo rozehrané úrovně; odchodem ze scény se zvýší
    poDokonceni: null,   // nastavuje main.js
    naMapu: null,        // nastavuje main.js

    start: function (uroven) {
      Engine.uroven = uroven;
      Engine.kolo = 0;
      Engine.chybyVKole = 0;
      Engine.zamek = false;
      Engine.beh++;

      var scena = RC.el('div', 'uroven');
      scena.innerHTML = RC.Art.kulisa(uroven.akt === 2 ? 'hora' : '');

      var obsah = RC.el('div', 'obsah');

      /* ---- lišta ---- */
      var lista = RC.el('header', 'uroven-lista');

      var zpet = RC.tlacitko('←', 'ikona', function () {
        Engine.beh++;                 // rozehraná kola už nemají kam pokračovat
        RC.Voice.ticho();
        Engine.naMapu && Engine.naMapu();
      });
      zpet.setAttribute('aria-label', 'Zpět na mapu');

      var titul = RC.el('div', 'uroven-titul',
        '<span class="ik">' + uroven.ikona + '</span><span>' + uroven.nazev + '</span>');

      var tecky = RC.el('div', 'kola-tecky');
      for (var i = 0; i < uroven.kola; i++) tecky.appendChild(RC.el('i'));

      var btnNap = RC.tlacitko('💡', 'ikona napoveda-tl', function () { Engine.ukazNapovedu(true); });
      btnNap.setAttribute('aria-label', 'Nápověda');

      var btnZvuk = RC.tlacitko(RC.State.data.hlas ? '🔊' : '🔇', 'ikona', function (e, b) {
        RC.State.data.hlas = !RC.State.data.hlas;
        RC.State.data.zvuk = RC.State.data.hlas;
        RC.State.save();
        b.textContent = RC.State.data.hlas ? '🔊' : '🔇';
        b.classList.toggle('vyp', !RC.State.data.hlas);
        if (!RC.State.data.hlas) RC.Voice.ticho(); else Engine.rekniZadani();
      });
      btnZvuk.setAttribute('aria-label', 'Zvuk a hlas');
      btnZvuk.classList.toggle('vyp', !RC.State.data.hlas);

      lista.appendChild(zpet);
      lista.appendChild(titul);
      lista.appendChild(tecky);
      lista.appendChild(btnNap);
      lista.appendChild(btnZvuk);

      /* ---- pás se zadáním ---- */
      var pas = RC.el('div', 'zadani-pas');
      var zadaniText = RC.el('p', 'zadani-text', '');
      var zadaniRepro = RC.tlacitko('🔊', 'ikona maly', function () { Engine.rekniZadani(); });
      zadaniRepro.setAttribute('aria-label', 'Přečti zadání');
      pas.appendChild(zadaniText);
      pas.appendChild(zadaniRepro);

      /* ---- tělo úrovně ---- */
      var telo = RC.el('div', 'uroven-telo');

      /* ---- bublina s nápovědou ---- */
      var napBublina = RC.el('div', 'nap-bublina');

      obsah.appendChild(lista);
      obsah.appendChild(pas);
      obsah.appendChild(telo);
      obsah.appendChild(napBublina);
      scena.appendChild(obsah);

      Engine.dom = { scena: scena, telo: telo, tecky: tecky, zadaniText: zadaniText, nap: napBublina };
      RC.scena(scena);

      RC.Voice.rekni(uroven.uvod || uroven.popis);
      setTimeout(function () { Engine.dalsiKolo(); }, uroven.uvod ? 260 : 120);
    },

    /* ---------- kola ---------- */

    dalsiKolo: function () {
      var u = Engine.uroven;
      if (Engine.kolo >= u.kola) return Engine.dokonceno();

      Engine.chybyVKole = 0;
      Engine.zamek = false;
      Engine._napoveda = null;
      Engine._zadani = '';
      Engine.dom.telo.innerHTML = '';
      Engine.dom.nap.classList.remove('vidi');
      Engine.dom.nap.innerHTML = '';
      Engine.dom.telo.classList.remove('mizi');

      var deti = Engine.dom.tecky.children;
      for (var i = 0; i < deti.length; i++) {
        deti[i].className = i < Engine.kolo ? 'hotova' : (i === Engine.kolo ? 'akt' : '');
      }

      u.vytvor(Engine.api, Engine.kolo);
    },

    dokonceno: function () {
      var u = Engine.uroven;
      var novy = !RC.State.hotova(u.id);
      RC.State.dokonci(u.id);
      RC.Audio.sfx('hotovo');
      RC.FX.konfety(60);

      var zaves = RC.el('div', 'zaves');
      var d = RC.el('div', 'dialog');
      d.innerHTML =
        '<h3>' + (novy ? 'Zastávka splněna!' : 'Zastávka znovu splněna!') + '</h3>' +
        '<div class="hvezdicky"><i>★</i></div>' +
        '<p>' + RC.t(u.odmena || 'Máš další hvězdu odvahy. Cesta k drakovi je o krok blíž.') + '</p>';
      var radek = RC.el('div', 'radek');
      radek.appendChild(RC.tlacitko('Jdeme dál →', 'velke', function () {
        zaves.remove();
        Engine.poDokonceni && Engine.poDokonceni(u);
      }));
      radek.appendChild(RC.tlacitko('Zkusit znovu', 'duch', function () {
        zaves.remove();
        Engine.start(u);
      }));
      d.appendChild(radek);
      zaves.appendChild(d);
      document.body.appendChild(zaves);
      RC.Voice.rekni('Výborně! Zastávka splněna. Máš další hvězdu odvahy.');
    },

    /* ---------- nápověda ---------- */

    ukazNapovedu: function (naKliknuti) {
      var n = Engine._napoveda;
      if (!n) return;
      if (typeof n === 'function') { n(); return; }
      Engine.dom.nap.innerHTML = '<span class="ik">💡</span><span>' + n + '</span>';
      Engine.dom.nap.classList.add('vidi');
      /* O nápovědu i o zadání si říká dítě samo – ta smí skočit do řeči. */
      if (naKliknuti) RC.Voice.rekni(n, { prerus: true });
    },

    rekniZadani: function () {
      if (Engine._zadani) RC.Voice.rekni(Engine._zadani, { prerus: true });
    },

    /* ---------- API pro úrovně ---------- */

    api: {
      get telo() { return Engine.dom.telo; },
      get kolo() { return Engine.kolo; },

      /* Zadání úlohy – zobrazí se v pásu a přečte se nahlas. */
      zadani: function (text, mluvenaVerze) {
        Engine.dom.zadaniText.innerHTML = text;
        Engine._zadani = mluvenaVerze || String(text).replace(/<[^>]+>/g, ' ');
        RC.Voice.rekni(Engine._zadani);
      },

      /* Nápověda: text, nebo funkce, která přehraje ukázku. */
      napoveda: function (textNeboFn) { Engine._napoveda = textNeboFn; },

      rekni: function (t, o) { RC.Voice.rekni(t, o); },
      sfx: function (n) { RC.Audio.sfx(n); },
      pocitaciTon: function (n) { RC.Audio.countTone(n); },

      /* Kolo vyřešeno – oslavíme a jdeme na další.
       * Další kolo začne, až je splněné obojí: doběhla animace (opts.pauza)
       * a hlas dopověděl výsledek i pochvalu. Nikdy se nic neutne v půlce. */
      hotovo: function (opts) {
        opts = opts || {};
        if (Engine.zamek) return;
        Engine.zamek = true;
        RC.Audio.sfx('spravne');
        if (!opts.bezNapisu) RC.FX.napis(RC.pick(POCHVALY));
        RC.FX.konfety(opts.konfety || 18);
        /* Pochvala se zařadí za výsledek, který úroveň právě říká. */
        RC.Voice.rekni(RC.pick(POCHVALY));
        Engine.kolo++;

        var beh = Engine.beh;
        var casPryc = false, hlasDomluvil = false, uzJdeme = false;
        function pokracuj() {
          if (uzJdeme || !casPryc || !hlasDomluvil) return;
          uzJdeme = true;
          if (beh !== Engine.beh) return;      // mezitím jsme ze scény odešli
          Engine.dom.telo.classList.add('mizi');
          setTimeout(function () {
            if (beh !== Engine.beh) return;
            Engine.dalsiKolo();
          }, 240);
        }
        setTimeout(function () { casPryc = true; pokracuj(); }, opts.pauza || 900);
        RC.Voice.potom(function () { hlasDomluvil = true; pokracuj(); });
      },

      /* Chyba – nic se neodečítá, jen jemná zpětná vazba a po druhé chybě nápověda. */
      chyba: function (prvek, text) {
        RC.Audio.sfx('vedle');
        RC.FX.zatres(prvek || Engine.dom.telo);
        if (prvek) {
          prvek.classList.add('vedle');
          setTimeout(function () { prvek.classList.remove('vedle'); }, 700);
        }
        Engine.chybyVKole++;
        var zprava = text || RC.pick(POVZBUZENI);
        /* Další pokus přebije povzbuzení k tomu předchozímu, ať se nehromadí. */
        RC.Voice.rekni(zprava, { prerus: true });
        if (Engine.chybyVKole >= 2) Engine.ukazNapovedu(false);
        Engine.dom.nap.classList.toggle('vidi', Engine.chybyVKole >= 2 && !!Engine._napoveda);
      },

      /* Řádek velkých tlačítek s čísly. */
      volby: function (spravna, seznam, opts) {
        opts = opts || {};
        var box = RC.el('div', 'volby ' + (opts.cls || ''));
        RC.shuffle(seznam).forEach(function (v) {
          var b = RC.el('button', 'volba', String(v));
          b.type = 'button';
          b.addEventListener('click', function () {
            if (Engine.zamek) return;
            if (v === spravna) {
              b.classList.add('spravne');
              RC.FX.jiskry(b, 12);
              /* Dítě odpovědělo – rozečtené zadání už nepotřebuje slyšet.
                 Uvolníme frontu, aby výsledek zazněl hned (a celý). */
              RC.Voice.ticho();
              opts.pred && opts.pred(v, b);
              Engine.api.hotovo(opts);
            } else {
              RC.Audio.sfx('tap');
              Engine.api.chyba(b);
            }
          });
          box.appendChild(b);
        });
        return box;
      },

      /* Sada voleb okolo správné odpovědi. */
      okoliVoleb: function (spravna, pocet, min, max) {
        var out = [spravna];
        var krok = 1;
        while (out.length < pocet && krok < 12) {
          [spravna - krok, spravna + krok].forEach(function (v) {
            if (out.length < pocet && v >= min && v <= max && out.indexOf(v) < 0) out.push(v);
          });
          krok++;
        }
        return out.sort(function (a, b) { return a - b; });
      }
    }
  });

  /* ---------- opakovaně použité vizuály ---------- */

  RC.Vis = {
    /* Desítkový rámec – 2 řady po 5, základ pro „vidím deset na první pohled“. */
    desitkovyRamec: function (plno, max, opts) {
      opts = opts || {};
      max = max || 10;
      var box = RC.el('div', 'ramec ' + (opts.cls || ''));
      for (var i = 0; i < max; i++) {
        var p = RC.el('i', 'pole' + (i < plno ? ' plne' : ''));
        if (opts.znak) p.textContent = i < plno ? opts.znak : '';
        p.style.animationDelay = (i * 0.045).toFixed(2) + 's';
        box.appendChild(p);
      }
      return box;
    },

    /* Hromádka věcí (emoji), volitelně klikatelných pro počítání. */
    hromada: function (n, znak, opts) {
      opts = opts || {};
      var box = RC.el('div', 'hromada ' + (opts.cls || ''));
      for (var i = 0; i < n; i++) {
        var v = RC.el('span', 'vec', znak);
        v.style.animationDelay = (i * 0.06).toFixed(2) + 's';
        box.appendChild(v);
      }
      return box;
    },

    /* Číselná osa s kameny – používá Stezka i Výtah. */
    osa: function (min, max, opts) {
      opts = opts || {};
      var box = RC.el('div', 'osa');
      for (var i = min; i <= max; i++) {
        var k = RC.el('button', 'kamen', String(i));
        k.type = 'button';
        k.dataset.cislo = String(i);
        if (opts.klik) {
          (function (cislo, node) {
            node.addEventListener('click', function () { opts.klik(cislo, node); });
          })(i, k);
        } else {
          k.disabled = true;
        }
        box.appendChild(k);
      }
      return box;
    }
  };

})();
