'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { TreeDeciduous, Users, Copy, ExternalLink, Trash2, ChevronRight, Bell, LogOut } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import NotificationModal from '@/components/NotificationModal';
import { getUnreadNotificationCount, createNotification } from '@/app/actions/notification';

const prisma = new PrismaClient();

export default function FamilyPage() {
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [familyToDelete, setFamilyToDelete] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [familyToLeave, setFamilyToLeave] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    fetchFamilies();
    loadUnreadCount();
    getCurrentUserId();
  }, []);

  const getCurrentUserId = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setCurrentUserId(data.user.id);
        }
      }
    } catch (error) {
      console.error('获取当前用户ID失败:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const unread = data.notifications.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('加载未读通知数失败:', error);
    }
  };

  const fetchFamilies = async () => {
    try {
      const response = await fetch('/api/families', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('获取家族信息失败');
      }

      const data = await response.json();
      setFamilies(data.families || []);
    } catch (err) {
      setError('获取家族信息失败，请重试');
      console.error('Error fetching families:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShareCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleDeleteFamily = (familyId: string) => {
    setFamilyToDelete(familyId);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteFamily = async () => {
    if (familyToDelete) {
      try {
        const response = await fetch(`/api/families/${familyToDelete}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('删除家族失败');
        }

        fetchFamilies();
      } catch (err) {
        setError('删除家族失败，请重试');
        console.error('Error deleting family:', err);
      } finally {
        setShowDeleteModal(false);
        setFamilyToDelete(null);
      }
    }
  };

  const handleCancelDeleteFamily = () => {
    setShowDeleteModal(false);
    setFamilyToDelete(null);
  };

  const handleLeaveFamily = (familyId: string) => {
    setFamilyToLeave(familyId);
    setShowLeaveModal(true);
  };

  const handleConfirmLeaveFamily = async () => {
    if (familyToLeave) {
      try {
        const response = await fetch(`/api/families/${familyToLeave}/leave`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('退出家族失败');
        }

        fetchFamilies();
      } catch (err) {
        setError('退出家族失败，请重试');
        console.error('Error leaving family:', err);
      } finally {
        setShowLeaveModal(false);
        setFamilyToLeave(null);
      }
    }
  };

  const handleCancelLeaveFamily = () => {
    setShowLeaveModal(false);
    setFamilyToLeave(null);
  };

  const handleCreateFamily = () => {
    router.push('/family/create');
  };

  // 申请权限提升
  const handleRequestPermission = async (family: any) => {
    try {
      await createNotification({
        recipientId: family.creatorId,
        title: '权限提升申请',
        content: `用户申请提升在家族 ${family.name} 中的权限级别，请审核。`,
        type: 'permission_request',
        familyId: family.id
      });
      alert('权限申请已发送，等待创建者审核');
    } catch (error) {
      console.error('发送权限申请失败:', error);
      alert('发送权限申请失败');
    }
  };

  // 打开通知中心
  const handleOpenNotifications = () => {
    loadNotifications();
    setShowNotificationModal(true);
  };

  // 加载通知
  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const response = await fetch('/api/notifications', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        // 更新未读计数
        const unread = data.notifications?.filter((n: any) => !n.isRead).length || 0;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('加载通知失败:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // 标记通知为已读
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (response.ok) {
        // 更新本地状态
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ));
        // 更新未读计数
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('标记通知为已读失败:', error);
    }
  };

  // 标记所有通知为已读
  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      if (unreadNotifications.length === 0) return;

      // 并行标记所有未读通知为已读
      await Promise.all(
        unreadNotifications.map(async (notification) => {
          const response = await fetch(`/api/notifications/${notification.id}`, {
            method: 'PATCH',
            credentials: 'include'
          });
          return response.ok;
        })
      );

      // 更新本地状态
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      // 重置未读计数
      setUnreadCount(0);
    } catch (error) {
      console.error('标记全部通知为已读失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#80ec13] mx-auto mb-4"></div>
          <p className="text-[#5c6f4b]">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f7f8f6]">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-[#80ec13]/10 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-[#dbead5] rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-[#80ec13]/15 rounded-full blur-2xl opacity-40"></div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 w-full">
        <div className="flex items-center gap-2 text-[#141811] font-bold text-xl select-none">
          <div className="p-2 bg-transparent rounded-lg shadow-md">
            <img src="/favicon.ico" alt="FamilyTree Logo" className="h-6 w-6" />
          </div>
          <span>FamilyTree</span>
        </div>
        <div className="flex items-center gap-4">
          {/* 通知按钮 */}
          <div className="relative">
            <button
              onClick={handleOpenNotifications}
              className="w-9 h-9 rounded-full bg-white shadow-sm text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200 relative"
              title="通知"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          <button 
            onClick={() => router.push('/settings')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#141811] font-bold shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            设置
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 relative z-10 w-full max-w-5xl mx-auto pt-8">
        <div className="w-full animate-in fade-in zoom-in duration-500">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#141811] mb-2">我的家族</h1>
              <p className="text-[#5c6f4b]">管理您创建的家族和加入的家族</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateFamily}
                className="bg-white hover:bg-gray-50 text-[#80ec13] font-bold py-3 px-6 rounded-xl shadow-lg shadow-gray-200 flex items-center gap-2 transition-all active:scale-95 border border-[#80ec13]"
              >
                <TreeDeciduous size={20} className="text-[#80ec13]" />
                创建家族
              </button>
              <button
                onClick={() => router.push('/family/join')}
                className="bg-white hover:bg-gray-50 text-[#192210] font-bold py-3 px-6 rounded-xl shadow-lg shadow-gray-200 flex items-center gap-2 transition-all active:scale-95 border border-gray-200"
              >
                <Users size={20} />
                加入家族
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {error}
            </div>
          )}

          {/* Families List */}
          <div className="space-y-4">
            {families.length === 0 ? (
              <div className="text-center py-16 bg-white/60 backdrop-blur-md rounded-2xl shadow-md">
                <div className="w-20 h-20 bg-[#f7f8f6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <TreeDeciduous size={40} className="text-[#80ec13]" />
                </div>
                <h2 className="text-xl font-bold text-[#141811] mb-2">您还没有创建任何家族</h2>
                <p className="text-[#5c6f4b] mb-6">点击上方的"创建家族"按钮开始创建您的第一个家族</p>
                <button
                  onClick={handleCreateFamily}
                  className="bg-[#80ec13] hover:bg-[#72d411] text-[#192210] font-bold py-3 px-6 rounded-xl shadow-lg shadow-[#80ec13]/20 flex items-center gap-2 transition-all active:scale-95 mx-auto"
                >
                  <TreeDeciduous size={18} />
                  创建第一个家族
                </button>
              </div>
            ) : (
              families.map((family) => (
                <div key={family.id} className="bg-white/60 backdrop-blur-md rounded-2xl shadow-md overflow-hidden border border-white/50 hover:shadow-lg transition-all">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#f7f8f6] rounded-xl flex items-center justify-center">
                          {family.avatar ? (
                            <img src={family.avatar} alt={`${family.name} Avatar`} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Users size={24} className="text-[#80ec13]" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#141811] mb-1">{family.name}</h3>
                          {family.motto && (
                            <p className="text-[#5c6f4b] text-sm mb-1">{family.motto}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{family.creatorId === currentUserId ? '创建于' : '加入于'} {new Date(family.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                            <span>•</span>
                            <span>{family.treeMembers?.length || 0} 位成员</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyShareCode(family.shareCode)}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="复制邀请码"
                        >
                          <Copy size={16} className="text-[#5c6f4b] hover:text-[#80ec13]" />
                        </button>
                        <button
                          onClick={() => router.push(`/family/${family.id}/tree`)}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="查看家族树"
                        >
                          <ExternalLink size={16} className="text-[#5c6f4b] hover:text-[#80ec13]" />
                        </button>
                        {family.creatorId === currentUserId ? (
                          <button
                            onClick={() => handleDeleteFamily(family.id)}
                            className="p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="删除家族"
                          >
                            <Trash2 size={16} className="text-[#5c6f4b] hover:text-red-500" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLeaveFamily(family.id)}
                            className="p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="退出家族"
                          >
                            <LogOut size={16} className="text-[#5c6f4b] hover:text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#5c6f4b]" />
                        <span className="text-sm text-[#5c6f4b]">邀请码：{family.shareCode}</span>
                        {copied === family.shareCode && (
                          <span className="text-xs text-green-500">已复制！</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {family.role?.name === 'observer' && (
                          <button 
                            onClick={() => handleRequestPermission(family)}
                            className="h-8 px-3 rounded-xl bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors text-xs"
                          >
                            申请更高权限
                          </button>
                        )}
                        <button 
                        onClick={() => router.push('/settings?tab=family')}
                        className="flex items-center gap-1 text-sm font-medium text-[#80ec13] hover:text-[#72d411] transition-colors"
                      >
                        管理家族
                        <ChevronRight size={16} />
                      </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      
      {/* 删除家族确认modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="删除家族"
        message="确定要删除这个家族吗？此操作不可恢复。"
        confirmText="确认删除"
        cancelText="取消"
        onConfirm={handleConfirmDeleteFamily}
        onCancel={handleCancelDeleteFamily}
      />
      
      {/* 退出家族确认modal */}
      <ConfirmModal
        isOpen={showLeaveModal}
        title="退出家族"
        message="确定要退出这个家族吗？"
        confirmText="确认退出"
        cancelText="取消"
        onConfirm={handleConfirmLeaveFamily}
        onCancel={handleCancelLeaveFamily}
      />
      
      {/* 通知模态框 */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notifications={notifications}
        loading={notificationsLoading}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
}
