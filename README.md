﻿# Timekeepers Server

The TK server is responsible for running scheduled crons and providing a CRUD API.

## Architecture

* [**TK Server**](https://github.com/Agent009/timekeepers-server) (this) - back-end functionality, crons, CRUD API, AI.
* [**TK Client**](https://github.com/Agent009/timekeepers-client) - front-end UX, web3 DApp, countdown timers.
* **TK Agents** - in development. Complicated multi-step and multi-tool workflows such as agnent orchestration (e.g. generating videos).

### Data Structure

* **Layers** organise **epochs** into context-specific domains, such as world news or user-controlled applications such as a board game stream.
* **Epochs** represent units of time such as a *minute*, *hour*, *day*, *month* and *year*.
* **News** records store world news for the default system-defined **World News** layer. The news articles are categorised, and then summarised to generate epoch-specific NFTs.
* **Tasks** store cron definitions and states.

### CRUD API

The TK server exposes a basic CRUD API.
All the routes are defined in [`src\lib\constants.ts`](src\lib\constants.ts) under the `routes` key.

Sample API endpoints structure (**Layer**):

* `POST http://localhost:3001/layer` - create a new record 
* `GET http://localhost:3001/layer/:recordId` - get a record by ID
* `GET http://localhost:3001/layer` - get all record
* `PUT http://localhost:3001/layer/:recordId` - update record by ID
* `DELETE http://localhost:3001/layer/:recordId` - delete record by ID

### Fetching & Saving News

The following will fetch the latest 20 headlines and save them in the DB, ready for further processing.

````bash
GET http://localhost:3001/news/fetch-save/top-headlines
````

### Crons

The cron schedules are controlled through environment variables.
Currently, we have the following crons activated:

* `FETCH_NEWS_ARTICLES_CRON` - fetches top headlines hourly.
* `CATEGORISE_NEWS_ARTICLES_CRON` - categorises articles that are pending categorisation every 10 minutes.

The cron definitions are stored in [src/tasks/tasks.ts](src/tasks/tasks.ts).

The crons are defined in two configurations:

* `Init` Tasks - these tasks run on application startup, provided that the `SETUP_INIT_DATA` environment variable is set. This is useful for bootstrapping data and initial runs.
* `Scheduled` Tasks - these run based on configured schedules from the environment variables.

There is a `Task Monitor` cron that runs regularly and reports on cron stats including last execution and upcoming execution date. 

## Setup

Copy `.env.sample` to `.env` and configure the variables.
**MongoDB** is required to persist the data. Therefore, you must configure the `MONGODB_URI` environment variable to resolve to a proper MongoDB instance.
The server utilises [NewsAPI](https://newsapi.org/). Register an account and set your `NEWSAPI_API_KEY` environment variable.
The server also utilises **OpenAI**, so you must set the `OPENAI_API_KEY` environment variable.

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

### Story Protocol

The server uses the [TypeScript SDK](https://docs.story.foundation/docs/typescript-sdk) from [Story](https://www.story.foundation/) protocol.
You will need to set the `Story Protocol` associated environment variables to ensure the NFTs are minted properly.
After setting up the environment variables as per the requirements, you should run:

```bash
npm run create-spg-collection
```

This will create a new SPG NFT collection which is required for consequent minting actions.

## Roadmap

* Refactor CRUD logic from client to server.
* Secure the API (e.g. JWT).
* Remove all MongoDB interaction from the client. This should solely happen in the server.
* Add web socket functionality for a more robust PubSub.
* Relocate **Livepeer** functionality from client to server.
* Migrate to using **NestJS** for more robust enterprise support.
* Optimise the **Story Protocol** integration.
  * Deploy bespoke NFT contract
  * Deploy bespoke PIL terms
* Add **Zora Protocol** integration.
