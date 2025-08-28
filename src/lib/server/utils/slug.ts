/**
 * Utility functions for generating URL-safe slugs
 */

/**
 * Convert a string to a URL-safe slug
 * @param text The input text to convert
 * @returns A URL-safe slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-|-$/g, '');
}

/**
 * Generate a unique slug by appending numbers if conflicts exist
 * @param baseSlug The base slug to check
 * @param existingSlugs Array of existing slugs to check against
 * @returns A unique slug
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate that a slug meets requirements
 * @param slug The slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  // Must be non-empty, only contain lowercase letters, numbers, and hyphens
  // Cannot start or end with hyphen, cannot have consecutive hyphens
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length > 0;
}