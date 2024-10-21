import mongoose from "mongoose";
import { Task } from "@api/models/task";
import { getServerUrl } from "@lib/util";

const tasksUrl = getServerUrl("tasks");

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const get_tasks = (req, res, next) => {
  Task.find()
    .exec()
    .then((docs) => {
      console.log(docs);
      const response = {
        count: docs.length,
        data: docs.map((doc) => {
          return {
            _id: doc._id,
            name: doc.name,
            updatedAt: doc.updatedAt,
            request: {
              type: "GET",
              url: tasksUrl + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const create_task = (req, res, next) => {
  const task = new Task({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    updatedAt: req.body.updatedAt,
  });
  task
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Task created successfully",
        data: {
          _id: result._id,
          name: result.name,
          updatedAt: result.updatedAt,
          request: {
            type: "GET",
            url: tasksUrl + result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const delete_task = (req, res, next) => {
  const id = req.params.taskId;
  Task.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Task deleted successfully",
        request: {
          type: "POST",
          url: tasksUrl,
          body: {
            name: "String",
            updatedAt: "Number",
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};
