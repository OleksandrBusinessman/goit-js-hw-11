import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '35884784-f4ef154ca00c5641d7d285f15';
const searchParams = new URLSearchParams({
  key: API_KEY,
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
});

async function fetchData(PER_PAGE, currentPage, SEARCH_QUERY) {
  try {
    const URL = `${BASE_URL}?${searchParams}&per_page=${PER_PAGE}&page=${currentPage}&q=${SEARCH_QUERY}`;
    const resp = await axios.get(URL);
    return resp;
  } catch (err) {
    console.log(err);
  }
}

export { fetchData };
