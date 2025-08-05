import apiClient from '@/lib/api-client';
import { 
  CategoryWithChildren, 
  CategoryFilters, 
  CreateCategoryData 
} from '@/types/product';

export class CategoriesAPI {
  static async getCategories(filters?: CategoryFilters): Promise<CategoryWithChildren[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get(`/categories?${params.toString()}`);
    return response.data;
  }

  static async getCategory(id: string): Promise<CategoryWithChildren> {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  }

  static async getRootCategories(): Promise<CategoryWithChildren[]> {
    const response = await apiClient.get('/categories/root');
    return response.data;
  }

  static async getCategoryHierarchy(): Promise<CategoryWithChildren[]> {
    const response = await apiClient.get('/categories/hierarchy');
    return response.data;
  }

  static async createCategory(data: CreateCategoryData): Promise<CategoryWithChildren> {
    const response = await apiClient.post('/categories', data);
    return response.data;
  }

  static async updateCategory(id: string, data: Partial<CreateCategoryData>): Promise<CategoryWithChildren> {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  }

  static async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  }
}