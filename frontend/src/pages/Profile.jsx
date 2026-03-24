import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Trash2, User } from 'lucide-react';
import { getProfile, getUserReviews, getFavorites, removeFavorite, deleteReview } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [profile,   setProfile]   = useState(null);
  const [reviews,   setReviews]   = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [tab,       setTab]       = useState('favorites');
  const [loading,   setLoading]   = useState(true);

  async function load() {
    try {
      const [pRes, rRes, fRes] = await Promise.all([
        getProfile(), getUserReviews(), getFavorites()
      ]);
      setProfile(pRes.data);
      setReviews(rRes.data);
      setFavorites(fRes.data);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleRemoveFav = async (movieId) => {
    try {
      await removeFavorite(movieId);
      setFavorites(f => f.filter(m => m.id !== movieId));
      toast.success('Removed from favorites');
    } catch { toast.error('Failed to remove'); }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(reviewId);
      setReviews(r => r.filter(rv => rv.id !== reviewId));
      toast.success('Review deleted');
    } catch { toast.error('Failed to delete review'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"/>Loading profile…</div>;

  return (
    <div className="container profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div className="profile-info" style={{flex:1}}>
          <h1>{profile?.username}</h1>
          <p className="profile-email">{profile?.email}</p>
          {profile?.bio && <p className="profile-bio">{profile.bio}</p>}
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-value">{profile?.review_count ?? 0}</div>
              <div className="profile-stat-label">Reviews</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{profile?.favorites_count ?? 0}</div>
              <div className="profile-stat-label">Favorites</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">
                {new Date(profile?.created_at).getFullYear()}
              </div>
              <div className="profile-stat-label">Joined</div>
            </div>
          </div>
        </div>
        <button
          onClick={() => { logoutUser(); navigate('/'); toast.success('Logged out!'); }}
          style={{padding:'10px 22px', borderRadius:10, background:'rgba(239,68,68,0.1)',
            border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', fontWeight:600, fontSize:'0.9rem'}}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button className={`profile-tab ${tab==='favorites' ? 'active' : ''}`}  onClick={() => setTab('favorites')}>
          <Heart size={15} style={{marginRight:6, verticalAlign:'middle'}}/>Favorites ({favorites.length})
        </button>
        <button className={`profile-tab ${tab==='reviews' ? 'active' : ''}`}    onClick={() => setTab('reviews')}>
          <Star size={15} style={{marginRight:6, verticalAlign:'middle'}}/>My Reviews ({reviews.length})
        </button>
      </div>

      {/* Favorites */}
      {tab === 'favorites' && (
        favorites.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">❤️</div><p>No favorites yet. Go explore movies!</p></div>
          : <div className="movies-grid">
              {favorites.map(m => (
                <div key={m.id} style={{position:'relative'}}>
                  <div className="movie-card" onClick={() => navigate(`/movies/${m.id}`)} style={{cursor:'pointer'}}>
                    {m.poster_url
                      ? <img src={m.poster_url} alt={m.title} className="movie-poster" loading="lazy"/>
                      : <div className="movie-poster-placeholder">🎬</div>
                    }
                    <div className="movie-info">
                      <div className="movie-title">{m.title}</div>
                      <div className="movie-meta">
                        <div className="movie-rating"><Star size={12} fill="currentColor"/>{m.avg_rating ?? '—'}</div>
                        <span>{m.release_year}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFav(m.id)}
                    style={{position:'absolute', top:8, right:8, background:'rgba(239,68,68,0.85)',
                      border:'none', borderRadius:8, padding:'4px 8px', color:'white', cursor:'pointer'}}
                    title="Remove from favorites"
                  ><Trash2 size={13}/></button>
                </div>
              ))}
            </div>
      )}

      {/* Reviews */}
      {tab === 'reviews' && (
        reviews.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">⭐</div><p>No reviews yet. Start reviewing movies!</p></div>
          : <div>
              {reviews.map(r => (
                <div key={r.id} className="review-card" style={{cursor:'default'}}>
                  <div className="review-header">
                    <div style={{display:'flex', alignItems:'center', gap:12}}>
                      <div>
                        <div
                          style={{fontWeight:700, color:'#a78bfa', cursor:'pointer', marginBottom:2}}
                          onClick={() => navigate(`/movies/${r.movie_id}`)}
                        >{r.movie_title}</div>
                        <div className="review-date">{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="stars">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{color: s <= r.rating ? '#f59e0b' : '#4a4a6a', fontSize:'1.1rem'}}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="review-comment">{r.comment}</p>}
                  <div className="review-actions">
                    <button className="btn-sm btn-delete" onClick={() => handleDeleteReview(r.id)}>
                      <Trash2 size={12}/> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
      )}
    </div>
  );
}
