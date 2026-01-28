import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/session';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
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

    // 获取用户的所有家族（包括创建的和加入的）
    const families = await prisma.family.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { users: { some: { userId } } }
        ]
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        treeMembers: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ families });
  } catch (error) {
    console.error('Error fetching families:', error);
    return NextResponse.json({ error: '获取家族信息失败' }, { status: 500 });
  }
}
