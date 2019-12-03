import { debounce } from "lodash";
import { reflect } from "../service/util";

function extractTitleName(titleCard) {
    const el = titleCard.getElementsByClassName('content-title')[0];
    return el && el.textContent && el.textContent.trim(); 
}

function getTitlesCards(el) {
    const cards =  el.querySelectorAll('.movie-card, .show-card');
    return [...cards]
}

function isPaginator(el) {
    return (isPaginatorArrow(el));
}

function isPaginatorArrow(el) {
    return ( el.className === "right-arrow" ||  
            el.className === "left-arrow");
}


function getTitleContainer(el){
    //slider - this is the caret indicator
    return el.parentNode.getElementsByClassName('slick-track')[0];
}

function isTitleEl(el){
    return el.classList.contains("slick-slide");
}
  
//refactor for an api with a contract
export const addEventListeners = callback => {
    window.addEventListener('scroll', debounce(() => {
        const titleCards = getTitlesCards(document);
        callback(titleCards, extractTitleName);
    }, 1000 * 1));

    window.addEventListener('click', (event) => {
        if(isPaginator(event.target)){
            //get parent container on which titles are added
            const getEnclosingEl = getTitleContainer(event.target);
            // Callback function to execute when mutations are observed
            const mutationCallback = async function(mutationsList, observer) {
                for(let mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        //check if added nodes are our titles
                            if(mutation.addedNodes.length){
                                for(let i = 0; i < mutation.addedNodes.length; i++){
                                    const node = mutation.addedNodes[i];
                                    if(isTitleEl(node)){
                                        //process the title
                                        const titleCards = getTitlesCards(node);
                                        callback(titleCards, extractTitleName);
                                    }
                                }
                        }
                    }
                }
                observer.disconnect();
            };
            //listen to only children getting added
            const config = { childList: true, subtree: true };

            // Create an observer instance linked to the callback function
            const observer = new MutationObserver(mutationCallback);

            // Start observing the target node for configured mutations
            observer.observe(getEnclosingEl, config);
        }
    });
}