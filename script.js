/* ========================================
   NOLAN BERNARD — SCRIPT PRINCIPAL
======================================== */

document.addEventListener("DOMContentLoaded", () => {

  initMenu();
  initHeader();
  initYear();
  initRevealAnimations();

  initArticlesPage();
  loadDynamicArticle();
  loadHomeLatestArticles();

});


/* ========================================
   MENU MOBILE
======================================== */

function initMenu() {
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");

  if (!menuToggle || !nav) return;

  function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Ouvrir le menu");

    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen =
      menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute(
      "aria-expanded",
      String(!isOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Ouvrir le menu" : "Fermer le menu"
    );

    nav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}


/* ========================================
   HEADER AU SCROLL
======================================== */

function initHeader() {
  const header = document.querySelector("[data-header]");

  if (!header) return;

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
    { passive: true }
  );
}


/* ========================================
   ANNÉE AUTOMATIQUE
======================================== */

function initYear() {
  document
    .querySelectorAll("[data-year]")
    .forEach(element => {
      element.textContent =
        new Date().getFullYear();
    });
}


/* ========================================
   ANIMATIONS
======================================== */

function initRevealAnimations() {
  const elements =
    document.querySelectorAll(".reveal");

  if (!elements.length) return;

  if (
    "IntersectionObserver" in window &&
    !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {

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

  } else {

    elements.forEach(element => {
      element.classList.add("is-visible");
    });

  }
}


/* ========================================
   FONCTIONS UTILES
======================================== */

function escapeArticleHtml(value) {
  const element =
    document.createElement("div");

  element.textContent =
    String(value ?? "");

  return element.innerHTML;
}


function formatArticleDate(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
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


/* ========================================
   PAGE ARTICLES
======================================== */

let dynamicArticles = [];
let activeDynamicCategory = "all";
let dynamicSearchTerm = "";


async function initArticlesPage() {
  const list =
    document.querySelector(
      "#dynamic-article-list"
    );

  if (!list) return;

  const buttons =
    document.querySelectorAll(
      "[data-dynamic-filter]"
    );

  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        buttons.forEach(item => {
          item.classList.remove(
            "is-active"
          );
        });

        button.classList.add(
          "is-active"
        );

        activeDynamicCategory =
          button.dataset.dynamicFilter;

        renderDynamicArticles();
      }
    );

  });


  const search =
    document.querySelector(
      "#dynamic-search"
    );

  if (search) {

    search.addEventListener(
      "input",
      event => {

        dynamicSearchTerm =
          event.target.value
            .trim()
            .toLowerCase();

        renderDynamicArticles();

      }
    );

  }


  try {

    const response =
      await fetch(
        "content/articles.json"
      );

    if (!response.ok) {
      throw new Error(
        "Impossible de charger les articles."
      );
    }

    const data =
      await response.json();

    dynamicArticles =
      Array.isArray(data.articles)
        ? data.articles
        : [];

    dynamicArticles.sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    );

    renderDynamicArticles();

  } catch (error) {

    console.error(error);

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


function renderDynamicArticles() {
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

  if (!list) return;


  const filtered =
    dynamicArticles.filter(article => {

      const categoryMatches =
        activeDynamicCategory === "all" ||
        article.category ===
          activeDynamicCategory;


      const searchableText = `
        ${article.title || ""}
        ${article.intro || ""}
        ${article.category || ""}
      `.toLowerCase();


      const searchMatches =
        searchableText.includes(
          dynamicSearchTerm
        );


      return (
        categoryMatches &&
        searchMatches
      );

    });


  list.innerHTML = "";


  filtered.forEach(article => {

    const item =
      document.createElement(
        "article"
      );

    item.className =
      "archive-item";


    const date =
      formatArticleDate(
        article.date
      );


    item.innerHTML = `

      <div>
        <p class="category">
          ${escapeArticleHtml(
            article.category
          )}
        </p>
      </div>

      <div class="archive-item-main">

        <h2>
          <a href="article.html?slug=${encodeURIComponent(
            article.slug || ""
          )}">
            ${escapeArticleHtml(
              article.title
            )}
          </a>
        </h2>

        <p>
          ${escapeArticleHtml(
            article.intro
          )}
        </p>

      </div>

      <div class="story-meta">

        <time>
          ${date}
        </time>

        <span>
          ${escapeArticleHtml(
            article.readingTime
          )}
        </span>

      </div>

    `;

    list.appendChild(item);

  });


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


/* ========================================
   PAGE ARTICLE
======================================== */

async function loadDynamicArticle() {

  const titleElement =
    document.querySelector(
      "#article-title"
    );

  if (!titleElement) return;


  const params =
    new URLSearchParams(
      window.location.search
    );

  const slug =
    params.get("slug");


  if (!slug) {

    titleElement.textContent =
      "Article introuvable";

    return;
  }


  try {

    const response =
      await fetch(
        "content/articles.json"
      );

    if (!response.ok) {
      throw new Error(
        "Impossible de charger l'article"
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
          item.slug === slug
      );


    if (!article) {

      titleElement.textContent =
        "Article introuvable";

      return;
    }


    document.title =
      `${article.title} — Nolan Bernard`;


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


  } catch (error) {

    console.error(error);

    titleElement.textContent =
      "Impossible de charger cet article";

  }
}


function setText(selector, value) {
  const element =
    document.querySelector(selector);

  if (element) {
    element.textContent =
      value || "";
  }
}


/* ========================================
   MARKDOWN SIMPLE
======================================== */

function markdownToHtml(markdown) {

  if (!markdown) return "";


  let html =
    escapeArticleHtml(markdown);


  html = html
    .replace(
      /^### (.+)$/gim,
      "<h3>$1</h3>"
    )
    .replace(
      /^## (.+)$/gim,
      "<h2>$1</h2>"
    )
    .replace(
      /^# (.+)$/gim,
      "<h1>$1</h1>"
    );


  html = html
    .replace(
      /\*\*(.*?)\*\*/gim,
      "<strong>$1</strong>"
    )
    .replace(
      /\*(.*?)\*/gim,
      "<em>$1</em>"
    );


  html = html.replace(
    /^&gt; (.+)$/gim,
    "<blockquote>$1</blockquote>"
  );


  const blocks =
    html.split(/\n{2,}/);


  return blocks
    .map(block => {

      const trimmed =
        block.trim();

      if (!trimmed) {
        return "";
      }


      if (
        trimmed.startsWith("<h1") ||
        trimmed.startsWith("<h2") ||
        trimmed.startsWith("<h3") ||
        trimmed.startsWith("<blockquote")
      ) {
        return trimmed;
      }


      return `
        <p>
          ${trimmed.replace(
            /\n/g,
            "<br>"
          )}
        </p>
      `;

    })
    .join("");

}


/* ========================================
   DERNIERS ARTICLES — ACCUEIL
======================================== */

async function loadHomeLatestArticles() {

  const container =
    document.querySelector(
      "#home-latest-articles"
    );

  if (!container) return;


  try {

    const response =
      await fetch(
        "content/articles.json"
      );


    if (!response.ok) {
      throw new Error(
        "Impossible de charger les articles"
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
        new Date(b.date) -
        new Date(a.date)
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
        .map(
          (article, index) => {

            const date =
              formatArticleDate(
                article.date
              );


            const url =
              `article.html?slug=${encodeURIComponent(
                article.slug || ""
              )}`;


            if (index === 0) {

              return `

                <div class="featured-story">

                  <div>

                    <p class="category">
                      ${escapeArticleHtml(
                        article.category
                      )}
                    </p>

                    <h3>
                      <a href="${url}">
                        ${escapeArticleHtml(
                          article.title
                        )}
                      </a>
                    </h3>

                    <p>
                      ${escapeArticleHtml(
                        article.intro
                      )}
                    </p>

                  </div>


                  <div class="story-meta">

                    <time>
                      ${date}
                    </time>

                    <span>
                      ${escapeArticleHtml(
                        article.readingTime
                      )}
                    </span>

                  </div>

                </div>

              `;

            }


            return `

              <article class="story-row">

                <div>

                  <p class="category">
                    ${escapeArticleHtml(
                      article.category
                    )}
                  </p>

                  <h3>
                    <a href="${url}">
                      ${escapeArticleHtml(
                        article.title
                      )}
                    </a>
                  </h3>

                  <p>
                    ${escapeArticleHtml(
                      article.intro
                    )}
                  </p>

                </div>


                <div class="story-meta">

                  <time>
                    ${date}
                  </time>

                  <span>
                    ${escapeArticleHtml(
                      article.readingTime
                    )}
                  </span>

                </div>

              </article>

            `;

          }
        )
        .join("");


  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <p class="empty-state">
        Impossible de charger les derniers articles.
      </p>
    `;

  }
}
