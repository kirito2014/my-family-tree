'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Users, UserPlus, UserMinus, Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface FamilyMember {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
  };
  role: {
    id: string;
    name: string;
    description: string | null;
  };
  joinedAt: string;
}

interface Family {
  id: string;
  name: string;
  creatorId: string;
}

export default function FamilyMembersPage() {
  const router = useRouter();
  const params = useParams<{ familyId: string }>();
  const familyId = params.familyId;

  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);

  // 获取家族信息和成员列表
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 获取家族信息
        const familyResponse = await fetch(`/api/families/${familyId}`, {
          credentials: 'include'
        });

        if (!familyResponse.ok) {
          throw new Error('获取家族信息失败');
        }

        const familyData = await familyResponse.json();
        setFamily(familyData.family);

        // 获取家族成员列表
        const membersResponse = await fetch(`/api/families/${familyId}/members`, {
          credentials: 'include'
        });

        if (!membersResponse.ok) {
          throw new Error('获取成员列表失败');
        }

        const membersData = await membersResponse.json();
        setMembers(membersData.members);
      } catch (err) {
        setError('获取家族成员失败，请重试');
        console.error('获取家族成员失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (familyId) {
      fetchFamilyMembers();
    }
  }, [familyId]);

  // 提升用户权限
  const handlePromoteMember = async (userId: string) => {
    try {
      setPromotingUserId(userId);

      const response = await fetch(`/api/families/${familyId}/members/${userId}/promote`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '提升权限失败');
      }

      // 重新获取成员列表
      const membersResponse = await fetch(`/api/families/${familyId}/members`, {
        credentials: 'include'
      });

      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.members);
      }
    } catch (err) {
      setError('提升权限失败，请重试');
      console.error('提升权限失败:', err);
    } finally {
      setPromotingUserId(null);
    }
  };

  // 检查当前用户是否是家族创建者
  const isCreator = () => {
    // 这里应该从会话中获取当前用户ID，然后与家族的creatorId比较
    // 暂时返回true，实际应用中需要实现会话管理
    return true;
  };

  // 获取角色显示名称
  const getRoleDisplayName = (roleName: string) => {
    const roleMap: Record<string, string> = {
      creator: '创造者',
      participant: '参与者',
      observer: '观察者'
    };
    return roleMap[roleName] || roleName;
  };

  // 获取角色颜色
  const getRoleColor = (roleName: string) => {
    const colorMap: Record<string, string> = {
      creator: 'text-purple-600 bg-purple-100',
      participant: 'text-green-600 bg-green-100',
      observer: 'text-blue-600 bg-blue-100'
    };
    return colorMap[roleName] || 'text-gray-600 bg-gray-100';
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/family')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            返回家族列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5 w-full border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/family/${familyId}`)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">{family?.name} - 成员管理</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/family/${familyId}/invite`)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserPlus size={16} />
            <span>邀请成员</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Family info card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{family?.name}</h3>
                <p className="text-sm text-gray-600">
                  家族成员: {members.length} 人
                  {family && ` | 创建者: ${family.creatorId}`}
                </p>
              </div>
            </div>
          </div>

          {/* Members list */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">家族成员</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {members.map((member) => (
                <div key={member.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {member.user.avatar ? (
                        <img
                          src={member.user.avatar}
                          alt={member.user.username}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {member.user.name?.charAt(0) || member.user.username.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {member.user.name || member.user.username}
                      </h4>
                      <p className="text-sm text-gray-600">@{member.user.username}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getRoleColor(member.role.name)}`}>
                          {getRoleDisplayName(member.role.name)}
                        </span>
                        <span className="text-xs text-gray-500">
                          加入于: {new Date(member.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCreator() && member.role.name === 'observer' && member.userId !== family?.creatorId && (
                      <button
                        onClick={() => handlePromoteMember(member.userId)}
                        disabled={promotingUserId === member.userId}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {promotingUserId === member.userId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        ) : (
                          <Shield size={14} />
                        )}
                        <span>提升权限</span>
                      </button>
                    )}
                    {member.role.name === 'participant' && (
                      <span className="text-green-600 flex items-center gap-1 text-sm">
                        <CheckCircle size={14} />
                        <span>参与者权限</span>
                      </span>
                    )}
                    {member.role.name === 'creator' && (
                      <span className="text-purple-600 flex items-center gap-1 text-sm">
                        <CheckCircle size={14} />
                        <span>创建者权限</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {members.length === 0 && (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无家族成员</p>
                <button
                  onClick={() => router.push(`/family/${familyId}/invite`)}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                >
                  <UserPlus size={16} />
                  <span>邀请成员</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
