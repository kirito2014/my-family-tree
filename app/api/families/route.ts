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
        treeMembers: true,
        users: {
          include: {
            role: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 为每个家族添加当前用户的角色和权限信息
    const familiesWithUserInfo = await Promise.all(
      families.map(async (family) => {
        // 找到当前用户在这个家族中的信息
        const familyUser = await prisma.familyUser.findFirst({
          where: {
            userId,
            familyId: family.id
          },
          include: {
            role: true,
            permissions: true
          }
        });

        return {
          ...family,
          role: familyUser?.role,
          permissions: familyUser?.permissions || []
        };
      })
    );

    return NextResponse.json({ families: familiesWithUserInfo });
  } catch (error) {
    console.error('Error fetching families:', error);
    return NextResponse.json({ error: '获取家族信息失败' }, { status: 500 });
  }
}
