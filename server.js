import "dotenv/config";
import express from "express";
import cors from "cors";
import { runAgent } from "./agent.js";
import { googleSearchToolDefinition, saveFileToolDefinition } from "./tools.js";

const app = express();
const PORT = 5000;

// ==================== MIDDLEWARE UTILITIES ====================
app.use(cors()); // Grants your Next.js application access to call this backend
app.use(express.json()); // Allows your server to parse incoming JSON payloads cleanly

// ==================== DEFINING PERSONAS (SYSTEM PROMPTS) ====================
const researcherPersona = `
You are a highly analytical Internet Investigator. Your ONLY goal is to gather raw, factual data using search engines.
Do NOT attempt to write final comprehensive reports or essays. Just spit out a compiled list of all the raw, unfiltered evidence and historical facts you find.
`;

const editorPersona = `
You are an Elite Business Editor and Document Publisher. Your job is to take raw, unorganized facts provided by your researcher colleague and polish them.
You must clean up the grammar, structure the information into a beautiful executive markdown layout, and automatically use your save_file tool to write it to disk.
`;

// ==================== THE MULTI-AGENT ENDPOINT ROUTE ====================
app.post("/api/run-pipeline", async (req, res) => {
    try {
        const { subject } = req.body;
        
        if (!subject) {
            return res.status(400).json({ error: "Missing target subject parameter." });
        }

        console.log(`\n[SERVER] WEB REQUEST RECEIVED: Starting multi-agent pipeline for "${subject}"...`);

        // --- STEP 1: DEPLOY THE RESEARCHER ---
        const researcherMission = `Research the deep history, founding members, and major competitor products of ${subject}.`;
        const rawResearchFacts = await runAgent(
            "RESEARCHER_AGENT", 
            researcherPersona, 
            [googleSearchToolDefinition], 
            researcherMission
        );

        // Pipeline Failure Validation Checkpoint
        if (rawResearchFacts.includes("Failed") || rawResearchFacts.includes("Timeout") || rawResearchFacts.includes("empty")) {
            console.error("\n[PIPELINE ABORTED] Researcher Agent failed to deliver valid source metrics.");
            return res.status(502).json({ error: "Researcher Agent connection timed out or failed." });
        }

        // --- STEP 2: DEPLOY THE EDITOR ---
        // Format a dynamic, clean file name based on what the user typed!
        const cleanFileName = `${subject.toLowerCase().replace(/[^a-z0-9]/g, "_")}_analysis.txt`;

        const editorMission = `
        Review these raw findings regarding ${subject}:
        
        ${rawResearchFacts}
        
        Transform them into a pristine executive summary and save it to a local file named '${cleanFileName}'.
        `;

        const editorFinalConfirmation = await runAgent(
            "EDITOR_AGENT", 
            editorPersona, 
            [saveFileToolDefinition], 
            editorMission
        );

        // Return a successful response bundle back to your Next.js screen!
        return res.json({
            success: true,
            fileName: cleanFileName,
            message: editorFinalConfirmation
        });

    } catch (error) {
        console.error("[SERVER ERROR] Pipeline failure:", error.message);
        return res.status(500).json({ error: "Internal Agentic System Pipeline Failure" });
    }
});

// ==================== ACTIVATE THE WEB ENGINE ====================
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` AGENTIC SERVER ONLINE: Listening at http://localhost:${PORT}`);
    console.log(`====================================================`);
});
