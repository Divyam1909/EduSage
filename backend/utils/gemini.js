const { GoogleGenerativeAI } = require("@google/generative-ai");

// Shared Gemini client; the API key is only ever read on the server
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-3.5-flash";

// Gemini returns these for temporary overload or rate limits
const RETRYABLE_STATUSES = [429, 500, 503];

const getModel = (generationConfig) => genAI.getGenerativeModel({ model: MODEL_NAME, generationConfig });

/**
 * Calls generateContent and retries temporary failures with exponential backoff
 */
async function generateWithRetry(model, contents, retries = 3) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await model.generateContent(contents);
    } catch (error) {
      if (attempt >= retries || !RETRYABLE_STATUSES.includes(error.status)) throw error;
      const delay = 1000 * 2 ** attempt;
      console.warn(`Gemini returned ${error.status}, retrying in ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

module.exports = { getModel, generateWithRetry };
