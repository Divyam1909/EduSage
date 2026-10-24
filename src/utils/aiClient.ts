// Gemini access through the EduSage backend, so the API key never reaches the browser.
// Mirrors the small part of the @google/generative-ai model API that the app uses.
import { apiFetch } from "./api";

type Part = string | { inlineData: { mimeType: string; data: string } };

interface GenerationConfig {
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
}

export const getGenerativeModel = (generationConfig: GenerationConfig = {}) => ({
  generateContent: async (contents: string | Part[]) => {
    const token = localStorage.getItem("token");
    const res = await apiFetch("/api/ai/generate", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ contents, generationConfig }),
    });
    const { text } = await res.json();
    return { response: { text: () => text as string } };
  },
});
