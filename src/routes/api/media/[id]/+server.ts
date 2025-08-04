import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { media, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * GET /api/media/[id]
 * Returns a single media file with all details
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const mediaId = event.params.id;
  
  try {
    // Fetch media with uploader information
    const mediaWithUploader = await db
      .select({
        id: media.id,
        filename: media.filename,
        originalFilename: media.originalFilename,
        mimeType: media.mimeType,
        size: media.size,
        path: media.path,
        url: media.url,
        altText: media.altText,
        width: media.width,
        height: media.height,
        uploaderId: media.uploaderId,
        createdAt: media.createdAt,
        updatedAt: media.updatedAt,
        metadata: media.metadata,
        uploader: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName
        }
      })
      .from(media)
      .leftJoin(users, eq(media.uploaderId, users.id))
      .where(eq(media.id, mediaId))
      .limit(1);

    if (mediaWithUploader.length === 0) {
      return json({ error: 'Media not found' }, { status: 404 });
    }

    const item = mediaWithUploader[0];
    
    // Transform the data to match our UI expectations
    const transformedMedia = {
      id: item.id,
      name: item.originalFilename,
      filename: item.filename,
      type: getMediaType(item.mimeType),
      mimeType: item.mimeType,
      size: formatFileSize(item.size),
      sizeBytes: item.size,
      dimensions: item.width && item.height ? `${item.width}x${item.height}` : '',
      width: item.width,
      height: item.height,
      url: item.url,
      altText: item.altText || '',
      uploaderId: item.uploaderId,
      uploader: item.uploader?.username || 'Unknown',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      uploaded: item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : '',
      thumbnail: generateThumbnailUrl(item),
      metadata: item.metadata
    };

    return json(transformedMedia);
  } catch (error) {
    console.error('Error fetching media:', error);
    return json({ error: 'Failed to fetch media' }, { status: 500 });
  }
};

/**
 * PUT /api/media/[id]
 * Updates media metadata (alt text, etc.)
 */
export const PUT: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const mediaId = event.params.id;
  
  try {
    // Check if user is authenticated
    if (!event.locals.user?.isAuthenticated) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse the request body
    const body = await event.request.json();
    const { altText, metadata } = body;

    // Check if media exists
    const existingMedia = await db
      .select()
      .from(media)
      .where(eq(media.id, mediaId))
      .limit(1);

    if (existingMedia.length === 0) {
      return json({ error: 'Media not found' }, { status: 404 });
    }

    // Prepare the update data
    const updateData = {
      altText: altText || '',
      metadata: metadata ? JSON.parse(typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null,
      updatedAt: new Date()
    };

    // Update the media
    const [updatedMedia] = await db
      .update(media)
      .set(updateData)
      .where(eq(media.id, mediaId))
      .returning();

    return json({ 
      message: 'Media updated successfully',
      media: updatedMedia 
    });

  } catch (error) {
    console.error('Error updating media:', error);
    return json({ error: 'Failed to update media' }, { status: 500 });
  }
};

/**
 * DELETE /api/media/[id]
 * Deletes a media file
 */
export const DELETE: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  const mediaId = event.params.id;
  
  try {
    // Check if user is authenticated
    if (!event.locals.user?.isAuthenticated) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if media exists
    const existingMedia = await db
      .select()
      .from(media)
      .where(eq(media.id, mediaId))
      .limit(1);

    if (existingMedia.length === 0) {
      return json({ error: 'Media not found' }, { status: 404 });
    }

    // TODO: Delete physical file from storage
    // For now, just delete from database

    // Delete the media record
    await db
      .delete(media)
      .where(eq(media.id, mediaId));

    return json({ 
      message: 'Media deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting media:', error);
    return json({ error: 'Failed to delete media' }, { status: 500 });
  }
};

// Helper functions (same as in main media endpoint)
function getMediaType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('text/') || mimeType.includes('document')) return 'document';
  return 'file';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function generateThumbnailUrl(item: any): string {
  if (item.mimeType?.startsWith('image/')) {
    return item.url;
  }
  return '';
}