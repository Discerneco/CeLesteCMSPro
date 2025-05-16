import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: text('role').default('editor'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
});

// Social login connections (for future implementation)
export const userSocialConnections = sqliteTable('user_social_connections', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  provider: text('provider').notNull(), // 'github', 'google', etc.
  providerId: text('provider_id').notNull(), // ID from the provider
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
