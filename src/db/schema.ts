
import { pgTable, text, serial, timestamp, varchar, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    clerkId: varchar('clerk_id').unique().notNull(),
    email: varchar('email').notNull(),
    firstName: varchar('first_name'),
    lastName: varchar('last_name'),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const favoriteJobs = pgTable('favorite_jobs', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    // Job Data
    externalId: varchar('external_id').notNull(), // Not unique globally, but unique per user theoretically (though we handle duplicates via logic or composite key if needed. For now simple.)
    title: text('title').notNull(),
    company: varchar('company').notNull(),
    description: text('description'),
    salary: varchar('salary'),
    url: text('url'),
    location: varchar('location'),
    tags: text('tags').array(),
    postedAt: varchar('posted_at_string'),

    createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    favoriteJobs: many(favoriteJobs),
}));

export const favoriteJobsRelations = relations(favoriteJobs, ({ one }) => ({
    user: one(users, {
        fields: [favoriteJobs.userId],
        references: [users.id],
    }),
}));
