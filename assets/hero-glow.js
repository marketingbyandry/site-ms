(function(){
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var hero = document.querySelector('.phero');
  var glow = document.querySelector('.phero-glow');
  if(!hero || !glow) return;
  var heroRect = hero.getBoundingClientRect();
  var restRect = glow.getBoundingClientRect();
  var restX = restRect.left - heroRect.left;
  var restY = restRect.top - heroRect.top;
  var w = glow.offsetWidth, h = glow.offsetHeight;
  var tx = null, ty = null, cx = 0, cy = 0, raf = null;
  hero.addEventListener('mousemove', function(e){
    var r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left - w / 2) - restX;
    ty = (e.clientY - r.top - h / 2) - restY;
    if (!raf) raf = requestAnimationFrame(step);
  });
  hero.addEventListener('mouseleave', function(){ tx = null; });
  function step(){
    if (tx === null) { raf = null; return; }
    cx += (tx - cx) * .12;
    cy += (ty - cy) * .12;
    glow.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    raf = requestAnimationFrame(step);
  }
})();
