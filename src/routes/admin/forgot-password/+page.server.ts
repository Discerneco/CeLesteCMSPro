import { redirect, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user, verification } from '$lib/server/db/schema';
import { EmailService } from '$lib/server/email/service';
import { createId } from '@paralleldrive/cuid2';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, url }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();

    if (!email) {
      return fail(400, { message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fail(400, { message: 'Please enter a valid email address' });
    }

    try {
      // Check if user exists
      const existingUser = await db.select().from(user).where(eq(user.email, email)).get();
      
      if (!existingUser) {
        // For security, don't reveal if user exists or not
        // Always show success message to prevent email enumeration
        throw redirect(302, '/admin/forgot-password?success=true');
      }

      // Generate reset token
      const resetToken = createId();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

      // Clean up any existing reset tokens for this user
      await db.delete(verification)
        .where(eq(verification.identifier, `password-reset:${existingUser.id}`));

      // Store reset token in verification table
      await db.insert(verification).values({
        id: createId(),
        identifier: `password-reset:${existingUser.id}`,
        value: resetToken,
        expiresAt: resetExpires
      });

      // Generate reset URL
      const resetUrl = `${url.origin}/admin/reset-password?token=${resetToken}`;

      // Send email
      const emailService = EmailService.getInstance();
      const result = await emailService.sendPasswordReset({
        userEmail: email,
        userName: existingUser.name || 'User',
        resetUrl,
        expirationHours: 1
      });

      if (!result.success) {
        console.error('Failed to send password reset email:', result.error);
        // In production, you might want to log this but still show success to user
        // For development with console/file providers, this should always succeed
      }

      // Always redirect to success page (don't reveal if email exists)
      throw redirect(302, '/admin/forgot-password?success=true');
    } catch (error) {
      // Re-throw redirects
      if (error instanceof Response) {
        throw error;
      }
      
      console.error('Password reset error:', error);
      return fail(500, { 
        message: 'An error occurred while processing your request. Please try again.' 
      });
    }
  }
};