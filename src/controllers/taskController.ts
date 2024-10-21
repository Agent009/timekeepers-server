import mongoose from "mongoose";
import { constants } from "@lib/constants";
import { getServerUrl } from "@lib/util";
import { Task } from "@models/task";

const tasksUrl = getServerUrl(constants.routes.tasks);

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getRecords = (req, res, next) => {
  Task.find()
    .exec()
    .then((docs) => {
      console.log("taskController -> getRecords -> docs", docs);
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
      console.error("taskController -> getRecords -> err", err);
      res.status(500).json({
        error: err,
      });
    });
};

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createRecord = (req, res, next) => {
  const task = new Task({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    updatedAt: req.body.updatedAt,
  });
  task
    .save()
    .then((result) => {
      console.log("taskController -> createRecord -> result", result);
      res.status(201).json({
        message: "Record created successfully",
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
      console.error("taskController -> createRecord -> err", err);
      res.status(500).json({
        error: err,
      });
    });
};

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteRecord = (req, res, next) => {
  const id = req.params.recordId;
  Task.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      console.log("taskController -> deleteRecord -> result", result);
      res.status(200).json({
        message: "Record deleted successfully",
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
      console.error("taskController -> deleteRecord -> err", err);
      res.status(500).json({
        error: err,
      });
    });
};
