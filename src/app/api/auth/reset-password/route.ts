import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    // Verify token
    const decoded = jwt.verify(validatedData.token, process.env.NEXTAUTH_SECRET!) as {
      userId: string;
      email: string;
      type: string;
    };

    if (decoded.type !== 'password-reset') {
      return NextResponse.json(
        { error: 'Geçersiz token türü' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    return NextResponse.json(
      { message: 'Şifreniz başarıyla güncellendi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token' },
        { status: 400 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Şifre sıfırlama sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}