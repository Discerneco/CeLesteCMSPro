import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromEvent } from '$lib/server/db/utils';
import { templates } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const db = getDbFromEvent({ locals });
    
    // Get all templates ordered by creation date
    const allTemplates = await db
      .select()
      .from(templates)
      .orderBy(desc(templates.createdAt));

    return json(allTemplates);
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const db = getDbFromEvent({ locals });
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.content) {
      return json({ error: 'Template name and content are required' }, { status: 400 });
    }

    // Create new template
    const [newTemplate] = await db
      .insert(templates)
      .values({
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description: data.description || null,
        content: data.content,
        advancedConfig: data.advancedConfig || null,
        visualBuilderState: data.visualBuilderState || null,
        type: data.type || 'page',
        isDefault: data.isDefault || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Failed to create template:', error);
    return json({ error: 'Failed to create template' }, { status: 500 });
  }
};