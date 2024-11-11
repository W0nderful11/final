document.addEventListener("DOMContentLoaded", function () {
    const themeToggleButton = document.getElementById("theme-toggle");
    const articlesContainer = document.getElementById("articles");
    const mostPopularContainer = document.getElementById("most-popular");
    const sortOptions = document.getElementById("sort-options");
    let theme = localStorage.getItem("theme") || "light";
    let articlesCache = null;

    applyTheme(theme);

    themeToggleButton.addEventListener("click", () => {
        theme = theme === "light" ? "dark" : "light";
        applyTheme(theme);
        localStorage.setItem("theme", theme);
    });

    sortOptions.addEventListener("change", () => {
        if (articlesCache) {
            renderArticles(sortArticles(articlesCache, sortOptions.value));
        }
    });

    fetchArticles();

    const modalElement = document.getElementById('articleModal');
    modalElement.addEventListener('hidden.bs.modal', clearModalContent);

    function applyTheme(selectedTheme) {
        document.body.classList.toggle("dark-mode", selectedTheme === "dark");
        document.body.classList.toggle("light-mode", selectedTheme === "light");
    }

    function fetchArticles(sortBy = "date") {
        showLoadingIndicator(true);

        fetch("Articles.json")
            .then(response => response.json())
            .then(data => {
                articlesCache = data.articles;
                renderArticles(sortArticles(articlesCache, sortBy));
                displayMostPopular(articlesCache);
                showLoadingIndicator(false);
            })
            .catch(error => {
                showLoadingIndicator(false);
                console.error("Error fetching articles:", error);
                alert("Error loading data. Please try again later.");
            });
    }

    function sortArticles(articles, sortBy) {
        return [...articles].sort((a, b) => 
            sortBy === "views" ? b.views - a.views : new Date(b.date) - new Date(a.date)
        );
    }

    function renderArticles(articles) {
        articlesContainer.innerHTML = "";
        articles.forEach(article => {
            const readingTime = Math.ceil(article.wordCount / 200);
            articlesContainer.innerHTML += `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100">
                        <img src="${article.image}" class="card-img-top" alt="${article.title}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${article.title}</h5>
                            <p class="card-text">${article.content.substring(0, 100)}...</p>
                            <div class="mt-auto">
                                <p class="card-text"><small>Category: ${article.category} | Date: ${article.date} | Views: ${article.views}</small></p>
                                <p class="card-text"><small>Reading Time: ${readingTime} min</small></p>
                                <button class="btn btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#articleModal" onclick="viewArticle(${article.id})">Read More</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    function displayMostPopular(articles) {
        const mostPopular = articles.reduce((max, article) => article.views > max.views ? article : max, articles[0]);
        mostPopularContainer.innerHTML = `
            <h5>${mostPopular.title}</h5>
            <p>${mostPopular.content.substring(0, 100)}...</p>
            <p>Views: ${mostPopular.views}</p>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#articleModal" onclick="viewArticle(${mostPopular.id})">Read</button>
        `;
    }

    window.viewArticle = function (articleId) {
        const article = articlesCache.find(a => a.id === articleId);
        if (article) {
            document.getElementById("articleModalLabel").textContent = article.title;
            document.getElementById("articleContent").textContent = article.content;
            document.getElementById("articleDetails").textContent = `Category: ${article.category} | Date: ${article.date} | Views: ${article.views}`;
        }
    };

    function showLoadingIndicator(visible) {
        document.getElementById("loading-indicator").style.display = visible ? "block" : "none";
    }

    function clearModalContent() {
        document.getElementById("articleContent").textContent = "";
        document.getElementById("articleDetails").textContent = "";
    }
});
