'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Member {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  age?: number;
  avatar?: string;
  isCreator?: boolean;
  isParticipant?: boolean;
  userId?: string;
}

interface Family {
  id: string;
  name: string;
  members: Member[];
  totalMembers: number;
  generations: number;
  existingRelatives: number;
}

export default function MemberCardsPage() {
  const { familyId } = useParams<{ familyId: string }>();
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取当前用户信息
        const userResponse = await fetch('/api/auth/me');
        if (!userResponse.ok) {
          setError('请先登录');
          setLoading(false);
          return;
        }

        const userData = await userResponse.json();
        if (!userData.user) {
          setError('请先登录');
          setLoading(false);
          return;
        }

        setCurrentUser(userData.user);

        // 获取家族信息和成员卡片
        const familyData = await fetch(`/api/families/${familyId}/members/cards`);
        if (!familyData.ok) {
          const errorData = await familyData.json();
          throw new Error(errorData.error || '获取成员卡片失败');
        }

        const data = await familyData.json();
        setFamily(data);

        // 检查用户是否为创建者
        const familyUserResponse = await fetch(`/api/families/${familyId}/user-role`);
        if (familyUserResponse.ok) {
          const familyUserData = await familyUserResponse.json();
          setIsCreator(familyUserData.isCreator || false);
        } else {
          setIsCreator(false);
        }
        setLoading(false);
      } catch (err) {
        setError('加载失败，请重试');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [familyId]);

  const handleAddMember = async (memberData: any) => {
    try {
      const response = await fetch(`/api/families/${familyId}/members/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        throw new Error('添加成员失败');
      }

      const newMember = await response.json();
      setFamily(prev => prev ? {
        ...prev,
        members: [...prev.members, newMember],
        totalMembers: prev.totalMembers + 1,
      } : null);
      setShowAddModal(false);
    } catch (err) {
      alert('添加成员失败，请重试');
      console.error('Error adding member:', err);
    }
  };

  const handleClaimCard = async (memberId: string) => {
    try {
      const response = await fetch(`/api/families/${familyId}/members/cards/${memberId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('认领卡片失败');
      }

      // 更新成员列表
      const updatedMember = await response.json();
      setFamily(prev => prev ? {
        ...prev,
        members: prev.members.map(member => 
          member.id === memberId ? { ...member, userId: currentUser.id } : member
        ),
      } : null);

      alert('卡片认领成功！');
    } catch (err) {
      alert('认领卡片失败，请重试');
      console.error('Error claiming card:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-text-main dark:text-white">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-text-main dark:text-white">{error}</div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-text-main dark:text-white">家族不存在</div>
      </div>
    );
  }

  // 空状态处理
  if (family.members.length === 0) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white">
        <div className="flex-1 flex flex-col lg:ml-64 h-screen overflow-y-auto">
          <header className="w-full px-4 md:px-10 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <a 
                  href={`/family/${familyId}`} 
                  className="text-text-secondary hover:text-primary font-medium"
                >
                  家族主页
                </a>
                <span className="text-text-secondary">/</span>
                <span className="text-text-main dark:text-white font-medium">成员卡片</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white mt-1">
                家族成员管理
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>
                </div>
                <input 
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-primary text-sm placeholder:text-text-secondary dark:text-white transition-all"
                  placeholder="搜索成员..."
                  type="text"
                />
              </div>
              {currentUser && (
                <div 
                  className="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm cursor-pointer"
                  style={{ backgroundImage: `url(${currentUser.image || 'https://via.placeholder.com/40'})` }}
                ></div>
              )}
            </div>
          </header>

          <main className="flex-1 p-4 md:p-10 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary">👥</span>
              </div>
              <h2 className="text-xl font-bold text-text-main dark:text-white mb-2">还没有家族成员</h2>
              <p className="text-text-secondary dark:text-text-secondary-light mb-8">
                开始添加您的第一个家族成员卡片，创建完整的家族树
              </p>
              {isCreator && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                  创建第一张成员卡片
                </button>
              )}
              {!isCreator && (
                <p className="text-text-secondary dark:text-text-secondary-light">
                  请联系家族创建者添加成员卡片
                </p>
              )}
            </div>
          </main>
        </div>

        {/* 添加成员模态框 */}
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="fixed inset-0 bg-[#141811]/20 backdrop-blur-sm transition-opacity"></div>
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-[#ffffff] dark:bg-[#192210] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10 bg-white/50 dark:bg-[#192210]/50 backdrop-blur-xl sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-bold text-[#141811] dark:text-white">添加成员</h3>
                  <p className="text-xs text-gray-500 mt-0.5">完善成员的基本信息</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <AddMemberForm onSubmit={handleAddMember} onCancel={() => setShowAddModal(false)} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white">
      <div className="flex-1 flex flex-col lg:ml-64 h-screen overflow-y-auto">
        <header className="w-full px-4 md:px-10 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <a 
                href={`/family/${familyId}`} 
                className="text-text-secondary hover:text-primary font-medium"
              >
                家族主页
              </a>
              <span className="text-text-secondary">/</span>
              <span className="text-text-main dark:text-white font-medium">成员卡片</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white mt-1">
              家族成员管理
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>
              </div>
              <input 
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-primary text-sm placeholder:text-text-secondary dark:text-white transition-all"
                placeholder="搜索成员..."
                type="text"
              />
            </div>
            {currentUser && (
              <div 
                className="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm cursor-pointer"
                style={{ backgroundImage: `url(${currentUser.image || 'https://via.placeholder.com/40'})` }}
              ></div>
            )}
          </div>
        </header>

        <main className="w-full px-4 md:px-10 pb-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-light/60 dark:bg-surface-dark/60 backdrop-blur-sm border border-border-light dark:border-border-dark shadow-sm">
              <div className="flex flex-col">
                <p className="text-text-secondary text-sm font-medium">总成员</p>
                <p className="text-2xl font-bold text-text-main dark:text-white mt-1">{family.totalMembers}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <span className="material-symbols-outlined">groups</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-light/60 dark:bg-surface-dark/60 backdrop-blur-sm border border-border-light dark:border-border-dark shadow-sm">
              <div className="flex flex-col">
                <p className="text-text-secondary text-sm font-medium">代系</p>
                <p className="text-2xl font-bold text-text-main dark:text-white mt-1">{family.generations}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <span className="material-symbols-outlined">family_history</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-light/60 dark:bg-surface-dark/60 backdrop-blur-sm border border-border-light dark:border-border-dark shadow-sm">
              <div className="flex flex-col">
                <p className="text-text-secondary text-sm font-medium">现存亲属</p>
                <p className="text-2xl font-bold text-text-main dark:text-white mt-1">{family.existingRelatives}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <span className="material-symbols-outlined">favorite</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-light dark:bg-surface-dark p-2 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
            <div className="flex items-center gap-2 p-1 w-full sm:w-auto overflow-x-auto">
              <button className="flex items-center gap-2 px-3 py-1.5 text-text-main dark:text-white hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors whitespace-nowrap">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>tune</span>
                <span className="text-sm font-medium">过滤</span>
              </button>
              <div className="h-5 w-px bg-border-light dark:bg-border-dark mx-1"></div>
              <button className="flex items-center gap-2 px-3 py-1.5 text-text-main dark:text-white hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors whitespace-nowrap">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>sort</span>
                <span className="text-sm font-medium">排序</span>
              </button>
              <div className="h-5 w-px bg-border-light dark:bg-border-dark mx-1"></div>
              <div className="flex items-center gap-1 px-2">
                <span className="text-xs text-text-secondary bg-primary/10 px-2 py-1 rounded text-primary font-medium whitespace-nowrap">所有成员</span>
                <span className="text-xs text-text-secondary hover:bg-background-light px-2 py-1 rounded cursor-pointer transition-colors whitespace-nowrap">直系亲属</span>
                <span className="text-xs text-text-secondary hover:bg-background-light px-2 py-1 rounded cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                  权限管理
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex p-1 bg-background-light dark:bg-background-dark rounded-lg w-full sm:w-auto">
                <button className="flex-1 sm:flex-none p-1.5 bg-white dark:bg-surface-dark shadow-sm rounded text-text-main dark:text-white">
                  <span className="material-symbols-outlined icon-fill" style={{ fontSize: '20px' }}>grid_view</span>
                </button>
                <button className="flex-1 sm:flex-none p-1.5 text-text-secondary hover:text-text-main transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>view_list</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {family.members.map((member) => (
              <div 
                key={member.id} 
                className="group relative flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl border-2 border-primary shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                <div className="absolute top-2 right-2 z-10">
                  <button className="p-1 rounded-full text-text-secondary hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_vert</span>
                  </button>
                </div>
                <div className="flex p-4 gap-4 items-center border-b border-border-light dark:border-border-dark/50">
                  <div className="relative shrink-0">
                    <div 
                      className="size-16 rounded-full bg-cover bg-center border-2 border-white dark:border-surface-dark shadow-sm"
                      style={{ backgroundImage: `url(${member.avatar || 'https://via.placeholder.com/64'})` }}
                    ></div>
                    {member.isCreator && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-text-main text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-surface-dark">
                        中心
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-text-main dark:text-white truncate">{member.name}</h3>
                      <span 
                        className="material-symbols-outlined" 
                        style={{ 
                          fontSize: '16px', 
                          color: member.gender === 'male' ? '#80ec13' : '#f472b6' 
                        }}
                      >
                        {member.gender === 'male' ? 'male' : 'female'}
                      </span>
                      {member.isCreator && (
                        <span className="material-symbols-outlined text-primary icon-fill" style={{ fontSize: '18px' }} title="创建者">
                          verified_user
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary font-medium">
                      {member.isCreator ? '创建者' : member.isParticipant ? '参与者' : '成员'}
                    </p>
                    <div className="mt-1 flex gap-2">
                      {member.age && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/20 text-text-secondary">
                          {member.age} 岁
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 flex flex-col gap-2 text-xs bg-background-light/30 dark:bg-background-dark/30 flex-1">
                  <div className="grid grid-cols-2 gap-2">
                    {member.birthDate && (
                      <div className="flex items-center gap-1.5 text-text-secondary truncate">
                        <span className="material-symbols-outlined text-[14px]">cake</span>
                        <span>{member.birthDate}</span>
                      </div>
                    )}
                    {member.birthPlace && (
                      <div className="flex items-center gap-1.5 text-text-secondary truncate">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span>{member.birthPlace}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-border-light/50 dark:border-border-dark/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative inline-block w-6 h-3 align-middle select-none transition duration-200 ease-in">
                          <input 
                            checked={member.isCreator}
                            disabled
                            className="toggle-checkbox absolute block w-3 h-3 rounded-full bg-white border-4 border-primary appearance-none cursor-pointer"
                            type="checkbox"
                          />
                          <label className="toggle-label block overflow-hidden h-3 rounded-full bg-primary cursor-pointer"></label>
                        </div>
                        <label className="text-[10px] font-medium text-text-main dark:text-white cursor-pointer">
                          设为中心
                        </label>
                      </div>
                      <button className="text-[10px] font-bold text-primary hover:underline">
                        编辑资料
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative inline-block w-6 h-3 align-middle select-none transition duration-200 ease-in">
                        <input 
                          checked={member.isParticipant || member.isCreator}
                          disabled
                          className="toggle-checkbox absolute block w-3 h-3 rounded-full bg-white border-4 border-primary appearance-none cursor-pointer"
                          type="checkbox"
                        />
                        <label className="toggle-label block overflow-hidden h-3 rounded-full bg-primary cursor-pointer"></label>
                      </div>
                      <label className="text-[10px] font-medium text-text-main dark:text-white cursor-pointer">
                        设为参与者
                      </label>
                    </div>
                    {!member.userId && currentUser && (
                      <button 
                        onClick={() => handleClaimCard(member.id)}
                        className="mt-2 w-full py-1.5 rounded-lg bg-primary text-text-main text-xs font-bold hover:bg-primary/90 transition-colors"
                      >
                        这是我
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isCreator && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex flex-col items-center justify-center gap-2 bg-transparent rounded-xl border-2 border-dashed border-border-light dark:border-border-dark min-h-[160px] hover:border-primary hover:bg-surface-light dark:hover:bg-surface-dark transition-all group"
              >
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-text-main transition-colors">
                  <span className="material-symbols-outlined text-2xl">add</span>
                </div>
                <p className="font-bold text-sm text-text-secondary group-hover:text-text-main dark:group-hover:text-white transition-colors">
                  添加家族成员
                </p>
              </button>
            )}
          </div>

          <div className="flex justify-center mt-auto pb-10">
            <nav className="flex items-center gap-1">
              <button className="p-2 text-text-secondary hover:text-text-main">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="size-8 rounded-lg bg-primary text-text-main font-bold flex items-center justify-center text-xs">1</button>
              <button className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-text-secondary font-medium flex items-center justify-center text-xs transition-colors">2</button>
              <button className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-text-secondary font-medium flex items-center justify-center text-xs transition-colors">3</button>
              <span className="text-text-secondary px-2 text-xs">...</span>
              <button className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-text-secondary font-medium flex items-center justify-center text-xs transition-colors">12</button>
              <button className="p-2 text-text-secondary hover:text-text-main">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </nav>
          </div>
        </main>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-[#141811]/20 backdrop-blur-sm transition-opacity"></div>
          <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-[#ffffff] dark:bg-[#192210] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10 bg-white/50 dark:bg-[#192210]/50 backdrop-blur-xl sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-[#141811] dark:text-white">添加成员</h3>
                <p className="text-xs text-gray-500 mt-0.5">完善成员的基本信息</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <AddMemberForm onSubmit={handleAddMember} onCancel={() => setShowAddModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

interface AddMemberFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function AddMemberForm({ onSubmit, onCancel }: AddMemberFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    gender: 'male' as 'male' | 'female',
    birthDate: '',
    birthPlace: '',
    deathDate: '',
    deathPlace: '',
    age: '',
    avatar: '',
    isCreator: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 bg-background-light/50 dark:bg-background-dark/50">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center gap-4 min-w-[140px]">
          <div className="relative group cursor-pointer">
            <div className="w-32 h-32 rounded-full bg-white dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-gray-300 group-hover:text-primary transition-colors">add_a_photo</span>
            </div>
            <div className="absolute bottom-1 right-1 bg-white dark:bg-[#2a3820] rounded-full p-1.5 shadow-md border border-gray-100 dark:border-gray-700 text-primary">
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </div>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">上传头像</h4>
            <p className="text-xs text-gray-400 mt-1">支持 JPG, PNG</p>
          </div>
        </div>
        <div className="flex-1 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">姓名</label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 px-3 py-2.5 text-sm focus:border-primary focus:ring-primary/20 transition-shadow outline-none placeholder:text-gray-400"
                placeholder="例如：李华"
                type="text"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">昵称</label>
              <input 
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 px-3 py-2.5 text-sm focus:border-primary focus:ring-primary/20 transition-shadow outline-none placeholder:text-gray-400"
                placeholder="例如：小李"
                type="text"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">性别</label>
            <div className="flex gap-2">
              <label className="flex-1 relative cursor-pointer group">
                <input 
                  name="gender"
                  type="radio"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-[#141811] hover:border-primary/50 transition-all">
                  <span className="material-symbols-outlined text-[18px]">male</span>
                  <span className="text-sm font-medium">男</span>
                </div>
              </label>
              <label className="flex-1 relative cursor-pointer group">
                <input 
                  name="gender"
                  type="radio"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-[#141811] hover:border-primary/50 transition-all">
                  <span className="material-symbols-outlined text-[18px]">female</span>
                  <span className="text-sm font-medium">女</span>
                </div>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">出生日期</label>
              <input 
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 px-3 py-2.5 text-sm focus:border-primary focus:ring-primary/20 transition-shadow outline-none text-gray-600"
                type="date"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">出生地点</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">location_on</span>
                <input 
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 pl-9 pr-3 py-2.5 text-sm focus:border-primary focus:ring-primary/20 transition-shadow outline-none placeholder:text-gray-400"
                  placeholder="城市"
                  type="text"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">逝世日期</label>
              <input 
                name="deathDate"
                value={formData.deathDate}
                onChange={handleChange}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 px-3 py-2.5 text-sm focus:border-primary focus:ring-primary/20 transition-shadow outline-none text-gray-600"
                type="date"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">逝世地点</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">location_on</span>
                <input 
                  name="deathPlace"
                  value={formData.deathPlace}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 pl-9 pr-3 py-2.5 text-sm focus:border-primary focus:ring-primary/20 transition-shadow outline-none placeholder:text-gray-400"
                  placeholder="城市"
                  type="text"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">年龄</label>
            <input 
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-24 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 px-3 py-2.5 text-sm focus:border-primary focus:ring-primary/20 transition-shadow outline-none placeholder:text-gray-400"
              placeholder="0"
              type="number"
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 mt-2">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary-dark">
                <span className="material-symbols-outlined text-[20px]">stars</span>
              </div>
              <div>
                <span className="block text-sm font-bold text-gray-900 dark:text-white">设为中心成员</span>
                <span className="block text-xs text-gray-500">将此人作为家族树的根节点</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                name="isCreator"
                type="checkbox"
                checked={formData.isCreator}
                onChange={(e) => setFormData(prev => ({ ...prev, isCreator: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/10 bg-white/80 dark:bg-[#192210]/80 backdrop-blur-xl">
        <button 
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
        >
          取消
        </button>
        <button 
          type="submit"
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#141811] bg-primary hover:bg-[#72d611] shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5"
        >
          保存
        </button>
      </div>
    </form>
  );
}
