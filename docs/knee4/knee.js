/* ===== COUNTDOWN: multi-instance ===== */
(function(){
  const nodes = Array.from(document.querySelectorAll('.bs-countdown'));
  if (!nodes.length) return;

  function pad(n){ return String(n).padStart(2,'0'); }

  function getDeadlineFor(el){
    const mode = el.getAttribute('data-mode') || 'rolling';
    const now = new Date();

    if (mode === 'daily'){
      const end = new Date(now);
      end.setHours(23,59,59,999);
      return end;
    }
    if (mode === 'rolling'){
      const end = new Date(now);
      const nextHour = Math.ceil(now.getHours()/2)*2;
      end.setHours(nextHour,0,0,0);
      if (end <= now) end.setHours(end.getHours()+2);
      return end;
    }
    if (mode === 'fixed'){
      const s = el.getAttribute('data-deadline');
      return s ? new Date(s) : new Date(now.getTime());
    }
    if (mode === 'duration'){
      // тривалість у мс (за замовч. 2 години)
      const key = el.getAttribute('data-key') || 'bs-countdown-duration';
      const durationMs = +(el.getAttribute('data-duration-ms') || 7200000);
      let end = +localStorage.getItem(key);
      if (!end || Date.now() > end) {
        end = Date.now() + durationMs;
        localStorage.setItem(key, end);
      }
      // запам'ятовуємо для автоперезапуску
      el._durationKey = key;
      el._durationMs = durationMs;
      return new Date(end);
    }
    return new Date(now.getTime());
  }

  const timers = nodes.map(el => ({
    el,
    mode: el.getAttribute('data-mode') || 'rolling',
    dEl: el.querySelector('[data-part="days"]'),
    hEl: el.querySelector('[data-part="hours"]'),
    mEl: el.querySelector('[data-part="minutes"]'),
    sEl: el.querySelector('[data-part="seconds"]'),
    getEnd: () => getDeadlineFor(el),
    end: null
  }));

  timers.forEach(t => { t.end = t.getEnd(); });

  function updateOne(t){
    let now = new Date();
    let diff = t.end - now;

    if (diff <= 0){
      if (t.mode === 'duration'){
        const key = t.el._durationKey || 'bs-countdown-duration';
        const ms = t.el._durationMs || 7200000;
        const newEnd = Date.now() + ms;
        localStorage.setItem(key, newEnd);
        t.end = new Date(newEnd);
      } else {
        t.end = t.getEnd();
      }
      diff = t.end - now;
    }

    let days = Math.floor(diff/86400000); diff -= days*86400000;
    let hours = Math.floor(diff/3600000); diff -= hours*3600000;
    let minutes = Math.floor(diff/60000); diff -= minutes*60000;
    let seconds = Math.floor(diff/1000);

    if (t.dEl) t.dEl.textContent = pad(days);
    if (t.hEl) t.hEl.textContent = pad(hours);
    if (t.mEl) t.mEl.textContent = pad(minutes);
    if (t.sEl) t.sEl.textContent = pad(seconds);
  }

  // первинний рендер і глобальний інтервал
  timers.forEach(updateOne);
  setInterval(() => timers.forEach(updateOne), 1000);
})();

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

/* ===== REVIEWS carousel ===== */
// === Reviews carousel (простий) ===
(function(){
  const root = document.getElementById('rvCarousel');
  if (!root) return;

  const track = root.querySelector('.rv-track');
  const slides = Array.from(root.querySelectorAll('.rv-slide'));
  const prevBtn = root.querySelector('.rv-prev');
  const nextBtn = root.querySelector('.rv-next');

  let index = 0;

  function update() {
    track.style.transform = `translateX(${-index * 100}%)`;
  }

  function next(){ index = (index + 1) % slides.length; update(); }
  function prev(){ index = (index - 1 + slides.length) % slides.length; update(); }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  update();
})();


/* ==== SPOTS + PURCHASE TOAST (sync) ==== */
(function () {
  const STORAGE_KEY = 'spots-state-v1';
  const START_SPOTS = 17;   // стартове число місць
  const MIN_SPOTS   = 3;    // нижня межа (далі не зменшуємо)
  const FIRST_AFTER = 5000; // перший тост через 5с після заходу
  const EVERY_MS    = 60000; // інтервал між тостами (60с). Зміни під себе.

  // 1) Стан у localStorage
  let state = {};
  try { state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) { state = {}; }
  if (!state.value || typeof state.value !== 'number') {
    state = { value: START_SPOTS, shown: 0 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // 2) Рендер усіх лічильників
  function renderSpots() {
    document.querySelectorAll('[data-spotss]').forEach(el => {
      el.textContent = state.value;
    });
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function decSpots() {
    if (state.value > MIN_SPOTS) {
      state.value -= 1;
      save();
      renderSpots();
    }
  }
  renderSpots();

  // 3) Дані для тостів (замініть на свої)
  const buyers = [
    'Олена', 'Ігор', 'Наталія', 'Максим', 'Світлана', 'Андрій', 'Марія',
    'Богдан', 'Ірина', 'Роман', 'Юлія', 'Влад', 'Катерина'
  ];
  const cities = ['Київ', 'Львів', 'Одеса', 'Дніпро', 'Харків', 'Вінниця', 'Чернівці', 'Запоріжжя'];

  // 4) Показ тосту + синхронне зменшення місць
  function showPurchaseToast() {
    if (state.value <= MIN_SPOTS) return; // стоп, досягли межі

    const name  = buyers[state.shown % buyers.length];
    const city  = cities[(state.shown * 7) % cities.length]; // псевдорандом
    const when  = ['щойно', '1 хв тому', '2 хв тому'][state.shown % 3];

    const el = document.createElement('div');
    el.className = 'bs-toast';
    el.innerHTML = `
      <strong>${name}</strong> приєднався(лась) до курсу
      <small>${when}</small>
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-visible'));

    // СИНХРОН: як тільки з’явився тост — зменшуємо кількість місць
    decSpots();

    state.shown += 1; save();

    setTimeout(() => {
      el.classList.remove('is-visible');
      setTimeout(() => el.remove(), 350);
    }, 3500);
  }

  // 5) Розклад показу
  setTimeout(function run() {
    showPurchaseToast();
    if (state.value > MIN_SPOTS) setTimeout(run, EVERY_MS);
  }, FIRST_AFTER);

  // 6) Публічний хук, якщо захочеш викликати тост вручну
  window.BS_PURCHASE_TOAST = showPurchaseToast;

  // 7) Якщо маєш власну систему тостів — слухай кастомну подію:
  // window.dispatchEvent(new CustomEvent('bs:purchase'));
  window.addEventListener('bs:purchase', function () {
    showPurchaseToast();
  });
})();

(function () {
  // Вимкнути автоповернення позиції скролу браузером
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // При старті прибираємо хеш із адреси
  window.addEventListener('load', function () {
    if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
      window.scrollTo(0, 0);
    }
  });

  // Плавний скрол за data-scroll-to
  const OFFSET = 0; // якщо є fixed-header — постав його висоту
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[data-scroll-to]');
    if (!a) return;

    const id = a.getAttribute('data-scroll-to');
    if (!id || id.charAt(0) !== '#') return;

    const el = document.querySelector(id);
    if (!el) return;

    e.preventDefault();

    const top = el.getBoundingClientRect().top + window.pageYOffset - OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

window.addEventListener('load', function () {
  // скидаємо позицію, навіть якщо браузер стрибнув
  window.scrollTo(0, 0);
});