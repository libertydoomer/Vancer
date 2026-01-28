import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export async function enrichJobDescription(description: string) {
  if (!apiKey) {
    return "Error: API Key missing.";
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // We'll try these models in order. 
  // 1.5-flash is the most reliable for free tier quotas.
  // 2.0-flash is faster but can have stricter '0 limit' quotas on some keys.
  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-2.0-flash"
  ];

  const prompt = `Analyze the job description and highlight three points: 
  1. Actual salary range (if available). 
  2. Main technology stack. 
  3. Red flags (suspicious requirements). 
  Format as a clean list with icons.
  Text: ${description}`;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting analysis with: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (text) return text;
    } catch (error: any) {
      console.warn(`Model ${modelName} failed. Status: ${error.status}`);

      // If we hit a 429 (Quota exceeded) on one model, 
      // it's worth trying the next one as they often have separate quotas.
      // If we hit a 404, the model simply isn't available for this key.
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        // Last model failed, handle the error
        if (error.status === 429) {
          return "Quota exceeded for all available AI models. Please wait a few seconds and try again, or check your Google AI Studio billing.";
        }
        return `AI Analysis failed: ${error.message}`;
      }
      continue;
    }
  }

  return "AI Analysis failed to find a working model.";
}
