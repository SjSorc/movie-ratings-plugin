import express from "express";
import timeout from "connect-timeout";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";

import { SERVER_TIMEOUT_SECONDS } from "../config";
import logger from "../logger";

//routes
import admin from "./admin";
import { default as ratings } from "./ratings";

const SERVER_TIMEOUT = SERVER_TIMEOUT_SECONDS * 1000;

const haltOnTimeout = (req, res, next) => {
  req.on("timeout", function() {
    res
      .status(504)
      .json({ error: { statusCode: 504, message: "Response timeout" } });
  });
  if (!req.timedout) next();
};

const morganConfig = () => {
  return morgan(
    ':date[iso] [http] :method :url',
  );
}
export default class Api {
  // create the express instance, attach app-level middleware, attach routers
  constructor(db) {
    this.express = express();
    this.middleware();
    this.routes(db);

    this.express.use(
      (err, req, res, next) => {
        if (err) {
          logger.error(err);
        }
        next(err);
      }
    );
  }

  middleware() {
    this.express.use(cors());
    this.express.use(bodyParser.json({ limit: "100mb" }));
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(morganConfig());
    this.express.use(timeout(SERVER_TIMEOUT, { respond: false }));
    this.express.use(haltOnTimeout);
  }

  routes(db) {
    this.express.use("/api/", admin, ratings(db));
  }

}
