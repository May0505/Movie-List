const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies'))

const dataPanel = document.querySelector('#data-panel')
const movieModal = document.querySelector('#movie-modal')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

function renderMovieList(data) {
  let rowHTML = ''

  // 處理
  data.forEach((item) => {
    // data-(x) -> data.set 可以撈資料

    rowHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-toggle='modal' data-target='#movie-modal' data-id='${item.id}'>More</button>
            <button class="btn btn-danger btn-remove" data-id='${item.id}'>X</button>
          </div>
        </div>
      </div>
    </div>`
  });

  dataPanel.innerHTML = rowHTML
}

function removeFromFavorite(id) {
  // findIndex 會回傳位置(1, 2, 3)
  const movieIndex = movies.findIndex(movie => movie.id === id)
  movies.splice(movieIndex, 1)

  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}

// 監聽按鈕 寫函式 （onPanelClicked） 可以幫助找問題
dataPanel.addEventListener('click', function onPanelClicked(event) {
  // description title
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }

})

// 用 id 尋找對應的電影
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')


  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results

    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src='${POSTER_URL + data.image}' alt='movie-poster' class='img-fuid'>`
  })
}

renderMovieList(movies)
