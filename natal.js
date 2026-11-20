/* =========================================================
   Avilar — tema de Natal (neve + botão para desligar)
   ========================================================= */
(function(){
  const snow = document.getElementById('snow');
  const btn  = document.getElementById('snowToggle');
  if(!snow || !btn) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  let on = true;
  try{
    const saved = localStorage.getItem('avilar-neve');
    if(saved === 'off') on = false;
  }catch(e){}

  const rand = (a, b) => a + Math.random() * (b - a);
  const count = window.innerWidth <= 640 ? 16 : 30;
  const frag = document.createDocumentFragment();

  for(let i = 0; i < count; i++){
    const f = document.createElement('span');
    f.className = 'snowflake';
    const d = rand(10, 20);
    f.style.setProperty('--x', rand(0, 100).toFixed(1) + '%');
    f.style.setProperty('--s', rand(3, 7).toFixed(1) + 'px');
    f.style.setProperty('--o', rand(0.35, 0.9).toFixed(2));
    f.style.setProperty('--d', d.toFixed(1) + 's');
    f.style.setProperty('--delay', (-rand(0, d)).toFixed(1) + 's');
    f.style.setProperty('--drift', rand(-70, 70).toFixed(0) + 'px');
    frag.appendChild(f);
  }
  snow.appendChild(frag);

  function apply(){
    snow.classList.toggle('off', !on);
    btn.setAttribute('aria-pressed', String(on));
  }
  apply();

  btn.addEventListener('click', ()=>{
    on = !on;
    apply();
    try{ localStorage.setItem('avilar-neve', on ? 'on' : 'off'); }catch(e){}
  });
})();
