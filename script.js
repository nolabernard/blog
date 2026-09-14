(() => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const header = document.querySelector('[data-header]');

  if (menuToggle && nav) {
    const closeMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
      nav.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
      nav.classList.toggle('is-open', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
    });

    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  if (header) {
    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  const articleList = document.querySelector('[data-article-list]');
  if (articleList) {
    const items = [...articleList.querySelectorAll('.archive-item')];
    const buttons = [...document.querySelectorAll('[data-filter]')];
    const search = document.querySelector('[data-article-search]');
    const count = document.querySelector('[data-article-count]');
    const emptyState = document.querySelector('[data-empty-state]');
    let activeFilter = 'all';

    const normalize = value => value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    const applyFilters = () => {
      const query = normalize(search?.value || '');
      let visibleCount = 0;

      items.forEach(item => {
        const matchesCategory = activeFilter === 'all' || item.dataset.category === activeFilter;
        const haystack = normalize(item.dataset.search || item.textContent);
        const matchesSearch = !query || haystack.includes(query);
        const visible = matchesCategory && matchesSearch;
        item.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      if (count) count.textContent = String(visibleCount);
      if (emptyState) emptyState.hidden = visibleCount !== 0;
    };

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.filter;
        buttons.forEach(btn => btn.classList.toggle('is-active', btn === button));
        applyFilters();
      });
    });

    search?.addEventListener('input', applyFilters);
    applyFilters();
  }
})();
