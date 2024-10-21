// @ts-nocheck
const argEnvIndex = process.argv.indexOf("--env");
let argEnv = (argEnvIndex !== -1 && process.argv[argEnvIndex + 1]) || "";

const RUN_ENV_MAP = {
  local: {
    script: "dotenvx run -- nodemon -r tsconfig-paths/register src/server.ts",
    instances: 1,
    max_memory_restart: "250M",
    // args: '--ignore-watch="node_modules"'
    args: "",
  },
  dev: {
    script: "dotenvx run -- nodemon -r tsconfig-paths/register src/server.ts",
    instances: 1,
    max_memory_restart: "250M",
    // args: '--ignore-watch="node_modules"'
    args: "",
  },
  prod: {
    script: "dotenvx run -- node src/server.ts",
    instances: 1,
    max_memory_restart: "1000M",
    args: "",
  },
};

if (!(argEnv in RUN_ENV_MAP)) {
  argEnv = "local";
}

module.exports = {
  apps: [
    {
      name: "tk-server",
      namespace: "cx.tk",
      script: RUN_ENV_MAP[argEnv].script,
      args: RUN_ENV_MAP[argEnv].args,
      instances: RUN_ENV_MAP[argEnv].instances,
      exec_mode: "cluster",
      watch: false,
      ignore_watch: ["node_modules", "\\.git", "*.log"],
      max_memory_restart: RUN_ENV_MAP[argEnv].max_memory_restart,
      time: true,
      env_local: {
        APP_ENV: "local",
        NODE_ENV: "development",
        watch: ["./"],
      },
      env_dev: {
        APP_ENV: "dev",
        NODE_ENV: "development",
        watch: ["./"],
      },
      env_prod: {
        APP_ENV: "prod",
        NODE_ENV: "production",
      },
    },
  ],
};
