import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest, { params }: { params: { notificationId: string } }) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const { notificationId } = params;

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: session.userId
      }
    });

    if (!notification) {
      return NextResponse.json({ error: '通知不存在' }, { status: 404 });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ notification: updatedNotification });
  } catch (error) {
    console.error('更新通知状态失败:', error);
    return NextResponse.json({ error: '更新通知状态失败' }, { status: 500 });
  }
}
