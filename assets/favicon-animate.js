(function () {
  "use strict";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var SIZE = 64;
  var PERIOD_MS = 2600;
  var TICK_MS = 120;
  var TEAL_DARK = [13, 79, 92];
  var TEAL_GLOW = [94, 207, 220];

  document.querySelectorAll('link[rel="icon"]').forEach(function (el) { el.remove(); });

  var link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  document.head.appendChild(link);

  var canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  var ctx = canvas.getContext("2d");

  var img = new Image();
  img.src = "assets/favicon-tiger-mask.png";
  img.onload = function () {
    var start = null;
    var timer = null;

    function draw(elapsed) {
      var pulse = (Math.sin((elapsed / PERIOD_MS) * Math.PI * 2) + 1) / 2;
      var c = TEAL_DARK.map(function (v, i) { return Math.round(v + (TEAL_GLOW[i] - v) * pulse); });

      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 1, 0, Math.PI * 2);
      ctx.fillStyle = "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
      ctx.fill();
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      link.href = canvas.toDataURL("image/png");
    }

    function tick() {
      if (document.hidden) return;
      if (start === null) start = Date.now();
      draw(Date.now() - start);
    }

    function play() {
      if (timer) return;
      timer = setInterval(tick, TICK_MS);
      tick();
    }
    function pause() {
      clearInterval(timer);
      timer = null;
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause();
      else { start = null; play(); }
    });

    play();
  };
})();
