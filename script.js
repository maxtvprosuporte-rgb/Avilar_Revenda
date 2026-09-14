// ---------- Coverflow: Em alta hoje (TMDB) ----------
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

    function render(){
      const isMobile = window.innerWidth <= 640;
      const spacingX = isMobile ? 108 : 175;
      const rotate = isMobile ? -28 : -34;
      const depth = isMobile ? 80 : 130;
      const scaleStep = isMobile ? 0.16 : 0.15;
      const opacityStep = isMobile ? 0.30 : 0.26;

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
        const translateX = offset * spacingX;
        const rotateY = offset * rotate;
        const translateZ = -abs * depth;
        const scale = 1 - abs * scaleStep;
        const opacity = 1 - abs * opacityStep;
        el.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
        el.style.zIndex = 100 - abs;
        el.style.opacity = String(Math.max(opacity, 0));
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

    function buildSlide(r){
      const isMovie = r.media_type === 'movie';
      const title = r.title || r.name || '';
      const dateStr = r.release_date || r.first_air_date || '';
      const year = dateStr ? dateStr.slice(0,4) : '—';
      const rating = typeof r.vote_average === 'number' ? r.vote_average.toFixed(1) : '—';
      return {
        img: `https://image.tmdb.org/t/p/w342${r.poster_path}`,
        title,
        subtitle: isMovie ? 'Filme' : 'Série',
        meta: [
          { label: 'Ano', value: year },
          { label: 'Nota', value: `★ ${rating}` },
        ],
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

        const t = document.createElement('div');
        t.className = 'cf-title';
        t.textContent = s.title;
        cap.appendChild(t);

        const sub = document.createElement('div');
        sub.className = 'cf-subtitle';
        sub.textContent = s.subtitle;
        cap.appendChild(sub);

        const meta = document.createElement('div');
        meta.className = 'cf-meta';
        s.meta.forEach(m=>{
          const span = document.createElement('span');
          span.textContent = m.value;
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
        b.setAttribute('aria-label', 'Ir para item ' + (i+1));
        b.addEventListener('click', ()=>{ currentIndex = i; render(); });
        dotsWrap.appendChild(b);
        return b;
      });

      currentIndex = Math.floor(items.length / 2);
      render();
    }

    fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_KEY}&language=pt-BR`)
      .then(res=>{
        if(!res.ok) throw new Error('TMDB request failed');
        return res.json();
      })
      .then(data=>{
        const results = (data.results || []).filter(r => r.poster_path).slice(0, 16);
        if(!results.length){
          stage.innerHTML = '<div class="cf-loading">Não foi possível carregar os destaques agora.</div>';
          return;
        }
        renderSlides(results.map(buildSlide));
      })
      .catch(()=>{
        stage.innerHTML = '<div class="cf-loading">Não foi possível carregar os destaques agora.</div>';
      });
  })();

  document.querySelectorAll('.marquee-lights').forEach(strip=>{
    strip.querySelectorAll('span').forEach((s,i)=>{
      s.style.animationDelay = (i * 0.08) + 's';
    });
  });

  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .stagger').forEach(el=>{
    revealObserver.observe(el);
  });

  document.querySelectorAll('.faq-item').forEach(item=>{
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(el=>{
        el.classList.remove('open');
        el.querySelector('.faq-a').style.maxHeight = null;
      });
      if(!isOpen){
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });