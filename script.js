"use strict";


/* =========================================================
   NOLAN BERNARD
   Script principal du site
   ========================================================= */


/* =========================================================
   DÉMARRAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  const maintenanceActive = await checkMaintenanceMode();

  if (maintenanceActive) {
    return;
  }

  initMenu();
  initHeader();
  initYear();
  initRevealAnimations();

  loadHomeContent();
  loadHomeLatestArticles();

  initArticlesPage();
  loadDynamicArticle();

});


/* =========================================================
   MODE MAINTENANCE
   ========================================================= */

async function checkMaintenanceMode() {

  const pathname = window.location.pathname;

  if (
    pathname.includes("/admin") ||
    pathname.includes("maintenance.html")
  ) {
    return false;
  }

  try {

    const response = await fetch(
      "/content/settings.json?cache=" + Date.now(),
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      return false;
    }

    const settings = await response.json();

    if (settings.maintenance === true) {

      window.location.replace("/maintenance.html");

      return true;
    }

  } catch (error) {

    console.warn(
      "Impossible de vérifier le mode maintenance :",
      error
    );

  }

  return false;
}


/* =========================================================
   MENU MOBILE
   ========================================================= */

function initMenu() {

  const menuToggle =
    document.querySelector(".menu-toggle") ||
    document.querySelector("[data-menu-toggle]");

  const nav =
    document.querySelector(".main-nav") ||
    document.querySelector("[data-nav]");

  if (!menuToggle || !nav) {
    return;
  }


  function closeMenu() {

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Ouvrir le menu"
    );

    nav.classList.remove("is-open");

    document.body.classList.remove(
      "menu-open"
    );
  }


  menuToggle.addEventListener(
    "click",
    () => {

      const isOpen =
        menuToggle.getAttribute(
          "aria-expanded"
        ) === "true";


      menuToggle.setAttribute(
        "aria-expanded",
        String(!isOpen)
      );


      menuToggle.setAttribute(
        "aria-label",
        isOpen
          ? "Ouvrir le menu"
          : "Fermer le menu"
      );


      nav.classList.toggle(
        "is-open",
        !isOpen
      );


      document.body.classList.toggle(
        "menu-open",
        !isOpen
      );

    }
  );


  nav
    .querySelectorAll("a")
    .forEach(link => {

      link.addEventListener(
        "click",
        closeMenu
      );

    });


  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {
        closeMenu();
      }

    }
  );

}


/* =========================================================
   HEADER AU SCROLL
   ========================================================= */

function initHeader() {

  const header =
    document.querySelector(".site-header") ||
    document.querySelector("[data-header]");

  if (!header) {
    return;
  }


  function updateHeader() {

    header.classList.toggle(
      "is-scrolled",
      window.scrollY > 8
    );

  }


  updateHeader();


  window.addEventListener(
    "scroll",
    updateHeader,
    {
      passive: true
    }
  );

}


/* =========================================================
   ANNÉE DU FOOTER
   ========================================================= */

function initYear() {

  const currentYear =
    new Date().getFullYear();


  document
    .querySelectorAll(
      "#year, [data-year]"
    )
    .forEach(element => {

      element.textContent =
        currentYear;

    });

}


/* =========================================================
   ANIMATIONS D'APPARITION
   ========================================================= */

function initRevealAnimations() {

  const elements =
    document.querySelectorAll(
      ".reveal"
    );

  if (!elements.length) {
    return;
  }


  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  if (
    !("IntersectionObserver" in window) ||
    reducedMotion
  ) {

    elements.forEach(element => {
      element.classList.add(
        "is-visible"
      );
    });

    return;
  }


  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target.classList.add(
              "is-visible"
            );

            observer.unobserve(
              entry.target
            );

          }

        });

      },
      {
        threshold: 0.08
      }
    );


  elements.forEach(element => {
    observer.observe(element);
  });

}


/* =========================================================
   CONTENU DYNAMIQUE DE LA PAGE D'ACCUEIL
   content/home.json
   ========================================================= */

async function loadHomeContent() {

  const elements =
    document.querySelectorAll(
      "[data-home], [data-home-href], [data-home-src]"
    );

  if (!elements.length) {
    return;
  }


  try {

    const response = await fetch(
      "/content/home.json?cache=" + Date.now(),
      {
        cache: "no-store"
      }
    );


    if (!response.ok) {

      throw new Error(
        "Impossible de charger home.json"
      );

    }


    const home =
      await response.json();


    /* TEXTES */

    document
      .querySelectorAll("[data-home]")
      .forEach(element => {

        const key =
          element.dataset.home;


        if (
          Object.prototype.hasOwnProperty.call(
            home,
            key
          ) &&
          home[key] !== null
        ) {

          element.textContent =
            home[key];

        }

      });


    /* LIENS */

    document
      .querySelectorAll(
        "[data-home-href]"
      )
      .forEach(element => {

        const key =
          element.dataset.homeHref;

        const value =
          home[key];


        if (
          typeof value === "string" &&
          value.trim()
        ) {

          element.setAttribute(
            "href",
            value
          );

        }

      });


    /* IMAGES */

    document
      .querySelectorAll(
        "[data-home-src]"
      )
      .forEach(element => {

        const key =
          element.dataset.homeSrc;

        const value =
          home[key];


        if (
          typeof value === "string" &&
          value.trim()
        ) {

          element.setAttribute(
            "src",
            value
          );

        }

      });


  } catch (error) {

    console.error(
      "Erreur lors du chargement de la page d'accueil :",
      error
    );

  }

}


/* =========================================================
   DERNIERS ARTICLES SUR LA PAGE D'ACCUEIL
   ========================================================= */

async function loadHomeLatestArticles() {

  const container =
    document.querySelector(
      "#home-latest-articles"
    );

  if (!container) {
    return;
  }


  try {

    const response = await fetch(
      "/content/articles.json?cache=" + Date.now(),
      {
        cache: "no-store"
      }
    );


    if (!response.ok) {

      throw new Error(
        "Impossible de charger les articles."
      );

    }


    const data =
      await response.json();


    const articles =
      Array.isArray(data.articles)
        ? [...data.articles]
        : [];


    articles.sort(
      (a, b) =>
        new Date(b.date || 0) -
        new Date(a.date || 0)
    );


    const latest =
      articles.slice(0, 5);


    if (!latest.length) {

      container.innerHTML = `
        <p class="empty-state">
          Aucun article publié pour le moment.
        </p>
      `;

      return;
    }


    container.innerHTML =
      latest
        .map((article, index) => {

          const articleUrl =
            "article.html?slug=" +
            encodeURIComponent(
              article.slug || ""
            );


          const formattedDate =
            formatArticleDate(
              article.date
            );


          if (index === 0) {

            return `
              <article class="featured-story reveal is-visible">

                <div>

                  <p class="category">
                    ${escapeHtml(
                      article.category || ""
                    )}
                  </p>

                  <h3>
                    <a href="${articleUrl}">
                      ${escapeHtml(
                        article.title || ""
                      )}
                    </a>
                  </h3>

                  <p>
                    ${escapeHtml(
                      article.intro || ""
                    )}
                  </p>

                </div>

                <div class="story-meta">

                  <time>
                    ${escapeHtml(
                      formattedDate
                    )}
                  </time>

                  <span>
                    ${escapeHtml(
                      article.readingTime || ""
                    )}
                  </span>

                </div>

              </article>
            `;

          }


          return `
            <article class="story-row reveal is-visible">

              <div>

                <p class="category">
                  ${escapeHtml(
                    article.category || ""
                  )}
                </p>

                <h3>
                  <a href="${articleUrl}">
                    ${escapeHtml(
                      article.title || ""
                    )}
                  </a>
                </h3>

                <p>
                  ${escapeHtml(
                    article.intro || ""
                  )}
                </p>

              </div>

              <div class="story-meta">

                <time>
                  ${escapeHtml(
                    formattedDate
                  )}
                </time>

                <span>
                  ${escapeHtml(
                    article.readingTime || ""
                  )}
                </span>

              </div>

            </article>
          `;

        })
        .join("");


  } catch (error) {

    console.error(
      "Erreur derniers articles :",
      error
    );


    container.innerHTML = `
      <p class="empty-state">
        Impossible de charger les derniers articles.
      </p>
    `;

  }

}


/* =========================================================
   PAGE ARTICLES.HTML
   ========================================================= */

let allArticles = [];
let activeArticleCategory = "all";
let articleSearchTerm = "";


async function initArticlesPage() {

  const list =
    document.querySelector(
      "#dynamic-article-list"
    );

  if (!list) {
    return;
  }


  initArticleFilters();


  try {

    const response = await fetch(
      "/content/articles.json?cache=" + Date.now(),
      {
        cache: "no-store"
      }
    );


    if (!response.ok) {

      throw new Error(
        "Impossible de charger les articles."
      );

    }


    const data =
      await response.json();


    allArticles =
      Array.isArray(data.articles)
        ? [...data.articles]
        : [];


    allArticles.sort(
      (a, b) =>
        new Date(b.date || 0) -
        new Date(a.date || 0)
    );


    renderArticlesPage();


  } catch (error) {

    console.error(
      "Erreur page articles :",
      error
    );


    list.innerHTML = `
      <p class="empty-state">
        Impossible de charger les articles.
      </p>
    `;


    const count =
      document.querySelector(
        "#dynamic-article-count"
      );


    if (count) {
      count.textContent =
        "Erreur de chargement";
    }

  }

}


