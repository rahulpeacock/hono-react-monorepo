import { bigint, boolean, integer, json, pgTable, primaryKey, serial, smallint, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import type { ProviderType } from '../lib/types';

/**
 * Represents the user table schema in the database.
 *
 * This table stores information about users, including their unique identifier, email address,
 * email verification status, and user metadata such as name and avatar URL.
 */
export const userTable = pgTable('user', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  user_metadata: json().$type<{ name: string; avatar_url: string | null }>().notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }),
});
export type User = typeof userTable.$inferSelect;
export type NewUser = typeof userTable.$inferInsert;

/**
 * Represents the account table schema in the database.
 *
 * This table stores information about user accounts, including their provider, provider account ID,
 * tokens, and other metadata. The primary key is a compound key consisting of the provider and
 * providerAccountId.
 */
export const accountTable = pgTable(
  'account',
  {
    userId: serial('userId')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    provider: text('provider').$type<ProviderType>().notNull(),
    accountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    account_metadata: json().$type<{ avatar_url: string | null; hashedPassword: string | null }>().notNull(),
  },
  (account) => [primaryKey({ columns: [account.provider, account.accountId] })],
);
export type Account = typeof accountTable.$inferSelect;
export type NewAccount = typeof accountTable.$inferInsert;

export const sessionTable = pgTable('session', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});
export type Session = typeof sessionTable.$inferSelect;
export type NewSession = typeof sessionTable.$inferInsert;

/**
 * Represents the verification token table schema in the database.
 *
 * This table stores email verification tokens for users.
 *
 * When a user needs to verify their email, a record is created in this table with a unique
 * code that is sent to their email address. The code must be used before the expiration time.
 */
export const verificationTokenTable = pgTable('verification_token', {
  id: text('id').notNull().primaryKey(),
  userId: serial('userId')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  code: varchar('code', { length: 10 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const gUserTable = pgTable('g_user', {
  id: serial('id').primaryKey(),
  userId: bigint({ mode: 'number' }),
  username: varchar('username', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
});

export const gConnectionTable = pgTable('g_connection', {
  id: serial('id').primaryKey(),
  gUserId: bigint({ mode: 'number' }),
  identifier: bigint({ mode: 'number' }).notNull(),
  podType: varchar('podType', { length: 50 }).notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
});

export const courseTable = pgTable('course', {
  id: serial('id').primaryKey(),
  userId: serial('userId')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description').notNull(),
  thumbnail: text('thumbnail').notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }),
  categories: text('categories').notNull(),
});

export const chapterTable = pgTable('chapter', {
  id: serial('id').primaryKey(),
  courseId: serial('courseId')
    .notNull()
    .references(() => courseTable.id, { onDelete: 'cascade' }),
  title: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description').notNull(),
  content: text('content').notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  index: smallint('index').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }),
});

export const enrolledCourseTable = pgTable('enrolled_course', {
  id: serial('id').primaryKey(),
  userId: serial('userId')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  courseId: serial('courseId')
    .notNull()
    .references(() => courseTable.id, { onDelete: 'cascade' }),
  enrolled: boolean('enrolled').default(true),
});
