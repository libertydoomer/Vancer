import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

// Singleton Queue mechanism
// This promise chain ensures that tasks are executed strictly sequentially.
let processingQueue: Promise<void> = Promise.resolve();
const MIN_DELAY_MS = 5000; // 5 seconds between requests (12 RPM safety)

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Extracts retry delay from Google Generative AI error object if available.
 */
function getRetryDelay(error: any): number {
  try {
    const details = error.errorDetails;
    if (Array.isArray(details)) {
      for (const item of details) {
        if (item.retryDelay) {
          const seconds = parseInt(item.retryDelay.replace('s', ''));
          if (!isNaN(seconds)) return (seconds * 1000) + 2000; // Add 2s buffer
        }
      }
    }
    const match = error.message?.match(/retry in ([\d\.]+)s/);
    if (match) {
      return (parseFloat(match[1]) * 1000) + 2000;
    }
  } catch (e) {
    console.warn("Failed to parse retry delay:", e);
  }
  return 60000; // Default 60s wait for quota issues
}

async function actualEnrich(description: string) {
  if (!apiKey) return "Error: API Key missing.";

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-2.5-flash as it is confirmed available and stable
  const modelName = "gemini-2.5-flash";
  console.log(`🚀 AI: Initializing model ${modelName}`);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `Analyze the job description and provide a structured JSON response (do NOT use Markdown formatting like \`\`\`json). 
  The JSON must have this exact structure:
  {
    "salary": "Extracted salary range or 'Not specified'",
    "techStack": ["Tool 1", "Tool 2", "Tool 3"],
    "redFlags": ["Concern 1", "Concern 2"],
    "conclusion": "A brief 2-sentence summary of whether this job is worth applying for and why.",
    "verdict": "Apply" | "Caution" | "Avoid"
  }
  
  Job Description:
  ${description}`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("Quota")) {
      const waitTime = getRetryDelay(error);
      console.warn(`⚠️ Quota hit. Waiting ${waitTime / 1000}s to retry once...`);
      await delay(waitTime);
      try {
        const retryResult = await model.generateContent(prompt);
        return retryResult.response.text();
      } catch (retryError: any) {
        console.error("Enrichment Retry Failed:", retryError.message);
        return "Quota exceeded. Please try again in a few minutes.";
      }
    }
    console.error(`Gemini Error: ${error.message}`);
    return `Analysis failed: ${error.message}`;
  }
}

export async function enrichJobDescription(description: string): Promise<string> {
  const enqueuedRequest = processingQueue.then(async () => {
    console.log("⏳ Queue: Waiting 5s for API cooldown (Job Analysis)...");
    await delay(MIN_DELAY_MS);
    return actualEnrich(description);
  });
  processingQueue = enqueuedRequest.then(() => { }).catch(() => { });
  return enqueuedRequest;
}

async function actualAnalyzeResume(text: string): Promise<string> {
  if (!apiKey) throw new Error("API Key missing.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = "gemini-2.5-flash";
  console.log(`🚀 AI: Initializing model ${modelName}`);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `You are an expert career coach and resume writer. Analyze the following resume text and provide a comprehensive JSON response.
  Do NOT use Markdown formatting (like \`\`\`json). Just return the raw JSON string.
  
  Structure:
  {
    "jobTitles": ["Title 1", "Title 2"],
    "searchQueries": ["Query 1", "Query 2"],
    "critique": ["Specific, actionable tip 1 (approx. 12-15 words)", "Specific, actionable tip 2 (approx. 12-15 words)"],
    "legend": "A massive, extremely detailed first-person narrative (approx. 500-600 words) that deeply summarizes the candidate's entire career. It should be exhaustive, covering every major skill, project, and achievement in a flowing, professional storytelling format."
  }

  Resume Text:
  ${text}`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("Quota")) {
      const waitTime = getRetryDelay(error);
      console.warn(`⚠️ Quota hit. Waiting ${waitTime / 1000}s to retry once...`);
      await delay(waitTime);
      try {
        const retryResult = await model.generateContent(prompt);
        return retryResult.response.text();
      } catch (retryError: any) {
        console.error("Resume Retry Failed:", retryError.message);
        throw new Error("AI Usage Limit Exceeded. Please try again in a minute.");
      }
    }
    console.error("Gemini Resume Analysis Error:", error);
    throw new Error("Failed to analyze resume: " + (error.message || "Unknown error"));
  }
}

export async function analyzeResumeContent(text: string): Promise<string> {
  const enqueuedRequest = processingQueue.then(async () => {
    console.log("⏳ Queue: Waiting 5s for API cooldown (Resume Analysis)...");
    await delay(MIN_DELAY_MS);
    return actualAnalyzeResume(text);
  });
  processingQueue = enqueuedRequest.then(() => { }).catch(() => { });
  return enqueuedRequest;
}
