
import { pgTable, text, serial, timestamp, varchar, uuid, boolean, integer } from 'drizzle-orm/pg-core';
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

export const resumeAnalyses = pgTable('resume_analyses', {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
    fileName: text('file_name').notNull(),
    // Store simple arrays as PostgreSQL arrays
    jobTitles: text('job_titles').array(),
    searchQueries: text('search_queries').array(),
    // critique is also string[]
    critique: text('critique').array(),
    legend: text('legend'),

    createdAt: timestamp('created_at').defaultNow(),
});

export const documents = pgTable('documents', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
    fileName: text('file_name').notNull(),
    filePath: text('file_path').notNull(),
    size: integer('size'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
    favoriteJobs: many(favoriteJobs),
    resumeAnalyses: many(resumeAnalyses),
    documents: many(documents),
}));

export const favoriteJobsRelations = relations(favoriteJobs, ({ one }) => ({
    user: one(profiles, {
        fields: [favoriteJobs.userId],
        references: [profiles.id],
    }),
}));

export const resumeAnalysesRelations = relations(resumeAnalyses, ({ one }) => ({
    user: one(profiles, {
        fields: [resumeAnalyses.userId],
        references: [profiles.id],
    }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
    user: one(profiles, {
        fields: [documents.userId],
        references: [profiles.id],
    }),
}));
