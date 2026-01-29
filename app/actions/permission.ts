'use server';

import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/session';

const prisma = new PrismaClient();

// 定义默认权限列表
export const DEFAULT_PERMISSIONS = [
  { key: 'view_members', name: '查看家族成员', value: true },
  { key: 'manage_members', name: '管理家族成员', value: false },
  { key: 'edit_family_info', name: '编辑家族信息', value: false },
  { key: 'delete_family', name: '删除家族', value: false },
  { key: 'join_family', name: '加入家族', value: true },
  { key: 'leave_family', name: '退出家族', value: true },
  { key: 'kick_member', name: '踢出成员', value: false },
  { key: 'invite_member', name: '邀请成员', value: true },
];

// 定义角色默认权限
export const ROLE_PERMISSIONS = {
  observer: DEFAULT_PERMISSIONS.map(p => ({
    ...p,
    value: ['view_members', 'join_family', 'leave_family', 'invite_member'].includes(p.key),
  })),
  participant: DEFAULT_PERMISSIONS.map(p => ({
    ...p,
    value: ['view_members', 'manage_members', 'edit_family_info', 'join_family', 'leave_family', 'invite_member'].includes(p.key),
  })),
  creator: DEFAULT_PERMISSIONS.map(p => ({
    ...p,
    value: true,
  })),
};

// 创建权限
export async function createPermission(data: {
  name: string;
  key: string;
  value: boolean;
  roleId?: string;
  familyUserId?: string;
}) {
  try {
    const permission = await prisma.permission.create({
      data,
    });
    return { permission };
  } catch (error) {
    console.error('创建权限失败:', error);
    return { error: '创建权限失败' };
  }
}

// 更新权限
export async function updatePermission(id: string, data: {
  value?: boolean;
  name?: string;
  description?: string;
}) {
  try {
    const permission = await prisma.permission.update({
      where: { id },
      data,
    });
    return { permission };
  } catch (error) {
    console.error('更新权限失败:', error);
    return { error: '更新权限失败' };
  }
}

// 批量更新权限
export async function updatePermissions(permissions: Array<{
  id: string;
  value: boolean;
}>) {
  try {
    const updatedPermissions = await Promise.all(
      permissions.map(p => 
        prisma.permission.update({
          where: { id: p.id },
          data: { value: p.value },
        })
      )
    );
    return { permissions: updatedPermissions };
  } catch (error) {
    console.error('批量更新权限失败:', error);
    return { error: '批量更新权限失败' };
  }
}

// 获取用户在家族中的权限
export async function getFamilyUserPermissions(familyUserId: string) {
  try {
    const permissions = await prisma.permission.findMany({
      where: { familyUserId },
    });
    return { permissions };
  } catch (error) {
    console.error('获取用户权限失败:', error);
    return { error: '获取用户权限失败' };
  }
}

// 为角色创建默认权限
export async function createDefaultPermissionsForRole(roleId: string, roleName: string) {
  try {
    const rolePermissions = ROLE_PERMISSIONS[roleName as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.observer;
    
    const permissions = await Promise.all(
      rolePermissions.map(p => 
        prisma.permission.create({
          data: {
            name: p.name,
            key: p.key,
            value: p.value,
            roleId,
          },
        })
      )
    );
    
    return { permissions };
  } catch (error) {
    console.error('为角色创建默认权限失败:', error);
    return { error: '为角色创建默认权限失败' };
  }
}

// 为家族用户创建默认权限
export async function createDefaultPermissionsForFamilyUser(familyUserId: string, roleName: string) {
  try {
    const rolePermissions = ROLE_PERMISSIONS[roleName as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.observer;
    
    const permissions = await Promise.all(
      rolePermissions.map(p => 
        prisma.permission.create({
          data: {
            name: p.name,
            key: p.key,
            value: p.value,
            familyUserId,
          },
        })
      )
    );
    
    return { permissions };
  } catch (error) {
    console.error('为家族用户创建默认权限失败:', error);
    return { error: '为家族用户创建默认权限失败' };
  }
}
