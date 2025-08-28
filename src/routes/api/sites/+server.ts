import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromEvent } from '$lib/server/db/utils';
import { sites, templates } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateSlug, generateUniqueSlug } from '$lib/server/utils/slug';

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const db = getDbFromEvent({ locals });
    
    // Get sites with template information
    const sitesWithTemplates = await db
      .select({
        id: sites.id,
        name: sites.name,
        slug: sites.slug,
        domain: sites.domain,
        description: sites.description,
        templateId: sites.defaultTemplateId,
        templateName: templates.name,
        buildStatus: sites.buildStatus,
        lastBuildAt: sites.lastBuildAt,
        isDefault: sites.isDefault,
        createdAt: sites.createdAt,
        updatedAt: sites.updatedAt,
      })
      .from(sites)
      .leftJoin(templates, eq(sites.defaultTemplateId, templates.id))
      .orderBy(sites.createdAt);

    return json(sitesWithTemplates);
  } catch (error) {
    console.error('Failed to fetch sites:', error);
    return json({ error: 'Failed to fetch sites' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const db = getDbFromEvent({ locals });
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return json({ error: 'Site name is required' }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = generateSlug(data.name);
    const existingSites = await db.select({ slug: sites.slug }).from(sites);
    const existingSlugs = existingSites.map(site => site.slug);
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

    // Create new site
    const [newSite] = await db
      .insert(sites)
      .values({
        name: data.name,
        slug: uniqueSlug,
        domain: data.domain || null,
        description: data.description || null,
        defaultTemplateId: data.templateId || null,
        settings: data.settings || null,
        buildStatus: 'idle',
        isDefault: data.isDefault || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Fetch the created site with template info
    const [siteWithTemplate] = await db
      .select({
        id: sites.id,
        name: sites.name,
        slug: sites.slug,
        domain: sites.domain,
        description: sites.description,
        templateId: sites.defaultTemplateId,
        templateName: templates.name,
        buildStatus: sites.buildStatus,
        lastBuildAt: sites.lastBuildAt,
        isDefault: sites.isDefault,
        createdAt: sites.createdAt,
        updatedAt: sites.updatedAt,
      })
      .from(sites)
      .leftJoin(templates, eq(sites.defaultTemplateId, templates.id))
      .where(eq(sites.id, newSite.id));

    return json(siteWithTemplate, { status: 201 });
  } catch (error) {
    console.error('Failed to create site:', error);
    return json({ error: 'Failed to create site' }, { status: 500 });
  }
};