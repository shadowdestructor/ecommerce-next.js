import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { OrdersClient } from '@/components/orders/orders-client';
import { OrdersLoading } from '@/components/orders/orders-loading';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/orders');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
        
        <Suspense fallback={<OrdersLoading />}>
          <OrdersClient userId={session.user.id} />
        </Suspense>
      </div>
    </div>
  );
}