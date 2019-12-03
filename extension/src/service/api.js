import config from "../config";

export const getRating = (movieName) => {
    const opts = {
        method: 'GET',
        headers: {}
    };

    return fetch(`${config.MOVIE_SERVICE_URL}?title=${movieName}`, opts)
            .then((response) => {
                return response.json();
            })
            .then(movies => {
                return movies.reduce(
                    (result, movie) => {
                        return result.numVotes > movie.numVotes
                        ? result
                        : movie;
                    },
                    { numVotes: 0}
                );
            })
}