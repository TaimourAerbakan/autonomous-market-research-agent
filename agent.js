import { GoogleGenAI } from "@google/genai";
// 1. IMPORT CHANGES: Pull in both search and file tool assets
import { 
    searchGoogle, 
    googleSearchToolDefinition, 
    saveFile, 
    saveFileToolDefinition 
} from "./tools.js";

const ai = new GoogleGenAI({});
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runAgent(userGoal) {
    console.log(`[AGENT] Starting mission: "${userGoal}"`);

    let memory = [
        { 
            role: "user", 
            parts: [{ text: userGoal }] 
        }
    ];

    let currentTurn = 0;
    const maxTurns = 5;

    while (currentTurn < maxTurns) {
        currentTurn++;
        console.log(`\n[AGENT] --- Starting Turn ${currentTurn} ---`);

        let response;
        let retries = 0;
        const maxRetries = 3;
        let baseDelay = 2000;

        while (retries < maxRetries) {
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: memory,
                    config: {
                        // 2. DECLARATION CHANGES: Both tools are fed to Gemini simultaneously
                        tools: [{ 
                            functionDeclarations: [
                                googleSearchToolDefinition, 
                                saveFileToolDefinition
                            ] 
                        }]
                    }
                });
                break; 
            } catch (error) {
                retries++;
                if (error.message.includes("503") || error.message.includes("high demand") || error.message.includes("UNAVAILABLE")) {
                    console.warn(`[WARNING] Gemini server overloaded (503). Retry attempt ${retries}/${maxRetries} in ${baseDelay / 1000}s...`);
                    await wait(baseDelay);
                    baseDelay *= 2;
                } else {
                    throw error;
                }
            }
        }

        if (!response) {
            console.error("[CRITICAL] Gemini model is completely unavailable after multiple retries.");
            return "Mission failed due to upstream AI provider downtime.";
        }

        const candidate = response.candidates?.[0]?.content;
        
        if (!candidate) {
            console.log("[ERROR] Received an empty response from Gemini.");
            return "Failed to get an answer.";
        }

        // FIX: Ensure there is only ONE question mark and ONE dot: ?.
        const aiMessageText = candidate.parts?.[0]?.text || "";
        const functionCall = candidate.parts?.[0]?.functionCall;

        memory.push(candidate);

        if (aiMessageText) {
            console.log(`[AI THOUGHT]: ${aiMessageText}`);
        }

        // 3. ROUTING CHANGES: Check and execute based on which tool name the AI selected
        if (functionCall) {
            const toolName = functionCall.name;
            const toolArgs = functionCall.args;

            console.log(`[AI ACTION]: Wants to execute tool "${toolName}" with arguments:`, toolArgs);

            if (toolName === "search_google") {
                // Route to live internet tool
                const searchResultText = await searchGoogle(toolArgs.query);

                memory.push({
                    role: "tool",
                    parts: [{
                        functionResponse: { name: "search_google", response: { result: searchResultText } }
                    }]
                });

            } else if (toolName === "save_file") {
                // Route to local file saver tool (New!)
                const saveResultText = saveFile(toolArgs.filename, toolArgs.content);

                memory.push({
                    role: "tool",
                    parts: [{
                        functionResponse: { name: "save_file", response: { result: saveResultText } }
                    }]
                });
            }
        } else {
            console.log("\n[AGENT] Mission accomplished! Final Answer generated.");
            return aiMessageText;
        }
    }

    console.log("\n[GUARDRAIL ALERT] Reached maximum allowed turns.");
    return "Agent timed out before finding a final conclusion.";
}
