/* Rytíř Čísel – propojení příběhu a úrovní */
(function () {
  'use strict';
  var RC = window.RC;

  var POSLEDNI_AKT1 = 'brana';
  var BOSS = 'souboj';

  RC.Engine.naMapu = function () { RC.Map.zobraz(); };

  RC.Engine.poDokonceni = function (uroven) {
    /* Konec prvního aktu – mezihra o Dračí hoře. */
    if (uroven.id === POSLEDNI_AKT1 && !RC.State.data.videlMezihru) {
      RC.State.data.videlMezihru = true;
      RC.State.save();
      RC.Story.komiks(RC.Story.MEZIHRA, 'Na Dračí horu!', function () {
        RC.Map.zobraz({ rekni: 'Druhá polovina cesty. Teď se počítá do dvaceti.' });
      });
      return;
    }
    /* Souboj vyhrán – závěrečný komiks a diplom. */
    if (uroven.id === BOSS) {
      RC.State.data.videlKonec = true;
      RC.State.save();
      RC.Story.komiks(RC.Story.KONEC, 'Hurá!', zaverecnaObrazovka);
      return;
    }
    RC.Map.zobraz();
  };

  function zaverecnaObrazovka() {
    RC.Audio.sfx('hotovo');
    RC.FX.konfety(90);

    var scena = RC.el('div');
    scena.innerHTML = RC.Art.kulisa();
    var obsah = RC.el('div', 'obsah uvod');

    obsah.appendChild(RC.el('h1', null, 'Výprava dokončena!'));
    obsah.appendChild(RC.el('h2', null, RC.t('Rytíř{ka} {jmeno} přivezl{a} Zlatý počet domů.')));

    var vystup = RC.el('div', 'uvod-scena');
    var r = RC.el('div'); r.innerHTML = RC.Art.rytir();
    var kniha = RC.el('span', 'rekvizita', '📕');
    kniha.style.fontSize = 'clamp(2rem, 9vh, 5rem)';
    kniha.style.alignSelf = 'center';
    var d = RC.el('div'); d.innerHTML = RC.Art.drak();
    vystup.appendChild(r); vystup.appendChild(kniha); vystup.appendChild(d);
    obsah.appendChild(vystup);

    var hvezdy = RC.el('div', 'hvezdicky');
    hvezdy.style.fontSize = 'clamp(1.2rem, 4vh, 2.2rem)';
    hvezdy.style.color = 'var(--zlata2)';
    for (var i = 0; i < RC.levels.length; i++) {
      var h = RC.el('i', null, '★');
      h.style.animationDelay = (i * 0.09).toFixed(2) + 's';
      hvezdy.appendChild(h);
    }
    obsah.appendChild(hvezdy);

    var tl = RC.el('div', 'uvod-tlacitka');
    tl.appendChild(RC.tlacitko('Procvičovat dál', 'velke', function () {
      RC.Map.zobraz({ rekni: 'Můžeš si každou zastávku zahrát znovu, kdykoli chceš.' });
    }));
    tl.appendChild(RC.tlacitko('Znovu od začátku', 'duch', function () {
      RC.State.reset();
      RC.Story.uvodniObrazovka();
    }));
    obsah.appendChild(tl);

    scena.appendChild(obsah);
    RC.scena(scena);
    setTimeout(function () {
      RC.Voice.rekni('Výprava dokončena! Máš všech ' + RC.levels.length + ' hvězd odvahy. ' +
        (RC.State.zena() ? 'Jsi opravdová rytířka čísel.' : 'Jsi opravdový rytíř čísel.'));
    }, 600);
  }

  RC.Story.uvodniObrazovka();

})();
