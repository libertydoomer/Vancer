import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

// Singleton Queue mechanism
// This promise chain ensures that tasks are executed strictly sequentially.
let processingQueue: Promise<void> = Promise.resolve();
const MIN_DELAY_MS = 6000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function actualEnrich(description: string) {
  if (!apiKey) return "Error: API Key missing.";

  const genAI = new GoogleGenerativeAI(apiKey);
  // Trying 'gemini-flash-latest' as it often points to the most stable free-tier compatible version
  // compared to specific version tags that might have different quotas.
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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
    console.error(`Gemini Error: ${error.message}`);
    if (error.status === 429 || error.message?.includes("Quota")) {
      return "Quota exceeded. Please try again later.";
    }
    return `Analysis failed: ${error.message}`;
  }
}

export async function enrichJobDescription(description: string): Promise<string> {
  // Append this request to the queue to ensure strict serial execution
  const enqueuedRequest = processingQueue.then(async () => {
    console.log("⏳ Queue: Waiting 6s before processing next request...");
    await delay(MIN_DELAY_MS);
    return actualEnrich(description);
  });

  // Advance the queue without failing the chain for future requests
  processingQueue = enqueuedRequest.then(() => { }).catch(() => { });

  // Return the result for this specific call
  return enqueuedRequest;
}
