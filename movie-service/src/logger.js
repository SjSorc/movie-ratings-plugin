import winston from "winston";
import { LOG_LEVEL } from "./config";

const logger = winston.createLogger({
  level: LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf(info => {
      const { timestamp, level, message, ...args } = info;
      return `${timestamp} [${level}] ${message} ${
        Object.keys(args).length ? `: ${JSON.stringify(args, null)}` : ""
      }`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
