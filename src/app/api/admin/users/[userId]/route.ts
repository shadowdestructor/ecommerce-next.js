import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, updateUserRole, toggleUserStatus } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface RouteParams {
  params: {
    userId: string;
  };
}

const updateUserSchema = z.object({
  role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            favorites: true,
            reviews: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const adminUser = await requireAdmin();
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    let updatedUser;

    if (data.role !== undefined) {
      updatedUser = await updateUserRole(params.userId, data.role, adminUser.id);
    }

    if (data.isActive !== undefined) {
      const user = await prisma.user.findUnique({
        where: { id: params.userId },
        select: { isActive: true },
      });

      if (user && user.isActive !== data.isActive) {
        updatedUser = await toggleUserStatus(params.userId, adminUser.id);
      }
    }

    if (!updatedUser) {
      // If no changes were made, fetch the current user
      updatedUser = await prisma.user.findUnique({
        where: { id: params.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Admin access required') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
      
      if (error.message.includes('Only super admins') || 
          error.message.includes('Cannot deactivate')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const adminUser = await requireAdmin();

    // Prevent admins from deleting themselves
    if (params.userId === adminUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only super admins can delete admin accounts
    if (user.role === 'ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only super admins can delete admin accounts' },
        { status: 403 }
      );
    }

    // Instead of hard delete, we'll deactivate the user
    await prisma.user.update({
      where: { id: params.userId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}