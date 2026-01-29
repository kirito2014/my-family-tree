import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/session';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { familyId: string } }) {
  try {
    const { familyId } = params;

    // 获取家族信息
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        treeMembers: true,
      },
    });

    if (!family) {
      return NextResponse.json({ error: '家族不存在' }, { status: 404 });
    }

    // 构建成员卡片数据
    const memberCards = family.treeMembers.map(member => ({
      id: member.id,
      name: `${member.firstName}${member.lastName || ''}`,
      gender: member.gender,
      birthDate: member.birthDate,
      birthPlace: null,
      deathDate: member.deathDate,
      deathPlace: null,
      age: null,
      avatar: member.avatar,
      isCreator: false,
      isParticipant: false,
      userId: null,
    }));

    // 计算统计数据
    const totalMembers = family.treeMembers.length;
    const generations = Math.ceil(Math.log(totalMembers + 1) / Math.log(2)); // 简单估算
    const existingRelatives = family.treeMembers.filter(member => member.isAlive).length;

    return NextResponse.json({
      id: family.id,
      name: family.name,
      members: memberCards,
      totalMembers,
      generations,
      existingRelatives,
    });
  } catch (error) {
    console.error('Error fetching member cards:', error);
    return NextResponse.json({ error: '获取成员卡片失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { familyId: string } }) {
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

    const { familyId } = params;

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

    const memberData = await request.json();

    // 验证必填字段
    if (!memberData.name) {
      return NextResponse.json({ error: '请填写成员姓名' }, { status: 400 });
    }

    // 分割姓名为firstName和lastName
    const nameParts = memberData.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

    // 创建成员卡片
    const newMember = await prisma.member.create({
      data: {
        familyId,
        firstName,
        lastName,
        nickname: memberData.nickname,
        gender: memberData.gender || 'male',
        birthDate: memberData.birthDate,
        deathDate: memberData.deathDate,
        isAlive: !memberData.deathDate,
        avatar: memberData.avatar,
      },
    });

    // 构建返回数据
    const returnMember = {
      id: newMember.id,
      name: `${newMember.firstName}${newMember.lastName || ''}`,
      gender: newMember.gender,
      birthDate: newMember.birthDate,
      birthPlace: null,
      deathDate: newMember.deathDate,
      deathPlace: null,
      age: null,
      avatar: newMember.avatar,
      isCreator: false,
      isParticipant: false,
      userId: null,
    };

    return NextResponse.json(returnMember, { status: 201 });
  } catch (error) {
    console.error('Error creating member card:', error);
    return NextResponse.json({ error: '创建成员卡片失败' }, { status: 500 });
  }
}
