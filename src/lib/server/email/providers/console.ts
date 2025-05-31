import type { EmailProvider, EmailOptions, EmailResult } from './base';

/**
 * Console Email Provider - Development
 * 
 * Logs emails to the console instead of sending them.
 * Perfect for development and testing without external dependencies.
 */
export class ConsoleEmailProvider implements EmailProvider {
  name = 'console';

  async send(options: EmailOptions): Promise<EmailResult> {
    const timestamp = new Date().toLocaleString();
    const separator = '='.repeat(60);
    
    console.log(`\n📧 EMAIL SENT (Console Provider) - ${timestamp}`);
    console.log(separator);
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(separator);
    
    if (options.text) {
      console.log('TEXT VERSION:');
      console.log(options.text);
      console.log(separator);
    }
    
    if (options.html) {
      console.log('HTML VERSION:');
      console.log(options.html);
      console.log(separator);
    }
    
    console.log('✅ Email logged to console\n');
    
    return { 
      success: true, 
      messageId: `console-${Date.now()}` 
    };
  }

  async validate(): Promise<boolean> {
    return true; // Console is always available
  }
}