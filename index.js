const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;

const movies = [];
let filteredMovies = [];

const dataPanel = document.querySelector("#data-panel");
const movieModal = document.querySelector("#movie-modal");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const modeChange = document.querySelector("#mode-change");

// 預設使用卡片模式
let viewMode = "card";
// 預設第一頁
let currentPage = 1;

//拉電影資料
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    checkMode(currentPage);
  })
  .catch((error) => {
    console.log(error);
  });

// 檢查目前觀看模式
function checkMode(page) {
  if (viewMode === "card") {
    dataPanel.classList.remove("d-flex", "flex-column");
    modeChange.innerHTML = `
    <a href="#"><i class="fas fa-th change-to-card"></i></a>
    `;
    renderMovieCardMode(getMoviesByPage(page));
  } else if (viewMode === "list") {
    dataPanel.classList.add("d-flex", "flex-column");
    modeChange.innerHTML = `
    <a href="#"><i class="fas fa-bars change-to-list"></i></a>
    `;
    renderMovieListMode(getMoviesByPage(page));
  }
}

// 檢查是否已加入最愛清單
function checkFavoriteMovie(id) {
  const favoriteList = JSON.parse(localStorage.getItem("favoriteMovies"));
  if (favoriteList && favoriteList.length > 0) {
    let value = favoriteList.some((f) => f.id === id);
    return value;
  }
}

function renderMovieCardMode(data) {
  let rowHTML = "";

  data.forEach((item) => {
    let isFavorite = checkFavoriteMovie(item.id);

    rowHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${
            POSTER_URL + item.image
          }" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer heart">
            <button class="btn btn-primary btn-show-movie" data-toggle='modal' data-target='#movie-modal' data-id='${
              item.id
            }'>More</button>
            <button class="btn-add-favorite btn fa-heart fa-2x ${
              isFavorite ? "fas" : "far"
            }" data-id='${item.id}'></button>
          </div>
        </div>
      </div>
    </div>
    `;
  });
  dataPanel.innerHTML = rowHTML;
}


function renderMovieListMode(data) {
  let rowHTML = "";

  data.forEach((item) => {
    let isFavorite = checkFavoriteMovie(item.id);

    rowHTML += `
      <hr>
    <div class="d-flex justify-content-between">
      <h5 class="title col-sm-6 ">${item.title}</h5>
      <div class='col-sm-2 heart'>
        <button class="btn btn-primary btn-show-movie" data-toggle='modal' data-target='#movie-modal' data-id='${
          item.id
        }'>More</button>
        <button class="btn-add-favorite btn fa-heart fa-2x ${
          isFavorite ? "fas" : "far"
        }" data-id='${item.id}'></button>
      </div>
    </div>
      `;
  });

  dataPanel.innerHTML = rowHTML;
}

// 增加當前頁面判斷，並顯示當前頁面
function renderPaginator(amount) {
  // 小數點無條件進位 Math.ceil
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  rawHTML = ``;
  for (let page = 1; page <= numberOfPages; page++) {
    // 檢查當前頁面並顯示
    if (currentPage === page) {
      rawHTML += `
<li class="page-item active"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>
`;
    } else {
      rawHTML += `
<li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>
`;
    }
  }
  paginator.innerHTML = rawHTML;
}

// page
function getMoviesByPage(page) {
  // page 1 -> 0 ~ 11 以此類推
  // filterMovies 有長度嗎？ 沒長度給回傳 movies
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];

  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("電影已經在收藏清單中！");
  }

  list.push(movie);

  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// 監聽按鈕 寫函式 （onPanelClicked） 可以幫助找問題
dataPanel.addEventListener("click", function onPanelClicked(event) {
  const target = event.target;
  // description title
  if (target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (target.matches(".btn-add-favorite")) {
    target.classList.remove("far");
    target.classList.add("fas");
    addToFavorite(Number(event.target.dataset.id));
  }
});

// 用 id 尋找對應的電影
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + "/" + id).then((response) => {
    const data = response.data.results;

    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src='${
      POSTER_URL + data.image
    }' alt='movie-poster' class='img-fuid'>`;
  });
}

// 分頁監聽器
paginator.addEventListener("click", function onPaginatorClicked(event) {
  const target = event.target;
  // 'A' -> 元素 <a></a>
  if (event.target.tagName !== "A") return;
  currentPage = Number(target.dataset.page);
  checkMode(currentPage);
  
  // 簡寫
  filteredMovies.length > 0
  ? renderPaginator(filteredMovies.length)
  : renderPaginator(movies.length)
  
  // if (filteredMovies.length > 0) {
  //   renderPaginator(filteredMovies.length)
  // } else {
  //   renderPaginator(movies.length)
  // }
});

// 搜尋監聽器
searchForm.addEventListener("submit", function onSearchFormSubmited(event) {
  // 瀏覽器不重整
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert("找不到關鍵字：" + keyword);
  }
  renderPaginator(filteredMovies.length);
  checkMode(1);
  currentPage = 1; // 回到第一頁
});

// 觀看模式監聽器，顯示目前觀看模式
modeChange.addEventListener("click", function onClickedChangeMode(event) {
  if (event.target.matches(".change-to-list")) {
    viewMode = "card";
    checkMode(currentPage);
  } else if (event.target.matches(".change-to-card")) {
    viewMode = "list";
    checkMode(currentPage);
  }
});
