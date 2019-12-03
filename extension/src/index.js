import { debounce } from "lodash";
import {  loadRatings } from "./loader";
import  * as netflixLoader from "./loader/netflixLoader";
import * as hotstarLoader from "./loader/hotstarLoader";

function getLoader(hostname){
    debugger;
    switch(hostname){
        case "www.netflix.com":
            return netflixLoader;
        case "www.hotstar.com":
            return hotstarLoader;
        default:
            return null;
    }
}

//start
const loader = getLoader(location.hostname);
if(loader){
    loader.addEventListeners(loadRatings);
}
