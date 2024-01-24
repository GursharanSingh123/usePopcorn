import { useEffect, useRef, useState } from "react";
import StarRating from "./independent components/StarRating";
import { useMovies } from "./custom hooks/useMovies";
import { useLocalStorageState } from "./custom hooks/useLocalStorageState";
import { useKey } from "./custom hooks/useKey";

const average = (arr) =>
  +arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0).toFixed(2);

const KEY = "5795a46e";

export default function App() {
  const [query, setQuery] = useState("");
  // const tempQuery = "interstellar";
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const [watched, setWatched] = useLocalStorageState([], "watched");

  function handleSelectMovie(id) {
    setSelectedMovieId(selectedMovieId === id ? null : id);
    // console.log(selectedMovieId);
  }
  function handleCloseMovie() {
    setSelectedMovieId(null);
    // console.log(selectedMovieId);
  }
  function handleAddWatchmovie(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  function handleWatchedDelete(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  const { movies, isLoading, error } = useMovies(query);

  return (
    <>
      <Navbar>
        <Search
          query={query}
          setQuery={setQuery}
          handleCloseMovie={handleCloseMovie}
        />
        <SearchResults movies={movies} />
      </Navbar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!error && !isLoading && (
            <MovieList movies={movies} handleSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedMovieId ? (
            <SelectedMovieDetail
              selectedMovieId={selectedMovieId}
              onCloseMovie={handleCloseMovie}
              key={selectedMovieId}
              onAddWatchedMovie={handleAddWatchmovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteMovie={handleWatchedDelete}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function SelectedMovieDetail({
  selectedMovieId,
  onCloseMovie,
  onAddWatchedMovie,
  watched,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [movie, setMovie] = useState({});
  const [rating, setRating] = useState(0);
  const isWatched = watched
    .map((movie) => movie.imdbID)
    .includes(selectedMovieId);
  const WatchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedMovieId
  )?.userRating;
  // console.log(WatchedUserRating);
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  const countRef = useRef(0);
  function handleAddRating() {
    const latestWatchedMovie = {
      imdbID: selectedMovieId,
      Title: title,
      Year: year,
      Poster: poster,
      runtime: Number(runtime.split(" ").at(0)),
      imdbRating: Number(imdbRating),
      userRating: rating,
      counRatingDecisions: countRef.current,
    };
    onAddWatchedMovie(latestWatchedMovie);
    onCloseMovie();
  }

  useEffect(
    function () {
      if (rating) countRef.current = countRef.current + 1;
    },
    [rating]
  );
  useKey("Escape", onCloseMovie);
  useEffect(
    function () {
      setIsLoading(true);
      async function getmovieDetails() {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedMovieId}`
        );
        const data = await res.json();
        // console.log(data);
        setMovie(data);
        setIsLoading(false);
      }
      getmovieDetails();
    },
    [selectedMovieId]
  );
  useEffect(
    function () {
      document.title = title ? `MOVIE | ${title}` : "usePopcorn";
      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`poster of ${title} movie.`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span> {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setRating}
                  />
                  {rating !== 0 && (
                    <button className="btn-add" onClick={handleAddRating}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>You have Rated this Movie {WatchedUserRating} ⭐</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Loader() {
  return <div className="loader">Loading...</div>;
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}
function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ query, setQuery, handleCloseMovie }) {
  const inputEl = useRef(null);
  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    // handleCloseMovie();
    setQuery("");
  });
  // useEffect(
  //   function () {
  //     function callBack(e) {
  //       if (e.code === "Enter") {
  //         if (document.activeElement === inputEl.current) return;
  //         inputEl.current.focus();
  //         // handleCloseMovie();
  //         setQuery("");
  //       }
  //     }
  //     document.addEventListener("keydown", callBack);
  //     return () => document.removeEventListener("keydown", callBack);
  //   },
  //   [setQuery]
  // );
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}
function SearchResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
/*function WatchBox({ children }) {
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && children}
    </div>
  );
}*/
function MovieList({ movies, handleSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onSelectMovie={handleSelectMovie}
        />
      ))}
    </ul>
  );
}
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMoviesList({ watched, onDeleteMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          watched={watched}
          onDeleteMovie={onDeleteMovie}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, onDeleteMovie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <p>
          <button
            className="btn-delete"
            onClick={() => onDeleteMovie(movie.imdbID)}
          >
            X
          </button>
        </p>
      </div>
    </li>
  );
}
