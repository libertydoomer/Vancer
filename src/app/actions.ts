
'use server'

import { db } from "@/db";
import { favoriteJobs, users } from "@/db/schema";
import { Job } from "@/lib/theirstack";
import { auth } from "@clerk/nextjs/server";
import { and, eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(job: Job) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
        return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkUserId),
    });

    if (!user) {
        throw new Error("User not found in database.");
    }

    // Check if job is already favorited by this user
    const existingFavorite = await db.query.favoriteJobs.findFirst({
        where: and(
            eq(favoriteJobs.userId, user.id),
            eq(favoriteJobs.externalId, String(job.id))
        ),
    });

    if (existingFavorite) {
        // Unlike: Delete the row
        await db.delete(favoriteJobs).where(eq(favoriteJobs.id, existingFavorite.id));
    } else {
        // Like: Insert row with all details
        await db.insert(favoriteJobs).values({
            userId: user.id,
            externalId: String(job.id),
            title: job.title,
            company: job.company,
            description: job.description,
            salary: job.salary || '',
            url: job.url,
            location: job.location,
            tags: job.tags,
            postedAt: job.postedAt,
        });
    }

    revalidatePath('/');
    revalidatePath('/favorites');
}

export async function getFavoriteJobIds(): Promise<string[]> {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return [];

    const user = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkUserId),
    });

    if (!user) return [];

    const favorites = await db.query.favoriteJobs.findMany({
        where: eq(favoriteJobs.userId, user.id),
        columns: {
            externalId: true,
        }
    });

    return favorites.map(f => f.externalId);
}

export async function getFavoriteJobs(): Promise<Job[]> {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return [];

    const user = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkUserId),
    });

    if (!user) return [];

    const favorites = await db.query.favoriteJobs.findMany({
        where: eq(favoriteJobs.userId, user.id),
        orderBy: [desc(favoriteJobs.createdAt)],
    });

    return favorites.map(f => ({
        id: f.externalId,
        title: f.title,
        company: f.company,
        description: f.description || '',
        salary: f.salary || '',
        url: f.url || '',
        location: f.location || '',
        tags: f.tags || [],
        postedAt: f.postedAt || '',
    }));
}
