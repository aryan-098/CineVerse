const fs = require("fs");

const API_KEY = "90b8fd449d405e2a9c88b03eb6e606b1";
const BASE_URL = "https://api.themoviedb.org/3";

// Map TMDB genre IDs to your local genre_id (adjust to match your genres table)
const genreMap = {
  28: 1,    // Action → Action
  16: 8,    // Animation → Animation
  35: 3,    // Comedy → Comedy
  18: 2,    // Drama → Drama
  27: 5,    // Horror → Horror
  10749: 6, // Romance → Romance
  878: 4,   // Sci-Fi → Sci-Fi
  53: 7,    // Thriller → Thriller
  // Everything else falls back to Action (1)
  10751: 1, // Family → Action
  12: 1,    // Adventure → Action
  14: 1,    // Fantasy → Action
  36: 2,    // History → Drama
  10402: 3, // Music → Comedy
  9648: 7,  // Mystery → Thriller
  10770: 2, // TV Movie → Drama
  80: 7,    // Crime → Thriller
  99: 2,    // Documentary → Drama
};

function escape(str) {
  if (!str) return "NULL";
  return `'${String(str).replace(/'/g, "''")}'`;
}

async function fetchMovies() {
  let inserts = [];
  const seenIds = new Set(); // 👈 add this

  for (let page = 1; page <= 10; page++) {
    const res = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
    );
    const data = await res.json();

    for (const movie of data.results) {
      if (seenIds.has(movie.id)) continue; // 👈 skip duplicates
      seenIds.add(movie.id);               // 👈 mark as seen

      const title = escape(movie.title);
      const description = escape(movie.overview);
      const release_year = movie.release_date
        ? movie.release_date.split("-")[0]
        : "NULL";
      const poster_url = movie.poster_path
        ? escape(`https://image.tmdb.org/t/p/w500${movie.poster_path}`)
        : "NULL";
      const language = escape(movie.original_language);
      const genre_id = genreMap[movie.genre_ids?.[0]] ?? 1;

      // TMDB popular endpoint doesn't include director/duration, default to NULL
      inserts.push(
        `(${title}, ${description}, ${release_year}, ${poster_url}, NULL, NULL, ${language}, ${genre_id})`
      );
    }
  }

  const sql = `
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE movies;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO movies (title, description, release_year, poster_url, director, duration_min, language, genre_id)
VALUES
${inserts.join(",\n")};
`;

  fs.writeFileSync("../../database/seed.sql", sql);
  console.log(`✅ seed.sql generated with ${inserts.length} movies!`);
}

fetchMovies().catch(console.error);