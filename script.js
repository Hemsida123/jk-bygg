(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-nav');
  function closeMenu(restoreFocus = false) {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Öppna menyn');
    document.body.classList.remove('menu-open');
    if (restoreFocus) toggle.focus();
  }
  toggle?.addEventListener('click', () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.setAttribute('aria-label', opening ? 'Stäng menyn' : 'Öppna menyn');
    document.body.classList.toggle('menu-open', opening);
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  matchMedia('(min-width: 801px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu && !menu.hidden) closeMenu(true);
    if (event.key !== 'Tab' || !menu || menu.hidden) return;
    const items = [toggle, ...menu.querySelectorAll('a')];
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
  });

  const filters = document.querySelector('.filters');
  const grid = document.querySelector('.gallery-grid');
  if (filters && grid) {
    filters.hidden = false;
    filters.addEventListener('click', event => {
      const control = event.target.closest('[data-filter]');
      if (!control) return;
      filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button === control)));
      let count = 0;
      grid.querySelectorAll('.project').forEach(project => {
        project.hidden = control.dataset.filter !== 'Alla' && project.dataset.category !== control.dataset.filter;
        if (!project.hidden) count++;
      });
      document.querySelector('.filter-status').textContent = `${count} ${count === 1 ? 'projekt visas' : 'projekt visas'}.`;
      grid.classList.remove('filtered');
      requestAnimationFrame(() => grid.classList.add('filtered'));
    });
  }

  const viewer = document.querySelector('.viewer');
  if (!viewer || typeof viewer.showModal !== 'function') return;
  const image = viewer.querySelector('figure img');
  const caption = viewer.querySelector('figcaption');
  const previous = viewer.querySelector('.viewer-prev');
  const next = viewer.querySelector('.viewer-next');
  let active = [], current = 0, opener = null;
  function show(index) {
    current = (index + active.length) % active.length;
    const link = active[current];
    image.classList.remove('is-error');
    image.classList.add('viewer-loading');
    image.alt = link.querySelector('img')?.alt || link.dataset.caption;
    image.src = link.href;
    caption.textContent = `${link.dataset.caption}${active.length > 1 ? ` · ${current + 1} av ${active.length}` : ''}`;
    previous.disabled = next.disabled = active.length < 2;
  }
  image.addEventListener('load', () => image.classList.remove('viewer-loading'));
  image.addEventListener('error', () => {
    image.classList.add('is-error');
    caption.textContent = 'Bilden kunde inte laddas. Stäng bilden och försök igen.';
  });
  document.querySelectorAll('[data-gallery]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    active = [...document.querySelectorAll('[data-gallery]')].filter(item => !item.closest('[hidden]'));
    show(active.indexOf(link));
    viewer.showModal();
    viewer.querySelector('.viewer-close').focus();
  }));
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {if (event.target === viewer) viewer.close();});
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') {event.preventDefault(); show(current + 1);}
    if (event.key === 'ArrowLeft') {event.preventDefault(); show(current - 1);}
  });
  viewer.addEventListener('close', () => opener?.focus());
})();
