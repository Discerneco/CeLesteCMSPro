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
  pages: many(typeTable(pages)),
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

// ================ PAGES ================

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content'),
  excerpt: text('excerpt'),
  featuredImageId: text('featured_image_id').references(() => media.id),
  authorId: text('author_id').notNull().references(() => users.id),
  templateId: text('template_id').references(() => templates.id),
  sectionsData: text('sections_data', { mode: 'json' }).$type<Record<string, any>>(), // Section-specific overrides
  status: text('status', { enum: ['draft', 'published', 'archived', 'trash'] }).notNull().default('draft'),
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
export const pageRelations = relations(typeTable(pages), ({ one }) => ({
  author: one(typeTable(users), { fields: [typeTable(pages.authorId)], references: [typeTable(users.id)] }),
  featuredImage: one(typeTable(media), { fields: [typeTable(pages.featuredImageId)], references: [typeTable(media.id)] }),
  template: one(typeTable(templates), { fields: [typeTable(pages.templateId)], references: [typeTable(templates.id)] }),
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

// ================ TEMPLATES (HORIZONTE SYSTEM) ================

export const templates = sqliteTable('templates', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  content: text('content').notNull(), // Complete .horizonte file content
  advancedConfig: text('advanced_config', { mode: 'json' }).$type<Record<string, any>>(),
  visualBuilderState: text('visual_builder_state', { mode: 'json' }).$type<Record<string, any>>(),
  type: text('type', { enum: ['page', 'post', 'homepage', 'blog'] }).default('page'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const templateSections = sqliteTable('template_sections', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  componentName: text('component_name').notNull(), // Svelte component name
  schema: text('schema', { mode: 'json' }).$type<Record<string, any>>(), // Configuration options
  previewImage: text('preview_image'), // URL to preview image
  category: text('category').notNull(), // 'navigation', 'content', 'media', etc.
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const sites = sqliteTable('sites', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  domain: text('domain'),
  description: text('description'),
  defaultTemplateId: text('default_template_id').references(() => templates.id),
  settings: text('settings', { mode: 'json' }).$type<Record<string, any>>(),
  buildStatus: text('build_status', { enum: ['idle', 'building', 'success', 'error'] }).default('idle'),
  lastBuildAt: integer('last_build_at', { mode: 'timestamp' }),
  buildLog: text('build_log'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// @ts-ignore - Suppress TypeScript errors for relations API with SQLite tables
export const templateRelations = relations(typeTable(templates), ({ many }) => ({
  pages: many(typeTable(pages)),
  sites: many(typeTable(sites))
}));

// @ts-ignore - Suppress TypeScript errors for relations API with SQLite tables  
export const siteRelations = relations(typeTable(sites), ({ one }) => ({
  defaultTemplate: one(typeTable(templates), { fields: [typeTable(sites.defaultTemplateId)], references: [typeTable(templates.id)] }),
}));

// ================ TYPES ================

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;
export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;
export type Page = InferSelectModel<typeof pages>;
export type NewPage = InferInsertModel<typeof pages>;
export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;
export type Tag = InferSelectModel<typeof tags>;
export type NewTag = InferInsertModel<typeof tags>;
export type Media = InferSelectModel<typeof media>;
export type NewMedia = InferInsertModel<typeof media>;
export type Setting = InferSelectModel<typeof settings>;
export type NewSetting = InferInsertModel<typeof settings>;
export type Template = InferSelectModel<typeof templates>;
export type NewTemplate = InferInsertModel<typeof templates>;
export type TemplateSection = InferSelectModel<typeof templateSections>;
export type NewTemplateSection = InferInsertModel<typeof templateSections>;
export type Site = InferSelectModel<typeof sites>;
export type NewSite = InferInsertModel<typeof sites>;
