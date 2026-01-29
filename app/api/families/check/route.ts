import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { shareCode } = data;

    if (!shareCode) {
      return NextResponse.json({ error: '缺少邀请码' }, { status: 400 });
    }

    // 查找对应的家族
    const family = await prisma.family.findUnique({
      where: {
        shareCode: shareCode.trim().toUpperCase()
      },
      select: {
        id: true,
        name: true,
        motto: true,
        location: true,
        avatar: true,
        createdAt: true,
        creatorId: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    if (family) {
      // 构建包含成员数的响应
      const familyWithMemberCount = {
        ...family,
        memberCount: family._count.users
      };
      return NextResponse.json({ family: familyWithMemberCount });
    } else {
      return NextResponse.json({ family: null });
    }
  } catch (error) {
    console.error('检查家族邀请码失败:', error);
    return NextResponse.json({ error: '检查邀请码失败' }, { status: 500 });
  }
}
