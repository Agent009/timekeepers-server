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
  routes: {
    home: "/",
    epoch: "epoch",
    news: "news",
    tasks: "tasks",
  },
  tasks: {
    TASK_MONITOR_CRON: process.env.TASK_MONITOR_CRON || "0 */10 * * * *", // Default: Second 0 of every 10th minute
    SETUP_INIT_DATA: process.env.SETUP_INIT_DATA === "true" || parseInt(process.env.SETUP_INIT_DATA || "") === 1, // Do we want to run the tasks for an initial setup?
    FETCH_NEWS_ARTICLES_CRON: process.env.FETCH_NEWS_ARTICLES_CRON || "15 1 */1 * * *", //  Default: Minute 1 of every hour
    CATEGORISE_NEWS_ARTICLES_CRON: process.env.CATEGORISE_NEWS_ARTICLES_CRON || "30 */10 * * * *", //  Default: Second 30 of every 10th minute
  },
  misc: {
    YMD_DATE_FORMAT: "YYYY-MM-DD",
    YMDHM_DATE_FORMAT: "YYYY-MM-DD HH:mm",
  },
  // 3rd Party, Integrations
  integrations: {
    newsAPI: {
      apiKey: process.env.NEWSAPI_API_KEY || "",
    },
    openAI: {
      useLocal: "true" === process.env.USE_LOCAL_AI,
      localBaseURL: process.env.LOCAL_AI_BASE_URL || "",
      apiKey: process.env.OPENAI_API_KEY || "",
      models: {
        chat: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      },
      temperature: 0.5,
      maxTokens: 500,
      promptTypes: {
        chat: "chat",
      },
      response: {
        default: "default",
        streaming: "streaming",
      },
    },
  },
});
