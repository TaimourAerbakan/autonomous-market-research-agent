import { GoogleGenAI } from "@google/genai";
import { searchGoogle, googleSearchToolDefinition } from "./tools.js";

const ai = new GoogleGenAI({});

// A helper function that forces our code to pause execution for a set number of milliseconds
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
        let baseDelay = 2000; // Start by waiting 2 seconds if it fails

        // PRODUCTION CORE: Retry Loop for 503 / 429 API Overload Handling
        while (retries < maxRetries) {
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: memory,
                    config: {
                        tools: [{ functionDeclarations: [googleSearchToolDefinition] }]
                    }
                });
                // If the request succeeds, break out of this inner retry loop immediately!
                break; 
            } catch (error) {
                retries++;
                // Check if the error looks like a temporary server overload
                if (error.message.includes("503") || error.message.includes("high demand") || error.message.includes("UNAVAILABLE")) {
                    console.warn(`[WARNING] Gemini server overloaded (503). Retry attempt ${retries}/${maxRetries} in ${baseDelay / 1000}s...`);
                    await wait(baseDelay);
                    baseDelay *= 2; // Double the wait time for the next attempt (Exponential Backoff)
                } else {
                    // If it's a completely different error (like a schema error), don't retry, just throw it
                    throw error;
                }
            }
        }

        // If all retries failed and we have no response object, gracefully exit the turn
        if (!response) {
            console.error("[CRITICAL] Gemini model is completely unavailable after multiple retries.");
            return "Mission failed due to upstream AI provider downtime.";
        }

        const candidate = response.candidates?.[0]?.content;
        if (!candidate) {
            console.log("[ERROR] Received an empty response from Gemini.");
            return "Failed to get an answer.";
        }

        const aiMessageText = candidate.parts?.[0]?.text || "";
        const functionCall = candidate.parts?.[0]?.functionCall;

        memory.push(candidate);

        if (aiMessageText) {
            console.log(`[AI THOUGHT]: ${aiMessageText}`);
        }

        if (functionCall) {
            const toolName = functionCall.name;
            const toolArgs = functionCall.args;

            console.log(`[AI ACTION]: Wants to execute tool "${toolName}" with arguments:`, toolArgs);

            if (toolName === "search_google") {
                const searchResultText = await searchGoogle(toolArgs.query);

                memory.push({
                    role: "tool",
                    parts: [{
                        functionResponse: {
                            name: "search_google",
                            response: { result: searchResultText }
                        }
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
