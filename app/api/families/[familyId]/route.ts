import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/session';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { familyId: string } }) {
  try {
    const { familyId } = params;
    
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

    // 验证用户是否是家族成员
    const isFamilyMember = await prisma.familyUser.findFirst({
      where: {
        userId,
        familyId
      }
    });

    if (!isFamilyMember) {
      return NextResponse.json({ error: '您不是该家族的成员' }, { status: 403 });
    }

    // 获取家族信息
    const family = await prisma.family.findUnique({
      where: {
        id: familyId
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    });

    if (!family) {
      return NextResponse.json({ error: '家族不存在' }, { status: 404 });
    }

    return NextResponse.json({ family });
  } catch (error) {
    console.error('获取家族信息失败:', error);
    return NextResponse.json({ error: '获取家族信息失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { familyId: string } }) {
  try {
    const { familyId } = params;
    const body = await request.json();
    
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

    // 验证用户是否是家族成员
    const familyUser = await prisma.familyUser.findFirst({
      where: {
        userId,
        familyId
      },
      include: {
        role: true
      }
    });

    if (!familyUser) {
      return NextResponse.json({ error: '您不是该家族的成员' }, { status: 403 });
    }

    // 验证用户是否有编辑权限（创造者或参与者）
    if (familyUser.role.name === 'observer') {
      return NextResponse.json({ error: '您没有编辑家族信息的权限' }, { status: 403 });
    }

    // 获取家族信息
    const existingFamily = await prisma.family.findUnique({
      where: {
        id: familyId
      }
    });

    if (!existingFamily) {
      return NextResponse.json({ error: '家族不存在' }, { status: 404 });
    }

    // 更新家族信息
    const updatedFamily = await prisma.family.update({
      where: {
        id: familyId
      },
      data: {
        name: body.name || existingFamily.name,
        motto: body.motto || existingFamily.motto,
        location: body.location || existingFamily.location,
        description: body.description || existingFamily.description,
        avatar: body.avatar || existingFamily.avatar
      }
    });

    return NextResponse.json({ family: updatedFamily });
  } catch (error) {
    console.error('更新家族信息失败:', error);
    return NextResponse.json({ error: '更新家族信息失败' }, { status: 500 });
  }
}
