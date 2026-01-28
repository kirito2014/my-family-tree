import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
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

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('获取通知失败:', error);
    return NextResponse.json({ error: '获取通知失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { recipientId, title, content, type, familyId } = data;

    if (!recipientId || !title || !content || !type) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        recipientId,
        senderId: session.userId,
        title,
        content,
        type,
        familyId
      }
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('创建通知失败:', error);
    return NextResponse.json({ error: '创建通知失败' }, { status: 500 });
  }
}
