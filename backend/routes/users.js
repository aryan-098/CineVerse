const express = require('express');
const pool    = require('../config/db');
const auth    = require('../middleware/auth');
const router  = express.Router();

// ── GET /api/users/profile  (auth required) ──────────────────
router.get('/profile', auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.username, u.email, u.bio, u.avatar_url, u.created_at,
              COUNT(DISTINCT r.id)  AS review_count,
              COUNT(DISTINCT f.id)  AS favorites_count
       FROM users u
       LEFT JOIN reviews   r ON r.user_id = u.id
       LEFT JOIN favorites f ON f.user_id = u.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [userId]
    );
    if (!users.length) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// ── GET /api/users/reviews  (auth required) ──────────────────
// All reviews by the logged-in user
router.get('/reviews', auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
              m.id AS movie_id, m.title AS movie_title, m.poster_url
       FROM reviews r
       JOIN movies m ON m.id = r.movie_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user reviews.' });
  }
});

// ── PUT /api/users/profile  (auth required) ──────────────────
router.put('/profile', auth, async (req, res) => {
  const userId = req.user.id;
  const { bio, avatar_url } = req.body;
  try {
    await pool.query(
      'UPDATE users SET bio = ?, avatar_url = ? WHERE id = ?',
      [bio || null, avatar_url || null, userId]
    );
    res.json({ message: 'Profile updated!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
