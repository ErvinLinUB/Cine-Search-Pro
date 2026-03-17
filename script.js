class SearchComponent {

  constructor() {

    // DOM Refs
    this.searchInput = document.getElementById('search-input');
    if (!this.searchInput) throw new Error('Element #search-input not found in the DOM');
    this.resultsList = document.getElementById('results-list');
    if (!this.resultsList) throw new Error('Element #results-list not found in the DOM');
    this.statusEl = document.getElementById('status');
    if (!this.statusEl) throw new Error('Element #status not found in the DOM');
    this.app = document.getElementById('app');
    if (!this.app) throw new Error('Element #app not found in the DOM');
    this.movieTemplate = document.getElementById('movie-template');
    if (!this.movieTemplate) throw new Error('Element #movie-template not found in the DOM');

    // Config
    this.API_KEY  = '2ee7d6898391a99306f00fe36468ece7';
    this.API_BASE = 'https://api.themoviedb.org/3/search/movie';

    // State
    this.cache        = new Map();
    this.timerId      = null;
    this.currentAbort = null;

    this.init();
  }

  // Init
  init() {
    this.searchInput.addEventListener('input', (e) => this.handleInput(e));
  }

  // Set Loading
  setLoading(isLoading) {
    this.app.setAttribute('data-loading', isLoading);
  }

  // Render Results
  renderResults(movies) {
    this.resultsList.innerHTML = '';

    if (movies.length === 0) {
      this.statusEl.textContent = 'No results found.';
      return;
    }

    this.statusEl.textContent = '';

    const frag = new DocumentFragment();

    movies.forEach(movie => {
      const clone = this.movieTemplate.content.cloneNode(true);
      clone.querySelector('.title').textContent = movie.title;
      frag.appendChild(clone);
    });

    this.resultsList.appendChild(frag);
  }

  // Fetch Results
  fetchResults(query) {
    if (this.cache.has(query)) {
      console.log('Cache hit:', query);
      this.renderResults(this.cache.get(query));
      return;
    }

    if (this.currentAbort) {
      this.currentAbort.abort();
    }
    this.currentAbort = new AbortController();

    this.setLoading(true);
    this.statusEl.textContent = '';

    const url = `${this.API_BASE}?api_key=${this.API_KEY}&query=${encodeURIComponent(query)}`;

    fetch(url, { signal: this.currentAbort.signal })
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP error - status: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        const results = data.results || [];
        this.cache.set(query, results);
        this.renderResults(results);
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          console.log('Request cancelled:', query);
          return;
        }
        this.statusEl.textContent = 'Error: ' + err.message;
      })
      .finally(() => {
        this.setLoading(false);
      });
  }

  // Handle Input
  handleInput(e) {
    const query = e.target.value.trim();

    if (!query) {
      this.resultsList.innerHTML = '';
      this.statusEl.textContent  = '';
      return;
    }

    if (this.timerId) {
      clearTimeout(this.timerId);
    }

    this.timerId = setTimeout(() => {
      this.fetchResults(query);
    }, 300);
  }

}

// Initialise
const search = new SearchComponent();