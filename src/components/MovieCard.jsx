import React from 'react'
import { getProxiedPosterUrl } from '../imageProxy';

const MovieCard = ({ movie:
    { title, vote_average, poster_path, release_date, original_language, poster_url }
}) => {



    return (
        <>
            <div className="movie-card">

                <img
                    src={poster_url
                        ? getProxiedPosterUrl(poster_url)
                        : poster_path
                            ? getProxiedPosterUrl(`https://image.tmdb.org/t/p/w500${poster_path}`)
                            : '/no-movie.png'}
                    alt={title || 'Movie poster'}
                    onError={(e) => { e.target.src = '/no-movie.png'; }}
                />


                <div className="mt-4">
                    <h3 className='text-left'>{title}</h3>

                    <div className="content">
                        <div className="rating">
                            <img src="star.svg" alt="Star Icon" />
                            <p className='text-white'>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
                        </div>

                        <span>•</span>
                        <p className="lang text-white">{original_language}</p>

                        <span>•</span>
                        <p className="year text-white">{release_date ? release_date.split('-')[0] : 'N/A'}</p>
                    </div>
                </div>
            </div>


        </>

    )
}

export default MovieCard 