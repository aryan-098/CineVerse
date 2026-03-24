import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, Clock, Calendar, User, Film, Pencil, Trash2 } from 'lucide-react';
import { getMovie, addFavorite, removeFavorite, checkFavorite, addReview, updateReview, deleteReview } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="stars">
      {[1,2,3,4,5].map(s => (
        <span
          key={s}
          className={`star ${s <= (hover || value) ? 'filled' : 'empty'}`}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          style={{fontSize:'1.6rem', cursor:'pointer'}}
        >★</span>
      ))}
    </div>
  );
}

function StarDisplay({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{fontSize:'1.1rem', color: s <= Math.round(rating) ? '#f59e0b' : '#4a4a6a'}}>★</span>
      ))}
    </div>
  );
}

export default function MovieDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const [movie,      setMovie]     = useState(null);
  const [loading,    setLoading]   = useState(true);
  const [isFav,      setIsFav]     = useState(false);
  const [favLoading, setFavLoading]= useState(false);

  // Review form state
  const [rating,   setRating]   = useState(0);
  const [comment,  setComment]  = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId]   = useState(null);

  async function loadMovie() {
    try {
      const res = await getMovie(id);
      setMovie(res.data);
    } catch {
      toast.error('Movie not found');
      navigate('/movies');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMovie(); }, [id]);

  useEffect(() => {
    if (isLoggedIn) {
      checkFavorite(id).then(r => setIsFav(r.data.isFavorite)).catch(() => {});
    }
  }, [id, isLoggedIn]);

  const toggleFav = async () => {
    if (!isLoggedIn) { toast.error('Please login to add favorites'); return; }
    setFavLoading(true);
    try {
      if (isFav) {
        await removeFavorite(id);
        setIsFav(false);
        toast.success('Removed from favorites');
      } else {
        await addFavorite(id);
        setIsFav(true);
        toast.success('Added to favorites ❤️');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    } finally {
      setFavLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      if (editingId) {
        await updateReview(editingId, { rating, comment });
        toast.success('Review updated!');
        setEditingId(null);
      } else {
        await addReview({ movie_id: Number(id), rating, comment });
        toast.success('Review submitted!');
      }
      setRating(0); setComment('');
      loadMovie();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (review) => {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment || '');
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(reviewId);
      toast.success('Review deleted');
      loadMovie();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"/>Loading…</div>;
  if (!movie)  return null;

  const myReview = movie.reviews?.find(r => r.user_id === user?.id);

  return (
    <div className="container movie-detail-page">
      {/* Movie Hero */}
      <div className="movie-detail-hero">
        <div>
          {movie.poster_url
            ? <div className="detail-poster"><img src={movie.poster_url} alt={movie.title}/></div>
            : <div className="detail-poster-placeholder">🎬</div>
          }
        </div>
        <div className="detail-info">
          <span className="detail-genre">{movie.genre}</span>
          <h1 className="detail-title">{movie.title}</h1>

          <div className="detail-stats">
            <span className="detail-stat"><Calendar size={15}/>{movie.release_year}</span>
            {movie.duration_min && <span className="detail-stat"><Clock size={15}/>{movie.duration_min} min</span>}
            {movie.director && <span className="detail-stat"><Film size={15}/>{movie.director}</span>}
            <span className="detail-stat"><User size={15}/>{movie.language}</span>
          </div>

          <div className="detail-rating-big">
            <span className="rating-number">
              {movie.avg_rating ?? '—'}
            </span>
            <div>
              <StarDisplay rating={movie.avg_rating || 0}/>
              <div className="rating-sub">{movie.review_count} review{movie.review_count !== 1 ? 's' : ''}</div>
            </div>
          </div>

          <p className="detail-description">{movie.description || 'No description available.'}</p>

          <div className="detail-actions">
            <button
              className={`fav-btn ${isFav ? 'active' : ''}`}
              onClick={toggleFav}
              disabled={favLoading}
            >
              <Heart size={16} fill={isFav ? 'currentColor' : 'none'}/>
              {isFav ? 'In Favorites' : 'Add to Favorites'}
            </button>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {isLoggedIn && (!myReview || editingId) && (
        <div className="review-form-card" id="review-form">
          <h3>{editingId ? '✏️ Edit Your Review' : '✍️ Write a Review'}</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="form-group">
              <label>Your Rating</label>
              <StarPicker value={rating} onChange={setRating}/>
            </div>
            <div className="form-group">
              <label>Comment (optional)</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Share your thoughts about this movie…"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>
            <div style={{display:'flex', gap:12}}>
              <button type="submit" className="btn-submit" style={{maxWidth:200}} disabled={submitting}>
                {submitting ? 'Submitting…' : editingId ? 'Update Review' : 'Submit Review'}
              </button>
              {editingId && (
                <button type="button" className="btn-secondary" style={{padding:'12px 24px', borderRadius:12}}
                  onClick={() => { setEditingId(null); setRating(0); setComment(''); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {isLoggedIn && myReview && !editingId && (
        <div style={{background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.25)', borderRadius:12, padding:16, marginBottom:24, color:'#a78bfa', fontSize:'0.9rem'}}>
          ✅ You have already reviewed this movie.
        </div>
      )}

      {!isLoggedIn && (
        <div style={{background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.25)', borderRadius:12, padding:20, marginBottom:24, textAlign:'center'}}>
          <p style={{color:'#94a3b8', marginBottom:12}}>Login to write a review or add to favorites</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-section">
        <h2>Reviews ({movie.reviews?.length || 0})</h2>
        {movie.reviews?.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <p>No reviews yet. Be the first to review!</p>
          </div>
        )}
        {movie.reviews?.map(r => (
          <div key={r.id} className="review-card">
            <div className="review-header">
              <div className="review-user">
                <div className="review-avatar">
                  {r.avatar_url
                    ? <img src={r.avatar_url} alt={r.username}/>
                    : r.username[0].toUpperCase()
                  }
                </div>
                <div>
                  <div className="review-username">{r.username}</div>
                  <div className="review-date">{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <StarDisplay rating={r.rating}/>
            </div>
            {r.comment && <p className="review-comment">{r.comment}</p>}
            {isLoggedIn && user?.id === r.user_id && (
              <div className="review-actions">
                <button className="btn-sm btn-edit" onClick={() => startEdit(r)}>
                  <Pencil size={12}/> Edit
                </button>
                <button className="btn-sm btn-delete" onClick={() => handleDelete(r.id)}>
                  <Trash2 size={12}/> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
