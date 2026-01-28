'use server';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { generateToken, verifyToken, destroySession } from '@/lib/session';

const prisma = new PrismaClient();

interface RegisterInput {
  username: string;
  password: string;
  email?: string;
}

interface LoginInput {
  username: string;
  password: string;
}

interface ResetPasswordInput {
  username: string;
  newPassword: string;
  confirmPassword: string;
}

export async function register(input: RegisterInput) {
  const { username, password, email } = input;

  // 检查用户名是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    return { error: '用户名已存在' };
  }

  // 检查邮箱是否已存在（如果提供了邮箱）
  if (email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return { error: '邮箱已被注册' };
    }
  }

  // 密码哈希
  const hashedPassword = await bcrypt.hash(password, 10);

  // 创建用户
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      email,
    },
  });

  // 生成 JWT
  const token = await generateToken(user.id);

  // 设置 Cookie
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: '/',
  });

  // 设置最后活动时间
  cookies().set('last-activity', Date.now().toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: '/',
  });

  return { success: true };
}

export async function createFamily(familyName: string, motto?: string, region?: string) {
  try {
    const session = await verifySession();
    if (!session.success) {
      return { error: '未登录' };
    }

    // 检查家庭名称是否有效
    if (!familyName.trim()) {
      return { error: '家庭名称不能为空' };
    }

    // 生成 TREE-XXXX-XXXX 格式的 shareCode
const generateShareCode = function (): string {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const part1 = Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
      const part2 = Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
      return `TREE-${part1}-${part2}`;
    }

    const shareCode = generateShareCode();

    // 创建家庭
    const family = await prisma.family.create({
      data: {
        name: familyName.trim(),
        motto: motto?.trim(),
        location: region,
        creatorId: session.user.id,
        shareCode: shareCode,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
          }
        }
      }
    });

    // 自动将创建者添加为家庭成员（通常是管理员角色）
    const adminRole = await prisma.role.findFirst({
      where: { name: 'admin' }
    });

    // 如果没有管理员角色，则查找或创建默认角色
    let roleId = adminRole?.id;
    if (!roleId) {
      const defaultRole = await prisma.role.upsert({
        where: { name: 'member' },
        update: {},
        create: {
          name: 'member',
          description: '普通成员'
        }
      });
      roleId = defaultRole.id;
    }

    await prisma.familyUser.create({
      data: {
        userId: session.user.id,
        familyId: family.id,
        roleId: roleId
      }
    });

    return { success: true, family };
  } catch (error) {
    console.error('创建家庭失败:', error);
    return { error: '创建家庭失败' };
  }
}

export async function joinFamily(inviteCode: string) {
  try {
    const session = await verifySession();
    if (!session.success) {
      return { error: '未登录' };
    }

    // 检查邀请码是否有效
    if (!inviteCode.trim()) {
      return { error: '邀请码不能为空' };
    }

    // 根据邀请码查找家庭
    const family = await prisma.family.findUnique({
      where: { 
        shareCode: inviteCode.trim().toUpperCase() 
      }
    });

    if (!family) {
      return { error: '无效的邀请码' };
    }

    // 检查用户是否已经是该家庭的成员
    const existingMembership = await prisma.familyUser.findFirst({
      where: {
        userId: session.user.id,
        familyId: family.id
      }
    });

    if (existingMembership) {
      return { error: '您已经是该家庭的成员' };
    }

    // 获取默认角色（通常为普通成员）
    const memberRole = await prisma.role.findFirst({
      where: { name: 'member' }
    });

    let roleId = memberRole?.id;
    if (!roleId) {
      const defaultRole = await prisma.role.upsert({
        where: { name: 'member' },
        update: {},
        create: {
          name: 'member',
          description: '普通成员'
        }
      });
      roleId = defaultRole.id;
    }

    // 创建家庭成员关系
    await prisma.familyUser.create({
      data: {
        userId: session.user.id,
        familyId: family.id,
        roleId: roleId
      }
    });

    return { success: true, family: { id: family.id, name: family.name } };
  } catch (error) {
    console.error('加入家庭失败:', error);
    return { error: '加入家庭失败' };
  }
}

// 内存缓存，用于跟踪登录尝试
const loginAttempts: Record<string, { count: number; lastAttempt: number; lockedUntil: number }> = {};

