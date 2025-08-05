import { AuthService } from '@/services/auth';
import { signIn } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react');
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResult = { ok: true, error: null };
      mockSignIn.mockResolvedValue(mockResult);

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await AuthService.login(loginData);

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw error for invalid credentials', async () => {
      const mockResult = { ok: false, error: 'CredentialsSignin' };
      mockSignIn.mockResolvedValue(mockResult);

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(AuthService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          message: 'User created successfully',
          user: { id: '1', email: 'test@example.com' },
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = await AuthService.register(registerData);

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
        }),
      });
      expect(result.message).toBe('User created successfully');
    });

    it('should throw error for registration failure', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: 'User already exists',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      await expect(AuthService.register(registerData)).rejects.toThrow('User already exists');
    });
  });
});