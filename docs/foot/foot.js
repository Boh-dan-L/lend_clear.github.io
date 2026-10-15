/* ===== FAQ accordion (smooth height) ===== */
(function(){
  const root = document.querySelector('[data-faq]');
  if(!root) return;

  function closeItem(item){
    const btn = item.querySelector('.bs-faq__q');
    const panel = item.querySelector('.bs-faq__a');
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded','false');
    panel.style.height = panel.scrollHeight + 'px'; // фіксуємо поточну, щоб анімація пішла
    requestAnimationFrame(()=>{ panel.style.height = '0px'; });
  }

  function openItem(item){
    const btn = item.querySelector('.bs-faq__q');
    const panel = item.querySelector('.bs-faq__a');
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded','true');
    panel.style.height = panel.scrollHeight + 'px';
    // після завершення — авто-висота не потрібна, лишаємо фікс для стабільності
  }

  // Делегування кліку
  root.addEventListener('click', (e)=>{
    const btn = e.target.closest('.bs-faq__q');
    if(!btn) return;
    const item = btn.closest('.bs-faq__item');
    const expanded = btn.getAttribute('aria-expanded') === 'true';

    // Якщо хочеш, щоб відкритим був лише один — спочатку закриємо всі
    root.querySelectorAll('.bs-faq__item').forEach(el=>{
      if(el !== item) closeItem(el);
    });

    if(expanded) closeItem(item); else openItem(item);
  });

  // Ініціалізація: все закрито
  root.querySelectorAll('.bs-faq__item').forEach(closeItem);

  // Перерахунок висоти при ресайзі (якщо контент перенісся)
  let rid = null;
  window.addEventListener('resize', ()=>{
    if (rid) cancelAnimationFrame(rid);
    rid = requestAnimationFrame(()=>{
      root.querySelectorAll('.bs-faq__item').forEach(item=>{
        const btn = item.querySelector('.bs-faq__q');
        const panel = item.querySelector('.bs-faq__a');
        if(btn.getAttribute('aria-expanded') === 'true'){
          panel.style.height = 'auto'; // скинь
          panel.style.height = panel.scrollHeight + 'px'; // зафіксуй нову
        }
      });
    });
  });
})();
