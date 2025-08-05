import apiClient from '@/lib/api-client';
import { 
  OrderWithItems, 
  OrderPage, 
  OrderFilters, 
  CreateOrderData, 
  OrderSummary 
} from '@/types/order';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class OrdersAPI {
  static async getOrders(filters?: OrderFilters): Promise<OrderPage> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await apiClient.get(`/orders?${params.toString()}`);
    return response.data;
  }

  static async getOrder(id: string): Promise<OrderWithItems> {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  }

  static async createOrder(data: CreateOrderData): Promise<OrderWithItems> {
    const response = await apiClient.post('/orders', data);
    return response.data;
  }

  static async updateOrderStatus(id: string, status: OrderStatus): Promise<OrderWithItems> {
    const response = await apiClient.put(`/orders/${id}?action=status`, { status });
    return response.data;
  }

  static async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<OrderWithItems> {
    const response = await apiClient.put(`/orders/${id}?action=payment`, { paymentStatus });
    return response.data;
  }

  static async cancelOrder(id: string, reason?: string): Promise<OrderWithItems> {
    const response = await apiClient.delete(`/orders/${id}`, {
      data: { reason },
    });
    return response.data;
  }

  static async getOrderSummary(userId?: string): Promise<OrderSummary> {
    const params = userId ? `?userId=${userId}` : '';
    const response = await apiClient.get(`/orders/summary${params}`);
    return response.data;
  }
}