// @flow

import * as http from "http";

import listEndpoints from "express-list-endpoints";
import { MongoClient } from "mongodb";

import { PORT } from "./config";
import Api from "./controllers/api";
import logger from "./logger";

const url = 'mongodb://localhost:27017';

MongoClient.connect(url, (err, client) => {
  if (err) return console.log(err)

  const db = client.db('imdb') // whatever your database name is
  const app = new Api(db);
  const port = PORT;
  const server = http.createServer(app.express);

  server.listen(port);
  server.on("error", onError);
  server.on("listening", onListening);

  function onError(error){
    if (error.syscall !== "listen") throw error;
    const bind =
      typeof port === "string" ? `Pipe ${port}` : `Port ${port.toString()}`;
  
    switch (error.code) {
      case "EACCES":
        throw new Error(`${bind} requires elevated privileges`);
      case "EADDRINUSE":
        throw new Error(`${bind} is already in use`);
      default:
        throw error;
    }
  }
  
  function onListening() {
    const addr = server.address();
    const bind =
      typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
    logger.debug(
      `Routes: ${JSON.stringify(listEndpoints(app.express))
        .replace(/},{/g, "},\r\n  {")
        .replace(/\[{/, "[\r\n{")
        .replace(/}]/, "}\r\n]")}`
    );
    logger.info(`Listening on ${bind}...`);
  }

});



