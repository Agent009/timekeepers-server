// @ts-expect-error ignore type error
import NewsAPI from "newsapi";
import { constants } from "@lib/constants";

const newsAPI = new NewsAPI(constants.integrations.newsAPI.apiKey);

export const getTopHeadlines = () => {
  // To query /v2/top-headlines
  // All options passed to topHeadlines are optional, but you need to include at least one of them
  newsAPI.v2
    .topHeadlines({
      //   sources: 'bbc-news,the-verge',
      //   q: 'bitcoin',
      //   category: 'business',
      language: "en",
      country: "us",
    })
    // @ts-expect-error ignore
    .then((response) => {
      // console.log(response);
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
    });
};

export const getEverything = () => {
  // To query /v2/everything
  // You must include at least one q, source, or domain
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
      console.log(response);
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
    });
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
      console.log(response);
      /*
      {
        status: "ok",
        sources: [...]
      }
    */
    });
};
