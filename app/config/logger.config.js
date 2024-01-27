module.exports = (category) => {
  const { createLogger, format, transports } = require("winston");
  const { combine, colorize, timestamp, label, printf, simple } = format;

  const loggerConfiguration = {
    format: combine(
      colorize(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),

      printf(
        (info) =>
          `${info.timestamp} ${info.level}: [${info.category}] ${info.message}`
      )
    ),
    // Log only if level is less than (meaning more severe) or equal to this
    level: process.env.LOGLEVEL || "info",
    defaultMeta: {
      category: category,
    },
    // Log to the console and a file
    transports: [
      new transports.Console(),
      new transports.File({ filename: "logs/app.log" }),
      new transports.File({ filename: "logs/error.log", level: "error" }),
    ],
  };

  const logger = createLogger(loggerConfiguration);

  return logger;
};
