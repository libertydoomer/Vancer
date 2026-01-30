
'use server'

import { Job } from "@/lib/theirstack";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";


export async function toggleFavorite(job: Job) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    // Check if job is already favorited by this user
    const { data: existingFavorite } = await supabase
        .from('favorite_jobs')
        .select('id')
        .eq('user_id', user.id)
        .eq('external_id', String(job.id))
        .single();

    if (existingFavorite) {
        // Unlike: Delete the row
        await supabase
            .from('favorite_jobs')
            .delete()
            .eq('id', existingFavorite.id);
    } else {
        // Like: Insert row with all details
        console.log(`[Action] Attempting to favorite job ${job.id} for user ${user.id}`);
        try {
            const { error } = await supabase
                .from('favorite_jobs')
                .insert({
                    user_id: user.id,
                    external_id: String(job.id),
                    title: job.title,
                    company: job.company,
                    description: job.description,
                    salary: job.salary || '',
                    url: job.url,
                    location: job.location,
                    tags: job.tags,
                    posted_at_string: job.postedAt,
                });

            if (error) {
                console.error('[Action] Supabase Insert Error:', error);
                throw error;
            }
            console.log('[Action] Insert successful');
        } catch (insertError) {
            console.error('[Action] Insert failed:', insertError);
            throw insertError;
        }
    }

    revalidatePath('/');
    revalidatePath('/favorites');
}

export async function getFavoriteJobIds(): Promise<string[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: favorites } = await supabase
        .from('favorite_jobs')
        .select('external_id')
        .eq('user_id', user.id);

    return favorites?.map(f => f.external_id) || [];
}

export async function getFavoriteJobs(): Promise<Job[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: favorites } = await supabase
        .from('favorite_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return favorites?.map(f => ({
        id: f.external_id,
        title: f.title,
        company: f.company,
        description: f.description || '',
        salary: f.salary || '',
        url: f.url || '',
        location: f.location || '',
        tags: f.tags || [],
        postedAt: f.posted_at_string || '',
    })) || [];
}
