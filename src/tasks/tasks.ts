import { CronJob } from "cron";
import { constants } from "@lib/constants";
import { isObject } from "@lib/util";
import { fetchNewsArticles, categoriseNewsArticles } from "@tasks/newsTasks";
import { mintNFTs } from "@tasks/nftTasks";

const NEXT_SCHEDULED_NO = 1;
const tasks: Record<string, CronJob> = {};
const commonProperties = {
  onComplete: null,
  runOnInit: false,
  start: false,
  timeZone: "Europe/London",
};
const syncInitTaskName = "syncInit";
const fetchNewsArticlesTaskName = "fetchNewsArticles";
const categoriseNewsArticlesTaskName = "categoriseNewsArticles";
const mintNFTsTaskName = "mintNFTs";
const taskMonitorTaskName = "taskMonitor";
/**
 * If set to TRUE, it means we want to set up the initial data, so we should run all the sync tasks turn by turn and
 * set up the data before configuring the scheduled tasks.
 */
let runInitTasks = constants.tasks.SETUP_INIT_DATA;
console.log("runInitTasks", runInitTasks);
const NOT_EXECUTED = 0;
const EXECUTION_SUCCESS = 1;
const EXECUTION_FAILURE = -1;
const initTasksDefinitionCommonParams = {
  status: NOT_EXECUTED,
  executions: 0,
};
const initTasksDefinition = {
  [categoriseNewsArticlesTaskName]: {
    order: 1,
    ...initTasksDefinitionCommonParams,
    cronSeconds: 0,
  },
  [fetchNewsArticlesTaskName]: {
    order: 2,
    ...initTasksDefinitionCommonParams,
    cronSeconds: 0,
  },
  [mintNFTsTaskName]: {
    order: 3,
    ...initTasksDefinitionCommonParams,
    cronSeconds: 0,
  },
};

/**
 * @see https://github.com/kelektiv/node-cron
 * NOTE: The "cronTime" contains a seconds element, so be careful when doing conversions from tools like crontab guru,
 * as you will need to put in the seconds element as well.
 */
//region Tasks - Init
//==========))) SYNC DATA TASKS - INIT (((==========\\
if (runInitTasks) {
  tasks[syncInitTaskName] = CronJob.from({
    cronTime: "0 * * * * *",
    onTick: async function () {
      console.log("==========))) BEGIN: CRON - SYNC DATA - INIT (((==========");
      console.log("---CRON--- All Pending Tasks:", getRemainingInitTasks());
      const nextTask = getRemainingInitTasks(true);
      console.log("---CRON--- Next Task:", nextTask);

      if (!nextTask?.length) {
        console.log("---CRON--- All sync init tasks successfully executed. Stopping sync init task...");
        runInitTasks = false;
        this.stop();
        console.log("---CRON--- Done. The normal sync tasks will resume now as per their schedules");
        return;
      }

      // @ts-expect-error ignore
      const nextTaskName = nextTask[0];
      // @ts-expect-error ignore
      initTasksDefinition[nextTaskName].executions++;
      // @ts-expect-error ignore
      const response = await runTaskByName(nextTaskName);
      // @ts-expect-error ignore
      initTasksDefinition[nextTaskName].status = !response ? EXECUTION_FAILURE : EXECUTION_SUCCESS;
      console.log("---CRON--- Next scheduled executions: ", scheduleDatesFormatted(this.nextDates(NEXT_SCHEDULED_NO)));
      console.log("==========))) END: CRON - SYNC DATA - INIT (((==========");
    },
    ...commonProperties,
  });
}

//endregion

//region Tasks - Task Monitor
//==========))) TASK MONITOR (((==========\\
// Keep this at the end, so that it can monitor all the other tasks.
const taskMonitor = CronJob.from({
  // In development environment, we can run this every minute for testing purposes.
  // In production environment, we probably want to run this every 15 minutes or so.
  cronTime: constants.tasks.TASK_MONITOR_CRON,
  onTick: function () {
    console.log("==========))) BEGIN: CRON - TASK MONITOR (((==========");
    if (isObject(tasks)) {
      for (const [taskName, task] of Object.entries(tasks)) {
        console.log(
          `---CRON--- ${taskName} - Schedule: ${task.cronTime}, Running: ${task.running}, Last Executed: ${task
            .lastDate()
            ?.toISOString()}, Next Execution: `,
          scheduleDatesFormatted(task.nextDates(1)),
        );
      }
    }

    console.log("---CRON--- Next scheduled executions: ", scheduleDatesFormatted(this.nextDates(NEXT_SCHEDULED_NO)));
    console.log("==========))) END: CRON - TASK MONITOR (((==========");
  },
  ...commonProperties,
});
tasks[taskMonitorTaskName] = taskMonitor;

