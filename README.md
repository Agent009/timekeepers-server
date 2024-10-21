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
npm run start
```
