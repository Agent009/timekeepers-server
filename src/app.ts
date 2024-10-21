import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import taskRoutes from "@api/routes/task";
import { corsErrorHandler } from "@lib/corsErrorHandler";
import { connectDB } from "@lib/db";
import { handleError, handleNotFound } from "@lib/errorHandler";
import { isObject } from "@lib/util";
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
app.use("/tasks", taskRoutes);

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
    // @ts-expect-error ignore
    task.start();
  }
}

export default app;
