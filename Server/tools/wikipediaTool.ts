import { DynamicTool } from "@langchain/core/tools";

export const wikipediaTool = new DynamicTool({
  name: "wikipedia_search",
  description:
    "Search Wikipedia for structured knowledge and encyclopedic information.",
  func: async (query: string) => {
    try {
      // Search for articles
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        query
      )}`;

      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent": "M32-Chatbot/1.0 (Research Bot)",
        },
      });

      if (!response.ok) {
        // If direct page not found, try search API
        const searchApiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          query
        )}&format=json&srlimit=1`;

        const searchResponse = await fetch(searchApiUrl, {
          headers: {
            "User-Agent": "M32-Chatbot/1.0 (Research Bot)",
          },
        });

        if (!searchResponse.ok) {
          return "Wikipedia search failed. Please try a different query.";
        }

        const searchData: any = await searchResponse.json();
        if (!searchData.query?.search?.length) {
          return "No Wikipedia articles found for this query.";
        }

        const firstResult = searchData.query.search[0];
        const pageTitle = firstResult.title;

        // Get the actual page content
        const pageUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          pageTitle
        )}`;
        const pageResponse = await fetch(pageUrl, {
          headers: {
            "User-Agent": "M32-Chatbot/1.0 (Research Bot)",
          },
        });

        if (!pageResponse.ok) {
          return `Found article "${pageTitle}" but couldn't retrieve content.`;
        }

        const pageData = await pageResponse.json();
        return formatWikipediaResponse(pageData);
      }

      const data = await response.json();
      return formatWikipediaResponse(data);
    } catch (error: any) {
      return `Wikipedia search error: ${error.message}`;
    }
  },
});

function formatWikipediaResponse(data: any): string {
  if (data.type === "disambiguation") {
    return `"${data.title}" is a disambiguation page. Please be more specific. Some options include: ${data.extract}`;
  }

  let result = `**${data.title}**\n\n`;

  if (data.extract) {
    result += `${data.extract}\n\n`;
  }

  if (data.content_urls?.desktop?.page) {
    result += `Source: ${data.content_urls.desktop.page}`;
  }

  return result;
}
