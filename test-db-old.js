import 'dotenv/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { users, posts, categories, tags, contentTypes, postCategories, postTags } from './src/lib/server/db/schema.js';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

// Connect to the database
const sqlite = new Database('local.db');
const db = drizzle(sqlite);

console.log('🔍 Testing database connection and reading data...\n');

async function testDatabase() {
  try {
    // Check existing data
    const existingUsers = await db.select().from(users);
    const existingPosts = await db.select().from(posts);
    const existingCategories = await db.select().from(categories);
    const existingContentTypes = await db.select().from(contentTypes);
    
    console.log('📊 Current Database Status:');
    console.log(`- Users: ${existingUsers.length}`);
    console.log(`- Posts: ${existingPosts.length}`);
    console.log(`- Categories: ${existingCategories.length}`);
    console.log(`- Content Types: ${existingContentTypes.length}\n`);
    
    if (existingPosts.length > 0) {
      console.log('📝 Existing Posts:');
      existingPosts.forEach(post => {
        console.log(`  - ${post.title} (${post.status})`);
      });
      console.log();
    }
    
    // If we have basic data but few posts, let's add the requested sample posts
    if (existingUsers.length > 0 && existingPosts.length < 3) {
      console.log('🌱 Adding sample posts...\n');
      await createSamplePosts(existingUsers[0], existingCategories, existingContentTypes);
    } else if (existingUsers.length === 0) {
      console.log('❌ No users found. Please run: pnpm run db:seed first');
      return;
    } else {
      console.log('✅ Database already has sufficient data!');
    }
    
    // Show final state
    const finalPosts = await db.select().from(posts);
    console.log('\n📚 Final Posts in Database:');
    finalPosts.forEach(post => {
      const featured = post.metaData?.featured ? ' ⭐ FEATURED' : '';
      console.log(`  - ${post.title} (${post.status})${featured}`);
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    sqlite.close();
    console.log('\n🔒 Database connection closed.');
  }
}

async function createSamplePosts(adminUser, existingCategories, existingContentTypes) {
  // Get or create necessary data
  let category = existingCategories[0];
  let contentType = existingContentTypes[0];
  
  // If no category exists, create one
  if (!category) {
    const categoryId = createId();
    await db.insert(categories).values({
      id: categoryId,
      name: 'General',
      slug: 'general',
      description: 'General posts'
    });
    category = { id: categoryId, name: 'General', slug: 'general' };
    console.log('✅ Created General category');
  }
  
  // If no content type exists, create one
  if (!contentType) {
    const contentTypeId = createId();
    await db.insert(contentTypes).values({
      id: contentTypeId,
      name: 'Post',
      slug: 'post',
      description: 'Regular blog post',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'richtext', required: true },
        { name: 'excerpt', type: 'text', required: false }
      ]
    });
    contentType = { id: contentTypeId, name: 'Post', slug: 'post' };
    console.log('✅ Created Post content type');
  }
  
  // Create a "featured" tag
  const featuredTagId = createId();
  await db.insert(tags).values({
    id: featuredTagId,
    name: 'Featured',
    slug: 'featured',
    description: 'Featured content'
  }).onConflictDoNothing();
  
  // Create sample posts
  const posts = [
    {
      id: createId(),
      title: 'Hello World',
      slug: 'hello-world',
      content: `<h2>Welcome to CeLesteCMS Pro! 🎉</h2>
      
<p>This is your very first post in CeLesteCMS Pro, and we're thrilled to have you here! This modern content management system is built with cutting-edge technologies like SvelteKit, Drizzle ORM, and Cloudflare's edge computing platform.</p>

<p>What makes this "Hello World" special?</p>
<ul>
  <li>⚡ <strong>Lightning Fast</strong> - Built on edge computing for incredible performance</li>
  <li>🎨 <strong>Beautiful UI</strong> - Modern admin interface with dark mode support</li>
  <li>🔒 <strong>Secure by Design</strong> - Enterprise-grade security features</li>
  <li>🌍 <strong>Global Ready</strong> - Built-in internationalization support</li>
</ul>

<p>Whether you're a blogger, business owner, or developer, CeLesteCMS Pro provides everything you need to create amazing web experiences. Start exploring the admin dashboard and see how easy content management can be!</p>

<blockquote>
  <p>"The best CMSs don't just manage content—they inspire creativity." - The CeLesteCMS Team</p>
</blockquote>`,
      excerpt: 'Your first step into the amazing world of CeLesteCMS Pro! Discover what makes this CMS special.',
      authorId: adminUser.id,
      contentTypeId: contentType.id,
      status: 'published',
      publishedAt: new Date(),
      metaData: {
        title: 'Hello World - Welcome to CeLesteCMS Pro',
        description: 'Get started with CeLesteCMS Pro, the modern content management system built for performance and developer experience.',
        keywords: ['cms', 'sveltekit', 'welcome', 'getting started']
      }
    },
    {
      id: createId(),
      title: 'Meet CeLesteCMS Pro',
      slug: 'meet-celestecms-pro',
      content: `<h2>Introducing CeLesteCMS Pro ✨</h2>

<p>CeLesteCMS Pro isn't just another content management system—it's a revolution in how we think about content creation and delivery. Built from the ground up with modern web technologies, it combines the power of static site generation with the flexibility of dynamic content management.</p>

<h3>🚀 What Sets Us Apart</h3>

<p><strong>Edge-First Architecture:</strong> Every page loads instantly thanks to Cloudflare's global edge network. Your content is delivered from the location closest to your visitors, ensuring lightning-fast load times anywhere in the world.</p>

<p><strong>Developer Experience:</strong> Built with SvelteKit and TypeScript, CeLesteCMS Pro offers an exceptional developer experience. Hot module reloading, type safety, and modern tooling make development a joy.</p>

<p><strong>Future-Ready:</strong> From AI-powered content suggestions to advanced SEO optimization, CeLesteCMS Pro is designed to grow with the evolving web landscape.</p>

<h3>🎯 Perfect For</h3>
<ul>
  <li>🏢 <strong>Businesses</strong> who need reliable, fast websites</li>
  <li>✍️ <strong>Content Creators</strong> who want powerful authoring tools</li>
  <li>👨‍💻 <strong>Developers</strong> who demand modern, maintainable code</li>
  <li>🌐 <strong>Agencies</strong> managing multiple client sites</li>
</ul>

<p>Ready to experience the future of content management? You're already here! 🎉</p>`,
      excerpt: 'Discover the revolutionary features that make CeLesteCMS Pro the perfect choice for modern websites.',
      authorId: adminUser.id,
      contentTypeId: contentType.id,
      status: 'published',
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      metaData: {
        title: 'Meet CeLesteCMS Pro - The Future of Content Management',
        description: 'Discover the revolutionary features and edge-first architecture that make CeLesteCMS Pro perfect for modern websites.',
        keywords: ['cms', 'edge computing', 'sveltekit', 'content management', 'featured'],
        featured: true, // This is our featured post!
        ogImage: '/static/celestecms-featured.jpg'
      }
    },
    {
      id: createId(),
      title: 'The Joy of Simple Moments',
      slug: 'joy-of-simple-moments',
      content: `<h2>Finding Happiness in Everyday Magic 🌈</h2>

<p>In our fast-paced digital world, it's easy to forget that the most profound happiness often comes from the simplest moments. Today, let's celebrate those small, beautiful experiences that make life truly wonderful.</p>

<h3>☕ Morning Rituals</h3>
<p>There's something magical about that first sip of coffee in the morning, watching steam rise from your mug while the world slowly wakes up around you. It's a moment of pure presence, where time seems to pause just for you.</p>

<h3>🌅 Nature's Daily Show</h3>
<p>Have you ever stopped to really watch a sunrise or sunset? Each day, nature puts on a completely unique performance—no two are ever exactly alike. The colors, the clouds, the way light dances across the sky—it's a free masterpiece available to anyone willing to look up.</p>

<h3>😊 Unexpected Smiles</h3>
<p>A stranger's smile on the street, a dog wagging its tail as you walk by, a child's spontaneous laughter echoing in a park—these moments of human (and furry) connection remind us that kindness is everywhere, waiting to be noticed.</p>

<h3>📚 The Perfect Word</h3>
<p>Sometimes you read a sentence that perfectly captures a feeling you've had but never been able to express. That moment of recognition, of feeling deeply understood by someone you've never met, is pure magic.</p>

<p>Life is full of these gentle gifts. All we need to do is slow down enough to receive them. What simple moment brought you joy today? 💝</p>

<blockquote>
  <p>"Happiness is not something ready made. It comes from your own actions." - Dalai Lama</p>
</blockquote>`,
      excerpt: 'Sometimes the most profound happiness comes from the simplest moments. A celebration of everyday magic.',
      authorId: adminUser.id,
      contentTypeId: contentType.id,
      status: 'draft', // This is our draft post
      metaData: {
        title: 'The Joy of Simple Moments - Finding Happiness Every Day',
        description: 'Discover how the simplest moments in life can bring the most profound happiness and joy.',
        keywords: ['happiness', 'mindfulness', 'simple pleasures', 'joy', 'lifestyle']
      }
    }
  ];
  
  // Insert all posts
  for (const post of posts) {
    await db.insert(posts).values(post);
    console.log(`✅ Created post: "${post.title}" (${post.status})`);
    
    // Associate with category
    await db.insert(postCategories).values({
      postId: post.id,
      categoryId: category.id
    });
    
    // Add featured tag to the featured post
    if (post.metaData?.featured) {
      await db.insert(postTags).values({
        postId: post.id,
        tagId: featuredTagId
      });
      console.log(`  ⭐ Marked "${post.title}" as featured`);
    }
  }
}

// Run the test
testDatabase();
