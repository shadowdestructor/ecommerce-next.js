import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { OrderDetailClient } from '@/components/orders/order-detail-client';
import { OrderDetailLoading } from '@/components/orders/order-detail-loading';
import { prisma } from '@/lib/prisma';

interface OrderDetailPageProps {
  params: {
    orderNumber: string;
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/orders');
  }

  // Verify order belongs to user
  const order = await prisma.order.findFirst({
    where: {
      orderNumber: params.orderNumber,
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<OrderDetailLoading />}>
          <OrderDetailClient 
            orderNumber={params.orderNumber} 
            userId={session.user.id} 
          />
        </Suspense>
      </div>
    </div>
  );
}