import apiClient from '@/lib/api-client';
import { 
  ProductFilters, 
  ProductPage, 
  ProductWithRelations, 
  CreateProductData, 
  UpdateProductData 
} from '@/types/product';

export class ProductsAPI {
  static async getProducts(filters?: ProductFilters): Promise<ProductPage> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data;
  }

  static async getProduct(id: string): Promise<ProductWithRelations> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  }

  static async createProduct(data: CreateProductData): Promise<ProductWithRelations> {
    const response = await apiClient.post('/products', data);
    return response.data;
  }

  static async updateProduct(data: UpdateProductData): Promise<ProductWithRelations> {
    const { id, ...updateData } = data;
    const response = await apiClient.put(`/products/${id}`, updateData);
    return response.data;
  }

  static async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }

  static async updateStock(id: string, quantity: number): Promise<void> {
    await apiClient.patch(`/products/${id}/stock`, { quantity });
  }

  static async getFeaturedProducts(limit?: number): Promise<ProductWithRelations[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get(`/products/featured${params}`);
    return response.data;
  }

  static async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
}