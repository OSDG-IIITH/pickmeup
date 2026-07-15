import { pgTable, text, boolean, timestamp, primaryKey, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	handle: text('handle').unique().notNull(),
	name: text('name').notNull(),
	role: text('role').notNull().default('user'),
	createdat: timestamp('createdat', { withTimezone: true }).notNull().defaultNow()
});

export const ideas = pgTable('ideas', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	body: text('body').notNull(),
	authorid: text('authorid').notNull().references(() => users.id),
	status: text('status').notNull().default('open').$type<'open' | 'closed'>(),
	pinned: boolean('pinned').notNull().default(false),
	createdat: timestamp('createdat', { withTimezone: true }).notNull().defaultNow(),
	updatedat: timestamp('updatedat', { withTimezone: true })
}, (t) => [
	index().on(t.status),
	index().on(t.authorid),
	check('status_check', sql`${t.status} IN ('open', 'closed')`)
]);

export const tags = pgTable('tags', {
	idea: text('idea').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
	tag: text('tag').notNull()
}, (t) => [
	primaryKey({ columns: [t.idea, t.tag] }),
	index().on(t.tag)
]);

export const votes = pgTable('votes', {
	idea: text('idea').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
	user: text('user').notNull().references(() => users.id)
}, (t) => [
	primaryKey({ columns: [t.idea, t.user] })
]);

export const comments = pgTable('comments', {
	id: text('id').primaryKey(),
	idea: text('idea').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
	authorid: text('authorid').notNull().references(() => users.id),
	parent: text('parent').references((): any => comments.id, { onDelete: 'cascade' }),
	body: text('body').notNull(),
	createdat: timestamp('createdat', { withTimezone: true }).notNull().defaultNow(),
	updatedat: timestamp('updatedat', { withTimezone: true })
}, (t) => [
	index().on(t.idea),
	index().on(t.parent)
]);

export const commentvotes = pgTable('commentvotes', {
	comment: text('comment').notNull().references(() => comments.id, { onDelete: 'cascade' }),
	user: text('user').notNull().references(() => users.id)
}, (t) => [
	primaryKey({ columns: [t.comment, t.user] })
]);

// zod schemas for api validation
export const createidea = z.object({
	title: z.string().min(1),
	body: z.string().min(1),
	tags: z.array(z.string()).default([])
});

export const editidea = z.object({
	title: z.string().min(1).optional(),
	body: z.string().min(1).optional(),
	status: z.enum(['open', 'closed']).optional()
});

export const createcomment = z.object({
	body: z.string().min(1),
	parent: z.string().optional()
});

export const editcomment = z.object({
	body: z.string().min(1)
});
