import { runAgent } from "./agent.js";

// Define the mission you want to give your autonomous agent
const startingGoal = "Research Taimour Aerbakan";

// Execute the agent and handle the final output
async function startSystem() {
    try {
        const finalReport = await runAgent(startingGoal);
        console.log("\n=================== FINAL REPORT ===================");
        console.log(finalReport);
        console.log("====================================================");
    } catch (error) {
        console.error("[CRITICAL ERROR] The system crashed:", error.message);
    }
}

// Fire up the engine!
startSystem();
