#!/usr/bin/env tsx

/**
 * Email System Test Script
 * 
 * This script tests the email functionality of CeLesteCMS Pro
 * Run with: tsx test-email.ts
 */

import { EmailService } from './src/lib/server/email/service.js';

async function testEmailSystem() {
  console.log('🧪 Testing CeLesteCMS Pro Email System\n');
  
  try {
    const emailService = EmailService.getInstance();
    
    // Test 1: Check provider status
    console.log('📊 Checking email provider status...');
    const status = await emailService.getProviderStatus();
    console.log(`Provider: ${status.name}`);
    console.log(`Available: ${status.available ? '✅' : '❌'}\n`);
    
    if (!status.available) {
      console.error('❌ Email provider is not available. Check your configuration.\n');
      return;
    }
    
    // Test 2: Send a test email
    console.log('📧 Sending test email...');
    const testResult = await emailService.testConfiguration('test@example.com');
    
    if (testResult.success) {
      console.log(`✅ Test email sent successfully!`);
      console.log(`Message ID: ${testResult.messageId}\n`);
    } else {
      console.error(`❌ Failed to send test email: ${testResult.error}\n`);
    }
    
    // Test 3: Send a password reset email
    console.log('🔐 Testing password reset email...');
    const resetResult = await emailService.sendPasswordReset({
      userEmail: 'admin@example.com',
      userName: 'Admin User',
      resetUrl: 'http://localhost:5173/admin/reset-password?token=test-token-123',
      expirationHours: 1
    });
    
    if (resetResult.success) {
      console.log(`✅ Password reset email sent successfully!`);
      console.log(`Message ID: ${resetResult.messageId}\n`);
    } else {
      console.error(`❌ Failed to send password reset email: ${resetResult.error}\n`);
    }
    
    // Test 4: Display provider-specific instructions
    if (status.name === 'console') {
      console.log('📋 Console Provider Instructions:');
      console.log('   • Emails are logged to the console above');
      console.log('   • Check the console output for email content');
      console.log('   • Perfect for development and testing\n');
    } else if (status.name === 'file') {
      console.log('📋 File Provider Instructions:');
      console.log('   • Emails are saved to ./email-logs/ directory');
      console.log('   • Check the email-logs folder for .txt files');
      console.log('   • Each email is saved as a separate file\n');
    }
    
    console.log('🎉 Email system test completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Visit http://localhost:5173/admin/forgot-password');
    console.log('   2. Test the complete password reset flow');
    console.log('   3. Configure production email provider when ready');
    
  } catch (error) {
    console.error('❌ Email system test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure EMAIL_PROVIDER is set in .env');
    console.log('   2. Check that the email service is properly configured');
    console.log('   3. Verify dependencies are installed (pnpm install)');
  }
}

// Run the test
testEmailSystem();