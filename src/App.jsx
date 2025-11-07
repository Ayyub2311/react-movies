import React, { useEffect, useState } from 'react'
import { useDebounce } from 'react-use'
import './App.css'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import { getTrendingMovies, updateSearchCount } from './appwrite';
import { getProxiedPosterUrl } from './imageProxy';


const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '', pageNum = 1) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNum}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${pageNum}`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) throw new Error('Failed to fetch movies');

      const data = await response.json();


      if (!data.results || data.results.length === 0) {
        if (pageNum === 1) setErrorMessage('Failed to fetch movies.');
        setHasMore(false);
        return;
      }

      setMovieList(prevMovies =>
        pageNum === 1 ? data.results : [...prevMovies, ...data.results]
      );

      setHasMore(data.page < data.total_pages);

      if (query && pageNum === 1 && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.error('Error fetching movies:', error);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error loading trending movies: ${error}`);
    }
  }

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);


  return (

    <main>

      <div className="pattern"></div>

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1 >Find <span className="text-gradient">Movies</span>  You'll Enjoy Without The Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={getProxiedPosterUrl(movie.poster_url)} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <li
                  key={movie.id}
                  className="movie-item"
                  ref={(el) => {
                    if (el) {
                      setTimeout(() => el.classList.add('animate-in'), 50);
                    }
                  }}
                >
                  <MovieCard movie={movie} />
                </li>

              ))}
            </ul>
          )}

          {hasMore && !isLoading && (
            <div className='load-more'>
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchMovies(debouncedSearchTerm, nextPage);
                }}
              >
                Load More
              </button>
            </div>
          )}
        </section>
      </div>
    </main>

  )
}

export default App
