import { redirect, fail } from '@sveltejs/kit';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user, verification, account } from '$lib/server/db/schema';
import bcrypt from 'bcrypt';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const token = data.get('token')?.toString();
    const password = data.get('password')?.toString();
    const confirmPassword = data.get('confirmPassword')?.toString();

    // Validate inputs
    if (!token) {
      return fail(400, { message: 'Reset token is required' });
    }

    if (!password || !confirmPassword) {
      return fail(400, { message: 'Password and confirmation are required' });
    }

    if (password !== confirmPassword) {
      return fail(400, { message: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return fail(400, { message: 'Password must be at least 8 characters long' });
    }

    try {
      // Find the reset token and verify it's not expired
      const resetVerification = await db
        .select()
        .from(verification)
        .where(
          and(
            eq(verification.value, token),
            gt(verification.expiresAt, new Date())
          )
        )
        .get();

      if (!resetVerification) {
        return fail(400, { 
          message: 'Invalid or expired reset token. Please request a new password reset.' 
        });
      }

      // Extract user ID from identifier (format: "password-reset:userId")
      const userId = resetVerification.identifier.replace('password-reset:', '');
      
      // Find the user
      const targetUser = await db.select().from(user).where(eq(user.id, userId)).get();
      
      if (!targetUser) {
        return fail(400, { message: 'User not found' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update the password in the account table (Better Auth stores passwords there)
      await db
        .update(account)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(account.userId, userId),
            eq(account.providerId, 'credential') // Better Auth uses 'credential' for email/password
          )
        );

      // Clean up the reset token
      await db
        .delete(verification)
        .where(eq(verification.id, resetVerification.id));

      // Also clean up any other reset tokens for this user
      await db
        .delete(verification)
        .where(eq(verification.identifier, `password-reset:${userId}`));

      console.log(`✅ Password reset successful for user: ${targetUser.email}`);

      // Redirect to success page
      throw redirect(302, '/admin/reset-password?success=true');
    } catch (error) {
      // Re-throw redirects
      if (error instanceof Response) {
        throw error;
      }
      
      console.error('Password reset error:', error);
      return fail(500, { 
        message: 'An error occurred while resetting your password. Please try again.' 
      });
    }
  }
};