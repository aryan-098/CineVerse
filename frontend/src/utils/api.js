import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data)    => API.post('/auth/register', data);
export const login    = (data)    => API.post('/auth/login', data);

// Movies
export const getMovies    = (genre)  => API.get('/movies', { params: genre ? { genre } : {} });
export const getTopRated  = ()       => API.get('/movies/top-rated');
export const getMovie     = (id)     => API.get(`/movies/${id}`);
export const searchMovies = (q)      => API.get('/movies/search', { params: { q } });
export const getGenres    = ()       => API.get('/movies/genres');

// Reviews
export const getReviews   = (movieId)         => API.get(`/reviews/movie/${movieId}`);
export const addReview    = (data)            => API.post('/reviews', data);
export const updateReview = (id, data)        => API.put(`/reviews/${id}`, data);
export const deleteReview = (id)              => API.delete(`/reviews/${id}`);

// Favorites
export const getFavorites     = ()        => API.get('/favorites');
export const addFavorite      = (movie_id)=> API.post('/favorites', { movie_id });
export const removeFavorite   = (movieId) => API.delete(`/favorites/${movieId}`);
export const checkFavorite    = (movieId) => API.get(`/favorites/check/${movieId}`);

// User
export const getProfile     = ()     => API.get('/users/profile');
export const getUserReviews = ()     => API.get('/users/reviews');
export const updateProfile  = (data) => API.put('/users/profile', data);

export default API;
