import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/session';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest, { params }: { params: { familyId: string } }) {
  try {
    const familyId = params.familyId;

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

    // 检查用户是否是家族的创建者
    const family = await prisma.family.findUnique({
      where: { id: familyId }
    });

    if (!family) {
      return NextResponse.json({ error: '家族不存在' }, { status: 404 });
    }

    if (family.creatorId !== userId) {
      return NextResponse.json({ error: '只有家族创建者可以删除家族' }, { status: 403 });
    }

    // 删除家族（级联删除关联的成员和连接）
    await prisma.family.delete({
      where: { id: familyId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting family:', error);
    return NextResponse.json({ error: '删除家族失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { familyId: string } }) {
  try {
    const familyId = params.familyId;

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

    // 检查用户是否是家族的创建者
    const family = await prisma.family.findUnique({
      where: { id: familyId }
    });

    if (!family) {
      return NextResponse.json({ error: '家族不存在' }, { status: 404 });
    }

    if (family.creatorId !== userId) {
      return NextResponse.json({ error: '只有家族创建者可以编辑家族' }, { status: 403 });
    }

    // 获取请求体
    const body = await request.json();
    const { name, description, motto, location, avatar } = body;

    // 更新家族信息
    const updatedFamily = await prisma.family.update({
      where: { id: familyId },
      data: {
        name: name || family.name,
        description: description,
        motto: motto,
        location: location,
        avatar: avatar
      }
    });

    return NextResponse.json({ success: true, family: updatedFamily });
  } catch (error) {
    console.error('Error updating family:', error);
    return NextResponse.json({ error: '更新家族信息失败' }, { status: 500 });
  }
}
