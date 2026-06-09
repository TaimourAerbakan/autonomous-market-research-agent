import { tavily } from "@tavily/core";
import fs from "fs"; // Built-in Node.js module to read/write files on your disk

const tvly = tavily();

// ==================== REAL JAVASCRIPT FUNCTIONS ====================

// Tool 1: Live Internet Search
export async function searchGoogle(query) {
    console.log(`[SYSTEM] Querying the live internet for: "${query}"...`);
    try {
        const response = await tvly.search(query, {
            searchDepth: "basic",
            maxResults: 3
        });

        return response.results.map(result => {
            return `Title: ${result.title}\nURL: ${result.url}\nSnippet: ${result.content}\n---`;
        }).join("\n");
    } catch (error) {
        console.error("[TOOL ERROR] Live web search failed:", error.message);
        return "Search failed due to an error fetching live data.";
    }
}

// Tool 2: Local File Saver (New!)
export function saveFile(filename, content) {
    console.log(`[SYSTEM] Writing output to local hard drive: "${filename}"...`);
    try {
        // fs.writeFileSync writes a file instantly to your active project directory
        fs.writeFileSync(filename, content, "utf-8");
        return `Success: The file "${filename}" has been saved completely to the hard drive.`;
    } catch (error) {
        console.error("[TOOL ERROR] File system write failed:", error.message);
        return `Failed to save file due to error: ${error.message}`;
    }
}

// ==================== AI TOOL DEFINITION OBJECTS ====================

// Definition 1: Google Search
export const googleSearchToolDefinition = {
  name: "search_google",
  description: "Use this tool to search the live internet for real-world facts, current news, company profiles, histories, or any up-to-date topic.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "The specific search keywords to pass into the web engine." }
    },
    required: ["query"]
  }
};

// Definition 2: Save File (New!)
export const saveFileToolDefinition = {
  name: "save_file",
  description: "Use this tool to save the final comprehensive research report to a local text file. Use this ONLY when all internet research steps are 100% complete and you have structured a valuable final output summary.",
  parameters: {
    type: "object",
    properties: {
      filename: { 
        type: "string", 
        description: "The targeted name of the file ending in .txt extension. Use lowercase and underscores. Example: 'nike_report.txt'" 
      },
      content: { 
        type: "string", 
        description: "The complete, rich-text markdown compilation of the final report summary to save inside the file." 
      }
    },
    required: ["filename", "content"]
  }
};
