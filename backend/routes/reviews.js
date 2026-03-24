const express = require('express');
const pool    = require('../config/db');
const auth    = require('../middleware/auth');
const router  = express.Router();

// ── GET /api/reviews/movie/:movieId ──────────────────────────
router.get('/movie/:movieId', async (req, res) => {
  const { movieId } = req.params;
  try {
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
              u.id AS user_id, u.username, u.avatar_url
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.movie_id = ?
       ORDER BY r.created_at DESC`,
      [movieId]
    );
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// ── POST /api/reviews  (auth required) ───────────────────────
router.post('/', auth, async (req, res) => {
  const { movie_id, rating, comment } = req.body;
  const userId = req.user.id;

  if (!movie_id || !rating) {
    return res.status(400).json({ error: 'movie_id and rating are required.' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  try {
    // Check if user already reviewed this movie
    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE user_id = ? AND movie_id = ?',
      [userId, movie_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'You have already reviewed this movie.' });
    }

    const [result] = await pool.query(
      'INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, movie_id, rating, comment || null]
    );

    const [newReview] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.id AS user_id, u.username, u.avatar_url
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ message: 'Review added!', review: newReview[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add review.' });
  }
});

// ── PUT /api/reviews/:id  (auth required, own review only) ───
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (!existing.length) {
      return res.status(404).json({ error: 'Review not found or not yours.' });
    }

    await pool.query(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment || null, id]
    );

    const [updated] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
              u.id AS user_id, u.username
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.id = ?`,
      [id]
    );

    res.json({ message: 'Review updated!', review: updated[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update review.' });
  }
});

// ── DELETE /api/reviews/:id  (auth required, own review) ─────
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [result] = await pool.query(
      'DELETE FROM reviews WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found or not yours.' });
    }
    res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete review.' });
  }
});

module.exports = router;
