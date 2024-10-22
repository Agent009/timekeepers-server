import mongoose from "mongoose";
import { convertToCoreMessages, generateText } from "ai";
import { NewsCategory } from "@customTypes/index";
import { constants } from "@lib/constants";
import { getTopHeadlines } from "@lib/newsAPI";
import { initializeOpenAI } from "@lib/util";
import { create, listAllOrNullOnError, update } from "@middleware/repository";
import { NewsModel, NewsDocument } from "@models/news";

const openai = initializeOpenAI();
type PerformResponse = {
  success: boolean;
  data?: string | null;
  message?: string | null;
};

const perform = async (article: NewsDocument): Promise<PerformResponse> => {
  try {
    const caetgories = Object.values(NewsCategory).join(", ");
    const { text } = await generateText({
      model: openai(constants.integrations.openAI.models.chat),
      messages: convertToCoreMessages([
        {
          role: "system",
          content: `Analyze the following news article title and description and categorise it as one or more of the following categories: ${caetgories}
            Only return the list of categories, in comma-separated format. Do not return any other output.
            Article Title: ${article.title}
            Article Description: ${article?.description || article.title}
            Categories: [List of categories]`,
        },
      ]),
    });
    const data = text?.replace("Categories:", "")?.replace(/\s+/g, "")?.trim()?.toLowerCase()?.split(",");
    console.log("tasks -> newsTasks -> perform -> text", text, "categories", data);

    // Save the categorisation to the database
    await update(NewsModel, { _id: article._id }, { categories: data, categorised: true });

    return { success: true, data: text, message: "News categorisation performed successfully" };
  } catch (error: unknown) {
    console.error("tasks -> newsTasks -> perform -> error", error);

    return {
      success: false,
      data: null,
      message:
        error instanceof Error && "reason" in error && error.reason === "maxRetriesExceeded"
          ? "maxRetriesExceeded"
          : `Error performing categorisation. ${error instanceof Error && error?.message}`,
    };
  }
};

const performInParallel = async (articles: NewsDocument[]) => {
  let timer = new Date().getTime();
  const completedRequests: string[] = [];
  console.log(`tasks -> newsTasks -> performInParallel -> configuring ${articles?.length} requests.`);
  let stopFurtherRequests = false;

  // Create an array of Promises for each request
  const requestPromises = articles.map(async (article) => {
    if (stopFurtherRequests) {
      return;
    }

    try {
      const response = await perform(article);

      if (response.success && response.data) {
        completedRequests.push(response.data);
      } else {
        console.error(`tasks -> newsTasks -> performInParallel -> article (${article?.id}) failed`, response.message);

        if (response.message === "maxRetriesExceeded") {
          stopFurtherRequests = true;
          console.error("tasks -> newsTasks -> performInParallel -> Stopping further requests");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`tasks -> newsTasks -> performInParallel -> article (${article?.id}) error: ${error?.message}`);
      } else {
        console.error(`tasks -> newsTasks -> performInParallel -> article (${article?.id}) error:`, error);
      }
    }
  });

  // Wait for all promises to resolve (requests to complete)
  console.log("tasks -> newsTasks -> performInParallel -> Requests configured. Awaiting responses...");
  await Promise.all(requestPromises);
  timer = new Date().getTime() - timer;
  console.log(`tasks -> newsTasks -> performInParallel -> Responses received in ${timer} ms...`);

  // Return the list of completed requests
  return completedRequests;
};

/**
 * Fetch news articles
 */
export const fetchNewsArticles = async () => {
  return getTopHeadlines()
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
          console.log("tasks -> newsTasks -> fetchNewsArticles -> saved article", record);
          saved++;
        } else {
          console.error("tasks -> newsTasks -> fetchNewsArticles -> failed to save article", article);
          failed++;
        }
      });

      return `Saved ${saved} articles, failed to save ${failed} articles.`;
    })
    .catch((err) => {
      console.error("tasks -> newsTasks -> fetchNewsArticles -> err", err);
      return `Error fetching news articles. ${err?.message}`;
    });
};

/**
 * Categorise news articles in batches
 */
export const categoriseNewsArticles = async () => {
  let message;
  let timer = new Date().getTime();
  console.log("tasks -> newsTasks -> categoriseNewsArticles -> starting...");
  const articles = await listAllOrNullOnError(NewsModel, {
    categorised: { $ne: true },
  });

  if (!articles || !articles.length) {
    message = "No news articles require categorisation.";
    console.log("tasks -> newsTasks -> categoriseNewsArticles ->", message);
    return message;
  }

  const total = articles.length;
  console.log(`tasks -> newsTasks -> categoriseNewsArticles -> found ${total} articles to categorise.`);
  const MAX_BATCH_SIZE = 5;
  let reqNo = 0;
  const completedRequests: string[] = [];

  // As long as there are items in the list continue to form batches
  while (reqNo < total) {
    // A batch is either limited by the batch size or it is smaller than the batch size when there are fewer items required
    const endIndex = total < reqNo + MAX_BATCH_SIZE ? total : reqNo + MAX_BATCH_SIZE;
    // const reqs = endIndex - reqNo;
    const concurrentReqs: NewsDocument[] = [];
    // console.log(`${reqNo} / ${total} - endIndex: ${endIndex}, reqs: ${reqs}`);

    for (let index = reqNo; index < endIndex; index++) {
      const article = articles[index];

      if (article) {
        concurrentReqs.push(article);
        reqNo++;
      }
    }

    // wait until all promises are done or one promise is rejected
    // await Promise.all(concurrentReqs);
    const results = await performInParallel(concurrentReqs);
    completedRequests.push(...results);
    console.log(
      `tasks -> newsTasks -> categoriseNewsArticles -> Requests ${
        reqNo - MAX_BATCH_SIZE
      } - ${reqNo} done. ${results?.length} completions.`,
    );
  }

  timer = new Date().getTime() - timer;
  message = `News articles categorised completed (${timer} ms). Categorised ${completedRequests?.length} records.`;
  console.log("tasks -> newsTasks -> categoriseNewsArticles ->", message);
  return message;
};
