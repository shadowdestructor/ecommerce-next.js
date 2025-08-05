import { Suspense } from 'react';
import { CheckCircle, ArrowRight, Package, Mail } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface SuccessPageProps {
  searchParams: {
    order?: string;
  };
}

function SuccessContent({ orderNumber }: { orderNumber?: string }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success Icon */}
      <div className="mb-8">
        <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
      </div>

      {/* Success Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Order Confirmed!
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        {orderNumber && (
          <p className="text-sm text-gray-500">
            Order Number: <span className="font-mono font-medium">{orderNumber}</span>
          </p>
        )}
      </div>

      {/* Order Details Card */}
      <Card className="mb-8 text-left">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            What's Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">Order Confirmation</h3>
              <p className="text-sm text-gray-600">
                We've sent a confirmation email with your order details and tracking information.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Package className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">Processing</h3>
              <p className="text-sm text-gray-600">
                Your order is being prepared and will be shipped within 1-2 business days.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <ArrowRight className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">Tracking</h3>
              <p className="text-sm text-gray-600">
                You'll receive tracking information once your order ships.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {orderNumber && (
            <Button asChild size="lg">
              <Link href={`/orders/${orderNumber}`}>
                View Order Details
              </Link>
            </Button>
          )}
          
          <Button variant="outline" size="lg" asChild>
            <Link href="/products">
              Continue Shopping
            </Link>
          </Button>
        </div>
        
        <div className="text-center">
          <Link 
            href="/orders" 
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            View All Orders
          </Link>
        </div>
      </div>

      {/* Support Information */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
        <p className="text-sm text-gray-600 mb-4">
          If you have any questions about your order, please don't hesitate to contact us.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" size="sm" asChild>
            <Link href="/support">Contact Support</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/faq">View FAQ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Suspense fallback={
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        }>
          <SuccessContent orderNumber={searchParams.order} />
        </Suspense>
      </div>
    </MainLayout>
  );
}