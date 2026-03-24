const express = require('express');
const pool    = require('../config/db');
const auth    = require('../middleware/auth');
const router  = express.Router();

// ── GET /api/favorites  (auth required) ──────────────────────
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const [favorites] = await pool.query(
      `SELECT ms.*, f.created_at AS favorited_at
       FROM favorites f
       JOIN movie_stats ms ON ms.id = f.movie_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );
    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch favorites.' });
  }
});

// ── POST /api/favorites  (auth required) ─────────────────────
router.post('/', auth, async (req, res) => {
  const { movie_id } = req.body;
  const userId = req.user.id;

  if (!movie_id) {
    return res.status(400).json({ error: 'movie_id is required.' });
  }

  try {
    // Check movie exists
    const [movie] = await pool.query('SELECT id FROM movies WHERE id = ?', [movie_id]);
    if (!movie.length) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    await pool.query(
      'INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)',
      [userId, movie_id]
    );
    res.status(201).json({ message: 'Added to favorites!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Movie already in favorites.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to add favorite.' });
  }
});

// ── DELETE /api/favorites/:movieId  (auth required) ──────────
router.delete('/:movieId', auth, async (req, res) => {
  const { movieId } = req.params;
  const userId = req.user.id;

  try {
    const [result] = await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favorite not found.' });
    }
    res.json({ message: 'Removed from favorites.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove favorite.' });
  }
});

// ── GET /api/favorites/check/:movieId  (auth required) ───────
// Check if a specific movie is in the user's favorites
router.get('/check/:movieId', auth, async (req, res) => {
  const { movieId } = req.params;
  const userId = req.user.id;
  try {
    const [rows] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );
    res.json({ isFavorite: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check favorite.' });
  }
});

module.exports = router;
