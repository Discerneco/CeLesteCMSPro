import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromEvent } from '$lib/server/db/utils';
import { sites, templates, posts, pages, media, settings } from '$lib/server/db/schema';
import { eq, and, desc, max, count, gt, ne } from 'drizzle-orm';

// Helper function to calculate content synchronization status
async function calculateContentSync(db: any, site: any) {
  try {
    const lastBuildAt = site.lastBuildAt ? new Date(site.lastBuildAt) : null;
    
    // If never built, count all content as out of sync
    if (!lastBuildAt) {
      // Get total counts for never-built sites
      const [totalPosts] = await db.select({ count: count() }).from(posts).where(eq(posts.status, 'published'));
      const [totalPages] = await db.select({ count: count() }).from(pages).where(eq(pages.status, 'published'));
      const [totalMedia] = await db.select({ count: count() }).from(media);
      const [totalSettings] = await db.select({ count: count() }).from(settings);
      
      const counts = {
        newPosts: totalPosts?.count || 0,
        updatedPosts: 0,
        newPages: totalPages?.count || 0,
        updatedPages: 0,
        newMedia: totalMedia?.count || 0,
        settingsChanges: totalSettings?.count || 0,
        templateChanges: site.templateId ? 1 : 0
      };

      return {
        syncStatus: 'out-of-sync',
        contentChanges: {
          hasNewPosts: counts.newPosts > 0,
          hasUpdatedPosts: false,
          hasNewPages: counts.newPages > 0,
          hasUpdatedPages: false,
          hasNewMedia: counts.newMedia > 0,
          hasSettingsChanges: counts.settingsChanges > 0,
          hasTemplateChanges: counts.templateChanges > 0,
          counts,
          lastContentUpdate: null,
          changesSummary: 'Site never built',
          detailedSummary: `${counts.newPosts} posts, ${counts.newPages} pages, ${counts.newMedia} media files available to build`
        }
      };
    }

    // Count content changes since last build
    const [newPostsCount] = await db
      .select({ count: count() })
      .from(posts)
      .where(and(eq(posts.status, 'published'), gt(posts.createdAt, lastBuildAt)));

    const [updatedPostsCount] = await db
      .select({ count: count() })
      .from(posts)
      .where(and(
        eq(posts.status, 'published'),
        gt(posts.updatedAt, lastBuildAt),
        ne(posts.updatedAt, posts.createdAt)
      ));

    const [newPagesCount] = await db
      .select({ count: count() })
      .from(pages)
      .where(and(eq(pages.status, 'published'), gt(pages.createdAt, lastBuildAt)));

    const [updatedPagesCount] = await db
      .select({ count: count() })
      .from(pages)
      .where(and(
        eq(pages.status, 'published'),
        gt(pages.updatedAt, lastBuildAt),
        ne(pages.updatedAt, pages.createdAt)
      ));

    const [newMediaCount] = await db
      .select({ count: count() })
      .from(media)
      .where(gt(media.createdAt, lastBuildAt));

    const [settingsChangesCount] = await db
      .select({ count: count() })
      .from(settings)
      .where(gt(settings.updatedAt, lastBuildAt));

    let templateChangesCount = 0;
    if (site.templateId) {
      const [templateCount] = await db
        .select({ count: count() })
        .from(templates)
        .where(and(eq(templates.id, site.templateId), gt(templates.updatedAt, lastBuildAt)));
      templateChangesCount = templateCount?.count || 0;
    }

    // Get latest content updates for timestamp tracking
    const [latestPost] = await db
      .select({ updatedAt: posts.updatedAt, createdAt: posts.createdAt })
      .from(posts)
      .where(eq(posts.status, 'published'))
      .orderBy(desc(posts.updatedAt))
      .limit(1);

    const [latestPage] = await db
      .select({ updatedAt: pages.updatedAt, createdAt: pages.createdAt })
      .from(pages)
      .where(eq(pages.status, 'published'))
      .orderBy(desc(pages.updatedAt))
      .limit(1);

    const [latestMedia] = await db
      .select({ updatedAt: media.updatedAt })
      .from(media)
      .orderBy(desc(media.updatedAt))
      .limit(1);

    const [latestSetting] = await db
      .select({ updatedAt: settings.updatedAt })
      .from(settings)
      .orderBy(desc(settings.updatedAt))
      .limit(1);

    let latestTemplate = null;
    if (site.templateId) {
      [latestTemplate] = await db
        .select({ updatedAt: templates.updatedAt })
        .from(templates)
        .where(eq(templates.id, site.templateId))
        .limit(1);
    }

    // Extract counts from query results
    const counts = {
      newPosts: newPostsCount?.count || 0,
      updatedPosts: updatedPostsCount?.count || 0,
      newPages: newPagesCount?.count || 0,
      updatedPages: updatedPagesCount?.count || 0,
      newMedia: newMediaCount?.count || 0,
      settingsChanges: settingsChangesCount?.count || 0,
      templateChanges: templateChangesCount
    };

    // Analyze content changes
    const changes = {
      hasNewPosts: counts.newPosts > 0,
      hasUpdatedPosts: counts.updatedPosts > 0,
      hasNewPages: counts.newPages > 0,
      hasUpdatedPages: counts.updatedPages > 0,
      hasNewMedia: counts.newMedia > 0,
      hasSettingsChanges: counts.settingsChanges > 0,
      hasTemplateChanges: counts.templateChanges > 0,
      counts,
      lastContentUpdate: lastBuildAt,
      changesSummary: '',
      detailedSummary: ''
    };

    const changeSummary = [];
    const detailedItems = [];
    let isOutOfSync = false;

    // Build detailed summary with counts
    if (counts.newPosts > 0) {
      changeSummary.push('new posts');
      detailedItems.push(`${counts.newPosts} new post${counts.newPosts === 1 ? '' : 's'}`);
      isOutOfSync = true;
    }
    if (counts.updatedPosts > 0) {
      changeSummary.push('updated posts');
      detailedItems.push(`${counts.updatedPosts} updated post${counts.updatedPosts === 1 ? '' : 's'}`);
      isOutOfSync = true;
    }
    if (counts.newPages > 0) {
      changeSummary.push('new pages');
      detailedItems.push(`${counts.newPages} new page${counts.newPages === 1 ? '' : 's'}`);
      isOutOfSync = true;
    }
    if (counts.updatedPages > 0) {
      changeSummary.push('updated pages');
      detailedItems.push(`${counts.updatedPages} updated page${counts.updatedPages === 1 ? '' : 's'}`);
      isOutOfSync = true;
    }
    if (counts.newMedia > 0) {
      changeSummary.push('new media');
      detailedItems.push(`${counts.newMedia} new media file${counts.newMedia === 1 ? '' : 's'}`);
      isOutOfSync = true;
    }
    if (counts.settingsChanges > 0) {
      changeSummary.push('settings changes');
      detailedItems.push(`${counts.settingsChanges} settings change${counts.settingsChanges === 1 ? '' : 's'}`);
      isOutOfSync = true;
    }
    if (counts.templateChanges > 0) {
      changeSummary.push('template changes');
      detailedItems.push(`${counts.templateChanges} template change${counts.templateChanges === 1 ? '' : 's'}`);
      isOutOfSync = true;
    }

    // Track last content update timestamp
    if (isOutOfSync) {
      let latestUpdateTime = lastBuildAt;
      if (latestPost) {
        const postTime = Math.max(new Date(latestPost.createdAt).getTime(), new Date(latestPost.updatedAt).getTime());
        if (postTime > latestUpdateTime?.getTime()) latestUpdateTime = new Date(postTime);
      }
      if (latestPage) {
        const pageTime = Math.max(new Date(latestPage.createdAt).getTime(), new Date(latestPage.updatedAt).getTime());
        if (pageTime > latestUpdateTime?.getTime()) latestUpdateTime = new Date(pageTime);
      }
      if (latestMedia) {
        const mediaTime = new Date(latestMedia.updatedAt).getTime();
        if (mediaTime > latestUpdateTime?.getTime()) latestUpdateTime = new Date(mediaTime);
      }
      if (latestSetting) {
        const settingTime = new Date(latestSetting.updatedAt).getTime();
        if (settingTime > latestUpdateTime?.getTime()) latestUpdateTime = new Date(settingTime);
      }
      if (latestTemplate) {
        const templateTime = new Date(latestTemplate.updatedAt).getTime();
        if (templateTime > latestUpdateTime?.getTime()) latestUpdateTime = new Date(templateTime);
      }
      changes.lastContentUpdate = latestUpdateTime;
    }

    changes.changesSummary = changeSummary.length > 0 
      ? `${changeSummary.join(', ')} since last build`
      : 'No changes since last build';
      
    changes.detailedSummary = detailedItems.length > 0 
      ? detailedItems.join(', ')
      : 'No changes since last build';

    return {
      syncStatus: isOutOfSync ? 'out-of-sync' : 'up-to-date',
      contentChanges: changes
    };

  } catch (error) {
    console.error('Error calculating content sync:', error);
    return {
      syncStatus: 'unknown',
      contentChanges: {
        hasNewPosts: false,
        hasUpdatedPosts: false,
        hasNewPages: false,
        hasUpdatedPages: false,
        hasNewMedia: false,
        hasSettingsChanges: false,
        hasTemplateChanges: false,
        lastContentUpdate: null,
        changesSummary: 'Error calculating changes'
      }
    };
  }
}

