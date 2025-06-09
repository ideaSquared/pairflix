import { AppSettings } from '../services/api';

/**
 * Interface for email message structure
 */
export interface EmailMessage {
  to: string | string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: {
    filename: string;
    content: string | Buffer;
  }[];
}

/**
 * Email service class that uses SMTP settings from application settings
 */
export class EmailService {
  private settings: AppSettings['email'];
  private initialized: boolean = false;

  constructor(emailSettings: AppSettings['email']) {
    this.settings = emailSettings;
    this.initialized = !!emailSettings && !!emailSettings.smtpServer;
  }

  /**
   * Sends an email using configured SMTP settings
   * Note: In a frontend environment, this would typically call an API endpoint
   * that handles the actual sending using the server's email service
   */
  async sendEmail(
    message: EmailMessage
  ): Promise<{ success: boolean; message: string }> {
    if (!this.initialized) {
      return {
        success: false,
        message: 'Email service not properly initialized with SMTP settings',
      };
    }

    try {
      // In a real implementation, this would make an API call to the backend
      // which would use the SMTP settings to send the email
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...message,
          // Don't include sensitive settings like passwords in the request
          // The backend already has these settings
          from: `${this.settings.senderName} <${this.settings.senderEmail}>`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      await response.json();
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  /**
   * Sends a template-based email using the configured template path
   */
  async sendTemplateEmail(
    to: string | string[],
    templateName: string,
    data: Record<string, unknown>,
    subject: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // In a real implementation, this would call an API endpoint
      // that loads the template and substitutes the data
      const response = await fetch('/api/email/send-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          to,
          subject,
          templateName,
          data,
          from: `${this.settings.senderName} <${this.settings.senderEmail}>`,
          templatePath: this.settings.emailTemplatesPath,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send template email');
      }

      return { success: true, message: 'Template email sent successfully' };
    } catch (error) {
      console.error('Failed to send template email:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to send template email',
      };
    }
  }

  /**
   * Tests the SMTP connection using current settings
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.initialized) {
      return {
        success: false,
        message: 'Email service not properly initialized with SMTP settings',
      };
    }

    try {
      // In a real implementation, this would call a backend API endpoint
      // that tests the SMTP connection
      const response = await fetch('/api/email/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          // Only send the server and port for the test, not credentials
          smtpServer: this.settings.smtpServer,
          smtpPort: this.settings.smtpPort,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to test SMTP connection');
      }

      return { success: true, message: 'SMTP connection test successful' };
    } catch (error) {
      console.error('Failed to test SMTP connection:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to test SMTP connection',
      };
    }
  }
}
