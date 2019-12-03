import { debounce } from "lodash";
import { reflect } from "../service/util";

function extractTitleName(titleCard) {
    const el = titleCard.getElementsByClassName('fallback-text')[0];
    return el && el.textContent; 
}

function getTitlesCards(el) {
    const cards =  el.getElementsByClassName('title-card-container');
    return [...cards]
        .map(card => card.getElementsByClassName('ptrack-content')[0]);
}

function isPaginator(el) {
    return (isPaginatorArrow(el) || isPaginatorContainer(el));
}

function isPaginatorContainer(el){
    return (
        el.className === "handle handleNext active" || 
        el.className === "handle handlePrev active"
    );
}

function isPaginatorArrow(el) {
    return ( el.className === "indicator-icon icon-rightCaret" ||  
            el.className === "indicator-icon icon-leftCaret");
}


function getTitleContainer(el){
    //slider - this is the caret indicator
    return el.parentNode.parentNode.getElementsByClassName('sliderContent')[0];
}

function isTitleEl(el){
    return el.classList.contains("slider-item");
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