import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/session';
import { createNotification } from '@/app/actions/notification';

const prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: { familyId: string } }) {
  try {
    const familyId = params.familyId;

    // 从请求中获取令牌
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 验证令牌
    const userId = await verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    // 检查家族是否存在
    const family = await prisma.family.findUnique({
      where: { id: familyId }
    });

    if (!family) {
      return NextResponse.json({ error: '家族不存在' }, { status: 404 });
    }

    // 检查用户是否是家族成员
    const familyMember = await prisma.familyUser.findFirst({
      where: {
        familyId,
        userId
      }
    });

    if (!familyMember) {
      return NextResponse.json({ error: '您不是该家族的成员' }, { status: 403 });
    }

    // 检查用户是否是家族创建者（创建者不能退出，只能删除）
    if (family.creatorId === userId) {
      return NextResponse.json({ error: '家族创建者不能退出家族' }, { status: 403 });
    }

    // 删除成员关系
    await prisma.familyUser.deleteMany({
      where: {
        familyId,
        userId
      }
    });

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true
      }
    });

    // 发送通知给家族创建者（即使失败也不影响退出操作）
    if (user) {
      try {
        await createNotification({
          recipientId: family.creatorId,
          title: '成员退出通知',
          content: `${user.name || user.username} 已退出您 创建的家族 ${family.name}`,
          type: 'member_leave',
          familyId: family.id,
          senderId: userId
        });
      } catch (error) {
        console.error('发送通知失败:', error);
        // 通知发送失败不影响退出操作
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving family:', error);
    return NextResponse.json({ error: '退出家族失败' }, { status: 500 });
  }
}
