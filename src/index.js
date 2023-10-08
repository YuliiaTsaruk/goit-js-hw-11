import { API_KEY } from './js/api';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
const BASE_URL = 'https://pixabay.com/api/';

let lightbox = new SimpleLightbox('.gallery a');
let searchQuery = '';
let page = 1;

form.addEventListener('submit', handlerSubmit);
loadMoreButton.addEventListener('click', handlerLoadMoreBtn);
loadMoreButton.hidden = true;

async function handlerSubmit(evt) {
  evt.preventDefault();
  page = 1;
  gallery.innerHTML = '';
  searchQuery = form.searchQuery.value.trim();
  if (searchQuery === '') {
    return;
  }
  fetchPhoto(searchQuery);
}

async function fetchPhoto() {
  try {
    const params = new URLSearchParams({
      key: API_KEY,
      q: searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: page,
      per_page: 40,
    });
    const response = await axios.get(`${BASE_URL}?${params}`);
    const obj = response.data;
    //   console.log(obj);
    if (obj.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    } else if (obj.totalHits < 40) {
      Notify.success(`Hooray! We found totalHits images: ${obj.totalHits}`);
      gallery.insertAdjacentHTML('beforeend', makeMarkup(obj.hits));
      lightbox.refresh();
      loadMoreButton.hidden = true;
      const messageElement = document.createElement('p class="messege"');
      messageElement.textContent =
        "We're sorry, but you've reached the end of search results.";
      gallery.insertAdjacentElement('beforeend', messageElement);
      return;
    } else {
      Notify.success(`Hooray! We found totalHits images: ${obj.totalHits}`);
      gallery.insertAdjacentHTML('beforeend', makeMarkup(obj.hits));
      lightbox.refresh();
      loadMoreButton.hidden = false;
    }
  } catch (error) {
    console.log(error);
  }
}

function makeMarkup(obj) {
  //   console.log(hits);
  return obj
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
        <div class="photo-card-container">
        <a class="photo-card-link" href="${largeImageURL}">
    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    </div>
    <div class="photo-card-info">
      <p class="info-item">
        <b>Likes</b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${downloads}
      </p>
    </div>
  </div>`
    )
    .join(' ');
}

function handlerLoadMoreBtn() {
  page += 1;
  fetchPhoto();
}
