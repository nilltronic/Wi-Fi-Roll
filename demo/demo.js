// Demo-mode behaviour shared by the admin pages.
// Replaces the real device: forms don't submit anywhere, stats tick over, and
// "Test sound" plays the selected tune through the browser.
(function () {
  var FREQ = { c: 262, d: 294, e: 330, f: 349, g: 392, a: 440, b: 494, C: 523 };
  // Same tunes as the sketch (notes + beats)
  var TUNES = [
    { n: 'cdfda ag cdfdg gf ', b: [1,1,1,1,1,1,4,4,2,1,1,1,1,1,1,4,4,2] },
    { n: 'cegC',               b: [2,2,2,4] },
    { n: 'Cbagfedc',           b: [2,1,1,1,1,1,1,3] }
  ];
  var ctx = null;

  function play(notes, beats, tempo) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      var t = ctx.currentTime + 0.05;
      for (var i = 0; i < notes.length; i++) {
        var dur = beats[i] * tempo / 1000;
        var f = FREQ[notes[i]];
        if (f) {
          var o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'square';
          o.frequency.value = f;
          g.gain.value = 0.05;
          o.connect(g); g.connect(ctx.destination);
          o.start(t); o.stop(t + dur);
        }
        t += dur + tempo / 10000;      // brief gap between notes, like the sketch
      }
    } catch (e) {}
  }

  window.demoTestSound = function () {
    var notes = TUNES[0].n, beats = TUNES[0].b, tempo = 125;
    var sel = document.querySelector('input[name=tune]:checked');
    if (sel) {
      var t = parseInt(sel.value, 10);
      if (t < TUNES.length) { notes = TUNES[t].n; beats = TUNES[t].b; }
      else {
        var ne = document.querySelector('input[name=notes]');
        notes = (ne && ne.value) || ' ';
        beats = notes.split('').map(function () { return 1; });
      }
    }
    var te = document.querySelector('input[name=tempo]');
    if (te) tempo = parseInt(te.value, 10) || 125;
    play(notes, beats, tempo);
  };

  window.setBuzzer = function (cb) {
    document.getElementById('buzLbl').textContent = cb.checked ? 'Buzzer is ON' : 'Buzzer is OFF';
  };

  function say(text) {
    var m = document.getElementById('demoMsg');
    if (!m) {
      m = document.createElement('div');
      m.id = 'demoMsg';
      m.className = 'msg';
      var h = document.querySelector('h1');
      h.parentNode.insertBefore(m, h.nextSibling);
    }
    m.textContent = text;
    window.scrollTo(0, 0);
  }

  document.addEventListener('submit', function (e) {
    if (e.defaultPrevented) return;          // a confirm() was cancelled
    e.preventDefault();
    var a = (e.submitter && e.submitter.getAttribute('formaction')) || e.target.getAttribute('action') || '';
    if (a === '/admin/reset') {
      document.getElementById('s').textContent = '0';
      document.getElementById('l').textContent = '0';
      say('Stats reset.');
    } else if (a === '/admin/upload') {
      say('Uploads are switched off in the demo.');
    } else {
      say('Demo only: on the real device this would be saved.');
    }
  });

  // Make the live counters tick now and then, like the real page polling the device
  setInterval(function () {
    var s = document.getElementById('s'), l = document.getElementById('l');
    if (s && l && Math.random() < 0.5) {
      s.textContent = (parseInt(s.textContent, 10) || 0) + 1;
      l.textContent = (parseInt(l.textContent, 10) || 0) + 1;
    }
  }, 4000);
})();
