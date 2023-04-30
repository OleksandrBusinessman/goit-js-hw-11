import { fetchData } from './js/fetchData';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let SEARCH_QUERY;
const PER_PAGE = 40;
let currentPage;

const formEl = document.querySelector('#search-form');
const inputEl = document.querySelector("[name='searchQuery']");
const galleryEl = document.querySelector('.gallery');
const guardEl = document.querySelector('.js-guard');

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 0,
};
const observer = new IntersectionObserver(onPagination, options);
const simpleLightbox = new SimpleLightbox('.gallery a');

inputEl.addEventListener('input', onInput);
formEl.addEventListener('submit', onFormSubmit);

function onInput(e) {
  SEARCH_QUERY = e.target.value.toLowerCase().trim();
}

function onFormSubmit(e) {
  e.preventDefault();
  if (!inputEl.value) {
    return;
  }
  currentPage = 1;
  fetchData(PER_PAGE, currentPage, SEARCH_QUERY)
    .then(({ data: { hits, totalHits } }) => {
      if (!hits.length) {
        observer.unobserve(guardEl);
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        galleryEl.innerHTML = '';
      } else if (hits.length > 0) {
        observer.unobserve(guardEl);
        galleryEl.innerHTML = createMarkup(hits);
        simpleLightbox.refresh();
        Notify.success(`Hooray! We found ${totalHits} images.`);
        if (currentPage !== Math.ceil(totalHits / PER_PAGE)) {
          observer.observe(guardEl);
        }
      }
    })
    .catch(err => console.log(err));
}

function onPagination(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentPage += 1;
      fetchData(PER_PAGE, currentPage, SEARCH_QUERY)
        .then(({ data: { hits, totalHits } }) => {
          galleryEl.insertAdjacentHTML('beforeend', createMarkup(hits));
          simpleLightbox.refresh();
          if (currentPage === Math.ceil(totalHits / PER_PAGE)) {
            observer.unobserve(guardEl);
            Notify.info(
              "We're sorry, but you've reached the end of search results."
            );
          }
        })
        .catch(err => console.log(err));
    }
  });
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<a href="${largeImageURL}"><div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes${likes}</b>
    </p>
    <p class="info-item">
      <b>Views${views}</b>
    </p>
    <p class="info-item">
      <b>Comments${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads${downloads}</b>
    </p>
  </div>
</div></a>`
    )
    .join('');
}
