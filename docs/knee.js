/* FAQ accordion */
(() => {
  const root = document.querySelector('[data-faq]');
  if (!root) return;

  const closeItem = (item) => {
    const button = item.querySelector('.bs-faq__q');
    const panel = item.querySelector('.bs-faq__a');
    if (!button || !panel) return;

    button.setAttribute('aria-expanded', 'false');
    panel.style.height = `${panel.scrollHeight}px`;
    requestAnimationFrame(() => {
      panel.style.height = '0px';
    });
  };

  const openItem = (item) => {
    const button = item.querySelector('.bs-faq__q');
    const panel = item.querySelector('.bs-faq__a');
    if (!button || !panel) return;

    button.setAttribute('aria-expanded', 'true');
    panel.style.height = `${panel.scrollHeight}px`;
  };

  root.querySelectorAll('.bs-faq__item').forEach((item) => {
    const panel = item.querySelector('.bs-faq__a');
    if (panel) panel.style.height = '0px';
  });

  root.addEventListener('click', (event) => {
    const button = event.target.closest('.bs-faq__q');
    if (!button) return;

    const currentItem = button.closest('.bs-faq__item');
    const isOpen = button.getAttribute('aria-expanded') === 'true';

    root.querySelectorAll('.bs-faq__item').forEach((item) => {
      if (item !== currentItem) closeItem(item);
    });

    if (isOpen) closeItem(currentItem);
    else openItem(currentItem);
  });

  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      root.querySelectorAll('.bs-faq__item').forEach((item) => {
        const button = item.querySelector('.bs-faq__q');
        const panel = item.querySelector('.bs-faq__a');
        if (button?.getAttribute('aria-expanded') === 'true' && panel) {
          panel.style.height = `${panel.scrollHeight}px`;
        }
      });
    });
  });
})();

/* Smooth in-page navigation */
(() => {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-scroll-to]');
    if (!link) return;

    const selector = link.getAttribute('data-scroll-to');
    if (!selector || !selector.startsWith('#')) return;

    const target = document.querySelector(selector);
    if (!target) return;

    event.preventDefault();

    const header = document.querySelector('.lp-header');
    const headerHeight = header?.getBoundingClientRect().height || 0;
    const extraOffset = selector === '#pricing-pro' ? 24 : 12;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - extraOffset;

    window.scrollTo({ top, behavior: 'smooth' });

    if (selector === '#pricing-pro') {
      target.classList.remove('lp-pricing-card--pulse');
      requestAnimationFrame(() => target.classList.add('lp-pricing-card--pulse'));
      window.setTimeout(() => target.classList.remove('lp-pricing-card--pulse'), 2400);
    }
  });
})();


/* Synchronized daily countdown to the next local midnight */
(() => {
  const countdowns = [...document.querySelectorAll('[data-daily-countdown]')];
  if (!countdowns.length) return;

  const pad = (value) => String(value).padStart(2, '0');

  const render = () => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);

    const totalSeconds = Math.max(0, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdowns.forEach((countdown) => {
      const hoursNode = countdown.querySelector('[data-countdown-hours]');
      const minutesNode = countdown.querySelector('[data-countdown-minutes]');
      const secondsNode = countdown.querySelector('[data-countdown-seconds]');

      if (hoursNode) hoursNode.textContent = pad(hours);
      if (minutesNode) minutesNode.textContent = pad(minutes);
      if (secondsNode) secondsNode.textContent = pad(seconds);
    });
  };

  render();
  window.setInterval(render, 1000);
})();
