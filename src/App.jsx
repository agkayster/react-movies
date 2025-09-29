import Search from './components/Search';
import React, { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { updateSearchCount, getTrendingMovies } from './appwrite';

const API_BASE_URL = 'https://api.themoviedb.org/3/discover/movie';

const API_BASE_URL_SEARCH = 'https://api.themoviedb.org/3/';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
	method: 'GET',
	headers: {
		accept: 'application/json',
		Authorization: `Bearer ${API_KEY}`,
	},
};

const App = () => {
	const [searchTerm, setSearchTerm] = useState('');

	// state to declare our error on the browser
	const [errorMessage, setErrorMessage] = useState('');

	const [movieList, setMovieList] = useState([]);

	const [isLoading, setIsLoading] = useState(false);

	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

	const [trendingMovies, setTrendingMovies] = useState([]);

	// debounce hook debounces the search term to prevent making too many requests
	// waits for the user to stop typing for 500ms
	useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

	// declare a function that allows us to fetch the movies
	const fetchMovies = async (query = '') => {
		// start the loading countdown
		setIsLoading(true);

		setErrorMessage('');

		try {
			const endpoint = query
				? `${API_BASE_URL_SEARCH}search/movie?query=${encodeURIComponent(
						query
				  )}`
				: `${API_BASE_URL}?sort_by=popularity.desc`;

			const response = await fetch(endpoint, API_OPTIONS);

			if (!response.ok) {
				throw new Error('Failed to fetch movies!');
			}

			const data = await response.json();

			// if no data response
			if (data.response === false) {
				setErrorMessage(data.Error || 'Failed to fetch movies');
				setMovieList([]);
				return;
			}

			// when we get data
			setMovieList(data.results || []);

			if (query && data.results.length > 0) {
				await updateSearchCount(query, data.results[0]);
			}
		} catch (error) {
			console.error('get error =>', error);
			setErrorMessage('Error fetching movies, please try again later...');
		} finally {
			setIsLoading(false);
		}
	};

	const loadTrendingMovies = async () => {
		try {
			const moviesTrending = await getTrendingMovies();

			setTrendingMovies(moviesTrending || []);
		} catch (error) {
			console.error('Error fetching trending movies:', error);
		}
	};

	// only run this once the component mounts or loads
	// whenever the searchTerm changes, fetchMovies function will return the current searchTerm state
	useEffect(() => {
		fetchMovies(debouncedSearchTerm);
		loadTrendingMovies();
	}, [debouncedSearchTerm]);

	// create another useEffect(uef) hook to load the trending movies function
	useEffect(() => {
		loadTrendingMovies();
	}, []);

	return (
		<main className=''>
			/* hero background blue pattern */
			<div className='pattern' />
			/* without "wrapper" you can't see the hero banner */
			<div className='wrapper'>
				<header>
					<img src='./hero.png' alt='Hero Banner' />
					<h1 className=''>
						Find <span className='text-gradient'>Movies</span>{' '}
						You'll Enjoy Without The Hassle
					</h1>
					<Search
						searchTerm={searchTerm}
						setSearchTerm={setSearchTerm}
					/>
				</header>
				/* trending movies section */
				{trendingMovies.length > 0 && (
					<section className='trending'>
						<h2 className=''>Trending Movies</h2>
						<ul className=''>
							{trendingMovies.map((movie, index) => (
								<li key={movie.$id} className=''>
									<p className=''>{index + 1}</p>
									<img
										src={movie.poster_url}
										alt={movie.title}
									/>
								</li>
							))}
						</ul>
					</section>
				)}
				/* all movies section */
				<section className='all-movies'>
					<h2 className='mt-[40px]'>All Movies</h2>
					{isLoading ? (
						<Spinner />
					) : errorMessage ? (
						<p className='text-red-50'>{errorMessage}</p>
					) : (
						<ul>
							{movieList.map((movie) => (
								<MovieCard key={movie.id} {...movie} />
								// <MovieCard key={movie.id} movie={movie} />
							))}
						</ul>
					)}
				</section>
			</div>
		</main>
	);
};

export default App;
