'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    // Basic validation or sanitization could go here

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                first_name: firstName,
                last_name: lastName,
                // imageUrl is not handled in this basic form yet, but could be added later or auto-generated
            })
            .eq('id', user.id);

        if (error) throw error;

        revalidatePath('/settings');
        revalidatePath('/'); // Update header if name is displayed there
        return { success: true };
    } catch (error) {
        console.error('Profile update failed:', error);
        return { error: 'Failed to update profile' };
    }
}
