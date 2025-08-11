import { json } from '@sveltejs/kit';
import { getDbFromEvent } from '$lib/server/db/utils';
import { media, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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
      uploaderData: item.uploader ? {
        id: item.uploader.id,
        username: item.uploader.username,
        name: [item.uploader.firstName, item.uploader.lastName].filter(Boolean).join(' ') || item.uploader.username
      } : null,
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

    // Parse multipart form data
    const formData = await event.request.formData();
    const file = formData.get('file') as File;
    const altText = formData.get('altText') as string || '';

    if (!file) {
      return json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = './static/uploads';
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename to prevent conflicts
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop() || '';
    const filename = `${timestamp}-${randomString}.${fileExtension}`;
    const filepath = path.join(uploadsDir, filename);
    const publicUrl = `/uploads/${filename}`;

    // Convert File to Buffer and save to filesystem
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filepath, buffer);

    let width = null;
    let height = null;

    // Get image dimensions for images
    if (file.type.startsWith('image/')) {
      // For demo purposes, we'll set sample dimensions
      // In production, you'd extract actual dimensions from the image
      width = 800;
      height = 600;
    }

    // Insert into database
    const mediaData = {
      filename: filename,
      originalFilename: file.name,
      mimeType: file.type,
      size: file.size,
      path: filepath,
      url: publicUrl,
      altText: altText,
      width: width,
      height: height,
      uploaderId: event.locals.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: JSON.stringify({
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      })
    };

    const [newMedia] = await db.insert(media).values(mediaData).returning();

    return json({ 
      message: 'File uploaded successfully',
      media: {
        ...newMedia,
        // Transform for UI
        name: newMedia.originalFilename,
        type: getMediaType(newMedia.mimeType),
        size: formatFileSize(newMedia.size),
        dimensions: width && height ? `${width}x${height}` : '',
        uploaded: new Date(newMedia.createdAt).toLocaleDateString('pt-BR'),
        thumbnail: newMedia.mimeType.startsWith('image/') ? newMedia.url : ''
      }
    }, { status: 201 });

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