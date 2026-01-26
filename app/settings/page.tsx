'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, updateUserProfile, uploadAvatar } from '@/app/actions/auth';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();
  
  // 用户信息状态
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
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

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      // 这里应该调用登出API
      router.push('/auth');
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
          <div className="flex items-center gap-4">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-2xl hover:bg-green-700 transition-colors"
              onClick={() => router.push('/')}
            >
              返回主页
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
            </nav>

            {/* 退出登录按钮 */}
            <div className="mt-auto pt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-red-50 text-red-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-base">退出登录</span>
              </button>
            </div>
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
                  <div className="flex flex-col items-start w-full md:w-auto">
                    <p className="text-gray-500 text-xs">已创建 0 个家族</p>
                    <p className="text-gray-500 text-xs">暂未关联任何家族</p>
                  </div>
                </div>
              </div>

              {/* 个人信息表单 */}
              <form className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
                <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">我的家族</h2>
              <p>我的家族内容将在此显示</p>
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
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;