// Helper function to calculate publication status (deployment/live status, NOT content)
async function calculatePublicationStatus(db: any, site: any) {
  try {
    const isLocalhost = !site.domain && (!site.deploymentSettings?.target || site.deploymentSettings.target === 'development');
    
    if (site.generationMode === 'static') {
      // STATIC SITE LOGIC
      if (site.buildStatus === 'building') {
        return { 
          status: 'blue', 
          message: 'Building static site',
          type: 'static'
        };
      }
      
      if (isLocalhost) {
        if (site.buildStatus === 'success' && site.lastBuildAt) {
          return { 
            status: 'purple', 
            message: 'Built locally',
            type: 'static'
          };
        }
        return { 
          status: 'gray', 
          message: 'Not built',
          type: 'static'
        };
      }
      
      if (site.domain && site.buildStatus === 'success') {
        return { 
          status: 'green', 
          message: 'Deployed',
          type: 'static'
        };
      }
      
      return { 
        status: 'gray', 
        message: 'Not deployed',
        type: 'static'
      };
      
    } else {
      // DYNAMIC SITE LOGIC
      if (isLocalhost) {
        // For dynamic localhost sites, purple indicates local development
        return { 
          status: 'purple', 
          message: 'Local development',
          type: 'dynamic'
        };
      }
      
      if (site.domain) {
        return { 
          status: 'green', 
          message: 'Live',
          type: 'dynamic'
        };
      }
      
      return { 
        status: 'gray', 
        message: 'Inactive',
        type: 'dynamic'
      };
    }
    
  } catch (error) {
    console.error('Error calculating publication status:', error);
    return {
      status: 'gray',
      message: 'Unknown status',
      type: site.generationMode || 'unknown'
    };
  }
}

