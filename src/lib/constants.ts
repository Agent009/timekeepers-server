const name = "Timekeepers Server";
const caption = "Tomorrow, Today!";
// Environment
const environment = process.env.NODE_ENV || "development";
const localEnv = environment === "local";
const prodEnv = ["production", "prod"].includes(environment);
const devEnv = !localEnv && !prodEnv;
const devOrLocalEnv = devEnv || localEnv;
// Timekeepers Server (TKS)
const tksServerHost = process.env.TKS_SERVER_HOST || "http://localhost";
const tksServerPort = process.env.TKS_SERVER_PORT || 3001;
const tksServerUrl = process.env.TKS_SERVER_URL || `${tksServerHost}:${tksServerPort}`;
// DB
const mongodbHost = process.env.MONGODB_HOST;
const mongodbPort = parseInt(process.env.MONGODB_PORT || "27017");
const mongodbDb = process.env.MONGODB_DB;
const mongodbUsername = process.env.MONGODB_USERNAME;
const mongodbPassword = process.env.MONGODB_PASSWORD;

export const constants = Object.freeze({
  // Environment
  env: {
    dev: devEnv,
    local: localEnv,
    devOrLocal: devOrLocalEnv,
    prod: prodEnv,
  },
  // TKS
  tks: {
    host: tksServerHost,
    port: tksServerPort,
    url: tksServerUrl,
  },
  app: {
    id: "cx-tk-server",
    name: name,
    caption: caption,
    productionUrl: "https://connextar.com",
    repoUrl: "https://github.com/Agent009/timekeepers-server",
  },
  db: {
    // MongoDB
    mongodbHost: mongodbHost,
    mongodbPort: mongodbPort,
    mongodbDb: mongodbDb,
    mongodbUsername: mongodbUsername,
    mongodbPassword: mongodbPassword,
    mongodbUri:
      process.env.MONGODB_URI ||
      `mongodb://${mongodbUsername}:${mongodbPassword}@${mongodbHost}:${mongodbPort}/${mongodbDb}`,
    models: {
      TASK: "Task",
    },
  },
  tasks: {
    DEFAULT_CF_TASK_ENTRIES_SYNC_DAYS: process.env.DEFAULT_CF_TASK_ENTRIES_SYNC_DAYS || 1,
    DEFAULT_RB_TASK_COMMENT_SYNC_DAYS: process.env.DEFAULT_RB_TASK_COMMENT_SYNC_DAYS || 1,
    TASK_MONITOR_CRON: process.env.TASK_MONITOR_CRON || "0 */10 * * * *", // Default: Second 0 of every 10th minute
    SETUP_INIT_DATA: process.env.SETUP_INIT_DATA === "true" || parseInt(process.env.SETUP_INIT_DATA || "") === 1, // Do we want to run the tasks for an initial setup?
  },
  misc: {
    YMD_DATE_FORMAT: "y-MM-dd",
  },
});
