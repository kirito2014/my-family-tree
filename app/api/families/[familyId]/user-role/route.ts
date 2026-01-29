import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/session';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { familyId: string } }) {
  try {
    // 从cookie中获取令牌
    const authHeader = request.headers.get('cookie');
    const token = authHeader?.split('auth-token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ isCreator: false, isMember: false }, { status: 200 });
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ isCreator: false, isMember: false }, { status: 200 });
    }

    const { familyId } = params;

    // 验证用户是否为家族成员
    const familyUser = await prisma.familyUser.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    });

    if (!familyUser) {
      return NextResponse.json({ isCreator: false, isMember: false }, { status: 200 });
    }

    return NextResponse.json({ 
      isCreator: familyUser.isCreator || false,
      isMember: true 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json({ isCreator: false, isMember: false }, { status: 200 });
  }
}
