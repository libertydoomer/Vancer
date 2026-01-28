'use server';

import { enrichJobDescription as enrich } from './gemini';

export async function enrichJobDescription(description: string) {
    // Wrap to simpler string response
    try {
        const result = await enrich(description);
        return result;
    } catch (e) {
        console.error(e);
        return "Failed to analyze job.";
    }
}
