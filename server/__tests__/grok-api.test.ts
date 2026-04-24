import { describe, it, expect, beforeAll } from "vitest";
import axios from "axios";

describe("Grok API Integration", () => {
  const GROK_API_KEY = process.env.GROK_API_KEY;
  const GROK_API_URL = "https://api.x.ai/v1";

  beforeAll(() => {
    if (!GROK_API_KEY) {
      throw new Error("GROK_API_KEY environment variable is not set");
    }
  });

  it("should authenticate with Grok API", async () => {
    try {
      const response = await axios.post(
        `${GROK_API_URL}/chat/completions`,
        {
          model: "grok-2",
          messages: [
            {
              role: "user",
              content: "Say 'APEX ready' if you can hear me.",
            },
          ],
          temperature: 0.7,
          max_tokens: 50,
        },
        {
          headers: {
            Authorization: `Bearer ${GROK_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.choices).toBeDefined();
      expect(response.data.choices.length).toBeGreaterThan(0);
      expect(response.data.choices[0].message.content).toBeDefined();

      console.log("✅ Grok API authenticated successfully");
      console.log("Response:", response.data.choices[0].message.content);
    } catch (error: any) {
      console.error("❌ Grok API authentication failed:", error.message);
      throw new Error(`Grok API error: ${error.message}`);
    }
  });

  it("should handle JSON responses from Grok API", async () => {
    try {
      const systemPrompt = `You are a pitch coach. Respond ONLY with valid JSON in this format:
{"score": 0-10, "feedback": "brief feedback"}`;

      const response = await axios.post(
        `${GROK_API_URL}/chat/completions`,
        {
          model: "grok-2",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: "Rate this pitch: 'We make software that saves time.'",
            },
          ],
          temperature: 0.7,
          max_tokens: 100,
        },
        {
          headers: {
            Authorization: `Bearer ${GROK_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      const content = response.data.choices[0].message.content;
      const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());

      expect(parsed.score).toBeDefined();
      expect(parsed.feedback).toBeDefined();
      console.log("✅ Grok API JSON parsing successful");
    } catch (error: any) {
      console.error("❌ Grok API JSON parsing failed:", error.message);
      throw new Error(`Grok API JSON error: ${error.message}`);
    }
  });
});
