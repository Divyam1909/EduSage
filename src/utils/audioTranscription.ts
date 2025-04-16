// Audio Transcription Service using Gemini API
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with the API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "REDACTED_GEMINI_KEY";
const genAI = new GoogleGenerativeAI(API_KEY);

// Use gemini-1.5-flash model for transcription and analysis
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Transcribes audio content from a base64 string
 * @param audioBase64 Base64 encoded audio data
 * @returns Transcribed text
 */
export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  try {
    // Extract the mime type and actual base64 data
    const matches = audioBase64.match(/^data:(.*);base64,(.*)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 audio format");
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Create an audio part for the Gemini API
    // For now, we're using a simpler approach since Gemini doesn't directly support audio transcription
    // We'll prompt the model to describe what it hears in the audio
    const prompt = "Please transcribe the following audio content as accurately as possible.";
    
    // Currently, direct audio transcription isn't fully supported in Gemini API
    // This is a simplified approach - in production, consider using a dedicated speech-to-text API
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Data
        }
      }
    ]);
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
};

/**
 * Analyzes an audio interview response 
 * @param audioBase64 Base64 encoded audio data
 * @param question The interview question that was asked
 * @returns Analysis of the answer including feedback and transcript
 */
export const analyzeAudioResponse = async (
  audioBase64: string,
  question: string
): Promise<any> => {
  try {
    // First, transcribe the audio
    const transcription = await transcribeAudio(audioBase64);
    
    // Then analyze the transcribed response in relation to the question
    const prompt = `
      You are an expert interview coach and evaluator with years of experience helping candidates succeed in technical interviews.
      
      Analyze the following audio response to this interview question:
      
      QUESTION: "${question}"
      
      CANDIDATE'S RESPONSE (transcribed from audio): "${transcription}"
      
      Provide a comprehensive evaluation in JSON format with the following structure:
      
      {
        "score": {
          "overall": number from 1-10,
          "content": number from 1-10,
          "delivery": number from 1-10,
          "structure": number from 1-10,
          "confidence": number from 1-10
        },
        "strengths": [
          { "category": "content|delivery|structure", "description": "Specific strength with example from response" },
          ... (up to 3 total)
        ],
        "weaknesses": [
          { "category": "content|delivery|structure", "description": "Specific weakness with suggestion for improvement" },
          ... (up to 3 total)
        ],
        "feedback": {
          "summary": "1-2 sentence overall assessment",
          "key_points": ["Bullet point observations", ...],
          "improvement_tips": ["Actionable advice", ...]
        },
        "nonverbal_assessment": {
          "speaking_pace": "Assessment of speaking speed and rhythm",
          "vocal_tone": "Assessment of voice modulation and clarity",
          "pauses": "Assessment of effective use of pauses and fillers"
        },
        "transcript": "The raw transcript (automatically filled - leave empty)"
      }
      
      Focus on being constructive, specific, and actionable in your feedback. Include concrete examples from the response. Be detailed but concise.
      
      Return ONLY the JSON object, no additional text.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      // Extract the JSON portion if there are any markdown code blocks
      let jsonText = text;
      if (text.includes("```json")) {
        jsonText = text.split("```json")[1].split("```")[0].trim();
      } else if (text.includes("```")) {
        jsonText = text.split("```")[1].split("```")[0].trim();
      }
      
      // Parse the JSON and add the transcript
      const analysisResult = JSON.parse(jsonText);
      
      // Add the transcript to the result object
      return {
        ...analysisResult,
        transcript: transcription
      };
    } catch (parseError) {
      console.error("Failed to parse JSON from API response:", parseError);
      throw new Error("Invalid response format from AI model");
    }
  } catch (error) {
    console.error("Error analyzing audio response:", error);
    throw error;
  }
}; 