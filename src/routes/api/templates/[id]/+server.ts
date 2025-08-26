import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromEvent } from '$lib/server/db/utils';
import { templates } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const db = getDbFromEvent({ locals });
    
    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, params.id));

    if (!template) {
      return json({ error: 'Template not found' }, { status: 404 });
    }

    return json(template);
  } catch (error) {
    console.error('Failed to fetch template:', error);
    return json({ error: 'Failed to fetch template' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    const db = getDbFromEvent({ locals });
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.content) {
      return json({ error: 'Template name and content are required' }, { status: 400 });
    }

    // Check if template exists
    const [existingTemplate] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, params.id));

    if (!existingTemplate) {
      return json({ error: 'Template not found' }, { status: 404 });
    }

    // Update template
    const [updatedTemplate] = await db
      .update(templates)
      .set({
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description: data.description || null,
        content: data.content,
        advancedConfig: data.advancedConfig || null,
        visualBuilderState: data.visualBuilderState || null,
        type: data.type || existingTemplate.type,
        updatedAt: new Date(),
      })
      .where(eq(templates.id, params.id))
      .returning();

    return json(updatedTemplate);
  } catch (error) {
    console.error('Failed to update template:', error);
    return json({ error: 'Failed to update template' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    const db = getDbFromEvent({ locals });
    
    // Check if template exists
    const [existingTemplate] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, params.id));

    if (!existingTemplate) {
      return json({ error: 'Template not found' }, { status: 404 });
    }

    // Prevent deletion of default template
    if (existingTemplate.isDefault) {
      return json({ error: 'Cannot delete default template' }, { status: 400 });
    }

    // Delete template
    await db
      .delete(templates)
      .where(eq(templates.id, params.id));

    return json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return json({ error: 'Failed to delete template' }, { status: 500 });
  }
};