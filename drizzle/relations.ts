import { relations } from "drizzle-orm/relations";
import { categories, users, media, postCategories, posts, tags, postTags, contentTypes, sessions } from "./schema";

export const categoriesRelations = relations(categories, ({one, many}) => ({
	category: one(categories, {
		fields: [categories.parentId],
		references: [categories.id],
		relationName: "categories_parentId_categories_id"
	}),
	categories: many(categories, {
		relationName: "categories_parentId_categories_id"
	}),
	postCategories: many(postCategories),
}));

export const mediaRelations = relations(media, ({one, many}) => ({
	user: one(users, {
		fields: [media.uploaderId],
		references: [users.id]
	}),
	posts: many(posts),
}));

export const usersRelations = relations(users, ({many}) => ({
	media: many(media),
	posts: many(posts),
	sessions: many(sessions),
}));

export const postCategoriesRelations = relations(postCategories, ({one}) => ({
	category: one(categories, {
		fields: [postCategories.categoryId],
		references: [categories.id]
	}),
	post: one(posts, {
		fields: [postCategories.postId],
		references: [posts.id]
	}),
}));

export const postsRelations = relations(posts, ({one, many}) => ({
	postCategories: many(postCategories),
	postTags: many(postTags),
	contentType: one(contentTypes, {
		fields: [posts.contentTypeId],
		references: [contentTypes.id]
	}),
	user: one(users, {
		fields: [posts.authorId],
		references: [users.id]
	}),
	media: one(media, {
		fields: [posts.featuredImageId],
		references: [media.id]
	}),
}));

export const postTagsRelations = relations(postTags, ({one}) => ({
	tag: one(tags, {
		fields: [postTags.tagId],
		references: [tags.id]
	}),
	post: one(posts, {
		fields: [postTags.postId],
		references: [posts.id]
	}),
}));

export const tagsRelations = relations(tags, ({many}) => ({
	postTags: many(postTags),
}));

export const contentTypesRelations = relations(contentTypes, ({many}) => ({
	posts: many(posts),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));