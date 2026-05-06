const environment = process.env.NODE_ENV || "development";

const shouldLogDebug = environment !== "production";

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const serializedMeta = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] ${level.toUpperCase()} ${message}${serializedMeta}`;
};

export const logger = {
  info(message, meta) {
    console.log(formatMessage("info", message, meta));
  },
  warn(message, meta) {
    console.warn(formatMessage("warn", message, meta));
  },
  error(message, meta) {
    console.error(formatMessage("error", message, meta));
  },
  debug(message, meta) {
    if (shouldLogDebug) {
      console.log(formatMessage("debug", message, meta));
    }
  },
};

export const isProduction = environment === "production";