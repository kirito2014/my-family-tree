import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化权限角色...');

  const roles = [
    {
      name: 'creator',
      description: '创建者 - 拥有全部权限，包括管理家族成员、修改家族信息、删除家族等'
    },
    {
      name: 'participant',
      description: '参与者 - 可以管理家族成员，包括添加、编辑、删除成员信息'
    },
    {
      name: 'observer',
      description: '观察者 - 仅可以查看家族成员信息，无法进行任何修改操作'
    }
  ];

  for (const role of roles) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role.name }
    });

    if (!existingRole) {
      await prisma.role.create({
        data: role
      });
      console.log(`✓ 创建角色: ${role.name}`);
    } else {
      console.log(`- 角色已存在: ${role.name}`);
    }
  }

  console.log('权限角色初始化完成！');
}

main()
  .catch((e) => {
    console.error('初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
