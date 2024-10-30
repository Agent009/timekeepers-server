import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import { constants } from "@lib/constants";
import { corsErrorHandler } from "@lib/corsErrorHandler";
import { connectDB } from "@lib/db";
import { handleError, handleNotFound } from "@lib/errorHandler";
import { isObject } from "@lib/util";
import epochRoutes from "@routes/epoch";
import newsRoutes from "@routes/news";
import taskRoutes from "@routes/task";
import tasks from "@tasks/tasks";

const app: Express = express();

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//PREVENT CORS ERRORS
app.use(corsErrorHandler);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Server is online",
  });
});

connectDB();

// Routes which should handle requests
app.use(`/${constants.routes.epoch}`, epochRoutes);
app.use(`/${constants.routes.news}`, newsRoutes);
app.use(`/${constants.routes.tasks}`, taskRoutes);

// Handle "Not Found" error
app.use(handleNotFound);

// Handle other errors
app.use(handleError);

// Start the configured tasks
// console.log(tasks);

if (isObject(tasks)) {
  for (const [taskName, task] of Object.entries(tasks)) {
    // Start each task individually.
    console.log("app -> starting task", taskName);
    task.start();
  }
}

export default app;
