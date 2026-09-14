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
let dynamicArticles = [];
let activeDynamicCategory = "all";
let dynamicSearchTerm = "";


async function loadDynamicArticlesList() {
  const list = document.querySelector("#dynamic-article-list");

  if (!list) return;

  try {
    const response = await fetch("content/articles.json");

    if (!response.ok) {
      throw new Error("Impossible de charger les articles.");
    }

    const data = await response.json();

    dynamicArticles = Array.isArray(data.articles)
      ? data.articles
      : [];

    dynamicArticles.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    renderDynamicArticles();

  } catch (error) {
    console.error(error);

    list.innerHTML = `
      <p class="empty-state">
        Impossible de charger les articles.
      </p>
    `;

    const count = document.querySelector("#dynamic-article-count");

    if (count) {
      count.textContent = "Erreur de chargement";
    }
  }
}


function renderDynamicArticles() {
  const list = document.querySelector("#dynamic-article-list");
  const count = document.querySelector("#dynamic-article-count");
  const empty = document.querySelector("#dynamic-empty-state");

  if (!list) return;


  const filteredArticles = dynamicArticles.filter(article => {

    const categoryMatches =
      activeDynamicCategory === "all" ||
      article.category === activeDynamicCategory;


    const searchableText = `
      ${article.title || ""}
      ${article.intro || ""}
      ${article.category || ""}
    `.toLowerCase();


    const searchMatches =
      searchableText.includes(
        dynamicSearchTerm.toLowerCase()
      );


    return categoryMatches && searchMatches;
  });


  list.innerHTML = "";


  filteredArticles.forEach(article => {

    const item = document.createElement("article");

    item.className = "archive-item";


    const formattedDate = article.date
      ? new Date(article.date).toLocaleDateString(
          "fr-FR",
          {
            day: "numeric",
            month: "long",
            year: "numeric"
          }
        )
      : "";


    item.innerHTML = `

      <div>
        <p class="category">
          ${escapeArticleHtml(article.category || "")}
        </p>
      </div>


      <div class="archive-item-main">

        <h2>

          <a href="article.html?slug=${encodeURIComponent(article.slug)}">
            ${escapeArticleHtml(article.title || "")}
          </a>

        </h2>


        <p>
          ${escapeArticleHtml(article.intro || "")}
        </p>

      </div>


      <div class="story-meta">

        <time>
          ${formattedDate}
        </time>

        <span>
          ${escapeArticleHtml(article.readingTime || "")}
        </span>

      </div>

    `;


    list.appendChild(item);
  });


  if (count) {

    const total = filteredArticles.length;

    count.textContent =
      total === 1
        ? "1 article"
        : `${total} articles`;
  }


  if (empty) {
    empty.hidden = filteredArticles.length !== 0;
  }
}


function escapeArticleHtml(value) {
  const div = document.createElement("div");

  div.textContent = String(value);

  return div.innerHTML;
}


document
  .querySelectorAll("[data-dynamic-filter]")
  .forEach(button => {

    button.addEventListener("click", () => {

      document
        .querySelectorAll("[data-dynamic-filter]")
        .forEach(btn => {
          btn.classList.remove("is-active");
        });


      button.classList.add("is-active");


      activeDynamicCategory =
        button.dataset.dynamicFilter;


      renderDynamicArticles();
    });

  });


const dynamicSearch =
  document.querySelector("#dynamic-search");


if (dynamicSearch) {

  dynamicSearch.addEventListener("input", event => {

    dynamicSearchTerm =
      event.target.value.trim();

    renderDynamicArticles();

  });

}


loadDynamicArticlesList();
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
async function loadDynamicArticle() {
  const titleElement = document.querySelector("#article-title");

  if (!titleElement) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    titleElement.textContent = "Article introuvable";
    return;
  }

  try {
    const response = await fetch("content/articles.json");

    if (!response.ok) {
      throw new Error("Impossible de charger les articles");
    }

    const data = await response.json();

    const article = data.articles.find(
      item => item.slug === slug
    );

    if (!article) {
      titleElement.textContent = "Article introuvable";
      return;
    }

    document.title = `${article.title} — Nolan Bernard`;

    document.querySelector("#article-category").textContent =
      article.category || "";

    document.querySelector("#article-title").textContent =
      article.title || "";

    document.querySelector("#article-intro").textContent =
      article.intro || "";

    document.querySelector("#article-reading-time").textContent =
      article.readingTime || "";

    if (article.date) {
      const date = new Date(article.date);

      document.querySelector("#article-date").textContent =
        date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
    }

    const body = document.querySelector("#article-body");

    body.innerHTML = markdownToHtml(article.body || "");

  } catch (error) {
    console.error(error);

    titleElement.textContent =
      "Impossible de charger cet article";
  }
}


function markdownToHtml(markdown) {
  if (!markdown) return "";

  let html = markdown;

  html = html
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>");

  html = html
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>");

  html = html
    .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>");

  html = html
    .split(/\n\n+/)
    .map(block => {

      if (
        block.startsWith("<h") ||
        block.startsWith("<blockquote") ||
        block.startsWith("<ul") ||
        block.startsWith("<ol")
      ) {
        return block;
      }

      return `<p>${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");

  return html;
}


loadDynamicArticle();
