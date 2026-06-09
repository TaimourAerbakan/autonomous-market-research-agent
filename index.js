import "dotenv/config"; // Loads the .env file keys into system memory immediately
import { runAgent } from "./agent.js";
import { googleSearchToolDefinition, saveFileToolDefinition } from "./tools.js";

// ==================== DEFINING PERSONAS (SYSTEM PROMPTS) ====================

const researcherPersona = `
You are a highly analytical Internet Investigator. Your ONLY goal is to gather raw, factual data using search engines.
Do NOT attempt to write final comprehensive reports or essays. Just spit out a compiled list of all the raw, unfiltered evidence and historical facts you find.
`;

const editorPersona = `
You are an Elite Business Editor and Document Publisher. Your job is to take raw, unorganized facts provided by your researcher colleague and polish them.
You must clean up the grammar, structure the information into a beautiful executive markdown layout, and automatically use your save_file tool to write it to disk.
`;

// ==================== THE MULTI-AGENT COLLABORATION PIPELINE ====================

async function startMultiAgentSystem() {
    try {
        const targetSubject = "Sony Corporation";
        console.log(`=== CRADLE INITIALIZATION: TARGET IS ${targetSubject.toUpperCase()} ===\n`);

        // --- STEP 1: DEPLOY THE RESEARCHER ---
        // We pass only the google search tool definition to this worker
        const researcherMission = `Look up exactly three core facts about ${targetSubject}.`;
        
        const rawResearchFacts = await runAgent(
            "RESEARCHER_AGENT", 
            researcherPersona, 
            [googleSearchToolDefinition], 
            researcherMission
        );

        // PRODUCTION ENGINE GUARDRAIL: Pipeline Failure Validation Checkpoint
        // If the researcher failed, we abort the entire assembly line here before wasting more API calls
        if (rawResearchFacts.includes("Failed") || rawResearchFacts.includes("Timeout") || rawResearchFacts.includes("empty")) {
            console.error("\n[PIPELINE ABORTED] Researcher Agent failed to deliver valid source metrics. Stopping execution pipeline to prevent downstream failure.");
            return; 
        }

        console.log("\n=================== COLLABORATIVE HANDOFF ===================");
        console.log("[ORCHESTRATOR] Passing raw investigator facts to the Document Editor...");
        console.log("=============================================================\n");

        // --- STEP 2: DEPLOY THE EDITOR ---
        // We pass only the file saver tool definition, and feed it the researcher's output text data!
        const editorMission = `
        Review these raw findings regarding ${targetSubject}:
        
        ${rawResearchFacts}
        
        Transform them into a pristine executive summary and save it to a local file named 'sony_analysis.txt'.
        `;

        const editorFinalConfirmation = await runAgent(
            "EDITOR_AGENT", 
            editorPersona, 
            [saveFileToolDefinition], 
            editorMission
        );

        console.log("\n=================== PIPELINE EXECUTION SUCCESS ===================");
        console.log(editorFinalConfirmation);
        console.log("==================================================================");

    } catch (error) {
        console.error("[CRITICAL PIPELINE FAILURE]:", error.message);
    }
}

// ==================== ENGINE IGNITION SWITCH ====================
// This line physically fires the function above when you type 'node index.js'
startMultiAgentSystem();
