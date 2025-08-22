import { sqliteTable, text, integer, blob, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

/**
 * Helper function to handle TypeScript compatibility issues between Drizzle ORM and SQLite.
 *
 * This is specifically needed because of type constraints in the Drizzle ORM's relations API
 * that are not fully compatible with SQLite table types. The SQLite column types don't match
 * the expected Column<any, object, object> constraint.
 *
 * @param table The SQLite table or column to be properly typed for relations
 * @returns The same table/column but with type compatibility for relations
 */
export function typeTable<T>(table: T): any {
  return table;
}

// ================ USERS ================

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: text('role', { enum: ['admin', 'editor', 'author', 'subscriber'] }).notNull().default('subscriber'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  verifiedEmail: integer('verified_email', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  lastLogin: integer('last_login', { mode: 'timestamp' }),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  deletedBy: text('deleted_by'),
  preferences: text('preferences', { mode: 'json' }).$type<{
    language?: string,
    theme?: string,
    notifications?: boolean
  }>(),
});

// @ts-ignore - Suppress TypeScript errors for relations API with SQLite tables
export const userRelations = relations(typeTable(users), ({ many }) => ({
  sessions: many(typeTable(sessions)),
  posts: many(typeTable(posts)),
  media: many(typeTable(media)),
}));

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
});

// @ts-ignore - Suppress TypeScript errors for relations API with SQLite tables
export const sessionRelations = relations(typeTable(sessions), ({ one }) => ({
  user: one(typeTable(users), { fields: [typeTable(sessions.userId)], references: [typeTable(users.id)] }),
}));

// ================ CONTENT ================

export const contentTypes = sqliteTable('content_types', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  fields: text('fields', { mode: 'json' }).notNull().$type<{
    name: string,
    type: string,
    required: boolean,
    default?: any,
    options?: any
  }[]>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// @ts-ignore - Suppress TypeScript errors for relations API with SQLite tables
export const contentTypeRelations = relations(typeTable(contentTypes), ({ many }) => ({
  posts: many(typeTable(posts)),
}));

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  featuredImageId: text('featured_image_id').references(() => media.id),
  authorId: text('author_id').notNull().references(() => users.id),
  contentTypeId: text('content_type_id').notNull().references(() => contentTypes.id),
  status: text('status', { enum: ['draft', 'published', 'archived', 'trash'] }).notNull().default('draft'),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  trashedAt: integer('trashed_at', { mode: 'timestamp' }),
  trashedBy: text('trashed_by').references(() => users.id),
  metaData: text('meta_data', { mode: 'json' }).$type<{
    title?: string,
    description?: string,
    keywords?: string[],
    ogImage?: string
  }>(),
});

// @ts-ignore - Suppress TypeScript errors for relations API with SQLite tables
export const postRelations = relations(typeTable(posts), ({ one, many }) => ({
  author: one(typeTable(users), { fields: [typeTable(posts.authorId)], references: [typeTable(users.id)] }),
  contentType: one(typeTable(contentTypes), { fields: [typeTable(posts.contentTypeId)], references: [typeTable(contentTypes.id)] }),
  featuredImage: one(typeTable(media), { fields: [typeTable(posts.featuredImageId)], references: [typeTable(media.id)] }),
  categories: many(typeTable(postCategories)),
  tags: many(typeTable(postTags)),
}));

// Use any to break the circular reference chain
let categoriesTemp: any;

// @ts-ignore - Suppress TypeScript errors for circular reference
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  // Use a function reference that returns the id without directly referencing categories
  parentId: text('parent_id').references(() => categoriesTemp.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Set the temp variable after definition
categoriesTemp = categories;

// @ts-ignore - Suppress TypeScript errors for relations API with SQLite tables
export const categoryRelations = relations(typeTable(categories), ({ many, one }) => ({
  posts: many(typeTable(postCategories)),
  parent: one(typeTable(categories), { fields: [typeTable(categories.parentId)], references: [typeTable(categories.id)] }),
  children: many(typeTable(categories), { relationName: 'children' }),
}));

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// @ts-ignore - Suppress TypeScript errors for relations API with SQLite tables
export const tagRelations = relations(typeTable(tags), ({ many }) => ({
  posts: many(typeTable(postTags)),
}));

export const postCategories = sqliteTable('post_categories', {
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.postId, table.categoryId] }),
  };
});

// @ts-ignore - Suppress TypeScript errors for relations API with SQLite tables
export const postCategoryRelations = relations(typeTable(postCategories), ({ one }) => ({
  post: one(typeTable(posts), { fields: [typeTable(postCategories.postId)], references: [typeTable(posts.id)] }),
  category: one(typeTable(categories), { fields: [typeTable(postCategories.categoryId)], references: [typeTable(categories.id)] }),
}));

export const postTags = sqliteTable('post_tags', {
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.postId, table.tagId] }),
  };
});

// @ts-ignore - Suppress TypeScript errors for relations API with SQLite tables
export const postTagRelations = relations(typeTable(postTags), ({ one }) => ({
  post: one(typeTable(posts), { fields: [typeTable(postTags.postId)], references: [typeTable(posts.id)] }),
  tag: one(typeTable(tags), { fields: [typeTable(postTags.tagId)], references: [typeTable(tags.id)] }),
}));

// ================ MEDIA ================

export const media = sqliteTable('media', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  filename: text('filename').notNull(),
  originalFilename: text('original_filename').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  url: text('url').notNull(),
  altText: text('alt_text'),
  width: integer('width'),
  height: integer('height'),
  uploaderId: text('uploader_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  metadata: text('metadata', { mode: 'json' }),
});

// @ts-ignore - Suppress TypeScript errors for relations API with SQLite tables
export const mediaRelations = relations(typeTable(media), ({ one, many }) => ({
  uploader: one(typeTable(users), { fields: [typeTable(media.uploaderId)], references: [typeTable(users.id)] }),
  featuredInPosts: many(typeTable(posts)),
}));


// ================ SETTINGS ================

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
