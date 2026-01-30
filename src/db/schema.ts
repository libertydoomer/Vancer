
import { pgTable, text, serial, timestamp, varchar, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Renamed from 'users' to 'profiles' to match Supabase conventions
export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey().notNull(), // Links to auth.users.id
    email: varchar('email'), // Optional, usually managed by Auth but good for relations
    firstName: varchar('first_name'),
    lastName: varchar('last_name'),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const favoriteJobs = pgTable('favorite_jobs', {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),

    // Job Data
    externalId: varchar('external_id').notNull(),
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
export const profilesRelations = relations(profiles, ({ many }) => ({
    favoriteJobs: many(favoriteJobs),
}));

export const favoriteJobsRelations = relations(favoriteJobs, ({ one }) => ({
    user: one(profiles, {
        fields: [favoriteJobs.userId],
        references: [profiles.id],
    }),
}));
