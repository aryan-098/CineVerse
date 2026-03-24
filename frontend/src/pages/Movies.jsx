import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Search } from 'lucide-react';
import { getMovies, getGenres, searchMovies } from '../utils/api';
import toast from 'react-hot-toast';

function MovieCard({ movie }) {
  const navigate = useNavigate();
  return (
    <div className="movie-card" onClick={() => navigate(`/movies/${movie.id}`)} style={{cursor:'pointer'}}>
      {movie.poster_url
        ? <img src={movie.poster_url} alt={movie.title} className="movie-poster" loading="lazy"/>
        : <div className="movie-poster-placeholder">🎬</div>
      }
      <div className="movie-info">
        <div className="movie-title">{movie.title}</div>
        <div className="movie-meta">
          <div className="movie-rating">
            <Star size={12} fill="currentColor"/>
            {movie.avg_rating ?? '—'} ({movie.review_count})
          </div>
          <span>{movie.release_year}</span>
        </div>
        <div style={{marginTop:6}}>
          <span className="movie-genre">{movie.genre}</span>
        </div>
      </div>
    </div>
  );
}

export default function Movies() {
  const [movies,       setMovies]      = useState([]);
  const [genres,       setGenres]      = useState([]);
  const [activeGenre,  setActiveGenre] = useState(null);
  const [query,        setQuery]       = useState('');
  const [loading,      setLoading]     = useState(true);

  // Load genres once
  useEffect(() => {
    getGenres().then(r => setGenres(r.data)).catch(() => {});
  }, []);

  // Load movies when genre changes
  useEffect(() => {
    if (query) return; // searching overrides
    setLoading(true);
    getMovies(activeGenre)
      .then(r => setMovies(r.data))
      .catch(() => toast.error('Failed to load movies'))
      .finally(() => setLoading(false));
  }, [activeGenre]);

  // Search with debounce
  useEffect(() => {
    if (!query) {
      // reset to genre filter
      setLoading(true);
      getMovies(activeGenre)
        .then(r => setMovies(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
      return;
    }
    if (query.length < 2) return;
    const t = setTimeout(() => {
      setLoading(true);
      searchMovies(query)
        .then(r => setMovies(r.data))
        .catch(() => toast.error('Search failed'))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="container" style={{paddingTop:40, paddingBottom:80}}>
      <div className="page-header">
        <h1>🎬 Movie Library</h1>
        <p>Browse {movies.length} movies, search by title, or filter by genre</p>
      </div>

      {/* Search */}
      <div style={{maxWidth:520, margin:'0 auto 28px'}}>
        <div className="search-bar-wrap">
          <Search size={18} className="search-icon"/>
          <input
            type="text"
            placeholder="Search movies by title…"
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveGenre(null); }}
          />
        </div>
      </div>

      {/* Genre Filters */}
      {!query && (
        <div className="filters-row">
          <button
            className={`filter-chip ${!activeGenre ? 'active' : ''}`}
            onClick={() => setActiveGenre(null)}
          >All</button>
          {genres.map(g => (
            <button
              key={g.id}
              className={`filter-chip ${activeGenre === g.id ? 'active' : ''}`}
              onClick={() => setActiveGenre(g.id)}
            >{g.name}</button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading
        ? <div className="loading-spinner"><div className="spinner"/>Loading…</div>
        : movies.length === 0
          ? <div className="empty-state">
              <div className="empty-state-icon">🎭</div>
              <p>No movies found. Try a different search or filter.</p>
            </div>
          : <div className="movies-grid">
              {movies.map(m => <MovieCard key={m.id} movie={m}/>)}
            </div>
      }
    </div>
  );
}
