import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/session';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { familyId: string } }) {
  try {
    const { familyId } = params;
    
    // 从请求头获取令牌
    const authHeader = request.headers.get('cookie');
    const token = authHeader?.split('auth-token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 验证令牌
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    // 验证用户是否是家族成员
    const isFamilyMember = await prisma.familyUser.findFirst({
      where: {
        userId,
        familyId
      }
    });

    if (!isFamilyMember) {
      return NextResponse.json({ error: '您不是该家族的成员' }, { status: 403 });
    }

    // 获取家族成员列表
    const members = await prisma.familyUser.findMany({
      where: {
        familyId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: {
        joinedAt: 'asc'
      }
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('获取家族成员失败:', error);
    return NextResponse.json({ error: '获取家族成员失败' }, { status: 500 });
  }
}
