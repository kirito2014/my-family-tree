'use server';

import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/session';

const prisma = new PrismaClient();

export async function getNotifications() {
  try {
    const session = await verifySession();
    if (!session) {
      return { error: '未授权' };
    }

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: session.userId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
        family: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { notifications };
  } catch (error) {
    console.error('获取通知失败:', error);
    return { error: '获取通知失败' };
  }
}

export async function getUnreadNotificationCount() {
  try {
    const session = await verifySession();
    if (!session) {
      return { error: '未授权' };
    }

    const count = await prisma.notification.count({
      where: {
        recipientId: session.userId,
        isRead: false
      }
    });

    return { count };
  } catch (error) {
    console.error('获取未读通知数失败:', error);
    return { error: '获取未读通知数失败' };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const session = await verifySession();
    if (!session) {
      return { error: '未授权' };
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        recipientId: session.userId
      }
    });

    if (!notification) {
      return { error: '通知不存在' };
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId
      },
      data: {
        isRead: true
      }
    });

    return { notification: updatedNotification };
  } catch (error) {
    console.error('标记通知为已读失败:', error);
    return { error: '标记通知为已读失败' };
  }
}

export async function createNotification(data: {
  recipientId: string;
  title: string;
  content: string;
  type: string;
  familyId?: string;
}) {
  try {
    const session = await verifySession();
    if (!session) {
      return { error: '未授权' };
    }

    const notification = await prisma.notification.create({
      data: {
        ...data,
        senderId: session.userId
      }
    });

    return { notification };
  } catch (error) {
    console.error('创建通知失败:', error);
    return { error: '创建通知失败' };
  }
}
