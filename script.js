/* =========================================================
   Avilar — interactions
   ========================================================= */

/* ---------- Coverflow: Em alta hoje (TMDB) ---------- */
(function(){
  const TMDB_KEY = 'ed3d0c9bfea7f601924b810c07471202';
  const stage = document.getElementById('cfStage');
  const dotsWrap = document.getElementById('cfDots');
  const prevBtn = document.getElementById('cfPrev');
  const nextBtn = document.getElementById('cfNext');
  if(!stage) return;

  let items = [];
  let dots = [];
  let currentIndex = 0;
  let allResults = [];
  let kind = 'all';

  function render(){
    const isMobile = window.innerWidth <= 640;
    const spacingX = isMobile ? 104 : 168;
    const rotate = isMobile ? -26 : -32;
    const depth = isMobile ? 80 : 128;
    const scaleStep = isMobile ? 0.16 : 0.15;
    const opacityStep = isMobile ? 0.32 : 0.28;

    items.forEach((el, i)=>{
      const offset = i - currentIndex;
      const abs = Math.abs(offset);
      el.classList.toggle('is-center', offset === 0);
      if(abs > 4){
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        return;
      }
      el.style.pointerEvents = 'auto';
      el.style.transform =
        `translateX(${offset * spacingX}px) translateZ(${-abs * depth}px) ` +
        `rotateY(${offset * rotate}deg) scale(${1 - abs * scaleStep})`;
      el.style.zIndex = String(100 - abs);
      el.style.opacity = String(Math.max(1 - abs * opacityStep, 0));
    });

    dots.forEach((d, i)=> d.classList.toggle('is-active', i === currentIndex));
  }

  let resizeTimer;
  window.addEventListener('resize', ()=>{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });

  function go(delta){
    currentIndex = Math.max(0, Math.min(items.length - 1, currentIndex + delta));
    render();
  }

  prevBtn && prevBtn.addEventListener('click', ()=>go(-1));
  nextBtn && nextBtn.addEventListener('click', ()=>go(1));

  let dragStartX = null;
  stage.addEventListener('pointerdown', e=>{ dragStartX = e.clientX; });
  stage.addEventListener('pointerup', e=>{
    if(dragStartX === null) return;
    const delta = e.clientX - dragStartX;
    if(delta > 40) go(-1);
    else if(delta < -40) go(1);
    dragStartX = null;
  });
  stage.addEventListener('pointercancel', ()=>{ dragStartX = null; });

  document.addEventListener('keydown', e=>{
    if(!items.length) return;
    if(e.key === 'ArrowLeft') go(-1);
    if(e.key === 'ArrowRight') go(1);
  });

  function buildSlide(r){
    const isMovie = r.media_type === 'movie';
    const year = (r.release_date || r.first_air_date || '').slice(0, 4) || '—';
    const rating = typeof r.vote_average === 'number' ? r.vote_average.toFixed(1) : '—';
    return {
      img: `https://image.tmdb.org/t/p/w342${r.poster_path}`,
      title: r.title || r.name || '',
      subtitle: isMovie ? 'Filme' : 'Série',
      meta: [year, `★ ${rating}`],
    };
  }

  function renderSlides(slides){
    stage.innerHTML = '';
    dotsWrap.innerHTML = '';

    items = slides.map((s, i)=>{
      const el = document.createElement('div');
      el.className = 'cf-item';

      const img = document.createElement('img');
      img.src = s.img;
      img.alt = s.title;
      img.loading = 'lazy';
      el.appendChild(img);

      const cap = document.createElement('div');
      cap.className = 'cf-caption';

      const title = document.createElement('div');
      title.className = 'cf-title';
      title.textContent = s.title;
      cap.appendChild(title);

      const sub = document.createElement('div');
      sub.className = 'cf-subtitle';
      sub.textContent = s.subtitle;
      cap.appendChild(sub);

      const meta = document.createElement('div');
      meta.className = 'cf-meta';
      s.meta.forEach(v=>{
        const span = document.createElement('span');
        span.textContent = v;
        meta.appendChild(span);
      });
      cap.appendChild(meta);

      el.appendChild(cap);
      el.addEventListener('click', ()=>{ currentIndex = i; render(); });
      stage.appendChild(el);
      return el;
    });

    dots = slides.map((_, i)=>{
      const b = document.createElement('button');
      b.className = 'cf-dot';
      b.setAttribute('aria-label', 'Ir para o destaque ' + (i + 1));
      b.addEventListener('click', ()=>{ currentIndex = i; render(); });
      dotsWrap.appendChild(b);
      return b;
    });

    currentIndex = Math.floor(items.length / 2);
    render();
  }

  function applyFilter(k){
    kind = k;
    const filtered = k === 'all'
      ? allResults
      : allResults.filter(r => r.media_type === k);
    const slice = filtered.slice(0, 16);

    if(!slice.length){
      stage.innerHTML = '<div class="cf-loading">Nada encontrado nessa categoria hoje.</div>';
      dotsWrap.innerHTML = '';
      items = [];
      dots = [];
      return;
    }
    renderSlides(slice.map(buildSlide));
  }

  const filterBtns = document.querySelectorAll('.cf-filter');
  filterBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      filterBtns.forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilter(btn.dataset.filter);
    });
  });

  fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_KEY}&language=pt-BR`)
    .then(res=>{
      if(!res.ok) throw new Error('TMDB request failed');
      return res.json();
    })
    .then(data=>{
      allResults = (data.results || []).filter(
        r => r.poster_path && (r.media_type === 'movie' || r.media_type === 'tv')
      );
      if(!allResults.length) throw new Error('empty');
      applyFilter(kind);
    })
    .catch(()=>{
      stage.innerHTML = '<div class="cf-loading">Não foi possível carregar os destaques agora. Tente recarregar a página.</div>';
    });
})();

/* ---------- Scroll reveal ---------- */
(function(){
  const targets = document.querySelectorAll('.reveal, .stagger');

  if(!('IntersectionObserver' in window)){
    targets.forEach(el=>el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el=>observer.observe(el));
})();

/* ---------- FAQ ---------- */
(function(){
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item=>{
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if(!q || !a) return;

    q.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');

      faqItems.forEach(other=>{
        if(other === item) return;
        other.classList.remove('open');
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-a').style.maxHeight = null;
      });

      if(isOpen){
        item.classList.remove('open');
        q.setAttribute('aria-expanded', 'false');
        a.style.maxHeight = null;
      } else {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  window.addEventListener('resize', ()=>{
    const open = document.querySelector('.faq-item.open .faq-a');
    if(open) open.style.maxHeight = open.scrollHeight + 'px';
  });
})();
