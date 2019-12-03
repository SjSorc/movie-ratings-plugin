import express from "express";
import config from "../config";

const router = express.Router();

function setUpRouter(db){
  router.get("/rating", (req, res) => {
    const title = decodeURIComponent(req.query.title);
    db.collection('titles').find( { primaryTitle:  title.toLowerCase()} ).toArray(function(err, results) {
      res.send(results);
    })
  });

  router.get("/rating/test", (req, res) => {
    const title = decodeURIComponent(req.query.title);
    const arr = [{
      primaryTitle:  title.toLowerCase(),
      numVotes: 100,
      averageRating: 8.8,
    }]
    res.send(arr);
  });
  
  return router;
}

export default setUpRouter;
