
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function syncUser() {
    const user = await currentUser();
    if (!user) return;

    const email = user.emailAddresses[0]?.emailAddress ?? '';

    try {
        // Try to insert the user, or update if they already exist (based on clerkId)
        await db.insert(users).values({
            clerkId: user.id,
            email: email,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
        }).onConflictDoUpdate({
            target: users.clerkId,
            set: {
                email: email,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
            }
        });

        // console.log(`User ${user.id} synced to DB`);
    } catch (error) {
        console.error('Error syncing user to DB:', error);
    }
}
