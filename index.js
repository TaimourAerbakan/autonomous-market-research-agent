import "dotenv/config"; // Loads the .env file keys into system memory
import { runAgent } from "./agent.js";

// Define the mission you want to give your autonomous agent
const startingGoal = "Research the history and core competitors of the company Apple, and automatically save the final findings to a file named apple_research.txt.";

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
