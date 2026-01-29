import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/session';
import { createNotification } from '@/app/actions/notification';
import { createDefaultPermissionsForFamilyUser } from '@/app/actions/permission';

const prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: { familyId: string; userId: string } }) {
  try {
    const { familyId, userId } = params;
    
    // 从请求头获取令牌
    const authHeader = request.headers.get('cookie');
    const token = authHeader?.split('auth-token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 验证令牌
    const currentUserId = await verifyToken(token);
    if (!currentUserId) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    // 验证当前用户是否是家族的创建者
    const family = await prisma.family.findFirst({
      where: {
        id: familyId,
        creatorId: currentUserId
      }
    });

    if (!family) {
      return NextResponse.json({ error: '只有家族创建者可以提升成员权限' }, { status: 403 });
    }

    // 验证目标用户是否是家族成员
    const familyUser = await prisma.familyUser.findFirst({
      where: {
        userId,
        familyId
      }
    });

    if (!familyUser) {
      return NextResponse.json({ error: '目标用户不是家族成员' }, { status: 404 });
    }

    // 获取参与者角色
    const participantRole = await prisma.role.findFirst({
      where: { name: 'participant' }
    });

    // 如果没有参与者角色，则创建
    let roleId = participantRole?.id;
    if (!roleId) {
      const defaultRole = await prisma.role.upsert({
        where: { name: 'participant' },
        update: {},
        create: {
          name: 'participant',
          description: '参与者 - 可以管理家族成员和编辑信息'
        }
      });
      roleId = defaultRole.id;
    }

    // 更新用户角色
    await prisma.familyUser.update({
      where: {
        id: familyUser.id
      },
      data: {
        roleId
      }
    });

    // 删除旧的权限
    await prisma.permission.deleteMany({
      where: {
        familyUserId: familyUser.id
      }
    });

    // 为用户分配新的参与者权限
    await createDefaultPermissionsForFamilyUser(familyUser.id, 'participant');

    // 发送通知给被提升权限的用户
    try {
      await createNotification({
        recipientId: userId,
        title: '权限提升通知',
        content: `${family.name} 家族 创建人 已将您的权限提升至参与者，您可进行参与家族内容管理`,
        type: 'permission_upgrade',
        familyId: family.id,
        senderId: currentUserId
      });
    } catch (error) {
      console.error('发送通知失败:', error);
      // 通知发送失败不影响权限提升流程
    }

    return NextResponse.json({ success: true, message: '权限提升成功' });
  } catch (error) {
    console.error('提升权限失败:', error);
    return NextResponse.json({ error: '提升权限失败' }, { status: 500 });
  }
}