// Helper function to calculate health status
async function calculateHealthStatus(db: any, site: any) {
  try {
    const healthChecks = {
      database: true,
      files: true,
      lastBuild: true,
      server: true
    };
    
    // Check database responsiveness (basic query)
    const startTime = Date.now();
    await db.select({ count: count() }).from(sites).where(eq(sites.id, site.id));
    const dbResponseTime = Date.now() - startTime;
    
    // Database health
    if (dbResponseTime > 1000) {
      healthChecks.database = false; // Slow database
    }
    
    // Build status health
    if (site.buildStatus === 'error') {
      healthChecks.lastBuild = false;
    }
    
    // Server connectivity check (localhost sites only)
    if (!site.domain && (!site.deploymentSettings?.target || site.deploymentSettings.target === 'development')) {
      try {
        const response = await fetch(`http://localhost:5173/sites/${site.slug}`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        healthChecks.server = response.ok;
        
        // Add dynamic server URL based on status
        if (response.ok) {
          healthChecks.serverUrl = `localhost:5173/sites/${site.slug}`;
          healthChecks.serverStatus = 'online';
        } else {
          healthChecks.serverUrl = 'localhost:5173 (offline)';
          healthChecks.serverStatus = 'offline';
        }
      } catch (error) {
        healthChecks.server = false; // Server down or unreachable
        healthChecks.serverUrl = 'localhost:5173 (unreachable)';
        healthChecks.serverStatus = 'offline';
      }
    } else {
      healthChecks.serverUrl = null; // Not applicable for external sites
      healthChecks.serverStatus = null;
    }
    
    // Determine overall health status
    let status = 'green';
    if (!healthChecks.lastBuild || !healthChecks.server) {
      status = 'red'; // Critical issues (build failed or server down)
    } else if (!healthChecks.database) {
      status = 'yellow'; // Minor issues (slow database)
    }
    
    return {
      status,
      dbResponseTime,
      checks: healthChecks,
      serverUrl: healthChecks.serverUrl,
      serverStatus: healthChecks.serverStatus,
      lastBuildStatus: site.buildStatus
    };
  } catch (error) {
    console.error('Error calculating health status:', error);
    return {
      status: 'red',
      dbResponseTime: -1,
      checks: { database: false, files: false, lastBuild: false },
      serverUrl: null,
      serverStatus: 'error',
      lastBuildStatus: 'unknown'
    };
  }
}

// Helper function to calculate sync/data layer status based on generation mode
async function calculateSyncDataStatus(db: any, site: any, contentSync: any) {
  try {
    if (site.generationMode === 'static') {
      // For static sites, use sync status logic
      const syncStatus = contentSync.syncStatus;
      
      if (syncStatus === 'up-to-date') {
        return { status: 'green', type: 'sync' };
      } else if (syncStatus === 'out-of-sync') {
        // Simple logic matching generate button - if out-of-sync, show red
        return { status: 'red', type: 'sync' }; // Out-of-sync = rebuild needed
      } else {
        return { status: 'gray', type: 'sync' }; // Never built or unknown
      }
    } else {
      // For dynamic sites, use data layer status logic
      // In future: check API health, cache status, etc.
      // For now, return healthy status for dynamic sites
      return { status: 'green', type: 'data-layer' };
    }
  } catch (error) {
    console.error('Error calculating sync/data status:', error);
    return { status: 'gray', type: site.generationMode === 'static' ? 'sync' : 'data-layer' };
  }
}

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

    // Calculate status information like GET endpoint
    const syncInfo = await calculateContentSync(db, siteWithTemplate);
    const publicationStatus = await calculatePublicationStatus(db, siteWithTemplate);
    const healthStatus = await calculateHealthStatus(db, siteWithTemplate);
    const syncDataStatus = await calculateSyncDataStatus(db, siteWithTemplate, syncInfo);
    
    const siteWithStatus = {
      ...siteWithTemplate,
      syncStatus: syncInfo.syncStatus,
      contentChanges: syncInfo.contentChanges,
      statusDots: {
        publication: publicationStatus,
        health: healthStatus,
        syncData: syncDataStatus
      }
    };

    return json(siteWithStatus);
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