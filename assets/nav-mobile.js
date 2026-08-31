(function(){
  function initNav(nav){
    if(nav.querySelector('.nav-burger')) return;
    var links = nav.querySelector('.nlinks');
    if(!links) return;

    var burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.type = 'button';
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span></span><span></span><span></span>';
    nav.insertBefore(burger, links);

    function setOpen(open){
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      document.body.classList.toggle('nav-scroll-lock', open);
    }

    burger.addEventListener('click', function(){
      setOpen(!nav.classList.contains('is-open'));
    });

    links.addEventListener('click', function(e){
      if(e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('click', function(e){
      if(nav.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false);
    });

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') setOpen(false);
    });

    window.addEventListener('resize', function(){
      if(window.innerWidth > 768) setOpen(false);
    });
  }

  function init(){
    document.querySelectorAll('nav.nav').forEach(initNav);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