function initArticleFilters() {

  const filterButtons =
    document.querySelectorAll(
      "[data-dynamic-filter]"
    );


  const searchInput =
    document.querySelector(
      "#dynamic-search"
    );


  filterButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        filterButtons.forEach(item => {
          item.classList.remove(
            "is-active"
          );
        });


        button.classList.add(
          "is-active"
        );


        activeArticleCategory =
          button.dataset.dynamicFilter ||
          "all";


        renderArticlesPage();

      }
    );

  });


  if (searchInput) {

    searchInput.addEventListener(
      "input",
      event => {

        articleSearchTerm =
          event.target.value
            .trim()
            .toLowerCase();


        renderArticlesPage();

      }
    );

  }

}


function renderArticlesPage() {

  const list =
    document.querySelector(
      "#dynamic-article-list"
    );


  const count =
    document.querySelector(
      "#dynamic-article-count"
    );


  const empty =
    document.querySelector(
      "#dynamic-empty-state"
    );


  if (!list) {
    return;
  }


  const filtered =
    allArticles.filter(article => {

      const categoryMatches =
        activeArticleCategory === "all" ||
        article.category ===
          activeArticleCategory;


      const searchableText =
        [
          article.title,
          article.intro,
          article.category
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


      const searchMatches =
        !articleSearchTerm ||
        searchableText.includes(
          articleSearchTerm
        );


      return (
        categoryMatches &&
        searchMatches
      );

    });


  list.innerHTML =
    filtered
      .map(article => {

        const articleUrl =
          "article.html?slug=" +
          encodeURIComponent(
            article.slug || ""
          );


        return `
          <article class="archive-item">

            <div>

              <p class="category">
                ${escapeHtml(
                  article.category || ""
                )}
              </p>

            </div>


            <div class="archive-item-main">

              <h2>

                <a href="${articleUrl}">
                  ${escapeHtml(
                    article.title || ""
                  )}
                </a>

              </h2>


              <p>
                ${escapeHtml(
                  article.intro || ""
                )}
              </p>

            </div>


            <div class="story-meta">

              <time>
                ${escapeHtml(
                  formatArticleDate(
                    article.date
                  )
                )}
              </time>

              <span>
                ${escapeHtml(
                  article.readingTime || ""
                )}
              </span>

            </div>

          </article>
        `;

      })
      .join("");


  if (count) {

    count.textContent =
      filtered.length === 1
        ? "1 article"
        : `${filtered.length} articles`;

  }


  if (empty) {

    empty.hidden =
      filtered.length !== 0;

  }

}


/* =========================================================
   PAGE ARTICLE.HTML
   ========================================================= */

async function loadDynamicArticle() {

  const titleElement =
    document.querySelector(
      "#article-title"
    );


  if (!titleElement) {
    return;
  }


  const params =
    new URLSearchParams(
      window.location.search
    );


  const slug =
    params.get("slug");


  if (!slug) {

    showArticleError(
      "Article introuvable"
    );

    return;
  }


  try {

    const response = await fetch(
      "/content/articles.json?cache=" + Date.now(),
      {
        cache: "no-store"
      }
    );


    if (!response.ok) {

      throw new Error(
        "Impossible de charger les articles."
      );

    }


    const data =
      await response.json();


    const articles =
      Array.isArray(data.articles)
        ? data.articles
        : [];


    const article =
      articles.find(
        item =>
          String(item.slug) ===
          String(slug)
      );


    if (!article) {

      showArticleError(
        "Article introuvable"
      );

      return;
    }


    document.title =
      `${article.title || "Article"} — Nolan Bernard`;


    setText(
      "#article-category",
      article.category
    );


    setText(
      "#article-title",
      article.title
    );


    setText(
      "#article-intro",
      article.intro
    );


    setText(
      "#article-reading-time",
      article.readingTime
    );


    setText(
      "#article-date",
      formatArticleDate(
        article.date
      )
    );


    const body =
      document.querySelector(
        "#article-body"
      );


    if (body) {

      body.innerHTML =
        markdownToHtml(
          article.body || ""
        );

    }


    const image =
      document.querySelector(
        "#article-image"
      );


    if (image) {

      if (article.image) {

        image.src =
          article.image;

        image.alt =
          article.title || "";

        image.hidden =
          false;

      } else {

        image.hidden =
          true;

      }

    }


  } catch (error) {

    console.error(
      "Erreur article :",
      error
    );


    showArticleError(
      "Impossible de charger cet article"
    );

  }

}


function showArticleError(message) {

  setText(
    "#article-title",
    message
  );


  setText(
    "#article-category",
    ""
  );


  setText(
    "#article-intro",
    ""
  );


  setText(
    "#article-date",
    ""
  );


  setText(
    "#article-reading-time",
    ""
  );


  const body =
    document.querySelector(
      "#article-body"
    );


  if (body) {
    body.innerHTML = "";
  }

}


/* =========================================================
   CONVERSION MARKDOWN DES ARTICLES
   ========================================================= */

function markdownToHtml(markdown) {

  if (!markdown) {
    return "";
  }


  const source =
    escapeHtml(markdown)
      .replace(/\r\n/g, "\n");


  const lines =
    source.split("\n");


  const output = [];

  let paragraph = [];
  let listItems = [];
  let listType = null;


  function flushParagraph() {

    if (!paragraph.length) {
      return;
    }


    let text =
      paragraph.join("<br>");


    text =
      applyInlineMarkdown(text);


    output.push(
      `<p>${text}</p>`
    );


    paragraph = [];

  }


  function flushList() {

    if (!listItems.length) {
      return;
    }


    const tag =
      listType === "ol"
        ? "ol"
        : "ul";


    output.push(
      `<${tag}>` +
      listItems
        .map(item =>
          `<li>${applyInlineMarkdown(item)}</li>`
        )
        .join("") +
      `</${tag}>`
    );


    listItems = [];
    listType = null;

  }


  lines.forEach(line => {

    const trimmed =
      line.trim();


    if (!trimmed) {

      flushParagraph();
      flushList();

      return;
    }


    const h3 =
      trimmed.match(
        /^###\s+(.+)$/
      );


    if (h3) {

      flushParagraph();
      flushList();

      output.push(
        `<h3>${applyInlineMarkdown(h3[1])}</h3>`
      );

      return;
    }


    const h2 =
      trimmed.match(
        /^##\s+(.+)$/
      );


    if (h2) {

      flushParagraph();
      flushList();

      output.push(
        `<h2>${applyInlineMarkdown(h2[1])}</h2>`
      );

      return;
    }


    const h1 =
      trimmed.match(
        /^#\s+(.+)$/
      );


    if (h1) {

      flushParagraph();
      flushList();

      output.push(
        `<h1>${applyInlineMarkdown(h1[1])}</h1>`
      );

      return;
    }


    const quote =
      trimmed.match(
        /^>\s+(.+)$/
      );


    if (quote) {

      flushParagraph();
      flushList();

      output.push(
        `<blockquote>${applyInlineMarkdown(quote[1])}</blockquote>`
      );

      return;
    }


    const unordered =
      trimmed.match(
        /^[-*]\s+(.+)$/
      );


    if (unordered) {

      flushParagraph();


      if (
        listType &&
        listType !== "ul"
      ) {
        flushList();
      }


      listType = "ul";

      listItems.push(
        unordered[1]
      );

      return;
    }


    const ordered =
      trimmed.match(
        /^\d+\.\s+(.+)$/
      );


    if (ordered) {

      flushParagraph();


      if (
        listType &&
        listType !== "ol"
      ) {
        flushList();
      }


      listType = "ol";

      listItems.push(
        ordered[1]
      );

      return;
    }


    flushList();

    paragraph.push(
      trimmed
    );

  });


  flushParagraph();
  flushList();


  return output.join("");

}


function applyInlineMarkdown(text) {

  return text
    .replace(
      /\*\*(.+?)\*\*/g,
      "<strong>$1</strong>"
    )
    .replace(
      /\*(.+?)\*/g,
      "<em>$1</em>"
    );

}


/* =========================================================
   OUTILS
   ========================================================= */

function setText(selector, value) {

  const element =
    document.querySelector(
      selector
    );


  if (!element) {
    return;
  }


  element.textContent =
    value || "";

}


function formatArticleDate(value) {

  if (!value) {
    return "";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }


  return date.toLocaleDateString(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );

}


function escapeHtml(value) {

  const element =
    document.createElement("div");


  element.textContent =
    String(value ?? "");


  return element.innerHTML;

}