// 生成斐波那契数列的锁定时间（分钟）
function getFibonacciLockTime(attempts: number): number {
  if (attempts <= 5) return 1; // 前5次失败锁定1分钟
  
  let a = 1, b = 1;
  for (let i = 2; i < attempts - 4; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

export async function login(input: LoginInput) {
  const { username, password } = input;

  // 检查登录尝试限制
  const now = Date.now();
  const attemptKey = username.toLowerCase();
  
  if (loginAttempts[attemptKey]) {
    const { count, lockedUntil } = loginAttempts[attemptKey];
    
    // 检查是否被锁定
    if (now < lockedUntil) {
      const remainingTime = Math.ceil((lockedUntil - now) / 60000);
      return { error: `账户已被锁定，请 ${remainingTime} 分钟后再试，或尝试重置密码` };
    }
  }

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    // 即使用户不存在，也要记录登录尝试
    if (!loginAttempts[attemptKey]) {
      loginAttempts[attemptKey] = { count: 0, lastAttempt: now, lockedUntil: 0 };
    }
    
    loginAttempts[attemptKey].count++;
    loginAttempts[attemptKey].lastAttempt = now;
    
    const attemptCount = loginAttempts[attemptKey].count;
    
    // 检查是否需要锁定
    if (attemptCount >= 5) {
      const lockTimeMinutes = getFibonacciLockTime(attemptCount);
      loginAttempts[attemptKey].lockedUntil = now + lockTimeMinutes * 60000;
      return { error: `账户已被锁定，请 ${lockTimeMinutes} 分钟后再试，或尝试重置密码` };
    }
    
    const remaining = 5 - attemptCount;
    return { error: `用户名或密码错误，还剩 ${remaining} 次尝试` };
  }

  // 验证密码
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    // 记录失败的登录尝试
    if (!loginAttempts[attemptKey]) {
      loginAttempts[attemptKey] = { count: 0, lastAttempt: now, lockedUntil: 0 };
    }
    
    loginAttempts[attemptKey].count++;
    loginAttempts[attemptKey].lastAttempt = now;
    
    const attemptCount = loginAttempts[attemptKey].count;
    
    // 检查是否需要锁定
    if (attemptCount >= 5) {
      const lockTimeMinutes = getFibonacciLockTime(attemptCount);
      loginAttempts[attemptKey].lockedUntil = now + lockTimeMinutes * 60000;
      return { error: `账户已被锁定，请 ${lockTimeMinutes} 分钟后再试，或尝试重置密码` };
    }
    
    const remaining = 5 - attemptCount;
    return { error: `用户名或密码错误，还剩 ${remaining} 次尝试` };
  }

  // 登录成功，重置登录尝试计数
  if (loginAttempts[attemptKey]) {
    delete loginAttempts[attemptKey];
  }

  // 生成 JWT
  const token = await generateToken(user.id);

  // 设置 Cookie
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: '/',
  });

  // 检查用户是否有家族（创建的或加入的）
  const userWithFamilies = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      createdFamilies: true,
      familyMemberships: true
    }
  });

  // 确定重定向路径
  const hasFamilies = (userWithFamilies?.createdFamilies?.length || 0) > 0 || (userWithFamilies?.familyMemberships?.length || 0) > 0;
  const redirectTo = hasFamilies ? '/family' : '/onboard';

  return { success: true, redirectTo };
}

export async function logout() {
  // 清除 Cookie
  cookies().delete('auth-token');
  cookies().delete('last-activity');
  return { success: true };
}

export async function verifySession() {
  const token = cookies().get('auth-token')?.value;

  if (!token) {
    return { error: '未授权' };
  }

  try {
    const userId = await verifyToken(token);
    
    if (!userId) {
      return { error: '无效的令牌' };
    }
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { error: '用户不存在' };
    }

    return { success: true, user };
  } catch (error) {
    return { error: '无效的令牌' };
  }
}

export async function getCurrentUser() {
  const session = await verifySession();
  if (session.success) {
    // 重新查询用户，获取更多信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        name: true,
        nickname: true,
        email: true,
        phone: true,
        location: true,
        avatar: true,
        bio: true,
      },
    });
    return user;
  }
  return null;
}

export async function updateUserProfile(data: {
    name?: string;
    nickname?: string;
    phone?: string;
    email?: string;
    location?: string;
    bio?: string;
    avatar?: string;
  }) {
  try {
    const session = await verifySession();
    if (!session.success) {
      throw new Error('未登录');
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        nickname: true,
        email: true,
        phone: true,
        location: true,
        avatar: true,
        bio: true,
      },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return { error: '更新用户信息失败' };
  }
}

export async function uploadAvatar(avatar: string) {
  try {
    const session = await verifySession();
    if (!session.success) {
      throw new Error('未登录');
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar },
      select: {
        id: true,
        avatar: true,
      },
    });

    return { success: true, avatar: updatedUser.avatar };
  } catch (error) {
    console.error('上传头像失败:', error);
    return { error: '上传头像失败' };
  }
}

export async function resetPassword(input: ResetPasswordInput) {
  const { username, newPassword, confirmPassword } = input;

  // 验证密码是否一致
  if (newPassword !== confirmPassword) {
    return { error: '两次输入的密码不一致' };
  }

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return { error: '用户不存在' };
  }

  // 对新密码进行哈希处理
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 更新用户的密码
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
    },
  });

  return { success: true };
}
