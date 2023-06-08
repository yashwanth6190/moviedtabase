const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://loaclhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertMovieNameToPascalCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const getAllMovies = `
    SELECT movie_name FROM movie;`;
  const moviesArray = await db.all(getAllMovies);
  response.send(
    moviesArray.map((movieName) => convertMovieNameToPascalCase(movieName))
  );
});

//API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovie = `
    INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES 
    ('${directorId}'
    '${movieName}'
    '${leadActor}');`;

  const dbResponse = await db.run(addMovie);
  response.send("Movie Successfully Added");
});
const covertDbObjectToObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id=${movieId};`;
  const movie = await db.get(getMovieQuery);
  console.log(movieId);
  response.send(convertMovieNameToPascalCase(movie));
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovie = `
    UPDATE movie SET 
    director_id=${directorId}
    movie_name=${movieName}
    lead_actor=${leadActor}
    WHERE movie_id=${movieId};`;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});
//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
  DELETE FROM movie
  WHERE movie_id=${movieId};`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});
const convertDirectorDetailsToPascalCase = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API 6
app.get("/directors/", async (request, response) => {
  const getAllDirectors = `
    SELECT * FROM director;`;
  const directorsArray = await db.all(getAllDirectors);
  response.send(
    directorsArray.map((director) =>
      convertDirectorDetailsToPascalCase(director)
    )
  );
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovie = `
    SELECT movie_name FROM director INNER JOIN movie
    ON director.director_id=movie.director_id
    WHERE director.director_id=${directorId};`;
  const movies = await db.all(getDirectorMovie);
  response.send(
    movies.map((movieName) => convertMovieNameToPascalCase(movieName))
  );
});
module.exports = app;
