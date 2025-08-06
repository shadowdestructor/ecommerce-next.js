import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EmailService } from '@/lib/email';
import { z } from 'zod';

const sendEmailSchema = z.object({
  type: z.enum(['order_confirmation', 'order_status_update', 'welcome', 'password_reset', 'low_stock_alert']),
  data: z.record(z.any()),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin users to send emails manually
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, data } = sendEmailSchema.parse(body);

    let result;

    switch (type) {
      case 'order_confirmation':
        result = await EmailService.sendOrderConfirmation(data);
        break;
      
      case 'order_status_update':
        result = await EmailService.sendOrderStatusUpdate(data);
        break;
      
      case 'welcome':
        result = await EmailService.sendWelcomeEmail(data);
        break;
      
      case 'password_reset':
        result = await EmailService.sendPasswordResetEmail(data);
        break;
      
      case 'low_stock_alert':
        result = await EmailService.sendLowStockAlert(data);
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Send email error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}