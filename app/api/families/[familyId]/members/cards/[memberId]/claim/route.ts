import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/session';

const prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: { familyId: string; memberId: string } }) {
  try {
    // 从cookie中获取令牌
    const authHeader = request.headers.get('cookie');
    const token = authHeader?.split('auth-token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { familyId, memberId } = params;

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
      return NextResponse.json({ error: '您不是该家族的成员' }, { status: 403 });
    }

    // 验证成员卡片是否存在且属于该家族
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return NextResponse.json({ error: '成员卡片不存在' }, { status: 404 });
    }

    if (member.familyId !== familyId) {
      return NextResponse.json({ error: '成员卡片不属于该家族' }, { status: 403 });
    }

    // 验证成员卡片是否已被认领
    if (member.userId) {
      return NextResponse.json({ error: '成员卡片已被认领' }, { status: 400 });
    }

    // 验证用户是否已认领其他成员卡片
    const existingClaimedMember = await prisma.member.findFirst({
      where: {
        familyId,
        userId,
      },
    });

    if (existingClaimedMember) {
      return NextResponse.json({ error: '您已认领其他成员卡片' }, { status: 400 });
    }

    // 认领成员卡片
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        userId,
        isParticipant: true, // 认领后自动成为参与者
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error claiming member card:', error);
    return NextResponse.json({ error: '认领成员卡片失败' }, { status: 500 });
  }
}
