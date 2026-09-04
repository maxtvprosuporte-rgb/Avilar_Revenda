function toggleFAQ(btn){
    const item = btn.parentElement;
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if(!wasActive) item.classList.add('active');
}

/* ===== Capas de filmes/séries (TMDB) removidas por enquanto.
   Aqui entrava a busca na API e o efeito de corredor nas laterais
   do hero — voltamos a adicionar isso em uma próxima etapa. ===== */

/* ===== Revelação em galeria: seções e cards entram suavemente
   conforme o usuário rola a página, como painéis expostos ===== */
function initScrollReveal(){
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduceMotion) return;

    const gruposEmGrade = [
        '.destaques-grid > *',
        '.sistemas-grid > *',
        '.diferenciais-grid > *',
        '.comparativo-grid > *',
        '.apps-grid > *',
        '.avaliacoes-grid > *',
        '.faq-container > *'
    ];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

    gruposEmGrade.forEach(seletor => {
        document.querySelectorAll(seletor).forEach((el, i) => {
            el.classList.add('reveal');
            el.style.transitionDelay = `${Math.min(i, 5) * 90}ms`;
            observer.observe(el);
        });
    });

    const cabecalhos = document.querySelectorAll(
        '#sistemas .titulo, #sistemas .subtexto, ' +
        '#diferenciais .titulo, #diferenciais .subtexto, ' +
        '#comparativo .titulo, #comparativo .subtexto, ' +
        '#aplicativos .titulo, #aplicativos .subtexto, ' +
        '#avaliacoes .titulo, #avaliacoes .subtexto, ' +
        '#faq .titulo, #faq .subtexto, ' +
        '.cta-teste .titulo, .cta-teste .subtexto, .cta-teste .btn-cta-teste'
    );
    cabecalhos.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

/* ===== Animação do texto principal no scroll: título/subtítulo
   crescem e desaparecem, revelando os números (canais, filmes, séries) ===== */
function initHeroTextScroll(){
    const wrap = document.querySelector('.hero-pin-wrap');
    const badge = document.querySelector('.hero-badge');
    const titulo = document.querySelector('.hero-titulo');
    const subtexto = document.querySelector('.hero-subtexto');
    const stats = document.querySelector('.stats-container');
    const hint = document.querySelector('.hero-scroll-hint');
    if(!wrap || !titulo || !stats) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduceMotion) return;

    const elementosTexto = [badge, titulo, subtexto].filter(Boolean);

    // Assim que a animação de entrada (fadeInUp) de cada elemento termina,
    // "solta" a propriedade animation para que o controle via scroll
    // (JS) passe a valer sem disputa com a keyframe de entrada.
    elementosTexto.forEach(el => {
        el.addEventListener('animationend', () => {
            el.style.animation = 'none';
        }, { once: true });
    });

    wrap.classList.add('js-active');

    let ticking = false;

    function update(){
        const rect = wrap.getBoundingClientRect();
        const pinDistance = wrap.offsetHeight - window.innerHeight;
        let progresso = pinDistance > 0 ? (-rect.top) / pinDistance : 0;
        progresso = Math.max(0, Math.min(1, progresso));

        /* Fase 1 (0 → 45% do scroll do hero): título, subtítulo e badge
           crescem, desfocam e desaparecem — como se saíssem da tela. */
        const textoProgresso = Math.max(0, Math.min(1, progresso / 0.45));
        const escala = 1 + textoProgresso * 1.8;
        const opacidadeTexto = 1 - textoProgresso;
        const desfoque = textoProgresso * 7;

        elementosTexto.forEach(el => {
            el.style.transform = `scale(${escala.toFixed(3)})`;
            el.style.opacity = opacidadeTexto.toFixed(3);
            el.style.filter = desfoque > 0.15 ? `blur(${desfoque.toFixed(2)}px)` : 'none';
            el.style.pointerEvents = textoProgresso > 0.6 ? 'none' : 'auto';
        });

        if(hint){
            hint.style.opacity = Math.max(0, 1 - progresso / 0.18).toFixed(3);
        }

        /* Fase 2 (32% → 72% do scroll do hero): os números de canais,
           filmes e séries aparecem crescendo suavemente. */
        const statsProgresso = Math.max(0, Math.min(1, (progresso - 0.32) / 0.4));
        stats.style.opacity = statsProgresso.toFixed(3);
        stats.style.transform = `scale(${(0.7 + statsProgresso * 0.3).toFixed(3)})`;

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if(!ticking){
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
    window.addEventListener('resize', update);

    update();
}

document.addEventListener('DOMContentLoaded', initScrollReveal);
document.addEventListener('DOMContentLoaded', initHeroTextScroll);
