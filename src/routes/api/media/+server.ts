import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { media, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * GET /api/media
 * Returns a list of all media files with uploader information
 */
export const GET: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  
  try {
    // Fetch media with uploader information using join
    const mediaWithUploaders = await db
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
      .orderBy(media.createdAt);

    // Transform the data to match our UI expectations
    const transformedMedia = mediaWithUploaders.map((item: any) => ({
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
      uploader: item.uploader?.username || 'Unknown',
      createdAt: item.createdAt,
      // Format dates for display
      uploaded: item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : '',
      thumbnail: generateThumbnailUrl(item),
      metadata: item.metadata
    }));

    return json(transformedMedia);
  } catch (error) {
    console.error('Error fetching media:', error);
    return json({ error: 'Failed to fetch media' }, { status: 500 });
  }
};

/**
 * POST /api/media
 * Uploads a new media file
 */
export const POST: RequestHandler = async (event) => {
  const db = getDbFromEvent(event);
  
  try {
    // Check if user is authenticated
    if (!event.locals.user?.isAuthenticated) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    // For now, return a placeholder response
    // File upload implementation will be added in Phase 2
    return json({ 
      message: 'File upload endpoint - implementation coming soon',
      note: 'This will handle multipart/form-data file uploads'
    }, { status: 501 });

  } catch (error) {
    console.error('Error uploading media:', error);
    return json({ error: 'Failed to upload media' }, { status: 500 });
  }
};

// Helper functions
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
  // For images, use the full URL as thumbnail for now
  // In production, you'd generate actual thumbnails
  if (item.mimeType?.startsWith('image/')) {
    return item.url;
  }
  
  // Return placeholder for non-images
  return '';
}