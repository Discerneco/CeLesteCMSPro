import { createDb } from './index';
import * as schema from './schema';
import { createId } from '@paralleldrive/cuid2';

/**
 * Seed the database with initial data for development
 * 
 * This script is meant to be run directly from the command line during development:
 * pnpm run db:seed
 */
async function seedDatabase() {
  console.log('🌱 Seeding database for development...');
  
  const db = createDb();
  if (!db) {
    console.error('Database connection failed');
    process.exit(1);
  }
  
  try {
    // Create admin user
    const adminId = createId();
    await db.insert(schema.users).values({
      id: adminId,
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: '$2b$10$J8SGeG1ADGfaTGNrBueiIuhS3GX4Xrn0VIuXLGf.iMOY9EANMkFui', // "password"
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      active: true,
      verifiedEmail: true
    }).onConflictDoNothing();
    
    // Create content types
    const postTypeId = createId();
    await db.insert(schema.contentTypes).values({
      id: postTypeId,
      name: 'Post',
      slug: 'post',
      description: 'Regular blog post',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'richtext', required: true },
        { name: 'excerpt', type: 'text', required: false }
      ]
    }).onConflictDoNothing();
    
    // Create categories
    const categoryId = createId();
    await db.insert(schema.categories).values({
      id: categoryId,
      name: 'General',
      slug: 'general',
      description: 'General posts'
    }).onConflictDoNothing();
    
    // Create tag
    const tagId = createId();
    await db.insert(schema.tags).values({
      id: tagId,
      name: 'News',
      slug: 'news',
      description: 'News and updates'
    }).onConflictDoNothing();
    
    // Create sample post
    const postId = createId();
    await db.insert(schema.posts).values({
      id: postId,
      title: 'Welcome to CeLesteCMS Pro',
      slug: 'welcome-to-celestecms-pro',
      content: '<p>This is your first post in CeLesteCMS Pro. You can edit or delete it to get started.</p>',
      excerpt: 'Get started with CeLesteCMS Pro',
      authorId: adminId,
      status: 'published',
      contentTypeId: postTypeId
    }).onConflictDoNothing();
    
    // Associate post with category
    await db.insert(schema.postCategories).values({
      postId,
      categoryId
    }).onConflictDoNothing();
    
    // Associate post with tag
    await db.insert(schema.postTags).values({
      postId,
      tagId
    }).onConflictDoNothing();
    
    // Create sample pages
    const aboutPageId = createId();
    await db.insert(schema.pages).values({
      id: aboutPageId,
      title: 'About Us',
      slug: 'about',
      content: `<h2>Welcome to CeLesteCMS Pro</h2>
<p>CeLesteCMS Pro is a modern, flexible content management system built with cutting-edge web technologies. Our platform empowers content creators and developers alike with powerful tools for building exceptional websites.</p>

<h3>Our Mission</h3>
<p>We believe that content management should be intuitive, performant, and developer-friendly. That's why we built CeLesteCMS Pro with the latest web standards and modern architecture.</p>

<h3>Key Features</h3>
<ul>
<li>Lightning-fast performance with static site generation</li>
<li>Modern admin interface built with SvelteKit</li>
<li>Flexible content modeling and management</li>
<li>Multi-language support out of the box</li>
<li>Plugin architecture for extensibility</li>
<li>SEO-optimized and mobile-first design</li>
</ul>

<p>Whether you're building a blog, corporate website, or complex web application, CeLesteCMS Pro provides the foundation you need to succeed.</p>`,
      excerpt: 'Learn more about CeLesteCMS Pro and our mission to revolutionize content management.',
      authorId: adminId,
      status: 'published',
      publishedAt: new Date()
    }).onConflictDoNothing();

    const contactPageId = createId();
    await db.insert(schema.pages).values({
      id: contactPageId,
      title: 'Contact Us',
      slug: 'contact',
      content: `<h2>Get in Touch</h2>
<p>Have questions about CeLesteCMS Pro? We'd love to hear from you!</p>

<h3>Support</h3>
<p>For technical support and questions about using CeLesteCMS Pro:</p>
<ul>
<li>Email: <a href="mailto:support@celestecms.com">support@celestecms.com</a></li>
<li>Documentation: Check our comprehensive guides and tutorials</li>
<li>Community: Join our developer community forum</li>
</ul>

<h3>Business Inquiries</h3>
<p>For partnerships, licensing, and business opportunities:</p>
<ul>
<li>Email: <a href="mailto:business@celestecms.com">business@celestecms.com</a></li>
</ul>

<h3>Follow Us</h3>
<p>Stay updated with the latest news and updates:</p>
<ul>
<li>GitHub: Follow our open-source projects</li>
<li>Twitter: @celestecms for updates and tips</li>
<li>LinkedIn: Connect with our team</li>
</ul>

<p>We typically respond to inquiries within 24 hours during business days.</p>`,
      excerpt: 'Get in touch with the CeLesteCMS Pro team for support, partnerships, and more.',
      authorId: adminId,
      status: 'published',
      publishedAt: new Date()
    }).onConflictDoNothing();

    const privacyPageId = createId();
    await db.insert(schema.pages).values({
      id: privacyPageId,
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: `<h2>Privacy Policy</h2>
<p><em>Last updated: ${new Date().toLocaleDateString()}</em></p>

<h3>Information We Collect</h3>
<p>CeLesteCMS Pro respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information.</p>

<h4>Data You Provide</h4>
<ul>
<li>Account registration information (email, username)</li>
<li>Content you create and publish</li>
<li>Profile information you choose to add</li>
<li>Communications you send to us</li>
</ul>

<h4>Automatically Collected Data</h4>
<ul>
<li>Usage analytics and performance metrics</li>
<li>Browser and device information</li>
<li>IP addresses and location data</li>
<li>Cookies and similar tracking technologies</li>
</ul>

<h3>How We Use Your Information</h3>
<ul>
<li>Provide and improve our services</li>
<li>Communicate with you about your account</li>
<li>Ensure security and prevent fraud</li>
<li>Analyze usage patterns and optimize performance</li>
</ul>

<h3>Data Protection</h3>
<p>We implement appropriate security measures to protect your data against unauthorized access, alteration, disclosure, or destruction.</p>

<h3>Your Rights</h3>
<p>You have the right to access, update, or delete your personal data. Contact us at privacy@celestecms.com for any privacy-related concerns.</p>

<p>For more detailed information about our privacy practices, please contact our privacy team.</p>`,
      excerpt: 'Learn about how CeLesteCMS Pro collects, uses, and protects your personal information.',
      authorId: adminId,
      status: 'published',
      publishedAt: new Date()
    }).onConflictDoNothing();
    
    // Default settings
    await db.insert(schema.settings).values({
      key: 'site',
      value: {
        title: 'CeLesteCMS Pro',
        description: 'Modern CMS built with SvelteKit and Drizzle',
        language: 'en',
        theme: 'system'
      }
    }).onConflictDoNothing();
    
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the function when this file is executed directly
seedDatabase();
