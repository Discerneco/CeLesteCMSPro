import { sqliteTable, AnySQLiteColumn, uniqueIndex, foreignKey, text, integer, primaryKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const categories = sqliteTable("categories", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	parentId: text("parent_id"),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
},
(table) => [
	uniqueIndex("categories_slug_unique").on(table.slug),
	uniqueIndex("categories_name_unique").on(table.name),
	foreignKey(() => ({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "categories_parent_id_categories_id_fk"
		})).onDelete("set null"),
]);

export const contentTypes = sqliteTable("content_types", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	fields: text().notNull(),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
},
(table) => [
	uniqueIndex("content_types_slug_unique").on(table.slug),
	uniqueIndex("content_types_name_unique").on(table.name),
]);

export const media = sqliteTable("media", {
	id: text().primaryKey().notNull(),
	filename: text().notNull(),
	originalFilename: text("original_filename").notNull(),
	mimeType: text("mime_type").notNull(),
	size: integer().notNull(),
	path: text().notNull(),
	url: text().notNull(),
	altText: text("alt_text"),
	width: integer(),
	height: integer(),
	uploaderId: text("uploader_id").references(() => users.id),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
	metadata: text(),
});

export const postCategories = sqliteTable("post_categories", {
	postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" } ),
	categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.postId, table.categoryId], name: "post_categories_post_id_category_id_pk"})
]);

export const postTags = sqliteTable("post_tags", {
	postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" } ),
	tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.postId, table.tagId], name: "post_tags_post_id_tag_id_pk"})
]);

export const posts = sqliteTable("posts", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	content: text().notNull(),
	excerpt: text(),
	featuredImageId: text("featured_image_id").references(() => media.id),
	authorId: text("author_id").notNull().references(() => users.id),
	contentTypeId: text("content_type_id").notNull().references(() => contentTypes.id),
	status: text().default("draft").notNull(),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
	publishedAt: integer("published_at"),
	metaData: text("meta_data"),
},
(table) => [
	uniqueIndex("posts_slug_unique").on(table.slug),
]);

export const sessions = sqliteTable("sessions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	token: text().notNull(),
	expiresAt: integer("expires_at").notNull(),
	createdAt: integer("created_at").notNull(),
	userAgent: text("user_agent"),
	ipAddress: text("ip_address"),
},
(table) => [
	uniqueIndex("sessions_token_unique").on(table.token),
]);

export const settings = sqliteTable("settings", {
	key: text().primaryKey().notNull(),
	value: text().notNull(),
	updatedAt: integer("updated_at").notNull(),
});

export const tags = sqliteTable("tags", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
},
(table) => [
	uniqueIndex("tags_slug_unique").on(table.slug),
	uniqueIndex("tags_name_unique").on(table.name),
]);

export const users = sqliteTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	username: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	role: text().default("subscriber").notNull(),
	active: integer().default(true).notNull(),
	verifiedEmail: integer("verified_email").default(false).notNull(),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
	lastLogin: integer("last_login"),
	preferences: text(),
},
(table) => [
	uniqueIndex("users_username_unique").on(table.username),
	uniqueIndex("users_email_unique").on(table.email),
]);

