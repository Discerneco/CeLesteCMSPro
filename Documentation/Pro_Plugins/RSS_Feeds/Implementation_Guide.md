✅ Goal

Expose an RSS feed (e.g., https://yourdomain.com/rss.xml) that updates dynamically based on your headless CMS content (e.g., blog posts or news).

⸻

🔧 Step-by-step Guide

1. Create a SvelteKit endpoint (e.g., src/routes/rss.xml/+server.ts)

// src/routes/rss.xml/+server.ts
import { xml } from '@sveltejs/kit'; // optional helper for response
import { getPosts } from '$lib/server/api/posts'; // your CMS fetch logic

export const GET = async () => {
	const posts = await getPosts(); // title, slug, date, excerpt, etc.

	const feed = `
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>My Blog</title>
  <link>https://yourdomain.com</link>
  <description>Latest posts from My Blog</description>
  ${posts
		.map(
			(post) => `
  <item>
    <title>${post.title}</title>
    <link>https://yourdomain.com/blog/${post.slug}</link>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <description><![CDATA[${post.excerpt}]]></description>
  </item>
  `
		)
		.join('')}
</channel>
</rss>
	`;

	return new Response(feed, {
		headers: {
			'Content-Type': 'application/rss+xml'
		}
	});
};


⸻

2. Create your getPosts() function

This can fetch from Airtable, Supabase, or any other CMS.

Example (mocked):

// src/lib/server/api/posts.ts
export async function getPosts() {
	return [
		{
			title: 'Hello World',
			slug: 'hello-world',
			date: '2025-05-01',
			excerpt: 'Welcome to my first post.'
		},
		// add more entries
	];
}

If you’re using Airtable:

// src/lib/server/api/posts.ts
import { AirtableConnect } from 'airtable-connect';
const airtable = new AirtableConnect({ apiKey: 'xxx', baseId: 'yyy' });

export async function getPosts() {
	const records = await airtable.select({ table: 'Posts' });
	return records.map((r) => ({
		title: r.fields.title,
		slug: r.fields.slug,
		date: r.fields.date,
		excerpt: r.fields.excerpt
	}));
}


⸻

3. Test It

Visit http://localhost:5173/rss.xml
It should return a valid XML file with your latest content.

⸻

🧪 Bonus: Validate Your Feed

Use tools like:
	•	W3C Feed Validator
	•	RSS Feed Reader to preview the result.

⸻

🔄 Automation Ideas
	•	Send newsletters via Mailchimp/ConvertKit using the RSS feed.
	•	Auto-post new items to Slack, Telegram, etc. using Zapier or Make.com.
	•	Add <link rel="alternate" type="application/rss+xml" href="/rss.xml"> in <head> for browser autodetection.


    Perfect — using SQLite or D1 with Drizzle ORM is a solid combo, especially for a lightweight, fast, and serverless-friendly CMS like CeLesteCMS.

Here’s how to adapt the RSS feed logic using Drizzle ORM:

⸻

✅ Step 1: Create a Drizzle query to get posts

Assuming you have a posts table with title, slug, date, and excerpt:

// src/lib/server/db/posts.ts
import { db } from './db'; // your Drizzle instance
import { posts } from './schema'; // your Drizzle schema

export async function getPosts() {
	return await db.select().from(posts).orderBy(posts.date);
}


⸻

✅ Step 2: Use it in your RSS endpoint

// src/routes/rss.xml/+server.ts
import { getPosts } from '$lib/server/db/posts';

export const GET = async () => {
	const posts = await getPosts();

	const feed = `
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>CeLesteCMS Blog</title>
  <link>https://yourdomain.com</link>
  <description>Latest updates from CeLesteCMS</description>
  ${posts
		.map(
			(post) => `
  <item>
    <title>${post.title}</title>
    <link>https://yourdomain.com/blog/${post.slug}</link>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <description><![CDATA[${post.excerpt}]]></description>
  </item>
  `
		)
		.join('')}
</channel>
</rss>
`;

	return new Response(feed, {
		headers: {
			'Content-Type': 'application/rss+xml'
		}
	});
};


⸻

🔧 Tips
	•	Use drizzle-kit to generate your schema types if you’re not already.
	•	If you’re on Cloudflare D1, you’ll just need to wire Drizzle to it using their sqlite3 adapter.
	•	Add proper <link rel="alternate"> tags in <svelte:head> of your main layout.
