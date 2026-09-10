/* Rytíř Čísel – propojení příběhu a úrovní
 * Kdy se hraje komiks a co přijde po dokončení zastávky se čte z dat světa
 * (RC.svety), ne z pevných id zastávek – přidat svět tedy nevyžaduje sáhnout sem.
 */
(function () {
  'use strict';
  var RC = window.RC;

  RC.Engine.naMapu = function () { RC.Map.zobraz(); };

  RC.Engine.poDokonceni = function (uroven) {
    var svet = RC.svet(uroven.svet);

    /* Dokončený svět spustí svůj komiks – jednou za profil. */
    if (RC.State.svetDokoncen(svet.id) && !RC.State.videlKomiks(svet.id)) {
      RC.State.oznacKomiks(svet.id);
      var panely = RC.Story[svet.komiksPo];
      if (panely) {
        var dalsiId = RC.State.dalsiSvet(svet.id);
        return RC.Story.komiks(panely, svet.posledni ? 'Hurá!' : 'Jdeme dál!', function () {
          if (svet.posledni || !dalsiId) return zaverecnaObrazovka();
          var dalsi = RC.svet(dalsiId);
          RC.Map.zobraz({
            svet: dalsiId,
            rekni: 'Nový svět: ' + dalsi.nazev + '. Teď se počítá ' + dalsi.kratce + '.'
          });
        });
      }
    }
    RC.Map.zobraz({ svet: svet.id });
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

    var pocet = RC.State.hvezdy();
    var hvezdy = RC.el('div', 'hvezdicky');
    hvezdy.style.fontSize = 'clamp(1.2rem, 4vh, 2.2rem)';
    hvezdy.style.color = 'var(--zlata2)';
    for (var i = 0; i < pocet; i++) {
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
      RC.Voice.rekni('Výprava dokončena! Máš ' + pocet + ' ' +
        RC.mn(pocet, 'hvězdu', 'hvězdy', 'hvězd') + ' odvahy. ' +
        (RC.State.zena() ? 'Jsi opravdová rytířka čísel.' : 'Jsi opravdový rytíř čísel.'));
    }, 600);
  }

  RC.Story.uvodniObrazovka();

})();
