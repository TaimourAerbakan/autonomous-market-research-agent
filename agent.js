import { GoogleGenAI } from "@google/genai";
import { searchGoogle, googleSearchToolDefinition } from "./tools.js";

const ai = new GoogleGenAI({});

export async function runAgent(userGoal) {
    console.log(`[AGENT] Starting mission: "${userGoal}"`);

    // 1. FIXED SCHEMA: Turn 1 must use the 'parts' array structure
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

        // A. Fire the network request
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: memory,
            config: {
                tools: [{ functionDeclarations: [googleSearchToolDefinition] }]
            }
        });

        // 2. FIXED EXTRACTION: Safe structural reading
        const candidate = response.candidates?.[0]?.content;
        if (!candidate) {
            console.log("[ERROR] Received an empty response from Gemini.");
            return "Failed to get an answer.";
        }

        const aiMessageText = candidate.parts?.[0]?.text || "";
        const functionCall = candidate.parts?.[0]?.functionCall; // Note: Singular 'functionCall' in new SDK

        // B. Save Gemini's exact response object straight into memory history
        memory.push(candidate);

        if (aiMessageText) {
            console.log(`[AI THOUGHT]: ${aiMessageText}`);
        }

        // C. Check if the AI wants to use our live tool
        if (functionCall) {
            const toolName = functionCall.name;
            const toolArgs = functionCall.args;

            console.log(`[AI ACTION]: Wants to execute tool "${toolName}" with arguments:`, toolArgs);

            if (toolName === "search_google") {
                const searchResultText = await searchGoogle(toolArgs.query);

                // 3. FIXED TOOL SCHEMA: Save the tool result the exact way Gemini expects it
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
