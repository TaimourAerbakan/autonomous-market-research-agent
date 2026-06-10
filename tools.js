import { tavily } from "@tavily/core";
import fs from "fs"; // Built-in Node.js module to read/write files on your disk
import XLSX from "xlsx";
import path from "path"; // 1. Built-in utility to map directory locations accurately

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
    // 2. process.cwd() guarantees it pins your active root project folder
    const absoluteDestinationPath = path.join(process.cwd(), filename);
    
    console.log(`[SYSTEM] Forcing write to exact hard drive location: "${absoluteDestinationPath}"...`);
    try {
        fs.writeFileSync(absoluteDestinationPath, content, "utf-8");
        return `Success: The file has been written completely to "${absoluteDestinationPath}"`;
    } catch (error) {
        console.error("[TOOL ERROR] File system write failed:", error.message);
        return `Failed to save file due to error: ${error.message}`;
    }
}

// Tool 3: Save File (xlxs)
export function saveExcel(filename, leadsArray) {
    console.log(`[SYSTEM] Creating lead generation spreadsheet for ${leadsArray.length} items...`);
    try {
        const absolutePath = path.join(__dirname, filename);
        
        // 1. Create a blank Excel Workbook
        const workbook = XLSX.utils.book_new();
        
        // 2. Convert the AI's JSON array of leads directly into an Excel worksheet grid
        const worksheet = XLSX.utils.json_to_sheet(leadsArray);
        
        // 3. Append the sheet to the file and write to disk
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
        XLSX.writeFile(workbook, absolutePath);
        
        return `Success: Excel sheet generated at ${absolutePath}`;
    } catch (error) {
        return `Failed to generate Excel sheet: ${error.message}`;
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

// Definition 3: Save File (xlxs)
export const saveExcelToolDefinition = {
  name: "save_excel",
  description: "Use this tool to save structured lead rows into a downloadable Microsoft Excel (.xlsx) spreadsheet file. Use this when you have collected list elements.",
  parameters: {
    type: "object",
    properties: {
      filename: { type: "string", description: "Name ending in .xlsx. Example: 'karachi_leads.xlsx'" },
      leadsArray: {
        type: "array",
        description: "An array of objects containing compiled restaurant lead data.",
        items: {
          type: "object",
          properties: {
            restaurant_name: { type: "string" },
            location_address: { type: "string" },
            contact_phone: { type: "string" }
          },
          required: ["restaurant_name"]
        }
      }
    },
    required: ["filename", "leadsArray"]
  }
};
