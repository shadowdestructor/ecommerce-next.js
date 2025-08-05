import { signIn, signOut } from 'next-auth/react';
import { LoginInput, RegisterInput, ResetPasswordInput } from '@/lib/validations/auth';

export class AuthService {
  static async login(data: LoginInput) {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error('Invalid credentials');
    }

    return result;
  }

  static async register(data: RegisterInput) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Registration failed');
    }

    return result;
  }

  static async resetPassword(data: ResetPasswordInput) {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Password reset failed');
    }

    return result;
  }

  static async logout() {
    await signOut({ redirect: false });
  }

  static async loginWithGoogle() {
    return signIn('google', { redirect: false });
  }

  static async loginWithFacebook() {
    return signIn('facebook', { redirect: false });
  }
}