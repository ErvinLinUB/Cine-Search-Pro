// Dom References
const searchInput = document.getElementById('search-input');
if (!searchInput) throw new Error('Element #search-input not found in the DOM');

const resultsList = document.getElementById('results-list');
if (!resultsList) throw new Error('Element #results-list not found in the DOM');

const statusEl = document.getElementById('status');
if (!statusEl) throw new Error('Element #status not found in the DOM');

const app = document.getElementById('app');
if (!app) throw new Error('Element #app not found in the DOM');

const movieTemplate = document.getElementById('movie-template');
if (!movieTemplate) throw new Error('Element #movie-template not found in the DOM');

const detailPanel = document.getElementById('detail-panel');
if (!detailPanel) throw new Error('Element #detail-panel not found in the DOM');

const detailPoster = document.getElementById('detail-poster');
if (!detailPoster) throw new Error('Element #detail-poster not found in the DOM');

const detailTitle = document.getElementById('detail-title');
if (!detailTitle) throw new Error('Element #detail-title not found in the DOM');

const detailOverview = document.getElementById('detail-overview');
if (!detailOverview) throw new Error('Element #detail-overview not found in the DOM');

const detailGenres = document.getElementById('detail-genres');
if (!detailGenres) throw new Error('Element #detail-genres not found in the DOM');

const detailCast = document.getElementById('detail-cast');
if (!detailCast) throw new Error('Element #detail-cast not found in the DOM');

const detailVideos = document.getElementById('detail-videos');
if (!detailVideos) throw new Error('Element #detail-videos not found in the DOM');

// Configuration
const API_KEY    = '2ee7d6898391a99306f00fe36468ece7';
const API_BASE   = 'https://api.themoviedb.org/3';

// TMDB image base URLs
const IMG_BASE_W92  = 'https://image.tmdb.org/t/p/w92';   // thumbnail in results list
const IMG_BASE_W500 = 'https://image.tmdb.org/t/p/w500';  // poster in detail panel

// Application State
const cache      = new Map();
let timerId      = null;
let currentAbort = null;
let activeIndex  = -1;

// UI State
function setLoading(isLoading) {
  app.setAttribute('data-loading', isLoading);
}

// Highlighting
function buildHighlightedTitle(title, query) {
  const container = document.createElement('span');
  const idx = title.toLowerCase().indexOf(query.toLowerCase());

  if (idx === -1) {
    container.textContent = title;
    return container;
  }

  const before = document.createTextNode(title.slice(0, idx));
  const match  = document.createElement('span');
  const after  = document.createTextNode(title.slice(idx + query.length));

  match.className   = 'highlight';
  match.textContent = title.slice(idx, idx + query.length);

  container.appendChild(before);
  container.appendChild(match);
  container.appendChild(after);

  return container;
}

// Render Results
function renderResults(movies, query) {
  resultsList.innerHTML = '';
  activeIndex = -1;

  if (movies.length === 0) {
    statusEl.textContent = 'No results found.';
    return;
  }

  statusEl.textContent = '';

  const frag = new DocumentFragment();

  movies.forEach((movie, index) => {
    const clone = movieTemplate.content.cloneNode(true);
    const li    = clone.querySelector('li');
    const thumb = clone.querySelector('.thumb');
    const span  = clone.querySelector('.title');

    // Thumbnail — use poster_path if available, otherwise hide the img
    if (movie.poster_path) {
      thumb.src = IMG_BASE_W92 + movie.poster_path;
      thumb.alt = movie.title;
    } else {
      thumb.style.display = 'none';
    }

    span.appendChild(buildHighlightedTitle(movie.title, query));

    li.setAttribute('data-index', index);
    li.addEventListener('click', () => selectMovie(movie.id));

    frag.appendChild(clone);
  });

  resultsList.appendChild(frag);
}

// Keyboard Navigation
function updateActiveItem() {
  const items = resultsList.querySelectorAll('li');
  items.forEach((item, i) => {
    item.classList.toggle('active', i === activeIndex);
  });
}

