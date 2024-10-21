import dayjs from "dayjs";
import mongoose, { UpdateQuery } from "mongoose";
import { constants } from "@lib/constants";
import { getServerUrl } from "@lib/util";
import { News } from "@models/news";

const newsUrl = getServerUrl(constants.routes.news);

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createRecord = (req, res, next) => {
  const record = new News({
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    description: req.body.description,
    categories: req.body.categories,
  });
  record
    .save()
    .then((result) => {
      console.log("newsController -> createRecord -> result", result);
      res.status(201).json({
        message: "Record created successfully",
        data: {
          ...result?.toJSON(),
          request: {
            description: "Fetch record",
            type: "GET",
            id: result._id,
            url: newsUrl + result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.error("newsController -> createRecord -> err", err);
      res.status(500).json({
        error: err,
      });
    });
};

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getRecord = (req, res, next) => {
  const id = req.params.recordId;
  News.findOne({ _id: id })
    .exec()
    .then((doc) => {
      console.log("newsController -> getRecord -> doc", doc);
      const response = {
        data: {
          ...doc?.toJSON(),
          request: {
            description: "Fetch record",
            type: "GET",
            id: id,
            url: newsUrl + id,
          },
        },
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.error("newsController -> getRecord -> err", err);
      res.status(500).json({
        error: err,
      });
    });
};

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getRecords = (req, res, next) => {
  News.find()
    .exec()
    .then((docs) => {
      console.log("newsController -> getRecords -> docs", docs);
      const response = {
        count: docs.length,
        data: docs.map((doc) => {
          return {
            ...doc,
            request: {
              description: "Fetch record",
              type: "GET",
              id: doc._id,
              url: newsUrl + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.error("newsController -> getRecords -> err", err);
      res.status(500).json({
        error: err,
      });
    });
};

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateRecord = (req, res, next) => {
  const id = req.params.recordId;
  const update: UpdateQuery<News> = {
    updatedAt: dayjs().toISOString(),
  };

  if (req.body?.title) {
    update.title = req.body.title;
  }

  if (req.body?.description) {
    update.description = req.body.description;
  }

  if (req.body?.categories) {
    update.categories = req.body.categories;
  }

  // { new: true } returns the updated document
  News.findOneAndUpdate({ _id: id }, update, { new: true })
    .then((result) => {
      console.log("newsController -> updateRecord -> result", result);

      if (!result) {
        res.status(400).json({
          error: "Could not update record. Ensure provided ID is correct.",
        });
        return;
      }

      res.status(201).json({
        message: "Record updated successfully",
        data: {
          ...result?.toJSON(),
          request: {
            description: "Fetch record",
            type: "GET",
            id: id,
            url: newsUrl + id,
          },
        },
      });
    })
    .catch((err) => {
      console.error("newsController -> updateRecord -> err", err);
      res.status(500).json({
        error: err,
      });
    });
};

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteRecord = (req, res, next) => {
  const id = req.params.recordId;
  News.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      console.log("newsController -> deleteRecord -> result", result);
      res.status(200).json({
        message: "Record deleted successfully",
      });
    })
    .catch((err) => {
      console.error("newsController -> deleteRecord -> err", err);
      res.status(500).json({
        error: err,
      });
    });
};
