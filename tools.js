import { tavily } from "@tavily/core";

// Initialize the live search engine client
// It will automatically read your $env:TAVILY_API_KEY
const tvly = tavily();

export async function searchGoogle(query) {
    console.log(`[SYSTEM] Querying the live internet for: "${query}"...`);
    try {
        // Run a real-world web search query
        const response = await tvly.search(query, {
            searchDepth: "basic",
            maxResults: 3
        });

        // Loop through the live results and join them into one master text string
        const organizedResults = response.results.map(result => {
            return `Title: ${result.title}\nURL: ${result.url}\nSnippet: ${result.content}\n---`;
        }).join("\n");

        return organizedResults;
    } catch (error) {
        console.error("[TOOL ERROR] Live web search failed:", error.message);
        return "Search failed due to an error fetching live data.";
    }
}

// Keep your tool definition EXACTLY the same so the AI knows how to invoke it
export const googleSearchToolDefinition = {
  name: "search_google",
  description: "Use this tool to search the live internet for real-world facts, current news, company profiles, histories, or any up-to-date topic.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The specific search keywords to pass into the web engine."
      }
    },
    required: ["query"]
  }
};
