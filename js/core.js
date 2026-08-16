/* Rytíř Čísel – jádro hry
 * Stav, zvuky, český dabing, SVG postavy, efekty, přepínání obrazovek.
 * Žádné závislosti, běží i z file:// (proto klasické skripty, ne ES moduly).
 */
(function () {
  'use strict';

  var RC = (window.RC = { levels: [] });

  /* ---------- malé pomocníky ---------- */

  RC.el = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  RC.rand = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
  RC.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  RC.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  RC.range = function (a, b) {
    var out = [];
    for (var i = a; i <= b; i++) out.push(i);
    return out;
  };
  /* Náhodné pořadí úloh bez opakování, doplněné když dojdou. */
  RC.bag = function (items) {
    var pool = [];
    return function () {
      if (!pool.length) pool = RC.shuffle(items);
      return pool.pop();
    };
  };

  /* ---------- stav a postup ---------- */

  /* Na github.io mají všechna repa jednoho účtu stejný origin, takže i stejné
     localStorage. Klíč proto obsahuje jméno repa, ať si projekty nepřepisují postup. */
  var KEY = 'rytir-cisel-2/postup-v1';
  var State = (RC.State = {
    data: {
      hrdina: null,      // 'kvido' | 'bara'
      hotovo: [],        // id dokončených úrovní
      hvezdy: 0,
      zvuk: true,
      hlas: true,
      videlUvod: false,
      videlMezihru: false,
      videlKonec: false
    },
    load: function () {
      try {
        var raw = localStorage.getItem(KEY);
        if (raw) {
          var saved = JSON.parse(raw);
          for (var k in saved) if (k in this.data) this.data[k] = saved[k];
        }
      } catch (e) { /* soukromý režim – hrajeme bez ukládání */ }
      return this;
    },
    save: function () {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {}
    },
    hotova: function (id) { return this.data.hotovo.indexOf(id) >= 0; },
    dokonci: function (id) {
      if (!this.hotova(id)) {
        this.data.hotovo.push(id);
        this.data.hvezdy++;
      }
      this.save();
    },
    /* Odemčená je první nehotová úroveň a všechny hotové. */
    odemcena: function (index) {
      for (var i = 0; i < index; i++) {
        if (!this.hotova(RC.levels[i].id)) return false;
      }
      return true;
    },
    reset: function () {
      this.data.hotovo = [];
      this.data.hvezdy = 0;
      this.data.videlUvod = false;
      this.data.videlMezihru = false;
      this.data.videlKonec = false;
      this.save();
    },
    zena: function () { return this.data.hrdina === 'bara'; },
    jmeno: function () { return this.zena() ? 'Bára' : 'Kvído'; }
  }).load();

  /* Rodová koncovka: "Zvládl{a} jsi" -> "Zvládla jsi" / "Zvládl jsi",
     "rytíř{ka}" -> "rytířka" / "rytíř". */
  RC.t = function (s) {
    var z = State.zena();
    return String(s)
      .replace(/\{ka\}/g, z ? 'ka' : '')
      .replace(/\{a\}/g, z ? 'a' : '')
      .replace(/\{jmeno\}/g, State.jmeno());
  };

  /* ---------- zvuk ---------- */

  var ctx = null;
  var Audio = (RC.Audio = {
    init: function () {
      if (ctx) return;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { try { ctx = new AC(); } catch (e) {} }
    },
    resume: function () { if (ctx && ctx.state === 'suspended') ctx.resume(); },

    tone: function (freq, dur, type, gain, delay) {
      if (!State.data.zvuk || !ctx) return;
      var t0 = ctx.currentTime + (delay || 0);
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain || 0.18, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t0); osc.stop(t0 + dur + 0.02);
    },
    /* šum – použito pro úder meče a dračí oheň */
    noise: function (dur, gain, freq) {
      if (!State.data.zvuk || !ctx) return;
      var len = Math.floor(ctx.sampleRate * dur);
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = ctx.createBufferSource();
      src.buffer = buf;
      var flt = ctx.createBiquadFilter();
      flt.type = 'bandpass';
      flt.frequency.value = freq || 900;
      var g = ctx.createGain();
      g.gain.value = gain || 0.2;
      src.connect(flt); flt.connect(g); g.connect(ctx.destination);
      src.start();
    },

    sfx: function (name) {
      Audio.init(); Audio.resume();
      switch (name) {
        case 'tap':    Audio.tone(660, 0.09, 'sine', 0.12); break;
        case 'pop':    Audio.tone(880, 0.07, 'triangle', 0.14); break;
        case 'spravne':
          [523, 659, 784].forEach(function (f, i) { Audio.tone(f, 0.16, 'triangle', 0.16, i * 0.07); });
          break;
        case 'hotovo':
          [523, 659, 784, 1046].forEach(function (f, i) { Audio.tone(f, 0.3, 'triangle', 0.18, i * 0.11); });
          break;
        case 'vedle':  Audio.tone(300, 0.16, 'sine', 0.12); Audio.tone(220, 0.22, 'sine', 0.1, 0.09); break;
        case 'krok':   Audio.tone(420, 0.06, 'square', 0.07); break;
        case 'mec':    Audio.noise(0.22, 0.16, 1800); Audio.tone(180, 0.16, 'sawtooth', 0.08); break;
        case 'ohen':   Audio.noise(0.5, 0.12, 380); break;
        case 'odemk':  [392, 523, 659].forEach(function (f, i) { Audio.tone(f, 0.2, 'sine', 0.15, i * 0.09); });
          break;
      }
    },

    /* Rostoucí tón při počítání 1,2,3… */
    countTone: function (n) {
      Audio.init(); Audio.resume();
      Audio.tone(392 + n * 42, 0.11, 'triangle', 0.13);
    }
  });

  /* ---------- český dabing (Web Speech API) ----------
   * Věty se řadí do fronty a čekají jedna na druhou. Nic se neutne v půlce:
   * „pět plus pět je deset“ se vždycky dopoví celé a teprve pak jde hra dál
   * (Engine.api.hotovo čeká přes Voice.potom, než fronta domluví).
   * Přeruší se jen to, co si vyžádá dítě samo – 🔊, další panel komiksu,
   * odchod ze scény nebo další pokus po chybě.
   */

  var Voice = (RC.Voice = {
    hlas: null,
    pripraven: false,

    _fronta: [],     // věty, které čekají, až na ně přijde řada
    _bezi: null,     // právě říkaná věta
    _pak: [],        // co se má spustit, až se dopoví všechno
    _selhani: 0,     // kolikrát po sobě se nepovedlo promluvit

    najdi: function () {
      if (!window.speechSynthesis) return;
      var vs = speechSynthesis.getVoices() || [];
      var cz = vs.filter(function (v) { return /^cs/i.test(v.lang); });
      Voice.hlas = cz[0] || null;
      Voice.pripraven = vs.length > 0;
    },

    /* Mluví se, nebo něco čeká ve frontě? */
    mluvi: function () { return !!Voice._bezi || Voice._fronta.length > 0; },

    /* Když hlas chybí nebo třikrát po sobě selhal, hra běží dál jen s textem. */
    zapnuty: function () {
      return !!(State.data.hlas && window.speechSynthesis && Voice._selhani < 3);
    },

    /* rekni(text)                – zařadí se za to, co se právě říká
       rekni(text, {prerus:true}) – utne, co běží, a řekne tohle */
    rekni: function (text, opts) {
      opts = opts || {};
      text = text == null ? '' : String(text).replace(/\s+/g, ' ').trim();
      if (opts.prerus) Voice._zahod();
      if (!text || !Voice.zapnuty()) { Voice._odbav(); return; }
      Voice._fronta.push({ text: text, rate: opts.rate || 0.95, pitch: opts.pitch || 1.05 });
      Voice._pust();
    },

    /* Spustí fn, až se dopoví všechno ve frontě. Když se nemluví, hned. */
    potom: function (fn) {
      if (typeof fn !== 'function') return;
      if (!Voice.mluvi()) { setTimeout(fn, 0); return; }
      Voice._pak.push(fn);
    },

    /* Ticho. Čekající pokračování se pustí dál, ať hra nikde neuvízne. */
    ticho: function () {
      Voice._zahod();
      Voice._odbav();
    },

    _zahod: function () {
      Voice._fronta.length = 0;
      var b = Voice._bezi;
      Voice._bezi = null;
      if (b) clearTimeout(b.hlidac);
      if (window.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} }
    },

    _odbav: function () {
      if (Voice.mluvi()) return;
      var cekaji = Voice._pak;
      Voice._pak = [];
      for (var i = 0; i < cekaji.length; i++) {
        try { cekaji[i](); } catch (e) {}
      }
    },

    _pust: function () {
      if (Voice._bezi || !Voice._fronta.length) return;
      var veta = Voice._fronta.shift();
      var zaznam = { hotova: false };
      Voice._bezi = zaznam;

      function konec(selhalo) {
        if (Voice._bezi !== zaznam || zaznam.hotova) return;   // mezitím se přerušilo
        zaznam.hotova = true;
        clearTimeout(zaznam.hlidac);
        Voice._bezi = null;
        Voice._selhani = selhalo ? Voice._selhani + 1 : 0;
        if (Voice._fronta.length) Voice._pust();
        else Voice._odbav();
      }

      /* Pojistka: kdyby prohlížeč konec věty neohlásil, hra se nesmí zaseknout. */
      zaznam.hlidac = setTimeout(function () { konec(true); }, 1800 + veta.text.length * 110);

      /* Chrome umí zahodit speak() volaný hned po cancel() – dáme mu chvilku. */
      setTimeout(function () {
        if (Voice._bezi !== zaznam) return;
        try {
          var u = new SpeechSynthesisUtterance(veta.text);
          u.lang = 'cs-CZ';
          if (Voice.hlas) u.voice = Voice.hlas;
          u.rate = veta.rate;
          u.pitch = veta.pitch;
          u.onend = function () { konec(false); };
          u.onerror = function (e) {
            var duvod = e && e.error;
            konec(!(duvod === 'canceled' || duvod === 'interrupted'));
          };
          speechSynthesis.speak(u);
          if (speechSynthesis.paused) speechSynthesis.resume();   // Chrome se občas sám pozastaví
        } catch (e) { konec(true); }
      }, 60);
    }
  });
  if (window.speechSynthesis) {
    Voice.najdi();
    speechSynthesis.onvoiceschanged = Voice.najdi;
  }

  /* ---------- efekty ---------- */

  var fxLayer = null;
  function fx() { return (fxLayer = fxLayer || document.getElementById('fx')); }

  RC.FX = {
    konfety: function (n) {
      var barvy = ['#f2b544', '#e0575b', '#4ec3a5', '#6ea8ff', '#f8f2e2', '#c78bff'];
      var host = fx();
      for (var i = 0; i < (n || 34); i++) {
        var p = RC.el('i', 'konfeta');
        p.style.left = RC.rand(4, 96) + '%';
        p.style.background = RC.pick(barvy);
        p.style.animationDelay = (Math.random() * 0.35).toFixed(2) + 's';
        p.style.animationDuration = (1.5 + Math.random() * 1.1).toFixed(2) + 's';
        p.style.setProperty('--otoc', RC.rand(-320, 320) + 'deg');
        host.appendChild(p);
        (function (node) { setTimeout(function () { node.remove(); }, 3200); })(p);
      }
    },
    jiskry: function (elem, n) {
      if (!elem) return;
      var r = elem.getBoundingClientRect();
      var host = fx();
      for (var i = 0; i < (n || 10); i++) {
        var s = RC.el('i', 'jiskra');
        s.style.left = (r.left + Math.random() * r.width) + 'px';
        s.style.top = (r.top + Math.random() * r.height) + 'px';
        s.style.animationDelay = (Math.random() * 0.2).toFixed(2) + 's';
        host.appendChild(s);
        (function (node) { setTimeout(function () { node.remove(); }, 1000); })(s);
      }
    },
    zatres: function (elem) {
      if (!elem) return;
      elem.classList.remove('zatres');
      void elem.offsetWidth;
      elem.classList.add('zatres');
    },
    /* Velký nápis přes obrazovku – "Výborně!" */
    napis: function (text) {
      var n = RC.el('div', 'velky-napis', text);
      fx().appendChild(n);
      setTimeout(function () { n.remove(); }, 1400);
    }
  };

  /* ---------- SVG postavy a kulisy ---------- */

  RC.Art = {
    rytir: function (opts) {
      opts = opts || {};
      var z = opts.zena != null ? opts.zena : State.zena();
      var plast = z ? '#c74f8a' : '#3f6bd8';
      var plastTmavy = z ? '#9c336a' : '#2a4da8';
      var chochol = z ? '#ffd166' : '#e0575b';
      return '' +
      '<svg class="postava rytir ' + (opts.cls || '') + '" viewBox="0 0 120 150" aria-hidden="true">' +
        '<ellipse class="stin" cx="60" cy="143" rx="30" ry="6"/>' +
        '<g class="rytir-telo">' +
          // plášť
          '<path d="M32 62 Q60 52 88 62 L96 126 Q60 136 24 126 Z" fill="' + plastTmavy + '"/>' +
          // nohy
          '<rect x="46" y="112" width="12" height="26" rx="5" fill="#4b5566"/>' +
          '<rect x="62" y="112" width="12" height="26" rx="5" fill="#4b5566"/>' +
          '<rect x="42" y="132" width="20" height="9" rx="4" fill="#3a2a1e"/>' +
          '<rect x="58" y="132" width="20" height="9" rx="4" fill="#4a382a"/>' +
          // trup
          '<path d="M38 60 Q60 54 82 60 L86 116 Q60 124 34 116 Z" fill="#aeb8c6"/>' +
          '<path d="M52 60 h16 v56 h-16 Z" fill="' + plast + '"/>' +
          '<path d="M56 72 h8 v10 h-8 Z M52 78 h16 v8 h-16 Z" fill="#f2d38a"/>' +
          // helma
          '<g class="rytir-hlava">' +
            '<path d="M42 46 Q60 -2 78 46 Z" fill="' + chochol + '"/>' +
            '<path d="M38 40 Q60 12 82 40 L82 56 Q60 66 38 56 Z" fill="#c3ccd8"/>' +
            '<rect x="40" y="40" width="40" height="7" rx="3" fill="#1b2233"/>' +
            '<rect x="52" y="47" width="5" height="12" rx="2" fill="#1b2233"/>' +
            '<rect x="63" y="47" width="5" height="12" rx="2" fill="#1b2233"/>' +
            '<path d="M38 40 Q60 30 82 40" fill="none" stroke="#eef3fa" stroke-width="3" stroke-linecap="round"/>' +
          '</g>' +
          // štít
          '<g class="rytir-stit">' +
            '<path d="M14 66 L40 60 L40 100 Q27 112 14 100 Z" fill="#3f6bd8" stroke="#f2b544" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M27 70 v22 M18 79 h18" stroke="#f2b544" stroke-width="4" stroke-linecap="round"/>' +
          '</g>' +
          // meč
          '<g class="rytir-mec">' +
            '<rect x="92" y="18" width="7" height="52" rx="3" fill="#e6edf7"/>' +
            '<path d="M92 18 h7 l-3.5 -12 Z" fill="#f8fbff"/>' +
            '<rect x="83" y="68" width="25" height="7" rx="3" fill="#f2b544"/>' +
            '<rect x="92" y="74" width="7" height="16" rx="3" fill="#7a4a24"/>' +
          '</g>' +
        '</g>' +
      '</svg>';
    },

    drak: function (opts) {
      opts = opts || {};
      return '' +
      '<svg class="postava drak ' + (opts.cls || '') + '" viewBox="0 0 220 170" aria-hidden="true">' +
        '<ellipse class="stin" cx="118" cy="162" rx="62" ry="8"/>' +
        '<g class="drak-telo">' +
          '<g class="drak-kridlo drak-kridlo-zad">' +
            '<path d="M104 66 Q60 6 24 34 Q52 44 46 66 Q70 58 74 78 Z" fill="#2f7d5c"/>' +
          '</g>' +
          // ocas
          '<path d="M156 118 Q210 118 202 78 Q196 104 162 100 Z" fill="#3e9c72"/>' +
          // tělo
          '<ellipse cx="120" cy="112" rx="52" ry="42" fill="#43a97c"/>' +
          '<ellipse cx="116" cy="122" rx="34" ry="27" fill="#bfe8b8"/>' +
          // nohy
          '<path d="M86 144 q-6 12 6 14 h18 q6 -8 -4 -14 Z" fill="#2f7d5c"/>' +
          '<path d="M132 146 q-4 12 8 12 h16 q6 -8 -6 -12 Z" fill="#2f7d5c"/>' +
          // krk a hlava
          '<path d="M96 86 Q76 44 96 26 Q120 12 138 30 L128 74 Z" fill="#43a97c"/>' +
          '<g class="drak-hlava">' +
            '<ellipse cx="116" cy="32" rx="36" ry="27" fill="#4bbd8a"/>' +
            '<path d="M84 34 Q62 30 58 40 Q74 46 88 44 Z" fill="#4bbd8a"/>' +   // čenich
            '<circle cx="70" cy="38" r="2.6" fill="#20573f"/>' +
            '<path d="M96 8 L88 -6 L106 4 Z" fill="#f2d38a"/>' +
            '<path d="M126 6 L124 -10 L138 4 Z" fill="#f2d38a"/>' +
            '<g class="drak-oko">' +
              '<ellipse cx="100" cy="28" rx="10" ry="11" fill="#fff8e6"/>' +
              '<circle cx="98" cy="29" r="5" fill="#1d2b22"/>' +
              '<circle cx="100" cy="26" r="1.8" fill="#fff"/>' +
            '</g>' +
            '<path d="M78 48 q14 8 30 5" fill="none" stroke="#20573f" stroke-width="2.5" stroke-linecap="round"/>' +
            '<path d="M84 46 l4 7 l5 -6 Z" fill="#fff"/>' +
          '</g>' +
          // hřbetní ostny
          '<path d="M120 68 l8 -14 l8 14 Z M138 76 l8 -13 l8 13 Z M156 88 l8 -12 l7 13 Z" fill="#f2d38a"/>' +
          '<g class="drak-kridlo drak-kridlo-pred">' +
            '<path d="M126 74 Q104 8 152 8 Q140 34 166 44 Q148 54 156 82 Z" fill="#3e9c72"/>' +
          '</g>' +
        '</g>' +
        '<g class="drak-ohen"><path d="M58 40 q-32 2 -50 -8 q22 16 50 14 Z" fill="#ff9d2e"/></g>' +
      '</svg>';
    },

    /* Kulisa: hory, hrad, měsíc, hvězdy – kreslí se za obsah scény.
     * Poměr 4:3 je blízko poměru tabletu, takže „slice“ odřízne jen málo
     * a měsíc s hradem zůstanou tam, kam patří (mimo obsah scény). */
    kulisa: function (varianta) {
      var hvezdy = '';
      for (var i = 0; i < 30; i++) {
        hvezdy += '<circle class="hvezdicka" cx="' + RC.rand(2, 398) + '" cy="' + RC.rand(8, 140) +
                  '" r="' + (Math.random() * 1.4 + 0.7).toFixed(1) + '" fill="#fff" opacity="' +
                  (0.3 + Math.random() * 0.6).toFixed(2) + '" style="animation-delay:' +
                  (Math.random() * 3).toFixed(1) + 's"/>';
      }
      /* Nad Dračí horou přelétá drak. */
      var drak = varianta === 'hora'
        ? '<g class="kulisa-drak"><ellipse cx="300" cy="150" rx="12" ry="4" fill="#1a2b22"/>' +
          '<path d="M292 148 q-10 -10 -18 -6 q10 2 12 8 Z M308 148 q10 -10 18 -6 q-10 2 -12 8 Z" fill="#1a2b22"/></g>'
        : '';
      /* Měsíc uhýbá obsahu scény: na hoře doleva nad hrad, jinak vpravo. */
      var mesic = varianta === 'hora'
        ? '<circle cx="66" cy="92" r="21" fill="#ffe7a8" opacity=".85"/>'
        : '<circle cx="338" cy="90" r="23" fill="#ffe7a8" opacity=".85"/>';
      return '' +
      '<svg class="kulisa" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
        '<defs>' +
          '<linearGradient id="obloha" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#2b1b52"/><stop offset="60%" stop-color="#5b3a7e"/>' +
            '<stop offset="100%" stop-color="#c9668a"/></linearGradient>' +
        '</defs>' +
        '<rect width="400" height="300" fill="url(#obloha)"/>' +
        hvezdy +
        mesic +
        drak +
        '<path class="vrstva v3" d="M0 232 L54 184 L96 222 L150 166 L206 224 L262 178 L318 226 L368 190 L400 228 L400 300 L0 300 Z" fill="#2e2350"/>' +
        '<path class="vrstva v2" d="M0 256 L60 216 L118 252 L176 208 L236 250 L300 212 L360 252 L400 230 L400 300 L0 300 Z" fill="#241a42"/>' +
        /* Hrad drží u levého okraje, aby nelezl do obsahu scény. */
        '<g class="kulisa-hrad">' +
          '<rect x="44" y="220" width="44" height="40" fill="#1a1233"/>' +
          '<rect x="36" y="206" width="14" height="54" fill="#1a1233"/>' +
          '<rect x="82" y="200" width="16" height="60" fill="#1a1233"/>' +
          '<path d="M36 206 l7 -14 l7 14 Z M82 200 l8 -16 l8 16 Z" fill="#1a1233"/>' +
          '<rect x="40" y="220" width="5" height="7" fill="#f2b544" opacity=".55"/>' +
          '<rect x="87" y="214" width="5" height="7" fill="#f2b544" opacity=".55"/>' +
          '<rect x="60" y="238" width="10" height="22" rx="5" fill="#c08f38" opacity=".45"/>' +
        '</g>' +
        '<path class="vrstva v1" d="M0 278 L70 256 L140 276 L210 254 L280 278 L350 258 L400 276 L400 300 L0 300 Z" fill="#1b1338"/>' +
      '</svg>';
    }
  };

  /* ---------- přepínání obrazovek ---------- */

  var app = null;
  RC.scena = function (node, opts) {
    opts = opts || {};
    app = app || document.getElementById('app');
    Voice.ticho();
    var stara = app.firstElementChild;
    if (stara) {
      stara.classList.add('odchazi');
      setTimeout(function () { stara.remove(); }, 260);
    }
    node.classList.add('scena', 'prichazi');
    app.appendChild(node);
    // vynutit reflow, aby naskočila animace příchodu
    void node.offsetWidth;
    node.classList.remove('prichazi');
    if (opts.rekni) setTimeout(function () { Voice.rekni(opts.rekni); }, 350);
    return node;
  };

  /* Tlačítko s ikonou + popiskem, velké pro dotyk na tabletu. */
  RC.tlacitko = function (text, cls, onClick) {
    var b = RC.el('button', 'tl ' + (cls || ''), text);
    b.type = 'button';
    b.addEventListener('click', function (e) {
      Audio.sfx('tap');
      onClick && onClick(e, b);
    });
    return b;
  };

  /* První dotyk odemkne zvuk na iOS/Androidu. */
  document.addEventListener('pointerdown', function once() {
    Audio.init(); Audio.resume();
    document.removeEventListener('pointerdown', once);
  }, { passive: true });

  /* Na tabletu nechceme dvojklik-zoom ani gumové posouvání. */
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  document.addEventListener('dblclick', function (e) { e.preventDefault(); });

})();
