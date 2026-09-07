(function(){
  var items = ['ma boulangerie','ma boucherie','ma plateforme industrielle','mon restaurant','mon hôtel','mon institut de beauté','mon exploitation agricole','mon lieu de réception'];
  var input = document.getElementById('heroSearchInput');
  var mirror = document.getElementById('heroSearchMirror');
  var caret = document.getElementById('heroSearchCaret');
  if(!input) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hi = 0;
  var typing = false;

  function idle(){ return document.activeElement !== input && !input.value; }
  function syncCaret(){ if(caret) caret.classList.toggle('hide', !idle()); }
  function updateCaretPos(){
    if(!mirror || !caret) return;
    mirror.textContent = input.value || input.placeholder || '';
    caret.style.left = mirror.offsetWidth + 'px';
  }

  function typeCycle(){
    if(!idle() || typing) return;
    typing = true;
    var current = input.placeholder;
    var i = current.length;
    (function erase(){
      if(!idle()){ typing = false; return; }
      if(i > 0){
        i--;
        input.placeholder = current.slice(0, i);
        updateCaretPos();
        setTimeout(erase, 20);
        return;
      }
      hi = (hi + 1) % items.length;
      var next = items[hi], j = 0;
      (function type(){
        if(!idle()){ typing = false; return; }
        if(j <= next.length){
          input.placeholder = next.slice(0, j);
          updateCaretPos();
          j++;
          setTimeout(type, 32);
        } else {
          typing = false;
        }
      })();
    })();
  }

  updateCaretPos();
  if(!reduceMotion){ setInterval(typeCycle, 2600); }

  input.addEventListener('focus', syncCaret);
  input.addEventListener('blur', syncCaret);
  input.addEventListener('input', function(){ syncCaret(); updateCaretPos(); });
})();
