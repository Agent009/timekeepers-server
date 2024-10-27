import dayjs from "@lib/dayjsConfig";
import mongoose, { UpdateQuery } from "mongoose";
import { constants } from "@lib/constants";
import { getTopHeadlines } from "@lib/newsAPI";
import { getServerUrl } from "@lib/util";
import { create, listAllOrNullOnError } from "@middleware/repository";
import { NewsModel, NewsDocument } from "@models/news";
import { EpochType, NewsCategory } from "@customTypes/index";

const newsUrl = getServerUrl(constants.routes.news);

//region NewsAPI
// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchAndSaveTopHeadlines = (req, res, next) => {
  console.log("newsController -> fetchAndSaveTopHeadlines");
  getTopHeadlines()
    .then((articles) => {
      let saved = 0;
      let failed = 0;
      articles.forEach(async (article) => {
        const record = await create<NewsDocument>(NewsModel, {
          _id: new mongoose.Types.ObjectId(),
          title: article.title,
          description: article.description || article.title,
          categorised: false,
        });

        if (record) {
          console.log("newsController -> fetchAndSaveTopHeadlines -> saved article", record);
          saved++;
        } else {
          console.error("newsController -> fetchAndSaveTopHeadlines -> failed to save article", article);
          failed++;
        }
      });

      res.status(201).json({
        message: "Articles fetched and saved successfully",
        data: {
          saved: saved,
          failed: failed,
        },
      });
    })
    .catch((err) => {
      console.error("newsController -> fetchAndSaveTopHeadlines -> err", err);
      res.status(500).json({
        error: err,
      });
    });
};
//endregion

//region Aggregation & Misc Logic

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getMintData = async (req, res, next) => {
  // For articles over the given date range, determine the most popular category.
  // If multiple categories are determined, pick one at random.
  // For the picked category, fetch x random articles within the given date range.
  // Return the determined category and the associated selected articles.
  const epochType: EpochType = req.query?.epochType || EpochType.Minute;
  const startDateObj: dayjs.Dayjs = req.query?.startDate
    ? // @ts-expect-error ignore
      dayjs.utc(req.query.startDate.replace(" ", "T"))
    : // @ts-expect-error ignore
      dayjs().utc();
  // @ts-expect-error ignore
  const endDateObj: dayjs.Dayjs = req.query?.endDate ? dayjs.utc(req.query.endDate.replace(" ", "T")) : dayjs().utc();
  const startDate: Date = startDateObj.toDate();
  const endDate: Date = endDateObj.toDate();
  const articlesToPick: number = 5;
  console.log("newsController -> getMintData -> epoch", epochType, startDate, endDate);

  try {
    // Fetch articles within the date range
    const articles = await listAllOrNullOnError(NewsModel, {
      createdAt: { $gte: startDate, $lte: endDate },
    });

    if (!articles || articles.length === 0) {
      return res.status(404).json({
        message: "No articles found for the given date range.",
        category: null,
        articles: [],
      });
    }

    // Count categories
    const categoryCount: { [key: string]: number } = {};
    articles.forEach((article) => {
      article.categories.forEach((category) => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    });

    // Determine the most popular category
    const mostPopularCategory: NewsCategory =
      Object.keys(categoryCount).length > 0
        ? (Object.keys(categoryCount).reduce((a, b) => {
            // Ensure both a and b are valid keys
            return categoryCount[a] !== undefined &&
              categoryCount[b] !== undefined &&
              categoryCount[a] > categoryCount[b]
              ? a
              : b;
          }) as NewsCategory)
        : NewsCategory.General;

    // Fetch random articles from the most popular category
    const selectedArticles = mostPopularCategory
      ? articles
          .filter((article) => article.categories && article.categories.includes(mostPopularCategory))
          .sort(() => 0.5 - Math.random()) // Shuffle the articles
          .slice(0, articlesToPick) // Pick the specified number of articles
      : [];

    res.status(200).json({
      epochType: epochType,
      startDate: startDate,
      endDate: endDate,
      category: mostPopularCategory,
      articles: selectedArticles,
    });
  } catch (err) {
    console.error("newsController -> determineMintData -> err", err);
    res.status(500).json({
      error: err,
    });
  }
};

//endregion

//region CRUD route handlers

// @ts-expect-error ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createRecord = (req, res, next) => {
  create<NewsDocument>(NewsModel, {
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    description: req.body.description,
    categories: req.body.categories,
    categorised: false,
  })
    .then((result) => {
      console.log("newsController -> createRecord -> result", result);
      res.status(201).json({
        message: "Record created successfully",
        data: {
          ...result?.toJSON(),
          request: {
            description: "Fetch record",
            type: "GET",
            id: result?._id,
            url: newsUrl + result?._id,
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
  NewsModel.findOne({ _id: id })
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
  NewsModel.find()
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
  const update: UpdateQuery<NewsDocument> = {
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

  if (req.body?.categorised !== undefined) {
    update.categorised = req.body.categorised === "true" || req.body.categorised === true;
  }

  // { new: true } returns the updated document
  NewsModel.findOneAndUpdate({ _id: id }, update, { new: true })
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
  NewsModel.deleteOne({ _id: id })
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

//endregion
