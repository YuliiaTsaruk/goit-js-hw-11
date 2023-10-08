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
let totalImages = 0;
let totalHitsShown = false;

form.addEventListener('submit', handlerSubmit);
loadMoreButton.addEventListener('click', handlerLoadMoreBtn);
loadMoreButton.hidden = true;

async function handlerSubmit(evt) {
  evt.preventDefault();
  loadMoreButton.hidden = true;
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
    loadMoreButton.hidden = true;
    //   console.log(obj);
    if (obj.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreButton.hidden = true;
      gallery.innerHTML = '';
      return;
    } else {
      gallery.insertAdjacentHTML('beforeend', makeMarkup(obj.hits));
      lightbox.refresh();
      loadMoreButton.hidden = false;
      totalImages += obj.hits.length;
      if (!totalHitsShown) {
        Notify.success(`Hooray! We found ${obj.totalHits} images.`);
        totalHitsShown = true; // Встановлюємо флаг
      }
    }
    if (totalImages >= obj.totalHits) {
      // Notify.success(`Hooray! We found ${obj.totalHits} images.`);
      loadMoreButton.hidden = true;
      const messageElement = document.createElement('p');
      messageElement.textContent =
        "We're sorry, but you've reached the end of search results.";
      gallery.insertAdjacentElement('beforeend', messageElement);
      return;
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
