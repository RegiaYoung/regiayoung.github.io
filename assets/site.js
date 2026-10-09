(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  let saved = null;
  try { saved = localStorage.getItem('ruijia-theme'); } catch (_) { /* Storage may be unavailable. */ }
  const setTheme = theme => {
    root.dataset.theme = theme;
    if (toggle) {
      toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
      toggle.title = toggle.getAttribute('aria-label');
    }
  };
  setTheme(saved === 'dark' || saved === 'light' ? saved : preference.matches ? 'dark' : 'light');
  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      saved = theme;
      setTheme(theme);
      try { localStorage.setItem('ruijia-theme', theme); } catch (_) { /* Keep session behavior. */ }
    });
  }
  preference.addEventListener('change', event => { if (!saved) setTheme(event.matches ? 'dark' : 'light'); });
  const filters = document.querySelector('.publication-filters');
  if (filters) {
    filters.hidden = false;
    const buttons = [...filters.querySelectorAll('button')];
    const publications = [...document.querySelectorAll('.publication')];
    buttons.forEach(button => button.addEventListener('click', () => {
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      let count = 0;
      publications.forEach(publication => {
        publication.hidden = button.dataset.filter !== 'all' && publication.dataset.category !== button.dataset.filter;
        if (!publication.hidden) count += 1;
      });
      document.querySelector('.publication-count').textContent = `${count} publication${count === 1 ? '' : 's'}`;
    }));
  }
  document.querySelectorAll('.copy-citation').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const citation = button.closest('details').querySelector('code').textContent;
      try {
        if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(citation);
        button.textContent = 'Copied';
      } catch (_) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(button.closest('details').querySelector('code'));
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = 'Selected — copy manually';
      }
      window.setTimeout(() => { button.textContent = 'Copy BibTeX'; }, 2500);
    });
  });
})();
