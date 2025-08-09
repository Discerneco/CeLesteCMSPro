// Base email provider interface for pluggable email system
export interface EmailProvider {
  name: string;
  send(options: EmailOptions): Promise<EmailResult>;
  validate(): Promise<boolean>;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Common email templates
export interface PasswordResetData {
  userEmail: string;
  userName: string;
  resetUrl: string;
  expirationHours: number;
}

export function generatePasswordResetEmail(data: PasswordResetData): { html: string; text: string } {
  const { userName, resetUrl, expirationHours } = data;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - CeLesteCMS Pro</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #007bff; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CeLesteCMS Pro</div>
        </div>
        
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>Hello ${userName || 'there'},</p>
          <p>We received a request to reset your password for your CeLesteCMS Pro account. If you made this request, click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link will expire in ${expirationHours} hour${expirationHours > 1 ? 's' : ''}</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>For security, never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f1f3f4; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${resetUrl}
          </p>
        </div>
        
        <div class="footer">
          <p>This email was sent by CeLesteCMS Pro. If you have questions, please contact your administrator.</p>
          <p style="font-size: 12px; color: #999;">
            Email sent at ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Reset Your Password - CeLesteCMS Pro

Hello ${userName || 'there'},

We received a request to reset your password for your CeLesteCMS Pro account.

Reset your password by clicking this link:
${resetUrl}

Important:
- This link will expire in ${expirationHours} hour${expirationHours > 1 ? 's' : ''}
- If you didn't request this reset, please ignore this email
- For security, never share this link with anyone

If you have questions, please contact your administrator.

Email sent at ${new Date().toLocaleString()}
  `;

  return { html, text };
}