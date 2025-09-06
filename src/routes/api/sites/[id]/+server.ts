import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromEvent } from '$lib/server/db/utils';
import { sites, templates } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const db = getDbFromEvent({ locals });
    const siteId = params.id;

    if (!siteId) {
      return json({ error: 'Site ID is required' }, { status: 400 });
    }

    // Get site with template information
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
        generationMode: sites.generationMode,
        optimizationSettings: sites.optimizationSettings,
        deploymentSettings: sites.deploymentSettings,
        settings: sites.settings,
        languages: sites.languages,
        defaultLanguage: sites.defaultLanguage,
        createdAt: sites.createdAt,
        updatedAt: sites.updatedAt,
      })
      .from(sites)
      .leftJoin(templates, eq(sites.defaultTemplateId, templates.id))
      .where(eq(sites.id, siteId));

    if (!siteWithTemplate) {
      return json({ error: 'Site not found' }, { status: 404 });
    }

    return json(siteWithTemplate);
  } catch (error) {
    console.error('Failed to fetch site:', error);
    return json({ error: 'Failed to fetch site' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    const db = getDbFromEvent({ locals });
    const siteId = params.id;
    const data = await request.json();

    if (!siteId) {
      return json({ error: 'Site ID is required' }, { status: 400 });
    }

    // Verify site exists
    const [existingSite] = await db
      .select({ id: sites.id })
      .from(sites)
      .where(eq(sites.id, siteId));

    if (!existingSite) {
      return json({ error: 'Site not found' }, { status: 404 });
    }

    // Update site
    const [updatedSite] = await db
      .update(sites)
      .set({
        name: data.name,
        domain: data.domain || null,
        description: data.description || null,
        defaultTemplateId: data.templateId || null,
        settings: data.settings || null,
        generationMode: data.generationMode,
        optimizationSettings: data.optimizationSettings || null,
        deploymentSettings: data.deploymentSettings || null,
        languages: data.languages || null,
        defaultLanguage: data.defaultLanguage || null,
        updatedAt: new Date(),
      })
      .where(eq(sites.id, siteId))
      .returning();

    // Fetch updated site with template info
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
        generationMode: sites.generationMode,
        optimizationSettings: sites.optimizationSettings,
        deploymentSettings: sites.deploymentSettings,
        languages: sites.languages,
        defaultLanguage: sites.defaultLanguage,
        createdAt: sites.createdAt,
        updatedAt: sites.updatedAt,
      })
      .from(sites)
      .leftJoin(templates, eq(sites.defaultTemplateId, templates.id))
      .where(eq(sites.id, siteId));

    return json(siteWithTemplate);
  } catch (error) {
    console.error('Failed to update site:', error);
    return json({ error: 'Failed to update site' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    const db = getDbFromEvent({ locals });
    const siteId = params.id;

    if (!siteId) {
      return json({ error: 'Site ID is required' }, { status: 400 });
    }

    // Verify site exists and is not default
    const [existingSite] = await db
      .select({ id: sites.id, isDefault: sites.isDefault })
      .from(sites)
      .where(eq(sites.id, siteId));

    if (!existingSite) {
      return json({ error: 'Site not found' }, { status: 404 });
    }

    if (existingSite.isDefault) {
      return json({ error: 'Cannot delete default site' }, { status: 400 });
    }

    // Delete site
    await db.delete(sites).where(eq(sites.id, siteId));

    return json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Failed to delete site:', error);
    return json({ error: 'Failed to delete site' }, { status: 500 });
  }
};