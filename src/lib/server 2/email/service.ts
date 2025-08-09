import type { EmailProvider, EmailOptions, EmailResult, PasswordResetData } from './providers/base';
import { generatePasswordResetEmail } from './providers/base';
import { ConsoleEmailProvider } from './providers/console';
import { FileEmailProvider } from './providers/file';

/**
 * Email Service - Pluggable Email System
 * 
 * Provides a unified interface for sending emails with different providers.
 * Supports development-friendly providers (console, file) and production providers (future).
 */
export class EmailService {
  private static instance: EmailService;
  private provider: EmailProvider;

  private constructor() {
    this.provider = this.createProvider();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private createProvider(): EmailProvider {
    const providerName = process.env.EMAIL_PROVIDER || 'console';
    
    console.log(`📧 Initializing email provider: ${providerName}`);
    
    switch (providerName.toLowerCase()) {
      case 'console':
        return new ConsoleEmailProvider();
      case 'file':
        return new FileEmailProvider();
      // Future providers:
      // case 'resend':
      //   return new ResendEmailProvider();
      // case 'gmail':
      //   return new GmailEmailProvider();
      // case 'ses':
      //   return new SESEmailProvider();
      default:
        console.warn(`⚠️ Unknown email provider: ${providerName}, falling back to console`);
        return new ConsoleEmailProvider();
    }
  }

  /**
   * Send a password reset email
   */
  async sendPasswordReset(data: PasswordResetData): Promise<EmailResult> {
    const { html, text } = generatePasswordResetEmail(data);
    
    console.log(`🔐 Sending password reset email to: ${data.userEmail}`);
    
    const result = await this.provider.send({
      to: data.userEmail,
      subject: 'Reset Your Password - CeLesteCMS Pro',
      html,
      text
    });

    if (result.success) {
      console.log(`✅ Password reset email sent successfully (${result.messageId})`);
    } else {
      console.error(`❌ Failed to send password reset email: ${result.error}`);
    }

    return result;
  }

  /**
   * Send a generic email
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    return await this.provider.send(options);
  }

  /**
   * Get information about the current email provider
   */
  async getProviderStatus(): Promise<{ name: string; available: boolean }> {
    const available = await this.provider.validate();
    return {
      name: this.provider.name,
      available
    };
  }

  /**
   * Test the email configuration
   */
  async testConfiguration(testEmail: string): Promise<EmailResult> {
    console.log(`🧪 Testing email configuration with provider: ${this.provider.name}`);
    
    const result = await this.provider.send({
      to: testEmail,
      subject: 'CeLesteCMS Pro - Email Configuration Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email to verify your CeLesteCMS Pro email configuration.</p>
        <p><strong>Provider:</strong> ${this.provider.name}</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <p>If you receive this email, your configuration is working correctly!</p>
      `,
      text: `
CeLesteCMS Pro - Email Configuration Test

This is a test email to verify your CeLesteCMS Pro email configuration.

Provider: ${this.provider.name}
Timestamp: ${new Date().toLocaleString()}

If you receive this email, your configuration is working correctly!
      `
    });

    return result;
  }
}