// Movie Details
function selectMovie(movieId) {
  detailPanel.style.display = 'block';
  detailTitle.textContent    = 'Loading...';
  detailOverview.textContent = '';
  detailGenres.textContent   = '';
  detailCast.textContent     = '';
  detailVideos.innerHTML     = '';
  detailPoster.src           = '';

  const detailsUrl = `${API_BASE}/movie/${movieId}?api_key=${API_KEY}`;
  const creditsUrl = `${API_BASE}/movie/${movieId}/credits?api_key=${API_KEY}`;
  const videosUrl  = `${API_BASE}/movie/${movieId}/videos?api_key=${API_KEY}`;

  Promise.allSettled([
    fetch(detailsUrl).then(r => r.json()),
    fetch(creditsUrl).then(r => r.json()),
    fetch(videosUrl).then(r => r.json())
  ]).then(([detailsResult, creditsResult, videosResult]) => {

    if (detailsResult.status === 'fulfilled') {
      const d = detailsResult.value;

      detailTitle.textContent    = d.title || 'N/A';
      detailOverview.textContent = d.overview || 'No overview available.';
      detailGenres.textContent   = d.genres
        ? d.genres.map(g => g.name).join(', ')
        : 'N/A';

      // Poster in detail panel
      if (d.poster_path) {
        detailPoster.src    = IMG_BASE_W500 + d.poster_path;
        detailPoster.alt    = d.title;
        detailPoster.style.display = 'block';
      } else {
        detailPoster.style.display = 'none';
      }
    } else {
      detailTitle.textContent = 'Failed to load details.';
    }

    if (creditsResult.status === 'fulfilled') {
      const cast = creditsResult.value.cast || [];
      detailCast.textContent = cast.length
        ? cast.slice(0, 5).map(c => c.name).join(', ')
        : 'No cast available.';
    } else {
      detailCast.textContent = 'Failed to load credits.';
    }

    if (videosResult.status === 'fulfilled') {
      const videos  = videosResult.value.results || [];
      const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');

      if (trailer) {
        // Embedded YouTube iframe so the user can watch directly in the app
        const iframe = document.createElement('iframe');
        iframe.src             = `https://www.youtube.com/embed/${trailer.key}`;
        iframe.title           = 'Movie Trailer';
        iframe.allow           = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        detailVideos.appendChild(iframe);
      } else {
        detailVideos.textContent = 'No trailer available.';
      }
    } else {
      detailVideos.textContent = 'Failed to load videos.';
    }
  });
}

// Search Requests
function fetchResults(query) {
  if (cache.has(query)) {
    console.log('Cache hit:', query);
    renderResults(cache.get(query), query);
    return;
  }

  if (currentAbort) {
    currentAbort.abort();
  }

  currentAbort = new AbortController();

  setLoading(true);
  statusEl.textContent = '';

  const url = `${API_BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;

  fetch(url, { signal: currentAbort.signal })
    .then(response => {
      if (!response.ok) {
        throw new Error('HTTP error - status: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      const results = data.results || [];
      cache.set(query, results);
      renderResults(results, query);
    })
    .catch(err => {
      if (err.name === 'AbortError') {
        console.log('Request cancelled:', query);
        return;
      }
      statusEl.textContent = 'Error: ' + err.message;
    })
    .finally(() => {
      setLoading(false);
    });
}

// Input Handling
function handleInput(e) {
  const query = e.target.value.trim();

  if (!query) {
    resultsList.innerHTML     = '';
    statusEl.textContent      = '';
    detailPanel.style.display = 'none';
    return;
  }

  if (timerId) {
    clearTimeout(timerId);
  }

  timerId = setTimeout(() => {
    fetchResults(query);
  }, 300);
}

// Keyboard Input
function handleKeydown(e) {
  const items = resultsList.querySelectorAll('li');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex = Math.min(activeIndex + 1, items.length - 1);
    updateActiveItem();
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex = Math.max(activeIndex - 1, 0);
    updateActiveItem();
  }
  else if (e.key === 'Enter' && activeIndex >= 0) {
    const activeItem = items[activeIndex];
    const index      = parseInt(activeItem.getAttribute('data-index'));
    const query      = searchInput.value.trim();
    const movies     = cache.get(query) || [];

    if (movies[index]) {
      selectMovie(movies[index].id);
    }
  }
}

// Initialization
searchInput.addEventListener('input', handleInput);
searchInput.addEventListener('keydown', handleKeydown);