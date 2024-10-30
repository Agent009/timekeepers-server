import { convertToCoreMessages, generateText } from "ai";
import { Request, Response, NextFunction } from "express";
import mongoose, { UpdateQuery } from "mongoose";
import { EpochType, NewsCategory, PerformResponse } from "@customTypes/index";
import { constants } from "@lib/constants";
import dayjs from "@lib/dayjsConfig";
import { getTopHeadlines } from "@lib/newsAPI";
import { initializeOpenAI } from "@lib/util";
import { NewsModel, NewsDocument } from "@models/news";
import { create, listAllOrNullOnError } from "@middleware/repository";
import { BaseController } from "@controllers/baseController";

const openai = initializeOpenAI();

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

const generatePrompt = async (category: NewsCategory, articles: NewsDocument[]): Promise<PerformResponse> => {
  try {
    const description = articles
      ?.map((r) => r.description || r.title)
      ?.join("\n")
      ?.slice(0, 3000);
    const { text } = await generateText({
      model: openai(constants.integrations.openAI.models.chat),
      messages: convertToCoreMessages([
        {
          role: "system",
          content: `For the ${category} news category, analyze the following news article descriptions which are seperated by newline, and generate a suitable image generation prompt to repsent these articles. Be descriptive and specific.
            Only return the image genration prompt. Do not return any other output.
            Article Descriptions: ${description}
            Prompt: [The prompt]`,
        },
      ]),
    });
    const data = text?.replace("Prompt:", "")?.trim();
    console.log("tasks -> newsTasks -> generatePrompt -> text", text, "prompt", data);

    return { success: true, data: text, message: "Image generation promot generated successfully" };
  } catch (error: unknown) {
    console.error("tasks -> newsTasks -> generatePrompt -> error", error);

    return {
      success: false,
      data: null,
      message:
        error instanceof Error && "reason" in error && error.reason === "maxRetriesExceeded"
          ? "maxRetriesExceeded"
          : `Error generating image generation prompt. ${error instanceof Error && error?.message}`,
    };
  }
};

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

    // Remove "general" from the counts if there are other categories present.
    if (categoryCount[NewsCategory.General] !== undefined && Object.keys(categoryCount).length > 1) {
      delete categoryCount[NewsCategory.General];
    }

    // Determine the most popular category
    const mostPopularCategory: NewsCategory =
      Object.keys(categoryCount).length > 0
        ? // FIXME: Uncomment for actual logic. Picks most popular category.
          // ? (Object.keys(categoryCount).reduce((a, b) => {
          //     // Ensure both a and b are valid keys
          //     return categoryCount[a] !== undefined &&
          //       categoryCount[b] !== undefined &&
          //       categoryCount[a] > categoryCount[b]
          //       ? a
          //       : b;
          //   }) as NewsCategory)
          // FIXME: Uncomment for testing purposes only. Picks random category instead of the most popular one.
          (Object.keys(categoryCount).sort(() => 0.5 - Math.random())?.[0] as NewsCategory)
        : NewsCategory.General;

    // Fetch random articles from the most popular category
    const selectedArticles = mostPopularCategory
      ? articles
          .filter(
            (article) => article.categorised && article.categories && article.categories.includes(mostPopularCategory),
          )
          .sort(() => 0.5 - Math.random()) // Shuffle the articles
          .slice(0, articlesToPick) // Pick the specified number of articles
      : [];

    // Compose an image generation prompt from the titles and descriptions of these articles.
    const result = await generatePrompt(mostPopularCategory, selectedArticles);

    res.status(200).json({
      epochType: epochType,
      startDate: startDate,
      endDate: endDate,
      prompt: result?.success ? result?.data : "",
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createRecord = async (req: Request, res: Response, next: NextFunction) => {
  const baseController = new BaseController<NewsDocument>(NewsModel, req, res);
  await baseController.createRecord({
    categorised: false,
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getRecord = async (req: Request, res: Response, next: NextFunction) => {
  const baseController = new BaseController<NewsDocument>(NewsModel, req, res);
  await baseController.getRecordById(req.params.recordId);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getRecords = async (req: Request, res: Response, next: NextFunction) => {
  const baseController = new BaseController<NewsDocument>(NewsModel, req, res);
  await baseController.getAllRecords();
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateRecord = async (req: Request, res: Response, next: NextFunction) => {
  const baseController = new BaseController<NewsDocument>(NewsModel, req, res);
  const update: UpdateQuery<NewsDocument> = {
    updatedAt: dayjs().toISOString(),
  };

  if (req.body?.categorised !== undefined) {
    update.categorised = req.body.categorised === "true" || req.body.categorised === true;
  }

  await baseController.updateRecordById(update, req.params.recordId);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteRecord = async (req: Request, res: Response, next: NextFunction) => {
  const baseController = new BaseController<NewsDocument>(NewsModel, req, res);
  await baseController.deleteRecordById(req.params.recordId);
};

//endregion
