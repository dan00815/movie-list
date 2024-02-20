const BASE_URL = "https://webdev.alphacamp.io/";
const INDEX_URL = BASE_URL + "api/movies/";
const poster_URL = BASE_URL + "posters/";
const MOVIE_PER_PAGE = 12;
const dataPanel = document.querySelector("#data-panel");
const button = document.querySelector("button");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const icon = document.querySelector(".icon");

const displayMode = {
  LIST_MODE: "list-mode",
  CARD_MODE: "card-mode",
  DEFAULT_MODE: "default-mode",
};

const model = {
  movies: [],
  filteredMovies: [],
  currentPage: 1,
  getMoviesByPage(page) {
    // movie有可能是80部去分，也可能是有搜尋到的去分
    const movieData = this.filteredMovies.length
      ? this.filteredMovies
      : this.movies;
    const startIndex = (page - 1) * MOVIE_PER_PAGE;
    return movieData.slice(startIndex, page * MOVIE_PER_PAGE);
  },
};

const view = {
  renderMovieByCard(data) {
    let htmlContent = "";
    data.forEach((mov) => {
      htmlContent += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${poster_URL + mov.image}"
              class="card-img-top"
              alt="Movie Poster"
            />
            <div class="card-body">
              <h5 class="card-title">${mov.title}</h5>
            </div>
            <div class="card-footer">
              <button
                class="btn btn-primary btn-show-movie"
                data-bs-toggle="modal"
                data-bs-target="#movie-modal"
                data-id=${mov.id}
              >
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id=${
                mov.id
              }>+</button>
            </div>
          </div>
        </div>
      </div>
    `;
    });

    dataPanel.innerHTML = htmlContent;
  },
  renderMovieByList(data) {
    let htmlContent = "";
    htmlContent += `<table class="movie-table">`;
    data.forEach((mov) => {
      htmlContent += `
      <tr>
      <td>${mov.title}</td>
      <td class="sec-td">
        <div class="card-footer">
          <button
            class="btn btn-primary btn-show-movie"
            data-bs-toggle="modal"
            data-bs-target="#movie-modal"
            data-id="${mov.id}"
          >
            More
          </button>
          <button class="btn btn-info btn-add-favorite" data-id=${mov.id}>+</button>
        </div>
      </td>
    </tr>`;
    });
    htmlContent += `</table>`;

    dataPanel.innerHTML = htmlContent;
  },
  renderPaginator(amount) {
    //依照amount要是電影的部數，來決定要產生多少分頁
    const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE);
    let pageRowContent = "";

    for (let page = 0; page < numberOfPages; page++) {
      pageRowContent += `<li class="page-item"><a class="page-link" href="#" data-page=${
        page + 1
      }>${page + 1}</a></li>`;
    }
    paginator.innerHTML = pageRowContent;
  },
  showMovieModal(id) {
    axios.get(INDEX_URL + id).then((res) => {
      const modalTitle = document.querySelector("#movie-modal-title");
      const modalImg = document.querySelector("#movie-modal-image");
      const modalDate = document.querySelector("#movie-modal-date");
      const modalDescription = document.querySelector(
        "#movie-modal-description"
      );
      const data = res.data.results;

      modalTitle.innerText = data.title;
      modalDate.innerText = "Release Date: " + data.release_date;
      modalDescription.innerText = data.description;
      modalImg.innerHTML = `<img src="https://webdev.alphacamp.io/posters/${data.image}" alt="not found" class="img-fuid"/>`;
    });
  },
  addToFavorite(id) {
    //先找到點選的電影，是一個物件
    const matchedMovie = model.movies.find((mov) => mov.id === id);
    //需要一個裝找到的電影的[]，最後要把他放進localStorage
    const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
    //先檢查沒有重複，才Push進list
    if (list.some((mov) => mov.id === id)) {
      return alert("電影已經在收藏清單中");
    }
    list.push(matchedMovie);

    localStorage.setItem("favoriteMovies", JSON.stringify(list));

    alert(`"${matchedMovie.title}"  已經加入最愛片單`);
  },
};

const controller = {
  currentMode: displayMode.DEFAULT_MODE,

  renderMovie() {
    switch (this.currentMode) {
      case "list-mode":
        view.renderMovieByList(model.getMoviesByPage(model.currentPage));
        break;
      case "card-mode":
        view.renderMovieByCard(model.getMoviesByPage(model.currentPage));
        break;
      default:
        view.renderMovieByCard(model.getMoviesByPage(model.currentPage));
        break;
    }
  },

  changePage() {
    //依狀態判斷要render哪個
    switch (this.currentMode) {
      case "list-mode":
        view.renderMovieByList(model.getMoviesByPage(model.currentPage));
        break;
      case "card-mode":
        view.renderMovieByCard(model.getMoviesByPage(model.currentPage));
        break;
      default:
        view.renderMovieByCard(model.getMoviesByPage(model.currentPage));
        break;
    }
  },

  showSearchedResult() {
    view.renderPaginator(model.filteredMovies.length);
    model.currentPage = 1;
    switch (this.currentMode) {
      case "list-mode":
        view.renderMovieByList(model.getMoviesByPage(1));
        break;
      case "card-mode":
        view.renderMovieByCard(model.getMoviesByPage(1));
        break;
      default:
        view.renderMovieByCard(model.getMoviesByPage(1));
        break;
    }
  },

  firstRender() {
    axios
      .get(INDEX_URL)
      .then((res) => {
        model.movies.push(...res.data.results);
        this.renderMovie();
        view.renderPaginator(model.movies.length);
      })
      .catch((err) => {
        console.log(err);
      });

    //這不需要依照list或card狀態來做不同動作
    dataPanel.addEventListener("click", function onPanelClicked(e) {
      if (e.target.matches(".btn-show-movie")) {
        view.showMovieModal(Number(e.target.dataset.id));
      } else if (e.target.matches(".btn-add-favorite")) {
        view.addToFavorite(Number(e.target.dataset.id));
      }
    });
  },
};

controller.firstRender();

icon.addEventListener("click", (e) => {
  if (e.target.classList.contains("icon-list")) {
    //改變狀態的時機在點擊切換選單按鈕時
    controller.currentMode = displayMode.LIST_MODE;
  } else if (e.target.classList.contains("icon-card")) {
    controller.currentMode = displayMode.CARD_MODE;
  }

  controller.renderMovie();
});

searchForm.addEventListener("submit", function onSearchFormSubmit(e) {
  e.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  model.filteredMovies = model.movies.filter((mov) =>
    mov.title.toLowerCase().includes(keyword)
  );
  if (model.filteredMovies.length === 0) {
    return alert("Couldn't Find Movie with: " + keyword);
  }
  controller.showSearchedResult();
});

paginator.addEventListener("click", (e) => {
  if (e.target.matches(".page-link")) {
    const PageIndex = Number(e.target.dataset.page);
    model.currentPage = PageIndex; //有存在必要 當點到某分頁時，若切換模式，model.currentPage要能知道在第幾頁
    controller.changePage();
  }
});
