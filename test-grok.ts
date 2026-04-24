import axios from "axios";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const GROK_API_URL = process.env.GROK_API_URL || "https://api.groq.com/openai/v1";
const GROK_API_KEY = process.env.GROK_API_KEY;

async function testGrok() {
  console.log("Testing Grok API connection...");
  console.log("URL:", GROK_API_URL);
  console.log("Key:", GROK_API_KEY ? "Set (starts with " + GROK_API_KEY.substring(0, 4) + ")" : "Not set");

  if (!GROK_API_KEY) {
    console.error("Error: GROK_API_KEY is not set in .env");
    process.exit(1);
  }

  try {
    const response = await axios.post(
      `${GROK_API_URL}/chat/completions`,
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Say 'Grok is online' if you can hear me." },
        ],
        max_tokens: 50,
      },
      {
        headers: {
          Authorization: `Bearer ${GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response Status:", response.status);
    console.log("Response Content:", response.data.choices?.[0]?.message?.content);
    console.log("Connection Successful!");
  } catch (error: any) {
    console.error("Connection Failed!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

testGrok();
