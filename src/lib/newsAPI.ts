// @ts-expect-error ignore type error
import NewsAPI from "newsapi";
import { constants } from "@lib/constants";
import { NewsArticle, NewsCategory } from "@customTypes/index";

const newsAPI = new NewsAPI(constants.integrations.newsAPI.apiKey);

export const getTopHeadlines = (
  q?: string | undefined,
  category?: NewsCategory | undefined,
): Promise<NewsArticle[]> => {
  // To query /v2/top-headlines
  // All options passed to topHeadlines are optional, but you need to include at least one of them
  return (
    newsAPI.v2
      .topHeadlines({
        //   sources: 'bbc-news,the-verge',
        q: q || undefined,
        category: category || undefined,
        language: "en",
        country: "us",
      })
      // @ts-expect-error ignore
      .then((response) => {
        // console.log("newsAPI -> getTopHeadlines -> response", response);
        /*
        {
        status: "ok",
        articles: [...]
        }
    */
        // @ts-expect-error ignore
        const data = response?.articles?.map((article) => {
          return {
            title: article.title,
            description: article.description,
          };
        });
        console.log("Articles", data);
        return data;
      })
      // @ts-expect-error ignore
      .catch((error) => {
        console.error("newsAPI -> getTopHeadlines -> error", error);
        return [];
      })
  );
};

export const getEverything = (): Promise<NewsArticle[]> => {
  // To query /v2/everything
  // You must include at least one q, source, or domain
  return (
    newsAPI.v2
      .everything({
        q: "bitcoin",
        sources: "bbc-news,the-verge",
        domains: "bbc.co.uk, techcrunch.com",
        from: "2017-12-01",
        to: "2017-12-12",
        language: "en",
        sortBy: "relevancy",
        page: 2,
      })
      // @ts-expect-error ignore
      .then((response) => {
        console.log("newsAPI -> getEverything -> response", response);
        /*
      {
        status: "ok",
        articles: [...]
      }
    */
        // @ts-expect-error ignore
        return response?.articles?.map((article) => {
          return {
            title: article.title,
            description: article.description,
          };
        });
      })
      // @ts-expect-error ignore
      .catch((error) => {
        console.error("newsAPI -> getEverything -> error", error);
        return [];
      })
  );
};

export const getSources = () => {
  // To query sources
  // All options are optional
  newsAPI.v2
    .sources({
      category: "technology",
      language: "en",
      country: "us",
    })
    // @ts-expect-error ignore
    .then((response) => {
      console.log("newsAPI -> getSources -> response", response);
      /*
      {
        status: "ok",
        sources: [...]
      }
    */
    })
    // @ts-expect-error ignore
    .catch((error) => {
      console.error("newsAPI -> getSources -> error", error);
      return [];
    });
};
