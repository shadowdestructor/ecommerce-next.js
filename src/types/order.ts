import { Order, OrderItem, OrderStatus, PaymentStatus, User } from '@prisma/client';

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    product: {
      id: string;
      name: string;
      slug: string;
      images: Array<{ url: string; altText?: string }>;
    };
    variant?: {
      id: string;
      name: string;
      option1Name?: string;
      option1Value?: string;
      option2Name?: string;
      option2Value?: string;
    };
  })[];
  user?: User;
}

export interface CreateOrderData {
  email: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  userId?: string;
  email?: string;
  orderNumber?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface OrderPage {
  orders: OrderWithItems[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface OrderSummary {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
}