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

    function update(){
        const y = window.scrollY * 0.35;
        const offsetFilmes = -(y % metade);
        const offsetSeries = (y % metade) - metade;
        colFilmes.style.transform = `translateY(${offsetFilmes}px)`;
        colSeries.style.transform = `translateY(${offsetSeries}px)`;
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

document.addEventListener('DOMContentLoaded', carregarColunasTmdb);
