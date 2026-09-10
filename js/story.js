/* Rytíř Čísel – příběh, mapa výpravy, nastavení */
(function () {
  'use strict';
  var RC = window.RC;

  /* ---------- obrázek ke komiksovému panelu ---------- */

  function obraz(casti) {
    var box = RC.el('div', 'komiks-obraz');
    casti.forEach(function (c) {
      if (c === 'rytir') {
        var r = RC.el('div', 'rytir-obal');
        r.innerHTML = RC.Art.rytir();
        r.style.height = '100%';
        box.appendChild(r);
      } else if (c === 'drak' || c === 'drak-smutny') {
        var d = RC.el('div', 'drak-obal');
        d.innerHTML = RC.Art.drak();
        d.style.height = '100%';
        if (c === 'drak-smutny') d.querySelector('svg').classList.add('smutny');
        box.appendChild(d);
      } else {
        box.appendChild(RC.el('span', 'rekvizita', c));
      }
    });
    return box;
  }

  /* ---------- panely příběhu ---------- */

  var UVOD = [
    { o: ['🏰', '🥖', '🧵'],
      t: 'V království Desítkově bývalo veselo. Každý tam umí počítat – pekař rohlíky, švadlena knoflíky, strážný schody na věž.' },
    { o: ['drak', '📕'],
      t: 'Jednou v noci přiletěl drak Šupinář a ukradl Zlatý počet – kouzelnou knihu, ve které jsou schovaná všechna čísla.' },
    { o: ['🥖', '❓', '😴'],
      t: 'Od té doby se čísla v království pletou. Pekař upeče tři rohlíky místo deseti a strážný počítá schody až do rána.' },
    { o: ['rytir', '👑'],
      t: 'A tady přicházíš ty. Jsi rytíř{ka} {jmeno}. Král ti dal meč, štít a jeden úkol: přines Zlatý počet zpátky.' },
    { o: ['rytir', '⛰️', 'drak'],
      t: 'Cesta vede přes deset zastávek až na Dračí horu. A pozor – draka neporazíš mečem. Porazíš ho počítáním!' }
  ];

  var MEZIHRA = [
    { o: ['rytir', '⛰️'],
      t: 'Zvládl{a} jsi celou cestu do deseti! Před tebou se z mraků tyčí Dračí hora.' },
    { o: ['🔟', '➕', '🔟'],
      t: 'Tady už jedna desítka nestačí. Na hoře se počítá až do dvaceti. Deset a ještě jednou tolik.' }
  ];

  var KONEC = [
    { o: ['drak-smutny'],
      t: 'Drak Šupinář sklopil hlavu. Poprvé v životě někdo počítal rychleji než on.' },
    { o: ['drak-smutny', '💰'],
      t: '„Já jsem nikomu ublížit nechtěl,“ povzdechl si drak. „Chtěl jsem si jen spočítat svůj poklad. Ale mě nikdy nikdo počítat nenaučil.“' },
    { o: ['rytir', 'drak'],
      t: 'Rytíř{ka} {jmeno} sklopil{a} meč. „Tak já tě to naučím,“ řekl{a}. A nakreslil{a} drakovi do písku deset okýnek.' },
    { o: ['📕', 'drak', '⭐'],
      t: 'Zlatý počet se vrátil do království. A na Dračí hoře odteď sedí drak a počítá nahlas, aby ho bylo slyšet až dolů. Jedna, dva, tři…' }
  ];

  /* ---------- přehrávač komiksu ---------- */

  function komiks(panely, popis, hotovo) {
    var i = 0;

    var scena = RC.el('div', 'komiks');
    scena.innerHTML = RC.Art.kulisa();
    var obsah = RC.el('div', 'obsah komiks');

    var panel = RC.el('div', 'komiks-panel');
    var textEl = RC.el('p', 'komiks-text', '');
    panel.appendChild(textEl);

    var ovl = RC.el('div', 'komiks-ovladani');
    var tecky = RC.el('div', 'komiks-tecky');
    panely.forEach(function () { tecky.appendChild(RC.el('i')); });

    var btnDal = RC.tlacitko('Dál →', 'velke', function () { dal(); });
    var btnPresk = RC.tlacitko('Přeskočit', 'duch', function () { RC.Voice.ticho(); hotovo(); });
    var btnRepro = RC.tlacitko('🔊', 'ikona', function () {
      RC.Voice.rekni(RC.t(panely[i].t), { prerus: true });
    });
    btnRepro.setAttribute('aria-label', 'Přečti znovu');

    ovl.appendChild(btnPresk);
    ovl.appendChild(tecky);
    ovl.appendChild(btnRepro);
    ovl.appendChild(btnDal);

    obsah.appendChild(panel);
    obsah.appendChild(ovl);
    scena.appendChild(obsah);
    RC.scena(scena);

    function nakresli() {
      var p = panely[i];
      var stary = panel.querySelector('.komiks-obraz');
      if (stary) stary.remove();
      panel.insertBefore(obraz(p.o), textEl);
      textEl.innerHTML = RC.t(p.t);
      for (var k = 0; k < tecky.children.length; k++) {
        tecky.children[k].className = k === i ? 'akt' : '';
      }
      btnDal.textContent = i === panely.length - 1 ? (popis || 'Jdeme!') : 'Dál →';
      btnPresk.style.visibility = i === panely.length - 1 ? 'hidden' : '';
      /* Nový panel utne ten předchozí – o další si klepnutím řeklo dítě samo. */
      RC.Voice.rekni(RC.t(p.t), { prerus: true });
      panel.style.animation = 'none';
      void panel.offsetWidth;
      panel.style.animation = '';
    }
    function dal() {
      i++;
      if (i >= panely.length) { RC.Voice.ticho(); hotovo(); return; }
      nakresli();
    }
    nakresli();
  }

  /* ---------- úvodní obrazovka ---------- */

  function uvodniObrazovka() {
    var scena = RC.el('div', 'uvod-scena-cela');
    scena.innerHTML = RC.Art.kulisa();
    var obsah = RC.el('div', 'obsah uvod');

    obsah.appendChild(RC.el('h1', null, 'Rytíř Čísel'));
    obsah.appendChild(RC.el('h2', null, 'Souboj s drakem &nbsp;·&nbsp; počítání do 10 a do 20'));

    var vystup = RC.el('div', 'uvod-scena');
    var r = RC.el('div'); r.innerHTML = RC.Art.rytir();
    var d = RC.el('div'); d.innerHTML = RC.Art.drak();
    vystup.appendChild(r); vystup.appendChild(d);
    obsah.appendChild(vystup);

    /* Profily: každé dítě má svůj postup. Ukazují se, jen když je jich víc, ať
       jediné dítě nemusí nic vybírat. */
    var profily = RC.State.profily();
    if (profily.length > 1) {
      var pas = RC.el('div', 'profil-pas');
      profily.forEach(function (pr) {
        var b = RC.tlacitko(pr.jmeno + ' <small>★ ' + pr.hvezdy + '</small>',
          'profil-chip' + (pr.id === RC.State.data.aktivniProfil ? ' aktivni' : ''),
          function () { RC.State.prepniProfil(pr.id); uvodniObrazovka(); });
        pas.appendChild(b);
      });
      obsah.appendChild(pas);
    }

    var tl = RC.el('div', 'uvod-tlacitka');
    var profil = RC.State.profil();
    var mameRozehrano = profil.hrdina && profil.hotovo.length > 0;

    if (mameRozehrano) {
      tl.appendChild(RC.tlacitko('Pokračovat ve výpravě →', 'velke', function () { RC.Map.zobraz(); }));
      tl.appendChild(RC.tlacitko('Příběh od začátku', 'duch', function () {
        komiks(UVOD, 'Vyrazit na cestu!', function () { RC.Map.zobraz(); });
      }));
    } else {
      tl.appendChild(RC.tlacitko('Začít výpravu', 'velke', function () { vyberHrdiny(); }));
    }
    tl.appendChild(RC.tlacitko('⚙️', 'ikona', function () { nastaveni(); }));
    obsah.appendChild(tl);

    scena.appendChild(obsah);
    RC.scena(scena);
    setTimeout(function () {
      RC.Voice.rekni(mameRozehrano
        ? (RC.State.zena() ? 'Vítej zpátky, rytířko. Pokračujeme ve výpravě?'
                           : 'Vítej zpátky, rytíři. Pokračujeme ve výpravě?')
        : 'Rytíř Čísel. Souboj s drakem. Klepni na Začít výpravu.');
    }, 500);
  }

  /* ---------- výběr hrdiny ---------- */

  function vyberHrdiny() {
    var scena = RC.el('div');
    scena.innerHTML = RC.Art.kulisa();
    var obsah = RC.el('div', 'obsah uvod');
    obsah.appendChild(RC.el('h1', null, 'Kdo pojede na Dračí horu?'));

    var volba = RC.el('div', 'volba-hrdiny');
    [
      { id: 'kvido', jm: 'Rytíř Kvído', pod: 'modrý plášť', zena: false },
      { id: 'bara',  jm: 'Rytířka Bára', pod: 'růžový plášť', zena: true }
    ].forEach(function (h) {
      var k = RC.el('button', 'hrdina-karta');
      k.type = 'button';
      var tvar = RC.el('div', 'tvar');
      tvar.innerHTML = RC.Art.rytir({ zena: h.zena });
      k.appendChild(tvar);
      k.appendChild(RC.el('b', null, h.jm));
      k.appendChild(RC.el('span', null, h.pod));
      k.addEventListener('click', function () {
        RC.Audio.sfx('odemk');
        RC.State.profil().hrdina = h.id;
        RC.State.save();
        Array.prototype.forEach.call(volba.children, function (c) { c.classList.remove('vybrano'); });
        k.classList.add('vybrano');
        RC.Voice.rekni(h.jm + '. Výborně!');
        /* Komiks začne, až se jméno dopoví – ne uprostřed věty. */
        var casPryc = false, hlasDomluvil = false, uzJdeme = false;
        function dal() {
          if (uzJdeme || !casPryc || !hlasDomluvil) return;
          uzJdeme = true;
          RC.State.profil().videlUvod = true;
          RC.State.save();
          komiks(UVOD, 'Vyrazit na cestu!', function () { RC.Map.zobraz(); });
        }
        setTimeout(function () { casPryc = true; dal(); }, 700);
        RC.Voice.potom(function () { hlasDomluvil = true; dal(); });
      });
      volba.appendChild(k);
    });
    obsah.appendChild(volba);
    scena.appendChild(obsah);
    RC.scena(scena, { rekni: 'Kdo pojede na Dračí horu? Vyber si rytíře, nebo rytířku.' });
  }

  /* ---------- mapa výpravy ---------- */

  /* Souřadnice se počítají z počtu zastávek, ne z pevné tabulky – přidat
     zastávku nebo svět tedy nic nerozbije. Stezka se vine (had), poslední uzel
     je nejvýš, protože končí svět. Krajní uzly drží od okraje, aby se jejich
     štítek vešel i na displej na výšku. */
  function bodMapy(i, n) {
    if (n === 1) return [50, 60];
    var x = 8 + (84 * i) / (n - 1);
    var y = (i % 2 === 0) ? 74 : 55;
    if (i === n - 1) y = 32;                       // vrchol světa
    else if (i === n - 2 && n > 3) y = 62;         // náběh na vrchol
    return [x, y];
  }

  var Map = (RC.Map = {
    /* opts.svet – který svět ukázat; jinak ten, kde dítě právě je */
    zobraz: function (opts) {
      opts = opts || {};
      var svetId = opts.svet || Map._svet || RC.State.prvniOtevrenySvet();
      if (!RC.State.svetOdemcen(svetId)) svetId = RC.State.prvniOtevrenySvet();
      Map._svet = svetId;
      var svet = RC.svet(svetId);
      var urovne = RC.urovneSveta(svetId);

      var scena = RC.el('div');
      scena.innerHTML = RC.Art.kulisa(svet.kulisa);
      var obsah = RC.el('div', 'obsah');

      /* hlava */
      var hlava = RC.el('header', 'mapa-hlava');
      hlava.appendChild(RC.tlacitko('🏠', 'ikona', function () { uvodniObrazovka(); }));
      hlava.appendChild(RC.el('h2', null, svet.nazev));
      var hotovoVeSvete = urovne.filter(function (u) { return RC.State.hotova(u.id); }).length;
      hlava.appendChild(RC.el('div', 'pocitadlo-hvezd',
        '★ ' + hotovoVeSvete + ' / ' + urovne.length));
      hlava.appendChild(RC.tlacitko('⚙️', 'ikona', function () { nastaveni(); }));
      obsah.appendChild(hlava);

      /* přepínač světů – ukáže se, až je co přepínat */
      if (RC.svety.length > 1) {
        var pas = RC.el('div', 'svet-pas');
        RC.svety.forEach(function (sv) {
          var otevreny = RC.State.svetOdemcen(sv.id);
          var b = RC.tlacitko(
            (otevreny ? '' : '🔒 ') + sv.kratce +
            '<small>' + (RC.State.svetDokoncen(sv.id) ? '★ hotovo' : sv.vek) + '</small>',
            'svet-chip' + (sv.id === svetId ? ' aktivni' : '') + (otevreny ? '' : ' zamceno'),
            function () {
              if (!otevreny) {
                RC.Audio.sfx('vedle');
                RC.Voice.rekni('Tenhle svět se otevře, až dokončíš ten předchozí. ' +
                               'Rodič ho může otevřít v nastavení.', { prerus: true });
                return;
              }
              Map.zobraz({ svet: sv.id });
            });
          pas.appendChild(b);
        });
        obsah.appendChild(pas);
      }

      /* plocha se stezkou */
      var plocha = RC.el('div', 'mapa-plocha');
      var cesta = RC.el('div', 'mapa-cesta');
      /* Šířka roste s počtem zastávek, ať se uzly neslepí. */
      cesta.style.width = 'max(100%, ' + Math.max(46, urovne.length * 7.5) + 'rem)';

      var body = urovne.map(function (u, idx) { return bodMapy(idx, urovne.length); });
      var d = 'M' + body.map(function (b) { return b[0] + ' ' + b[1]; }).join(' L');
      cesta.innerHTML = '<svg class="stezka" viewBox="0 0 100 100" preserveAspectRatio="none">' +
                        '<path d="' + d + '"/></svg>';

      var prvniNehotova = urovne.length;
      urovne.forEach(function (u, idx) {
        if (prvniNehotova === urovne.length && !RC.State.hotova(u.id)) prvniNehotova = idx;
      });

      urovne.forEach(function (u, idx) {
        var b = body[idx];
        var hotova = RC.State.hotova(u.id);
        var odemcena = RC.State.odemcena(u);
        var uzel = RC.el('button', 'uzel' + (u.boss ? ' boss' : '') +
          (hotova ? ' hotovo' : '') + (!odemcena ? ' zamceno' : '') +
          (idx === prvniNehotova && odemcena ? ' dalsi' : ''), u.ikona);
        uzel.type = 'button';
        uzel.style.left = b[0] + '%';
        uzel.style.top = b[1] + '%';
        uzel.appendChild(RC.el('span', 'cislo', String(idx + 1)));
        uzel.appendChild(RC.el('span', 'stitek', u.nazev));
        uzel.setAttribute('aria-label', (idx + 1) + '. ' + u.nazev + '. ' + u.popis);

        uzel.addEventListener('click', function () {
          if (!odemcena) {
            RC.Audio.sfx('vedle');
            RC.FX.zatres(uzel);
            RC.Voice.rekni('Tuhle zastávku ještě neumíme otevřít. Nejdřív dokonči tu předchozí.',
                           { prerus: true });
            return;
          }
          RC.Audio.sfx('odemk');
          RC.Engine.start(u);
        });
        cesta.appendChild(uzel);
      });

      cesta.appendChild(RC.el('div', 'mapa-oddil', svet.nazev + ' · ' + svet.kratce)).style.cssText =
        'left:50%;top:92%';

      /* rytíř stojí na aktuální zastávce */
      var kde = body[Math.min(prvniNehotova, body.length - 1)] || [50, 60];
      var rytir = RC.el('div', 'mapa-rytir');
      rytir.innerHTML = RC.Art.rytir();
      rytir.style.left = kde[0] + '%';
      rytir.style.top = kde[1] + '%';
      cesta.appendChild(rytir);

      plocha.appendChild(cesta);
      obsah.appendChild(plocha);
      scena.appendChild(obsah);
      RC.scena(scena);

      /* posunout mapu k aktuální zastávce (na úzkém displeji) */
      setTimeout(function () {
        var cil = kde[0] / 100 * cesta.offsetWidth - plocha.clientWidth / 2;
        plocha.scrollTo ? plocha.scrollTo({ left: cil, behavior: 'smooth' }) : (plocha.scrollLeft = cil);
      }, 120);

      if (opts.rekni) setTimeout(function () { RC.Voice.rekni(opts.rekni); }, 450);
      else if (RC.State.hvezdy() === RC.levels.length) {
        setTimeout(function () {
          RC.Voice.rekni(RC.t('Máš všechny hvězdy! Celou výpravu jsi zvládl{a}.'));
        }, 450);
      }
    }
  });

  /* ---------- nastavení ---------- */

  function prepinac(popis, klic, poZmene) {
    var row = RC.el('div', 'prepinac');
    row.appendChild(RC.el('span', null, popis));
    var b = RC.tlacitko(RC.State.data[klic] ? 'zapnuto' : 'vypnuto', 'duch', function (e, btn) {
      RC.State.data[klic] = !RC.State.data[klic];
      RC.State.save();
      btn.textContent = RC.State.data[klic] ? 'zapnuto' : 'vypnuto';
      poZmene && poZmene();
    });
    b.style.minHeight = '2.8rem';
    b.style.color = '#3a2b18';
    b.style.boxShadow = 'inset 0 0 0 2px rgba(0,0,0,.25)';
    row.appendChild(b);
    return row;
  }

  /* Přehled pro rodiče: kde dítě chybovalo a kde si bralo nápovědu. */
  function prehled() {
    var zaves = RC.el('div', 'zaves');
    var d = RC.el('div', 'dialog siroky');
    /* Jméno se neskloňuje – „Anežkaovi“ by bylo horší než odrážka. */
    d.innerHTML = '<h3>Jak to jde &middot; ' + RC.State.profil().jmeno + '</h3>';

    var neco = false;
    RC.svety.forEach(function (svet) {
      var urovne = RC.urovneSveta(svet.id);
      var radky = RC.el('div', 'prehled');
      urovne.forEach(function (u) {
        var st = RC.State.profil().staty[u.id];
        if (!st || (!st.kola && !st.dokonceno)) return;
        neco = true;
        var na100 = st.kola ? Math.round(100 * st.chyby / st.kola) : 0;
        var r = RC.el('div', 'prehled-radek');
        r.innerHTML =
          '<span class="ik">' + u.ikona + '</span>' +
          '<span class="jm">' + u.nazev + '</span>' +
          '<span class="cis">' + (st.dokonceno || 0) + '&times;</span>' +
          '<span class="cis">' + (st.chyby || 0) + ' chyb</span>' +
          '<span class="cis">' + (st.napovedy || 0) + '&times; 💡</span>';
        /* Hodně chyb na kolo = tady to dítě potřebuje procvičit. */
        if (na100 >= 60) r.classList.add('trapi');
        radky.appendChild(r);
      });
      if (radky.children.length) {
        d.appendChild(RC.el('h4', null, svet.nazev));
        d.appendChild(radky);
      }
    });
    if (!neco) d.appendChild(RC.el('p', null, 'Ještě se nic neodehrálo. Až si dítě zahraje, uvidíš tady, co mu jde a co ne.'));
    else d.appendChild(RC.el('p', 'poznamka',
      'Červeně je zastávka, kde dítě chybovalo víc než v polovině kol – tam se vyplatí zahrát si ji spolu.'));

    var radek = RC.el('div', 'radek');
    radek.appendChild(RC.tlacitko('Zavřít', '', function () { zaves.remove(); }));
    d.appendChild(radek);
    zaves.appendChild(d);
    zaves.addEventListener('click', function (e) { if (e.target === zaves) zaves.remove(); });
    document.body.appendChild(zaves);
  }

  function nastaveni() {
    var zaves = RC.el('div', 'zaves');
    var d = RC.el('div', 'dialog');
    d.innerHTML = '<h3>Nastavení</h3>';

    /* ---- profily ---- */
    d.appendChild(RC.el('h4', null, 'Kdo hraje'));
    var seznam = RC.el('div', 'profil-seznam');
    function prekresliProfily() {
      seznam.innerHTML = '';
      var profily = RC.State.profily();
      profily.forEach(function (pr) {
        var row = RC.el('div', 'profil-radek' + (pr.id === RC.State.data.aktivniProfil ? ' aktivni' : ''));
        var jm = RC.el('button', 'profil-jmeno', pr.jmeno + ' <small>★ ' + pr.hvezdy + '</small>');
        jm.type = 'button';
        jm.addEventListener('click', function () {
          RC.State.prepniProfil(pr.id);
          prekresliProfily();
        });
        row.appendChild(jm);
        if (profily.length > 1) {
          var smaz = RC.tlacitko('🗑', 'ikona maly', function (e, btn) {
            if (btn.dataset.jiste) { RC.State.smazProfil(pr.id); prekresliProfily(); }
            else { btn.dataset.jiste = '1'; btn.textContent = '?'; }
          });
          smaz.setAttribute('aria-label', 'Smazat ' + pr.jmeno);
          row.appendChild(smaz);
        }
        seznam.appendChild(row);
      });

      var pridej = RC.el('div', 'profil-radek');
      var vstup = RC.el('input', 'profil-vstup');
      vstup.type = 'text';
      vstup.placeholder = 'jméno dítěte';
      vstup.maxLength = 14;
      var ok = RC.tlacitko('Přidat', 'duch', function () {
        var jmeno = (vstup.value || '').trim();
        if (!jmeno) { vstup.focus(); return; }
        RC.State.pridejProfil(jmeno);
        prekresliProfily();
      });
      pridej.appendChild(vstup);
      pridej.appendChild(ok);
      seznam.appendChild(pridej);
    }
    prekresliProfily();
    d.appendChild(seznam);

    /* ---- zvuk a světy ---- */
    d.appendChild(RC.el('h4', null, 'Hra'));
    d.appendChild(prepinac('Zvuky', 'zvuk'));
    d.appendChild(prepinac('Čtení nahlas', 'hlas', function () {
      if (!RC.State.data.hlas) RC.Voice.ticho();
    }));
    d.appendChild(prepinac('Otevřít všechny světy', 'odemcenoVse'));
    var pozn = RC.el('p', 'poznamka',
      'Otevřením všech světů si dítě může vybrat, co chce trénovat — hodí se, ' +
      'když už umí víc, než kde je v příběhu.');
    d.appendChild(pozn);

    var info = RC.el('p', 'poznamka',
      'Pro rodiče: hra nikdy netrestá za chybu. Po druhé chybě se sama ukáže nápověda, ' +
      'dítě může zkoušet, jak dlouho potřebuje. Postup se ukládá v tomto prohlížeči.');
    d.appendChild(info);

    var radek = RC.el('div', 'radek');
    radek.appendChild(RC.tlacitko('Hotovo', '', function () { zaves.remove(); }));
    radek.appendChild(RC.tlacitko('📊 Jak to jde', 'duch', function () { prehled(); }));
    radek.appendChild(RC.tlacitko('Vymazat postup', 'duch', function (e, btn) {
      if (btn.dataset.jiste) {
        RC.State.reset();
        zaves.remove();
        uvodniObrazovka();
      } else {
        btn.dataset.jiste = '1';
        btn.textContent = 'Opravdu vymazat?';
      }
    }));
    d.appendChild(radek);

    zaves.appendChild(d);
    zaves.addEventListener('click', function (e) { if (e.target === zaves) zaves.remove(); });
    document.body.appendChild(zaves);
  }

  RC.Story = {
    uvodniObrazovka: uvodniObrazovka,
    vyberHrdiny: vyberHrdiny,
    komiks: komiks,
    UVOD: UVOD, MEZIHRA: MEZIHRA, KONEC: KONEC,
    nastaveni: nastaveni,
    prehled: prehled
  };

})();
