'use server';

import { analyzeResumeContent } from '@/lib/gemini';
import mammoth from 'mammoth';
import { db } from '@/db';
import { resumeAnalyses, documents } from '@/db/schema';
import { createClient } from '@/utils/supabase/server';
import { eq, desc } from 'drizzle-orm';

const PDFParser = require("pdf2json");
const officeParser = require('officeparser');

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


export async function analyzeResumeAction(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const file = formData.get('file') as File;

    if (!file) {
        throw new Error('No file uploaded');
    }

    let text = '';
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
        if (file.type === 'application/pdf') {
            text = await new Promise((resolve, reject) => {
                const pdfParser = new PDFParser(null, 1);

                pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));

                pdfParser.on("pdfParser_dataReady", () => {
                    const raw = pdfParser.getRawTextContent();
                    resolve(raw);
                });

                pdfParser.parseBuffer(buffer);
            });
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else if (file.type === 'application/msword') {
            // Handle legacy .doc files via officeparser
            text = await new Promise((resolve, reject) => {
                officeParser.parseOffice(buffer, (data: any, err: any) => {
                    if (err) return reject(err);

                    if (typeof data === 'string') {
                        resolve(data);
                    } else if (data && typeof data.toText === 'function') {
                        resolve(data.toText());
                    } else {
                        resolve(String(JSON.stringify(data)));
                    }
                });
            });
        } else {
            throw new Error(`Unsupported file type: ${file.type}`);
        }

        const safeText = String(text || '');

        if (safeText.trim().length === 0) {
            throw new Error('Could not extract text from file');
        }

        const analysisJson = await analyzeResumeContent(safeText);

        // Hard delay to stay within 15 RPM limit
        console.log("Waiting 10s for API cooldown...");
        await delay(10000);

        const cleanJson = analysisJson.replace(/```json/g, '').replace(/```/g, '').trim();

        const result = JSON.parse(cleanJson);

        // Return result without saving automatically
        return result;

    } catch (error: any) {
        console.error('Resume Analysis Error:', error);
        throw new Error(error.message || 'Failed to analyze resume');
    }
}

export async function saveAnalysisAction(result: any, fileName: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Insert into resume_analyses
    await db.insert(resumeAnalyses).values({
        userId: user.id,
        fileName: fileName,
        jobTitles: result.jobTitles,
        searchQueries: result.searchQueries,
        critique: result.critique,
        legend: result.legend || result.improvedResume,
    });
}

export async function getAnalysisHistory() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
        const history = await db.query.resumeAnalyses.findMany({
            where: eq(resumeAnalyses.userId, user.id),
            orderBy: [desc(resumeAnalyses.createdAt)],
        });
        return history;
    } catch (e) {
        console.error("Failed to fetch history:", e);
        return [];
    }
}

// --- Document Management Actions ---

export async function uploadDocumentAction(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const file = formData.get('file') as File;
    if (!file) throw new Error("No file found");

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${user.id}/${timestamp}-${safeName}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Storage
    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: false
        });

    if (uploadError) throw new Error("Storage Upload Failed: " + uploadError.message);

    // Insert to DB
    await db.insert(documents).values({
        userId: user.id,
        fileName: file.name,
        filePath: storagePath,
        size: file.size,
    });
}

export async function getUserDocuments() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    return await db.query.documents.findMany({
        where: eq(documents.userId, user.id),
        orderBy: [desc(documents.createdAt)],
    });
}

export async function deleteDocumentAction(id: string, filePath: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Delete from Storage
    const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

    if (storageError) console.error("Storage delete warning:", storageError);

    // Delete from DB
    await db.delete(documents).where(eq(documents.id, id));
}


export async function analyzeStoredDocumentAction(documentId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Fetch document metadata
    const doc = await db.query.documents.findFirst({
        where: eq(documents.id, documentId)
    });

    if (!doc) throw new Error("Document not found");

    // Download file from Storage
    const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(doc.filePath);

    if (downloadError || !fileData) {
        throw new Error("Failed to download file from storage");
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    let text = '';

    // Determine type from extension or mime (we stored filename)
    const lowerName = doc.fileName.toLowerCase();

    try {
        if (lowerName.endsWith('.pdf')) {
            text = await new Promise((resolve, reject) => {
                const pdfParser = new PDFParser(null, 1);
                pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
                pdfParser.on("pdfParser_dataReady", () => {
                    const raw = pdfParser.getRawTextContent();
                    resolve(raw);
                });
                pdfParser.parseBuffer(buffer);
            });
        } else if (lowerName.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else if (lowerName.endsWith('.doc')) {
            text = await new Promise((resolve, reject) => {
                officeParser.parseOffice(buffer, (data: any, err: any) => {
                    if (err) return reject(err);
                    if (typeof data === 'string') resolve(data);
                    else if (data && typeof data.toText === 'function') resolve(data.toText());
                    else resolve(String(JSON.stringify(data)));
                });
            });
        } else {
            throw new Error("Unsupported file format");
        }

        const safeText = String(text || '');
        if (safeText.trim().length === 0) throw new Error('Could not extract text');

        const analysisJson = await analyzeResumeContent(safeText);

        // Hard delay to stay within 15 RPM limit
        console.log("Waiting 10s for API cooldown...");
        await delay(10000);
        const cleanJson = analysisJson.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanJson);

        return result;

    } catch (error: any) {
        console.error("Stored Document Analysis Error:", error);
        throw new Error(error.message || "Analysis failed");
    }
}
