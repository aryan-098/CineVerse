const express = require('express');
const pool    = require('../config/db');
const router  = express.Router();

// ── GET /api/movies ──────────────────────────────────────────
// List all movies with avg rating; optional ?genre=1
router.get('/', async (req, res) => {
  try {
    const { genre } = req.query;
    let query  = 'SELECT * FROM movie_stats';
    const params = [];

    if (genre) {
      query += ' WHERE genre_id = ?';
      params.push(genre);
    }
    query += ' ORDER BY title ASC';

    const [movies] = await pool.query(query, params);
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch movies.' });
  }
});

// ── GET /api/movies/top-rated ────────────────────────────────
// Top 10 movies by average rating
router.get('/top-rated', async (req, res) => {
  try {
    const [movies] = await pool.query(
      `SELECT * FROM movie_stats
       WHERE review_count > 0
       ORDER BY avg_rating DESC, review_count DESC
       LIMIT 10`
    );
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch top-rated movies.' });
  }
});

// ── GET /api/movies/search?q= ────────────────────────────────
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters.' });
  }
  try {
    const [movies] = await pool.query(
      `SELECT ms.*
       FROM movie_stats ms
       WHERE MATCH(m.title, m.description) AGAINST (? IN BOOLEAN MODE)
          OR ms.title LIKE ?
       ORDER BY avg_rating DESC
       LIMIT 20`,
      [q + '*', `%${q}%`]
    );

    // Simpler fallback if FULLTEXT fails - just use LIKE
    if (!movies.length) {
      const [fallback] = await pool.query(
        `SELECT * FROM movie_stats
         WHERE title LIKE ? OR genre LIKE ?
         ORDER BY avg_rating DESC
         LIMIT 20`,
        [`%${q}%`, `%${q}%`]
      );
      return res.json(fallback);
    }
    res.json(movies);
  } catch (err) {
    // Fallback to simple LIKE search
    try {
      const [movies] = await pool.query(
        `SELECT * FROM movie_stats
         WHERE title LIKE ? OR genre LIKE ?
         ORDER BY avg_rating DESC
         LIMIT 20`,
        [`%${q}%`, `%${q}%`]
      );
      res.json(movies);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Search failed.' });
    }
  }
});

// ── GET /api/movies/genres ───────────────────────────────────
router.get('/genres', async (req, res) => {
  try {
    const [genres] = await pool.query('SELECT * FROM genres ORDER BY name');
    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch genres.' });
  }
});

// ── GET /api/movies/:id ──────────────────────────────────────
// Single movie detail with all reviews
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [movies] = await pool.query(
      'SELECT * FROM movie_stats WHERE id = ?', [id]
    );
    if (!movies.length) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
              u.id AS user_id, u.username, u.avatar_url
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.movie_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({ ...movies[0], reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch movie details.' });
  }
});

module.exports = router;
