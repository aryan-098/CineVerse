require('dotenv').config();
const express  = require('express');
const cors     = require('cors');

const authRoutes      = require('./routes/auth');
const movieRoutes     = require('./routes/movies');
const reviewRoutes    = require('./routes/reviews');
const favoriteRoutes  = require('./routes/favorites');
const userRoutes      = require('./routes/users');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/movies',    movieRoutes);
app.use('/api/reviews',   reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/users',     userRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🎬 Movie Review API running on http://localhost:${PORT}`);
});
