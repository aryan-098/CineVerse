# 🎬 CineVerse — Movie Review Website
### DBMS Project | Node.js + MySQL + React

A full-stack movie reviewing website where users can register, login, browse films, write reviews, rate movies, and manage a favorites list.

---

## 📁 Project Structure

```
DBMS Project/
├── database/
│   ├── schema.sql          ← Run first (tables + views)
│   └── seed.sql            ← Run second (sample data)
├── backend/                ← Express REST API
│   ├── server.js
│   ├── .env                ← Fill in your DB password
│   ├── config/db.js
│   ├── middleware/auth.js
│   └── routes/
│       ├── auth.js
│       ├── movies.js
│       ├── reviews.js
│       ├── favorites.js
│       └── users.js
└── frontend/               ← React (Vite)
    └── src/
        ├── pages/
        │   ├── Home.jsx
        │   ├── Movies.jsx
        │   ├── MovieDetail.jsx
        │   ├── Login.jsx
        │   └── Profile.jsx
        ├── components/Navbar.jsx
        ├── context/AuthContext.jsx
        └── utils/api.js
```

---

## 🚀 Setup & Run

### Step 1 — Database

Open MySQL Workbench (or `mysql` CLI) and run:

```sql
SOURCE path/to/database/schema.sql;
SOURCE path/to/database/seed.sql;
```

Or via CLI:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

---

### Step 2 — Backend

```bash
cd backend
# Edit .env and set your MySQL password
notepad .env

# Start the server
npm start
# Server runs at http://localhost:5000
```

---

### Step 3 — Frontend

```bash
cd frontend
npm run dev
# App runs at http://localhost:5173
```

---

## 🔑 Demo Accounts

| Username | Email               | Password     |
|----------|---------------------|--------------|
| alice    | alice@example.com   | Password123! |
| bob      | bob@example.com     | Password123! |
| charlie  | charlie@example.com | Password123! |

---

## 🌐 API Endpoints

| Method | Path                          | Auth? | Description             |
|--------|-------------------------------|-------|-------------------------|
| POST   | /api/auth/register            | No    | Register new user       |
| POST   | /api/auth/login               | No    | Login                   |
| GET    | /api/movies                   | No    | List all movies         |
| GET    | /api/movies/top-rated         | No    | Top 10 by avg rating    |
| GET    | /api/movies/search?q=         | No    | Search movies           |
| GET    | /api/movies/genres            | No    | List genres             |
| GET    | /api/movies/:id               | No    | Movie detail + reviews  |
| GET    | /api/reviews/movie/:id        | No    | Reviews for a movie     |
| POST   | /api/reviews                  | ✅ Yes | Add a review            |
| PUT    | /api/reviews/:id              | ✅ Yes | Edit own review         |
| DELETE | /api/reviews/:id              | ✅ Yes | Delete own review       |
| GET    | /api/favorites                | ✅ Yes | User's favorites        |
| POST   | /api/favorites                | ✅ Yes | Add to favorites        |
| DELETE | /api/favorites/:movieId       | ✅ Yes | Remove from favorites   |
| GET    | /api/users/profile            | ✅ Yes | User profile + counts   |
| GET    | /api/users/reviews            | ✅ Yes | User's review history   |

---

## 🗄️ Database Schema

```
genres      → id, name
users       → id, username, email, password_hash, bio, avatar_url
movies      → id, title, description, release_year, poster_url, genre_id, director, duration_min, language
reviews     → id, user_id, movie_id, rating (1–5), comment
favorites   → id, user_id, movie_id
```

Views:
- `movie_stats` — Movies with AVG rating + review count
- `top_rated_movies` — Ranked by avg rating

---

## ✨ Features

- 🔐 JWT Authentication (register / login)
- 🎬 Browse all movies with genre filtering
- 🔍 Full-text movie search
- ⭐ Write, edit & delete reviews with star ratings
- ❤️ Add/remove movies from favorites
- 📊 Top-rated movies leaderboard
- 👤 User profile with review history & favorites

---

## 🛠️ Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Database | MySQL 8                           |
| Backend  | Node.js, Express, mysql2, bcryptjs, jsonwebtoken |
| Frontend | React 19, Vite, React Router v7, Axios |
| Auth     | JWT (stored in localStorage)      |
