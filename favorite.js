const BASE_URL = "https://webdev.alphacamp.io/";
const INDEX_URL = BASE_URL + "api/movies/";
const poster_URL = BASE_URL + "posters/";
const MOVIE_PER_PAGE = 12;
const dataPanel = document.querySelector("#data-panel");
const button = document.querySelector("button");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");

const movies = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
renderMovie(movies);

function renderMovie(data) {
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
              <button class="btn btn-danger btn-minus-favorite" data-id=${
                mov.id
              }>X</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  dataPanel.innerHTML = htmlContent;
}

function showMovieModal(id) {
  axios.get(INDEX_URL + id).then((res) => {
    const modalTitle = document.querySelector("#movie-modal-title");
    const modalImg = document.querySelector("#movie-modal-image");
    const modalDate = document.querySelector("#movie-modal-date");
    const modalDescription = document.querySelector("#movie-modal-description");
    const data = res.data.results;

    modalTitle.innerText = data.title;
    modalDate.innerText = "Release Date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImg.innerHTML = `<img src="https://webdev.alphacamp.io/posters/${data.image}" alt="not found" class="img-fuid"/>`;
  });
}

//刪除最愛的清單
function removeFavorite(id) {
  if (!movies || !movies.length) return;

  const deletedIndex = movies.findIndex((mov) => mov.id === id);
  if (deletedIndex === -1) {
    return;
  } else {
    movies.splice(deletedIndex, 1);
  }

  localStorage.setItem("favoriteMovies", JSON.stringify(movies));
  renderMovie(movies);
}

dataPanel.addEventListener("click", function onPanelClicked(e) {
  if (e.target.matches(".btn-show-movie")) {
    showMovieModal(Number(e.target.dataset.id));
  } else if (e.target.matches(".btn-minus-favorite")) {
    removeFavorite(Number(e.target.dataset.id));
  }
});

searchForm.addEventListener("submit", function onSearchFormSubmit(e) {
  e.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  let filteredMovies = [];

  //方法1
  // for (const mov of movies) {
  //   if (mov.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(mov);
  //   }
  // }
  //方法2  (filter回傳的是保留的陣列，直接讓篩選後的movie等於他)
  filteredMovies = movies.filter((mov) =>
    mov.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert("Couldn't Find Movie with: " + keyword);
  }

  renderMovie(filteredMovies);
});
