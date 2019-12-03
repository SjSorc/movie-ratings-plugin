import { getRating } from "../service/api";
import { reflect } from "../service/util";

const RATING_CONTAINER = "rating-container";

export const loadRatings = (titleCards = [], extractTitleName) => {
    const titles = titleCards
                    .filter(card => card && !hasRating(card));

    titles.forEach(card => {
        const titleName = extractTitleName(card);
    
        if(titleName){
           getRating(titleName)
            .then(movie => {
                removeRating(card);
                addRating(card, movie);
            });
        }
    });
    
}

const hasRating = el => {
    return el.getElementsByClassName(RATING_CONTAINER).length;
};

const addRating = (titleCard, movie) => {
    const ratingEl = createRatingElement(movie);
    titleCard.appendChild(ratingEl);
};

const removeRating = (titleCard) => {
    [...titleCard.getElementsByClassName(RATING_CONTAINER)]
        .map(el => el && el.remove());
};

const createRatingElement = (movie) => {    
    const div = document.createElement('div');
    div.className = RATING_CONTAINER;
    div.textContent = movie.averageRating;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(div);
    
    return fragment;
};
