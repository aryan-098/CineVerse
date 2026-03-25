
--  Movie Review Website - Database Schema
--  Run this file first, then seed.sql


CREATE DATABASE IF NOT EXISTS movie_review_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE movie_review_db;

-- Genres

CREATE TABLE IF NOT EXISTS genres (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
);


-- Users

CREATE TABLE IF NOT EXISTS users (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(50)  NOT NULL UNIQUE,
    email          VARCHAR(100) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);


-- Movies

CREATE TABLE IF NOT EXISTS movies (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    release_year   YEAR         NOT NULL,
    poster_url     VARCHAR(500) DEFAULT NULL,
    trailer_url    VARCHAR(500) DEFAULT NULL,
    genre_id       INT          NOT NULL,
    director       VARCHAR(100) DEFAULT NULL,
    duration_min   INT          DEFAULT NULL COMMENT 'Duration in minutes',
    language       VARCHAR(50)  DEFAULT 'English',
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movies_genre FOREIGN KEY (genre_id) REFERENCES genres(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_genre (genre_id),
    INDEX idx_title (title),
    INDEX idx_year (release_year),
    FULLTEXT INDEX ft_title_desc (title, description)
);


-- Reviews

CREATE TABLE IF NOT EXISTS reviews (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT  NOT NULL,
    movie_id    INT  NOT NULL,
    rating      TINYINT NOT NULL,
    comment     TEXT,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_reviews_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    CONSTRAINT chk_rating       CHECK (rating BETWEEN 1 AND 5),
    UNIQUE KEY uq_user_movie (user_id, movie_id),
    INDEX idx_movie_id (movie_id),
    INDEX idx_user_id (user_id)
);


-- Favorites

CREATE TABLE IF NOT EXISTS favorites (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    movie_id    INT NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fav_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_fav_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE KEY uq_fav_user_movie (user_id, movie_id),
    INDEX idx_fav_user (user_id)
);


-- Useful Views

-- Movies with average rating and review count
CREATE OR REPLACE VIEW movie_stats AS
SELECT
    m.id,
    m.title,
    m.description,
    m.release_year,
    m.poster_url,
    m.trailer_url,
    m.director,
    m.duration_min,
    m.language,
    g.name               AS genre,
    g.id                 AS genre_id,
    ROUND(AVG(r.rating), 1) AS avg_rating,
    COUNT(r.id)          AS review_count
FROM movies m
JOIN genres g ON g.id = m.genre_id
LEFT JOIN reviews r ON r.movie_id = m.id
GROUP BY m.id, m.title, m.description, m.release_year, m.poster_url,
         m.trailer_url, m.director, m.duration_min, m.language, g.name, g.id;

-- Top-rated movies (avg rating >= 1 review)
CREATE OR REPLACE VIEW top_rated_movies AS
SELECT * FROM movie_stats
WHERE review_count > 0
ORDER BY avg_rating DESC, review_count DESC;
