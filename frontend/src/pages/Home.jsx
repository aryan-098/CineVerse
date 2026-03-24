import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, TrendingUp, Film, ChevronRight } from 'lucide-react';
import { getTopRated, getMovies } from '../utils/api';
import toast from 'react-hot-toast';

function StarDisplay({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`star ${s <= Math.round(rating) ? 'filled' : 'empty'}`}>★</span>
      ))}
    </div>
  );
}

function MovieCard({ movie, rank }) {
  const navigate = useNavigate();
  return (
    <div className="movie-card-wrap" onClick={() => navigate(`/movies/${movie.id}`)}>
      {rank && <div className="rank-badge">#{rank}</div>}
      <div className="movie-card">
        {movie.poster_url
          ? <img src={movie.poster_url} alt={movie.title} className="movie-poster" loading="lazy" />
          : <div className="movie-poster-placeholder">🎬</div>
        }
        <div className="movie-info">
          <div className="movie-title">{movie.title}</div>
          <div className="movie-meta">
            <div className="movie-rating">
              <Star size={12} fill="currentColor" />
              {movie.avg_rating ?? '—'} ({movie.review_count})
            </div>
            <span>{movie.release_year}</span>
          </div>
          <div style={{marginTop:6}}>
            <span className="movie-genre">{movie.genre}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [topRated, setTopRated]   = useState([]);
  const [recent,   setRecent]     = useState([]);
  const [loading,  setLoading]    = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [trRes, allRes] = await Promise.all([getTopRated(), getMovies()]);
        setTopRated(trRes.data.slice(0, 8));
        setRecent(allRes.data.slice(0, 8));
      } catch {
        toast.error('Failed to load movies');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge"><Film size={14}/>Your next favourite movie awaits</div>
          <h1>Discover, Review &amp; Share Great Movies</h1>
          <p>Join our community of movie lovers. Rate films, write reviews, and build your personal watchlist.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/movies')}>
              <Film size={18}/> Browse Movies
            </button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Sign Up
            </button>
          </div>
        </div>
      </section>

      {/* Top Rated */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <TrendingUp size={22} className="section-title-icon"/>Top Rated
            </h2>
            <Link to="/movies" className="section-link">View all <ChevronRight size={14} style={{verticalAlign:'middle'}}/></Link>
          </div>
          {loading
            ? <div className="loading-spinner"><div className="spinner"/>Loading…</div>
            : <div className="movies-grid">
                {topRated.map((m, i) => <MovieCard key={m.id} movie={m} rank={i+1}/>)}
              </div>
          }
        </div>
      </section>

      {/* All Movies */}
      <section className="section" style={{paddingTop:0}}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <Film size={22} className="section-title-icon"/>All Movies
            </h2>
            <Link to="/movies" className="section-link">See more <ChevronRight size={14} style={{verticalAlign:'middle'}}/></Link>
          </div>
          {loading
            ? <div className="loading-spinner"><div className="spinner"/>Loading…</div>
            : <div className="movies-grid">
                {recent.map(m => <MovieCard key={m.id} movie={m}/>)}
              </div>
          }
        </div>
      </section>
    </>
  );
}
