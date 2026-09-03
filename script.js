function toggleFAQ(btn){
    const item = btn.parentElement;
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if(!wasActive) item.classList.add('active');
}

/* ===== Colunas de pôsteres (TMDB) com animação ao rolar a página ===== */

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZDNkMGM5YmZlYTdmNjAxOTI0YjgxMGMwNzQ3MTIwMiIsIm5iZiI6MTc3MTk0NDAwNy4yNDgsInN1YiI6IjY5OWRiODQ3MjQwMWRiY2I1OGQ3NDkwNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.tbKJw-MIm0tBV03XFAWKyuewOeyZs4LOt3E17xMtb7I';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w185';
const POSTERS_POR_COLUNA = 10;

async function tmdbFetch(path){
    const res = await fetch(`https://api.themoviedb.org/3/${path}`, {
        headers: {
            Authorization: `Bearer ${TMDB_TOKEN}`,
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    if(!res.ok) throw new Error(`TMDB request failed (${path}): ${res.status}`);
    return res.json();
}

function renderPosterColumn(track, items){
    const validos = items.filter(i => i.poster_path).slice(0, POSTERS_POR_COLUNA);
    const dobrado = [...validos, ...validos];
    track.innerHTML = dobrado.map(item => `
        <img src="${TMDB_IMG}${item.poster_path}"
             alt="${(item.title || item.name || '').replace(/"/g, '&quot;')}"
             loading="lazy">
    `).join('');
}

function initTmdbScrollParallax(){
    const colFilmes = document.getElementById('tmdbMovies');
    const colSeries = document.getElementById('tmdbSeries');
    if(!colFilmes || !colSeries) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduceMotion) return;

    const metade = colFilmes.scrollHeight / 2;
    if(!metade) return;
    let ticking = false;

    /* Efeito "corredor de galeria": as colunas de pôsteres ganham leve
       inclinação em perspectiva, como se fossem paredes de um corredor
       vistas em fuga, enquanto deslizam verticalmente ao rolar. */
    const TILT_MAX = 10;

    function update(){
        const y = window.scrollY * 0.35;
        const offsetFilmes = -(y % metade);
        const offsetSeries = (y % metade) - metade;

        const progresso = Math.min(window.scrollY / 500, 1);
        const tilt = 6 + progresso * TILT_MAX;

        colFilmes.style.transform =
            `translateY(${offsetFilmes}px) perspective(900px) rotateY(-${tilt}deg)`;
        colSeries.style.transform =
            `translateY(${offsetSeries}px) perspective(900px) rotateY(${tilt}deg)`;

        const opacidade = 1 - progresso * 0.5;
        colFilmes.style.opacity = opacidade;
        colSeries.style.opacity = opacidade;

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if(!ticking){
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    update();
}

async function carregarColunasTmdb(){
    const colFilmes = document.getElementById('tmdbMovies');
    const colSeries = document.getElementById('tmdbSeries');
    if(!colFilmes || !colSeries) return;

    try {
        const [filmes, series] = await Promise.all([
            tmdbFetch('trending/movie/week'),
            tmdbFetch('trending/tv/week')
        ]);
        renderPosterColumn(colFilmes, filmes.results);
        renderPosterColumn(colSeries, series.results);
        initTmdbScrollParallax();
    } catch(err){
        console.error('Erro ao carregar pôsteres do TMDB:', err);
    }
}

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
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

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

document.addEventListener('DOMContentLoaded', carregarColunasTmdb);
document.addEventListener('DOMContentLoaded', initScrollReveal);
