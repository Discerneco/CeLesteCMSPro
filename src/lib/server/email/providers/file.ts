import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { EmailProvider, EmailOptions, EmailResult } from './base';

/**
 * File Email Provider - Testing
 * 
 * Saves emails to disk files instead of sending them.
 * Useful for testing email templates and debugging email flows.
 */
export class FileEmailProvider implements EmailProvider {
  name = 'file';
  private logDir = './email-logs';

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      const timestamp = new Date().toISOString();
      const filename = `email-${Date.now()}-${options.to.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      const filepath = join(this.logDir, filename);
      
      const content = `
EMAIL LOG - ${timestamp}
===============================
To: ${options.to}
Subject: ${options.subject}
Timestamp: ${timestamp}
===============================

TEXT VERSION:
${options.text || 'No text version'}

===============================

HTML VERSION:
${options.html || 'No HTML version'}

===============================
End of Email
`;

      await this.ensureLogDirExists();
      await writeFile(filepath, content, 'utf8');
      
      console.log(`📁 Email saved to: ${filepath}`);
      
      return { 
        success: true, 
        messageId: filename 
      };
    } catch (error) {
      console.error('File email provider error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save email to file' 
      };
    }
  }

  async validate(): Promise<boolean> {
    try {
      await this.ensureLogDirExists();
      return true;
    } catch {
      return false;
    }
  }

  private async ensureLogDirExists(): Promise<void> {
    try {
      await mkdir(this.logDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
      if (error instanceof Error && !error.message.includes('EEXIST')) {
        throw error;
      }
    }
  }
}