import { EmailService } from '@/lib/email';

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOrderConfirmation', () => {
    it('should send order confirmation email', async () => {
      const mockSend = jest.fn().mockResolvedValue({
        data: { id: 'email-123' },
      });

      // Mock the resend instance
      const { Resend } = require('resend');
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const orderData = {
        email: 'customer@example.com',
        orderNumber: 'ORD240101001',
        customerName: 'John Doe',
        items: [
          {
            name: 'Test Product',
            quantity: 2,
            price: 99.99,
            image: 'test.jpg',
          },
        ],
        subtotal: 199.98,
        tax: 16.00,
        shipping: 5.99,
        total: 221.97,
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          addressLine1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
      };

      await EmailService.sendOrderConfirmation(orderData);

      expect(mockSend).toHaveBeenCalledWith({
        from: 'noreply@ecommerce.com',
        to: ['customer@example.com'],
        subject: 'Order Confirmation - ORD240101001',
        html: expect.stringContaining('Order Confirmed!'),
        text: undefined,
        react: undefined,
        replyTo: undefined,
      });
    });
  });

  describe('sendOrderStatusUpdate', () => {
    it('should send order status update email', async () => {
      const mockSend = jest.fn().mockResolvedValue({
        data: { id: 'email-124' },
      });

      const { Resend } = require('resend');
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const orderData = {
        email: 'customer@example.com',
        orderNumber: 'ORD240101001',
        customerName: 'John Doe',
        status: 'SHIPPED',
        trackingNumber: 'TRK123456789',
      };

      await EmailService.sendOrderStatusUpdate(orderData);

      expect(mockSend).toHaveBeenCalledWith({
        from: 'noreply@ecommerce.com',
        to: ['customer@example.com'],
        subject: 'Order Update - ORD240101001',
        html: expect.stringContaining('Order Status Update'),
        text: undefined,
        react: undefined,
        replyTo: undefined,
      });
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      const mockSend = jest.fn().mockResolvedValue({
        data: { id: 'email-125' },
      });

      const { Resend } = require('resend');
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const userData = {
        email: 'newuser@example.com',
        name: 'Jane Doe',
      };

      await EmailService.sendWelcomeEmail(userData);

      expect(mockSend).toHaveBeenCalledWith({
        from: 'noreply@ecommerce.com',
        to: ['newuser@example.com'],
        subject: 'Welcome to E-Commerce Platform!',
        html: expect.stringContaining('Welcome to E-Commerce Platform!'),
        text: undefined,
        react: undefined,
        replyTo: undefined,
      });
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      const mockSend = jest.fn().mockResolvedValue({
        data: { id: 'email-126' },
      });

      const { Resend } = require('resend');
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      const userData = {
        email: 'user@example.com',
        name: 'John Doe',
        resetLink: 'https://example.com/reset?token=abc123',
      };

      await EmailService.sendPasswordResetEmail(userData);

      expect(mockSend).toHaveBeenCalledWith({
        from: 'noreply@ecommerce.com',
        to: ['user@example.com'],
        subject: 'Reset Your Password',
        html: expect.stringContaining('Reset Your Password'),
        text: undefined,
        react: undefined,
        replyTo: undefined,
      });
    });
  });

  describe('sendLowStockAlert', () => {
    it('should send low stock alert to admin emails', async () => {
      const mockSend = jest.fn().mockResolvedValue({
        data: { id: 'email-127' },
      });

      const { Resend } = require('resend');
      Resend.mockImplementation(() => ({
        emails: { send: mockSend },
      }));

      // Mock environment variable
      process.env.ADMIN_EMAILS = 'admin1@example.com,admin2@example.com';

      const productData = {
        productName: 'Test Product',
        currentStock: 2,
        sku: 'TEST-001',
      };

      await EmailService.sendLowStockAlert(productData);

      expect(mockSend).toHaveBeenCalledWith({
        from: 'noreply@ecommerce.com',
        to: ['admin1@example.com', 'admin2@example.com'],
        subject: 'Low Stock Alert - Test Product',
        html: expect.stringContaining('Low Stock Alert'),
        text: undefined,
        react: undefined,
        replyTo: undefined,
      });
    });

    it('should handle missing admin emails gracefully', async () => {
      // Mock console.warn
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Clear admin emails
      delete process.env.ADMIN_EMAILS;

      const productData = {
        productName: 'Test Product',
        currentStock: 2,
        sku: 'TEST-001',
      };

      await EmailService.sendLowStockAlert(productData);

      expect(consoleSpy).toHaveBeenCalledWith('No admin emails configured for low stock alerts');
      
      consoleSpy.mockRestore();
    });
  });
});