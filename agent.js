import { GoogleGenAI } from "@google/genai";
import { searchGoogle, googleSearchToolDefinition, saveFile, saveFileToolDefinition } from "./tools.js";

const ai = new GoogleGenAI({});
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// PRODUCTION UPGRADE: The function now takes an agentName, systemInstruction, and an array of allowedTools
export async function runAgent(agentName, systemInstruction, allowedTools, userGoal) {
    console.log(`[${agentName}] Booting up with mission: "${userGoal}"`);

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
        console.log(`\n[${agentName}] --- Starting Turn ${currentTurn} ---`);

        // PRODUCTION THROTTLING: Wait 3 seconds before firing the next turn request
        // This stops the agent from executing in microsecond bursts and blowing your RPM quota
        await wait(3000); 

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
                        // Pass the custom persona instruction to Gemini
                        systemInstruction: systemInstruction,
                        // Pass only the tools this specific agent is allowed to use
                        tools: allowedTools.length > 0 ? [{ functionDeclarations: allowedTools }] : undefined
                    }
                });
                break; 
            } catch (error) {
                retries++;
                if (error.message.includes("503") || error.message.includes("high demand") || error.message.includes("UNAVAILABLE")) {
                    console.warn(`[WARNING] [${agentName}] Server overloaded (503). Retry ${retries}/${maxRetries} in ${baseDelay / 1000}s...`);
                    await wait(baseDelay);
                    baseDelay *= 2;
                } else {
                    throw error;
                }
            }
        }

        if (!response) {
            return `[${agentName}] Failed to respond due to connection loss.`;
        }

        const candidate = response.candidates?.[0]?.content;
        
        if (!candidate) {
            return `[${agentName}] Returned an empty state payload.`;
        }

        // FIX: Use clean single-dot optional chaining
        const aiMessageText = candidate.parts?.[0]?.text || "";
        const functionCall = candidate.parts?.[0]?.functionCall;
        
        memory.push(candidate);

        if (aiMessageText) {
            console.log(`[${agentName} THOUGHT]: ${aiMessageText}`);
        }

        if (functionCall) {
            const toolName = functionCall.name;
            const toolArgs = functionCall.args;

            console.log(`[${agentName} ACTION]: Executing tool "${toolName}"...`);

            if (toolName === "search_google") {
                const searchResultText = await searchGoogle(toolArgs.query);
                memory.push({
                    role: "tool",
                    parts: [{ functionResponse: { name: "search_google", response: { result: searchResultText } } }]
                });
            } else if (toolName === "save_file") {
                const saveResultText = saveFile(toolArgs.filename, toolArgs.content);
                memory.push({
                    role: "tool",
                    parts: [{ functionResponse: { name: "save_file", response: { result: saveResultText } } }]
                });
            }
        } else {
            console.log(`\n[${agentName}] Task Complete! Handing off output.`);
            return aiMessageText;
        }
    }

    return `[${agentName}] Reached maximum operation limits.`;
}
