import axios from "axios";
import FormData from "form-data";
import { Readable } from "stream";

const GROK_API_URL = process.env.GROK_API_URL || "https://api.x.ai/v1";
const GROK_API_KEY = process.env.GROK_API_KEY;

if (!GROK_API_KEY) {
  console.warn("GROK_API_KEY is not set. Grok API calls will fail.");
}

export interface PitchFeedback {
  verdict: string;
  landed: string;
  killed: string;
  scores: {
    hook: number;
    clarity: number;
    pain: number;
    solutionFit: number;
    credibility: number;
    callToAction: number;
  };
  overallScore: number;
  drill: string;
  rewrite: string;
  nextLevel: string;
}

/**
 * Call Grok API for text generation (pitch analysis, coaching chat)
 */
export async function callGrokAPI(
  systemPrompt: string,
  userMessage: string,
  isJson: boolean = true
): Promise<PitchFeedback | string | null> {
  try {
    if (!GROK_API_KEY) {
      throw new Error("GROK_API_KEY is not configured");
    }

    const response = await axios.post(
      `${GROK_API_URL}/chat/completions`,
      {
        model: "grok-2",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices?.[0]?.message?.content || "";

    if (isJson) {
      try {
        // Clean up JSON response (remove markdown fences if present)
        const cleanedContent = content.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanedContent) as PitchFeedback;
      } catch {
        console.error("Failed to parse JSON response:", content);
        return null;
      }
    }

    return content;
  } catch (error) {
    console.error("Grok API error:", error);
    return null;
  }
}

/**
 * Call Grok API for speech-to-text transcription
 */
export async function transcribeAudio(audioBlob: Buffer): Promise<string | null> {
  try {
    if (!GROK_API_KEY) {
      throw new Error("GROK_API_KEY is not configured");
    }

    // Use FormData with Node.js streams
    const form = new FormData();
    form.append("file", Readable.from(audioBlob), { filename: "audio.wav", contentType: "audio/wav" });
    form.append("model", "whisper-1");

    const response = await axios.post(
      `${GROK_API_URL}/audio/transcriptions`,
      form,
      {
        headers: {
          Authorization: `Bearer ${GROK_API_KEY}`,
          ...form.getHeaders(),
        },
      }
    );

    return response.data.text || null;
  } catch (error) {
    console.error("Grok transcription error:", error);
    return null;
  }
}

/**
 * Call Grok API for text-to-speech
 */
export async function synthesizeSpeech(text: string): Promise<Buffer | null> {
  try {
    if (!GROK_API_KEY) {
      throw new Error("GROK_API_KEY is not configured");
    }

    const response = await axios.post(
      `${GROK_API_URL}/audio/speech`,
      {
        model: "grok-2",
        input: text,
        voice: "nova",
      },
      {
        headers: {
          Authorization: `Bearer ${GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    return Buffer.from(response.data);
  } catch (error) {
    console.error("Grok TTS error:", error);
    return null;
  }
}
