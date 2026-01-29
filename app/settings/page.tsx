'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser, updateUserProfile, uploadAvatar, logout } from '@/app/actions/auth';
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead, createNotification } from '@/app/actions/notification';
import ConfirmModal from '@/components/ConfirmModal';
import NotificationModal from '@/components/NotificationModal';

const prisma = new PrismaClient();

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();
  
  // 通知相关状态
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(false);
  
  // 从URL参数获取默认选中的标签页
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['profile', 'family', 'tree', 'system', 'permissions'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);
  
  // 加载未读通知数
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const result = await getUnreadNotificationCount();
        if (!result.error) {
          setUnreadCount(result.count || 0);
        } else {
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('加载未读通知数失败:', error);
        setUnreadCount(0);
      }
    };
    
    loadUnreadCount();
  }, []);
  
  // 用户信息状态
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // 家族信息状态
  const [families, setFamilies] = useState<any[]>([]);
  const [familiesLoading, setFamiliesLoading] = useState<boolean>(false);
  const [familiesError, setFamiliesError] = useState<string>('');
  
  // 表单数据状态
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    phone: '',
    email: '',
    location: '',
    bio: ''
  });
  
  // 初始表单数据，用于比较是否有变更
  const [initialFormData, setInitialFormData] = useState({
    name: '',
    nickname: '',
    phone: '',
    email: '',
    location: '',
    bio: ''
  });
  
  // 图片上传状态
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  
  // 确认modal状态
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [familyToDelete, setFamilyToDelete] = useState<string | null>(null);
  const [familyToEdit, setFamilyToEdit] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    motto: '',
    location: '',
    avatar: ''
  });
  
  // 加载用户信息
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const userData = {
            name: currentUser.name || '',
            nickname: currentUser.nickname || '',
            phone: currentUser.phone || '',
            email: currentUser.email || '',
            location: currentUser.location || '',
            bio: currentUser.bio || ''
          };
          setFormData(userData);
          setInitialFormData(userData);
        }
      } catch (err) {
        setError('加载用户信息失败');
        console.error('加载用户信息失败:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // 加载家族信息
  useEffect(() => {
    const loadFamilies = async () => {
      setFamiliesLoading(true);
      setFamiliesError('');
      try {
        const response = await fetch('/api/families', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setFamilies(data.families || []);
        } else {
          setFamiliesError('获取家族信息失败');
          setFamilies([]);
        }
      } catch (err) {
        setFamiliesError('获取家族信息失败');
        setFamilies([]);
        console.error('获取家族信息失败:', err);
      } finally {
        setFamiliesLoading(false);
      }
    };
    
    loadFamilies();
  }, []);

  // 加载通知
  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const result = await getNotifications();
      if (!result.error) {
        setNotifications(result.notifications);
        // 更新未读计数
        const unread = result.notifications.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('加载通知失败:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // 打开通知模态框
  const handleOpenNotifications = () => {
    loadNotifications();
    setShowNotificationModal(true);
  };

  // 标记通知为已读
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      // 更新本地状态
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
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
          await markNotificationAsRead(notification.id);
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

  // 申请权限提升
  const handleRequestPermission = async (family: any) => {
    try {
      await createNotification({
        recipientId: family.creatorId,
        title: '权限提升申请',
        content: `${user?.name || user?.username} 申请提升在家族 ${family.name} 中的权限级别，请审核。`,
        type: 'permission_request',
        familyId: family.id
      });
      alert('权限申请已发送，等待创建者审核');
    } catch (error) {
      console.error('发送权限申请失败:', error);
      alert('发送权限申请失败');
    }
  };

  const handleLogout = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowConfirmModal(false);
    await logout();
    router.push('/auth');
  };

  const handleCancelLogout = () => {
    setShowConfirmModal(false);
  };

  // 处理删除家族
  const handleDeleteFamily = (familyId: string) => {
    setFamilyToDelete(familyId);
    setShowDeleteModal(true);
  };

  // 确认删除家族
  const handleConfirmDeleteFamily = async () => {
    if (familyToDelete) {
      try {
        const response = await fetch(`/api/families/${familyToDelete}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          // 重新加载家族列表
          const loadFamilies = async () => {
            setFamiliesLoading(true);
            setFamiliesError('');
            try {
              const response = await fetch('/api/families', { credentials: 'include' });
              if (response.ok) {
                const data = await response.json();
                setFamilies(data.families || []);
              } else {
                setFamiliesError('获取家族信息失败');
                setFamilies([]);
              }
            } catch (err) {
              setFamiliesError('获取家族信息失败');
              setFamilies([]);
              console.error('获取家族信息失败:', err);
            } finally {
              setFamiliesLoading(false);
            }
          };
          
          await loadFamilies();
        } else {
          setFamiliesError('删除家族失败');
        }
      } catch (err) {
        setFamiliesError('删除家族失败');
        console.error('删除家族失败:', err);
      } finally {
        setShowDeleteModal(false);
        setFamilyToDelete(null);
      }
    }
  };

  // 取消删除家族
  const handleCancelDeleteFamily = () => {
    setShowDeleteModal(false);
    setFamilyToDelete(null);
  };

  // 处理编辑家族
  const handleEditFamily = (family: any) => {
    setFamilyToEdit(family);
    setEditFormData({
      name: family.name || '',
      description: family.description || '',
      motto: family.motto || '',
      location: family.location || '',
      avatar: family.avatar || ''
    });
    setShowEditModal(true);
  };

  // 处理编辑表单输入变化
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理编辑表单头像上传
  const handleEditAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 这里可以添加头像上传逻辑
      // 暂时使用Base64模拟
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setEditFormData(prev => ({
          ...prev,
          avatar: base64Image
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 保存编辑的家族信息
  const handleSaveFamilyEdit = async () => {
    if (familyToEdit) {
      try {
        const response = await fetch(`/api/families/${familyToEdit.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editFormData)
        });

        if (response.ok) {
          // 重新加载家族列表
          const loadFamilies = async () => {
            setFamiliesLoading(true);
            setFamiliesError('');
            try {
              const response = await fetch('/api/families', { credentials: 'include' });
              if (response.ok) {
                const data = await response.json();
                setFamilies(data.families || []);
              } else {
                setFamiliesError('获取家族信息失败');
                setFamilies([]);
              }
            } catch (err) {
              setFamiliesError('获取家族信息失败');
              setFamilies([]);
              console.error('获取家族信息失败:', err);
            } finally {
              setFamiliesLoading(false);
            }
          };
          
          await loadFamilies();
          setShowEditModal(false);
          setFamilyToEdit(null);
        } else {
          setFamiliesError('更新家族信息失败');
        }
      } catch (err) {
        setFamiliesError('更新家族信息失败');
        console.error('更新家族信息失败:', err);
      }
    }
  };

  // 取消编辑家族
  const handleCancelEditFamily = () => {
    setShowEditModal(false);
    setFamilyToEdit(null);
  };

  const handleGoHome = async () => {
    try {
      // 获取当前用户信息
      const currentUser = await getCurrentUser();
      if (currentUser) {
        // 检查用户是否有家族
        const response = await fetch('/api/families', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          const hasFamilies = data.families && data.families.length > 0;
          router.push(hasFamilies ? '/family' : '/onboard');
        } else {
          // 如果 API 调用失败，默认导航到 onboard
          router.push('/onboard');
        }
      } else {
        router.push('/onboard');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      router.push('/onboard');
    }
  };
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 检查表单是否有变更
  const isFormChanged = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };
  
  // 保存用户信息
  const handleSaveChanges = async () => {
    try {
      setError('');
      const result = await updateUserProfile(formData);
      if (result.success) {
        setUser(result.user);
        // 更新初始表单数据，使其与当前表单数据一致
        setInitialFormData({ ...formData });
        alert('保存成功！');
      } else {
        setError(result.error || '保存失败');
      }
    } catch (err) {
      setError('保存失败');
      console.error('保存用户信息失败:', err);
    }
  };
  
  // 处理文件输入变化
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // 立即上传
      handleUploadAvatar(file);
    }
  };
  
  // 处理图片上传
  const handleUploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      setError('');
      
      // 这里应该调用实际的图片上传API
      // 暂时使用Base64模拟
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        const result = await uploadAvatar(base64Image);
        if (result.success) {
          // 更新用户信息
          setUser((prev: any) => ({ ...prev, avatar: result.avatar }));
          alert('头像上传成功！');
        } else {
          setError(result.error || '上传失败');
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('上传失败');
      setUploading(false);
      console.error('上传头像失败:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="FamilyTree Logo" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-gray-900">FamilyTree</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* 通知按钮 */}
            <div className="relative">
              <button
                onClick={handleOpenNotifications}
                className="w-9 h-9 rounded-full bg-white shadow-sm text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200 relative"
                title="通知"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* 返回主页按钮 */}
            <button
              onClick={handleGoHome}
              className="w-9 h-9 rounded-full bg-white shadow-sm text-green-600 flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
              title="返回主页"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            
            {/* 退出登录按钮 */}
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full bg-white shadow-sm text-red-600 flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
              title="退出登录"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* 左侧导航栏 */}
        <aside className="w-full md:w-64 bg-white shadow-sm border-r border-gray-200">
          <div className="p-4 flex flex-col h-full">
            <nav className="space-y-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors ${activeTab === 'profile' ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-base">个人设置</span>
              </button>
              
              <button
                onClick={() => setActiveTab('family')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors ${activeTab === 'family' ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-base">我的家族</span>
              </button>
              
              <button
                onClick={() => setActiveTab('tree')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors ${activeTab === 'tree' ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span className="text-base">家族树设置</span>
              </button>
              
              <button
                onClick={() => setActiveTab('system')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors ${activeTab === 'system' ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-base">系统设置</span>
              </button>
              
              <button
                onClick={() => setActiveTab('permissions')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors ${activeTab === 'permissions' ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-base">权限管理</span>
              </button>
            </nav>


          </div>
        </aside>

        {/* 右侧内容区 */}
        <main className="flex-1 p-6 bg-gray-50">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* 页面标题 */}
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-[-0.033em]">个人设置</h1>
                <p className="text-sage-text text-sm font-normal leading-normal">更新您的个人信息以及您在家族树中的显示方式。</p>
              </div>

              {/* 个人资料卡片 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="relative group cursor-pointer">
                      {user?.avatar ? (
                        <div className="bg-green-100 rounded-full w-20 h-20 md:w-28 md:h-28 border-4 border-white shadow-lg flex items-center justify-center">
                          <img src={user.avatar} alt="用户头像" className="w-full h-full object-cover rounded-full" />
                        </div>
                      ) : (
                        <div className="bg-green-100 rounded-full w-20 h-20 md:w-28 md:h-28 border-4 border-white shadow-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-xl font-bold text-gray-900">{user?.name || user?.username || '用户名称'}</h2>
                      <p className="text-green-600 text-xs font-medium mb-2">家族历史记录员</p>
                      {(() => {
                        // 计算最后登录时间
                        const lastLogin = new Date(); // 这里应该从数据库获取用户的最后登录时间
                        const now = new Date();
                        const daysSinceLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
                        
                        if (daysSinceLogin <= 1) {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              活跃成员
                            </span>
                          );
                        } else if (daysSinceLogin <= 10) {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                              有时活跃
                            </span>
                          );
                        } else {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              不活跃
                            </span>
                          );
                        }
                      })()}
                    </div>
                  </div>
                  <div className="flex flex-col items-start w-full md:w-auto gap-2">
                    <div className="flex flex-col gap-1.5 items-start">
                      <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0a6 6 0 00-9 5.197" />
                        </svg>
                        <p className="text-gray-500 text-xs">已创建 {families.filter(f => f.creatorId === user?.id).length} 个家族</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <p className="text-gray-500 text-xs">已加入 {families.filter(f => f.creatorId !== user?.id).length} 个家族</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 个人信息表单 */}
              <form className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
                <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  个人信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-700">名字</label>
                    <input 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-gray-300 bg-white text-gray-900 h-10 px-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-xs font-['SimSun']" 
                      type="text" 
                      placeholder="请输入名字" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-700">昵称</label>
                    <input 
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-gray-300 bg-white text-gray-900 h-10 px-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-xs font-['SimSun']" 
                      type="text" 
                      placeholder="请输入昵称" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-700">邮箱地址</label>
                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <input 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-gray-300 bg-white text-gray-900 h-10 pl-10 pr-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-xs font-['SimSun']" 
                        type="email" 
                        placeholder="请输入邮箱地址" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-700">电话号码</label>
                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-gray-300 bg-white text-gray-900 h-10 pl-10 pr-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-xs font-['SimSun']" 
                        type="tel" 
                        placeholder="请输入电话号码" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-700">所在地</label>
                    <input 
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-gray-300 bg-white text-gray-900 h-10 px-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-xs font-['SimSun']" 
                      type="text" 
                      placeholder="请输入所在地" 
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-xs font-medium text-gray-700">个人简介</label>
                    <textarea 
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-gray-300 bg-white text-gray-900 p-3 min-h-[100px] focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none resize-y text-xs font-['SimSun']" 
                      placeholder="向家人们简单介绍一下自己..."
                      maxLength={500}
                    ></textarea>
                    <p className="text-xs text-gray-500 text-right">{formData.bio.length}/500 字</p>
                  </div>
                </div>
              </form>

              {/* 保存按钮 */}
              <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-2 sticky bottom-6 z-40">
                <button className="h-10 px-6 rounded-2xl bg-white border border-gray-300 text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition-colors" type="button">
                  取消
                </button>
                <button 
                  onClick={handleSaveChanges}
                  disabled={!isFormChanged()}
                  className={`h-10 px-6 rounded-2xl font-medium shadow-sm transition-all flex items-center justify-center gap-2 ${isFormChanged() ? 'bg-white border border-green-500 text-green-600 hover:bg-green-50' : 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed'}`} 
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  保存更改
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'family' && (
            <div className="space-y-8">
              {/* 页面标题 */}
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-[-0.033em]">我的家族</h1>
                <p className="text-sage-text text-sm font-normal leading-normal">管理您创建和加入的家族</p>
              </div>

              {/* 家族仪表盘 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">共 {families.length} 个家族</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{families.length}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 01-9.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">我创建的家族</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{families.filter(f => f.creatorId === user?.id).length}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">我加入的家族</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{families.filter(f => f.creatorId !== user?.id).length}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 01-9.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 家族列表 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">家族列表</h3>
                </div>
                
                {familiesLoading ? (
                  <div className="p-10 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                  </div>
                ) : familiesError ? (
                  <div className="p-10 text-center text-red-600">
                    {familiesError}
                  </div>
                ) : families.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-gray-500">您还没有创建或加入任何家族</p>
                    <button 
                      onClick={() => router.push('/onboard')}
                      className="mt-4 h-10 px-6 rounded-2xl bg-white border border-green-500 text-green-600 hover:bg-green-50 transition-colors"
                    >
                      创建或加入家族
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {families.map((family) => {
                      const isCreator = family.creatorId === user?.id;
                      const memberCount = family.users?.length || 0;
                      
                      return (
                        <div key={family.id} className="p-5 flex items-center justify-between gap-4">
                          {/* 头像 */}
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                            {family.avatar ? (
                              <img src={family.avatar} alt={`${family.name} Avatar`} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 01-9.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            )}
                          </div>
                          
                          {/* 家族信息 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-4">
                              <h4 className="text-base font-bold text-gray-900 truncate">{family.name}</h4>
                              <span className="text-xs text-gray-500">{new Date(family.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-500">{isCreator ? '我创建的' : '我加入的'}</span>
                              <span className="text-xs text-gray-500">{memberCount} 成员</span>
                            </div>
                          </div>
                          
                          {/* 操作栏 */}
                          <div className="flex items-center gap-2">
                            {family.role?.name === 'observer' && (
                              <button 
                                onClick={() => handleRequestPermission(family)}
                                className="h-8 px-3 rounded-xl bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors text-xs"
                              >
                                申请更高权限
                              </button>
                            )}
                            
                            {/* 基于权限显示按钮，创建者默认拥有所有权限 */}
                            {(isCreator || (family.permissions || []).some(p => p.key === 'manage_members' && p.value)) && (
                              <button 
                                className="h-8 px-3 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-xs"
                              >
                                成员管理
                              </button>
                            )}
                            
                            {(isCreator || (family.permissions || []).some(p => p.key === 'edit_family_info' && p.value)) && (
                              <button 
                                onClick={() => handleEditFamily(family)}
                                className="h-8 px-3 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-xs"
                              >
                                编辑家族
                              </button>
                            )}
                            
                            {(isCreator || (family.permissions || []).some(p => p.key === 'delete_family' && p.value)) && (
                              <button 
                                onClick={() => handleDeleteFamily(family.id)}
                                className="h-8 px-3 rounded-xl bg-white border border-red-300 text-red-600 hover:bg-red-50 transition-colors text-xs"
                              >
                                删除家族
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'tree' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">家族树设置</h2>
              <p>家族树设置内容将在此显示</p>
            </div>
          )}
          
          {activeTab === 'system' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">系统设置</h2>
              <p>系统设置内容将在此显示</p>
            </div>
          )}
          
          {activeTab === 'permissions' && (
            <div className="space-y-8">
              {/* 页面标题 */}
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-[-0.033em]">权限管理</h1>
                <p className="text-sage-text text-sm font-normal leading-normal">管理家族成员的权限级别和访问权限</p>
              </div>

              {/* 权限类别卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 观察者权限 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">观察者</h3>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">只能查看家族成员信息，无法进行任何修改操作</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">查看家族成员</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 bg-gray-100"></div>
                      <span className="text-sm text-gray-500">管理家族成员</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 bg-gray-100"></div>
                      <span className="text-sm text-gray-500">编辑家族信息</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 bg-gray-100"></div>
                      <span className="text-sm text-gray-500">删除家族</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">加入家族</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">退出家族</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 bg-gray-100"></div>
                      <span className="text-sm text-gray-500">踢出成员</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">邀请成员</span>
                    </div>
                  </div>
                </div>

                {/* 参与者权限 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 01-9.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">参与者</h3>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">可以查看和管理家族成员，参与家族活动</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">查看家族成员</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">管理家族成员</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">编辑家族信息</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 bg-gray-100"></div>
                      <span className="text-sm text-gray-500">删除家族</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">加入家族</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">退出家族</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 bg-gray-100"></div>
                      <span className="text-sm text-gray-500">踢出成员</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">邀请成员</span>
                    </div>
                  </div>
                </div>

                {/* 创造者权限 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">创造者</h3>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">拥有家族的所有权限，包括管理和删除权限</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">查看家族成员</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">管理家族成员</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">编辑家族信息</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">删除家族</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">加入家族</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">退出家族</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">踢出成员</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center bg-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">邀请成员</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 权限说明 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3">权限说明</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>观察者：适合只想了解家族历史的成员，只能查看信息，可加入和退出家族，可邀请成员</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>参与者：适合积极参与家族管理的成员，可以管理成员和编辑信息，可加入和退出家族，可邀请成员</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>创造者：家族的创建者，拥有最高权限，包括删除家族和踢出成员的权利，可加入和退出家族，可邀请成员</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* 确认modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="退出登录"
        message="是否退出登录"
        confirmText="确认"
        cancelText="取消"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
      
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
      
      {/* 编辑家族modal */}
      {showEditModal && familyToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleCancelEditFamily}
          ></div>
          <div className="relative bg-white rounded-3xl border-2 border-green-500 p-6 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">编辑家族</h3>
            <form className="space-y-4">
              {/* 头像上传 */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group cursor-pointer">
                  {editFormData.avatar ? (
                    <div className="bg-green-100 rounded-full w-24 h-24 border-4 border-white shadow-lg flex items-center justify-center">
                      <img src={editFormData.avatar} alt="家族头像" className="w-full h-full object-cover rounded-full" />
                    </div>
                  ) : (
                    <div className="bg-green-100 rounded-full w-24 h-24 border-4 border-white shadow-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 01-9.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleEditAvatarUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                </div>
                <p className="text-sm text-gray-500">点击上传家族头像</p>
              </div>
              
              {/* 家族名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">家族名称</label>
                <input 
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="w-full rounded-2xl border border-gray-300 bg-white text-gray-900 h-10 px-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-sm"
                  type="text"
                  placeholder="请输入家族名称"
                />
              </div>
              
              {/* 家族格言 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">家族格言</label>
                <input 
                  name="motto"
                  value={editFormData.motto}
                  onChange={handleEditInputChange}
                  className="w-full rounded-2xl border border-gray-300 bg-white text-gray-900 h-10 px-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-sm"
                  type="text"
                  placeholder="请输入家族格言"
                />
              </div>
              
              {/* 家族所在地 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">家族所在地</label>
                <input 
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditInputChange}
                  className="w-full rounded-2xl border border-gray-300 bg-white text-gray-900 h-10 px-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-sm"
                  type="text"
                  placeholder="请输入家族所在地"
                />
              </div>
              
              {/* 家族描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">家族描述</label>
                <textarea 
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  className="w-full rounded-2xl border border-gray-300 bg-white text-gray-900 p-3 min-h-[100px] focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none resize-y text-sm"
                  placeholder="请输入家族描述"
                ></textarea>
              </div>
            </form>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={handleCancelEditFamily}
                className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveFamilyEdit}
                className="px-6 py-2.5 rounded-2xl bg-white text-green-600 font-medium hover:bg-green-50 transition-colors border border-green-600"
              >
                保存更改
              </button>
            </div>
          </div>
        </div>
      )}

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
};

export default SettingsPage;