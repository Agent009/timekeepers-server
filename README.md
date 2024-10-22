# Timekeepers Server
## Setup

Copy `.env.sample` to `.env` and configure the variables.

Install the node modules:

```bash
npm i
```

### PM2 Approach (Recommended)

It is recommended that you use the [PM2 approach](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/) as it
allows you to properly build the application and deploy it as needed in three different environments: `local`, `dev`
and `prod`.

You can override the port settings in the `.env` file.

Once ready, simply run one of the commands below:

```bash
npm run deploy:local
npm run deploy:dev
npm run deploy:prod
```

This should bring up your app which you can check with `pm2 status`.

To check the active running logs, use the following command:

```bash
pm2 logs [APP_NAME]
-- E.g. --
pm2 logs tk-server
```

### Non-PM2 Approach

```bash
npm run dev
npm run start
```

## Fetching & Saving News

The following will fetch the latest 20 headlines and save them in the DB, ready for further processing.

````bash
GET http://localhost:3001/news/fetch-save/top-headlines
````

## Crons

The cron schedules are controlled through environment variables.
Currently, we have the following crons activated:

* `FETCH_NEWS_ARTICLES_CRON` - fetches top headlines hourly.
* `CATEGORISE_NEWS_ARTICLES_CRON` - categorises articles that are pending categorisation every 10 minutes.

The cron definitions are stored in [src/tasks/tasks.ts](src/tasks/tasks.ts).

The crons are defined in two configurations:

* `Init` Tasks - these tasks run on application startup, provided that the `SETUP_INIT_DATA` environment variable is set. This is useful for bootstrapping data and initial runs.
* `Scheduled` Tasks - these run based on configured schedules from the environment variables.

There is a `Task Monitor` cron that runs regularly and reports on cron stats including last execution and upcoming execution date. 
