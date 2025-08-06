import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  const user = await getAdminSession();
  
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    throw new Error('Admin access required');
  }

  return user;
}

export async function requireSuperAdmin() {
  const user = await getAdminSession();
  
  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Error('Super admin access required');
  }

  return user;
}

export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'SUPER_ADMIN';
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    CUSTOMER: 0,
    ADMIN: 1,
    SUPER_ADMIN: 2,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export async function createAdminUser(email: string, name: string, password: string, role: UserRole = 'ADMIN') {
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashedPassword,
      role,
      emailVerified: true,
    },
  });

  return user;
}

export async function updateUserRole(userId: string, role: UserRole, adminUserId: string) {
  // Only super admins can create other super admins
  const adminUser = await prisma.user.findUnique({
    where: { id: adminUserId },
    select: { role: true },
  });

  if (!adminUser) {
    throw new Error('Admin user not found');
  }

  if (role === 'SUPER_ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
    throw new Error('Only super admins can create other super admins');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return updatedUser;
}

export async function toggleUserStatus(userId: string, adminUserId: string) {
  // Prevent admins from deactivating themselves
  if (userId === adminUserId) {
    throw new Error('Cannot deactivate your own account');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true, role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Only super admins can deactivate other admins
  const adminUser = await prisma.user.findUnique({
    where: { id: adminUserId },
    select: { role: true },
  });

  if (!adminUser) {
    throw new Error('Admin user not found');
  }

  if (user.role === 'ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
    throw new Error('Only super admins can deactivate admin accounts');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });

  return updatedUser;
}