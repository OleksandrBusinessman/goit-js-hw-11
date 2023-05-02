import { fetchData } from './js/fetchData';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const PER_PAGE = 40;
let currentPage;
let inputValue;

const formEl = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');
const guardEl = document.querySelector('.js-guard');

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 0,
};
const observer = new IntersectionObserver(onPagination, options);
const simpleLightbox = new SimpleLightbox('.gallery a');

formEl.addEventListener('submit', onFormSubmit);

async function onFormSubmit(e) {
  e.preventDefault();
  inputValue = e.target.elements.searchQuery.value.toLowerCase().trim();
  if (!inputValue) {
    observer.unobserve(guardEl);
    galleryEl.innerHTML = '';
    Notify.info('Please enter a search term!');
    return;
  }
  currentPage = 1;
  galleryEl.innerHTML = '';
  observer.unobserve(guardEl);

  try {
    const {
      data: { hits, totalHits },
    } = await fetchData(PER_PAGE, currentPage, inputValue);

    if (!hits.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (hits.length > 0) {
      galleryEl.innerHTML = createMarkup(hits);
      simpleLightbox.refresh();
      Notify.success(`Hooray! We found ${totalHits} images.`);

      if (currentPage !== Math.ceil(totalHits / PER_PAGE)) {
        observer.observe(guardEl);
      }
    }
  } catch (err) {
    console.log(err);
  }
}

async function onPagination(entries, observer) {
  await entries.forEach(async entry => {
    if (entry.isIntersecting) {
      currentPage += 1;

      try {
        const {
          data: { hits, totalHits },
        } = await fetchData(PER_PAGE, currentPage, inputValue);
        galleryEl.insertAdjacentHTML('beforeend', createMarkup(hits));
        simpleLightbox.refresh();
        if (currentPage === Math.ceil(totalHits / PER_PAGE)) {
          observer.unobserve(guardEl);
          Notify.info(
            "We're sorry, but you've reached the end of search results."
          );
        }
      } catch (err) {
        console.log(err);
      }
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
      }) => `<a class="gallery__item" href="${largeImageURL}"><div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes<br /><span class="info-item__value">${likes}</span></b>
    </p>
    <p class="info-item">
      <b>Views<br /><span class="info-item__value">${views}</span></b>
    </p>
    <p class="info-item">
      <b>Comments<br /><span class="info-item__value">${comments}</span></b>
    </p>
    <p class="info-item">
      <b>Downloads<br /><span class="info-item__value">${downloads}</span></b>
    </p>
  </div>
</div></a>`
    )
    .join('');
}
