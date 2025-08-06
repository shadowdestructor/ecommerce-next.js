import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: React.ReactElement;
  from?: string;
  replyTo?: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ecommerce.com';
  private static readonly COMPANY_NAME = 'E-Commerce Platform';

  static async sendEmail(options: EmailOptions) {
    try {
      const result = await resend.emails.send({
        from: options.from || this.FROM_EMAIL,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        react: options.react,
        replyTo: options.replyTo,
      });

      console.log('Email sent successfully:', result.data?.id);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  static async sendOrderConfirmation(orderData: {
    email: string;
    orderNumber: string;
    customerName: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    shippingAddress: any;
  }) {
    const subject = `Order Confirmation - ${orderData.orderNumber}`;
    
    const html = this.generateOrderConfirmationHTML(orderData);
    
    return this.sendEmail({
      to: orderData.email,
      subject,
      html,
    });
  }

  static async sendOrderStatusUpdate(orderData: {
    email: string;
    orderNumber: string;
    customerName: string;
    status: string;
    trackingNumber?: string;
  }) {
    const subject = `Order Update - ${orderData.orderNumber}`;
    
    const html = this.generateOrderStatusUpdateHTML(orderData);
    
    return this.sendEmail({
      to: orderData.email,
      subject,
      html,
    });
  }

  static async sendWelcomeEmail(userData: {
    email: string;
    name: string;
  }) {
    const subject = `Welcome to ${this.COMPANY_NAME}!`;
    
    const html = this.generateWelcomeHTML(userData);
    
    return this.sendEmail({
      to: userData.email,
      subject,
      html,
    });
  }

  static async sendPasswordResetEmail(userData: {
    email: string;
    name: string;
    resetLink: string;
  }) {
    const subject = 'Reset Your Password';
    
    const html = this.generatePasswordResetHTML(userData);
    
    return this.sendEmail({
      to: userData.email,
      subject,
      html,
    });
  }

  static async sendLowStockAlert(productData: {
    productName: string;
    currentStock: number;
    sku: string;
  }) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured for low stock alerts');
      return;
    }

    const subject = `Low Stock Alert - ${productData.productName}`;
    
    const html = this.generateLowStockAlertHTML(productData);
    
    return this.sendEmail({
      to: adminEmails,
      subject,
      html,
    });
  }

  private static generateOrderConfirmationHTML(orderData: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
            .order-details { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
            .total { font-weight: bold; font-size: 18px; }
            .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
              <p>Thank you for your order, ${orderData.customerName}!</p>
            </div>
            
            <div class="order-details">
              <h2>Order Details</h2>
              <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
              
              <h3>Items Ordered:</h3>
              ${orderData.items.map((item: any) => `
                <div class="item">
                  <div>
                    <strong>${item.name}</strong><br>
                    Quantity: ${item.quantity}
                  </div>
                  <div>$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              `).join('')}
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e9ecef;">
                <div class="item">
                  <span>Subtotal:</span>
                  <span>$${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div class="item">
                  <span>Tax:</span>
                  <span>$${orderData.tax.toFixed(2)}</span>
                </div>
                <div class="item">
                  <span>Shipping:</span>
                  <span>${orderData.shipping === 0 ? 'Free' : '$' + orderData.shipping.toFixed(2)}</span>
                </div>
                <div class="item total">
                  <span>Total:</span>
                  <span>$${orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div class="order-details">
              <h3>Shipping Address:</h3>
              <p>
                ${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}<br>
                ${orderData.shippingAddress.addressLine1}<br>
                ${orderData.shippingAddress.addressLine2 ? orderData.shippingAddress.addressLine2 + '<br>' : ''}
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postalCode}<br>
                ${orderData.shippingAddress.country}
              </p>
            </div>
            
            <div class="footer">
              <p>We'll send you a shipping confirmation email when your order is on its way.</p>
              <p>Questions? Contact us at support@ecommerce.com</p>
              <p>&copy; 2024 ${this.COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generateOrderStatusUpdateHTML(orderData: any): string {
    const statusMessages = {
      CONFIRMED: 'Your order has been confirmed and is being prepared.',
      PROCESSING: 'Your order is currently being processed.',
      SHIPPED: 'Great news! Your order has been shipped.',
      DELIVERED: 'Your order has been delivered.',
      CANCELLED: 'Your order has been cancelled.',
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Status Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
            .status-update { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Status Update</h1>
              <p>Hello ${orderData.customerName},</p>
            </div>
            
            <div class="status-update">
              <h2>Order ${orderData.orderNumber}</h2>
              <p><strong>Status:</strong> ${orderData.status}</p>
              <p>${statusMessages[orderData.status as keyof typeof statusMessages] || 'Your order status has been updated.'}</p>
              
              ${orderData.trackingNumber ? `
                <p><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>
                <p>You can track your package using the tracking number above.</p>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>Questions? Contact us at support@ecommerce.com</p>
              <p>&copy; 2024 ${this.COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generateWelcomeHTML(userData: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
            .content { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; }
            .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${this.COMPANY_NAME}!</h1>
              <p>Hello ${userData.name},</p>
            </div>
            
            <div class="content">
              <p>Thank you for joining our community! We're excited to have you on board.</p>
              
              <p>Here's what you can do with your new account:</p>
              <ul>
                <li>Browse our extensive product catalog</li>
                <li>Save your favorite items to your wishlist</li>
                <li>Track your orders and view order history</li>
                <li>Manage your addresses and payment methods</li>
                <li>Get exclusive offers and early access to sales</li>
              </ul>
              
              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="btn">Start Shopping</a>
              </p>
            </div>
            
            <div class="footer">
              <p>Questions? Contact us at support@ecommerce.com</p>
              <p>&copy; 2024 ${this.COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generatePasswordResetHTML(userData: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
            .content { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; }
            .btn { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
              <p>Hello ${userData.name},</p>
            </div>
            
            <div class="content">
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <p style="text-align: center;">
                <a href="${userData.resetLink}" class="btn">Reset Password</a>
              </p>
              
              <p><strong>This link will expire in 1 hour.</strong></p>
              
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <p>For security reasons, please don't share this email with anyone.</p>
            </div>
            
            <div class="footer">
              <p>Questions? Contact us at support@ecommerce.com</p>
              <p>&copy; 2024 ${this.COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generateLowStockAlertHTML(productData: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Low Stock Alert</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #fff3cd; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffeaa7; }
            .content { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; }
            .alert { color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header alert">
              <h1>⚠️ Low Stock Alert</h1>
            </div>
            
            <div class="content">
              <h2>Product Running Low on Stock</h2>
              <p><strong>Product:</strong> ${productData.productName}</p>
              <p><strong>SKU:</strong> ${productData.sku}</p>
              <p><strong>Current Stock:</strong> ${productData.currentStock} units</p>
              
              <p>This product is running low on stock. Consider restocking soon to avoid stockouts.</p>
              
              <p>You can manage inventory from the admin panel.</p>
            </div>
            
            <div class="footer">
              <p>&copy; 2024 ${this.COMPANY_NAME} Admin System</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}