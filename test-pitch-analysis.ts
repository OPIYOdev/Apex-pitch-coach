import * as dotenv from "dotenv";
import path from "path";
import { callGrokAPI } from "./server/services/grok";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const PITCH_COACH_SYSTEM_PROMPT = `You are APEX, an elite startup pitch coach built on the frameworks of Oren Klaff (Pitch Anything), Chris Voss (Never Split the Difference), and Y-Combinator. 

Your goal is to provide high-stakes, direct, and actionable feedback. You don't care about grammar; you care about frame control, status, and the business case.

Analyse the pitch and return ONLY a JSON object (no markdown fences) with this exact shape:
{
  "verdict": "<one sentence high-impact verdict in the style of a venture partner>",
  "landed": "<what worked well in terms of frame control or logic>",
  "killed": "<what hurt the pitch or weakened the founder's status>",
  "scores": {
    "frame": <0-10, status and authority>,
    "hook": <0-10, the first 30 seconds impact>,
    "logic": <0-10, the business case and traction>,
    "urgency": <0-10, the cost of inaction>
  },
  "overallScore": <0.0-10.0, the APEX Elite Index>,
  "drill": "<one specific high-intensity practice exercise>",
  "rewrite": "<an elite, high-status rewrite of the weakest part of the pitch>",
  "nextLevel": "<one concrete step to reach the next level of founder maturity>"
}`;

const TEST_PITCH = `We are building a new social network for cats. It's like Facebook but for felines. We have 10 users and we are looking for $1M investment to buy more catnip.`;

async function testPitchAnalysis() {
  console.log("Testing APEX Pitch Analysis with Groq...");
  
  try {
    const feedback = await callGrokAPI(PITCH_COACH_SYSTEM_PROMPT, TEST_PITCH, true);
    
    if (feedback && typeof feedback !== 'string') {
      console.log("Analysis Successful!");
      console.log("Verdict:", feedback.verdict);
      console.log("Overall Score:", feedback.overallScore);
      console.log("Scores:", JSON.stringify(feedback.scores, null, 2));
      console.log("Drill:", feedback.drill);
    } else {
      console.error("Analysis failed or returned invalid format.");
      console.log("Result:", feedback);
    }
  } catch (error) {
    console.error("Analysis Error:", error);
  }
}

testPitchAnalysis();