//endregion

//region Tasks - News
//==========))) TASKS - NEWS (((==========\\
const categoriseNewsArticlesTask = CronJob.from({
  cronTime: constants.tasks.CATEGORISE_NEWS_ARTICLES_CRON,
  onTick: async function () {
    console.log("==========))) BEGIN: CRON - CATEGORISE NEWS ARTICLES (((==========");

    if (runInitTasks) {
      console.log("---CRON--- Skipping due to init task being set to run first.");
      return;
    }

    await runTaskByName(categoriseNewsArticlesTaskName);
    console.log("---CRON--- Next scheduled executions: ", scheduleDatesFormatted(this.nextDates(NEXT_SCHEDULED_NO)));
    console.log("==========))) END: CRON - CATEGORISE NEWS ARTICLES (((==========");
  },
  ...commonProperties,
});
tasks[categoriseNewsArticlesTaskName] = categoriseNewsArticlesTask; // Usually takes about x.x seconds to complete.

const fetchNewsArticlesTask = CronJob.from({
  cronTime: constants.tasks.FETCH_NEWS_ARTICLES_CRON,
  onTick: async function () {
    console.log("==========))) BEGIN: CRON - FETCH NEWS ARTICLES (((==========");

    if (runInitTasks) {
      console.log("---CRON--- Skipping due to init task being set to run first.");
      return;
    }

    await runTaskByName(fetchNewsArticlesTaskName);
    console.log("---CRON--- Next scheduled executions: ", scheduleDatesFormatted(this.nextDates(NEXT_SCHEDULED_NO)));
    console.log("==========))) END: CRON - FETCH NEWS ARTICLES (((==========");
  },
  ...commonProperties,
});
tasks[fetchNewsArticlesTaskName] = fetchNewsArticlesTask; // Usually takes about x.x seconds to complete.

//endregion

//region Tasks - NFTs
//==========))) TASKS - NFTS (((==========\\
const mintNFTsTask = CronJob.from({
  cronTime: constants.tasks.MINT_NFTS_CRON,
  onTick: async function () {
    console.log("==========))) BEGIN: CRON - MINT NFTS (((==========");

    if (runInitTasks) {
      console.log("---CRON--- Skipping due to init task being set to run first.");
      return;
    }

    await runTaskByName(mintNFTsTaskName);
    console.log("---CRON--- Next scheduled executions: ", scheduleDatesFormatted(this.nextDates(NEXT_SCHEDULED_NO)));
    console.log("==========))) END: CRON - MINT NFTS (((==========");
  },
  ...commonProperties,
});
tasks[mintNFTsTaskName] = mintNFTsTask; // Usually takes about x.x seconds to complete.

//endregion

//region Tasks - Misc
//==========))) SUPPORTING / MISC STUFF (((==========\\
/**
 * @param {import("luxon").DateTime<boolean>[]} nextDates
 */
const scheduleDatesFormatted = (nextDates: import("luxon").DateTime<boolean>[]) => {
  const output = [];

  for (const nextDate of nextDates) {
    output.push(nextDate.toISO());
  }

  return output.join(", ");
};

/**
 * Get the remaining sync init tasks that need to be executed.
 * @param {boolean} returnNextTask Return the next task from the list of remaining tasks in order of highest priority
 * @return {[]} An array of all pending sync init tasks, or the next pending task.
 * Each entry is another array. Index 0 = task name, 1 = task definition
 */
const getRemainingInitTasks = (returnNextTask: boolean = false): [] => {
  const remaining = Object.entries(initTasksDefinition).filter((entry) => {
    // Index 0 = task name, 1 = task definition
    return entry[1].status !== EXECUTION_SUCCESS;
  });

  if (remaining.length < 1 || !returnNextTask) {
    // @ts-expect-error ignore
    return remaining;
  }

  // The task with the highest priority is the task with the lowest "order" parameter.
  // @ts-expect-error ignore
  return remaining.reduce((acc, entry) => (acc == null || entry[1].order < acc ? entry[1].order : acc));
};

/**
 * Run the specified task.
 * @param {string} taskName The task to execute
 * @returns {Promise<string>}
 */
const runTaskByName = async (taskName: string): Promise<string> => {
  let response;

  switch (taskName) {
    case categoriseNewsArticlesTaskName:
      // response = await (async () => {
      //   return "success";
      // })();
      response = await categoriseNewsArticles();
      break;
    case fetchNewsArticlesTaskName:
      response = await fetchNewsArticles();
      break;
    case mintNFTsTaskName:
      response = await mintNFTs();
      break;
  }

  console.log("---CRON--- Response:", response);
  return response || "";
};

//endregion

export default tasks;
