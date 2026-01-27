'use client';

import { useState, useEffect } from 'react';
import { createFamily, getCurrentUser } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { BadgeCheck, MessageSquareQuote, Globe, ChevronDown, ArrowRight, Users, Home } from 'lucide-react';

export default function CreateFamilyPage() {
  const [familyName, setFamilyName] = useState('');
  const [motto, setMotto] = useState('');
  const [region, setRegion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [createdFamilyId, setCreatedFamilyId] = useState<string | null>(null);
  const [hasFamilies, setHasFamilies] = useState<boolean>(false);
  const [checkingFamilies, setCheckingFamilies] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserFamilies = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          // 检查用户是否有家族
          const response = await fetch('/api/families', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            setHasFamilies(data.families && data.families.length > 0);
          }
        }
      } catch (error) {
        console.error('检查用户家族失败:', error);
      } finally {
        setCheckingFamilies(false);
      }
    };

    checkUserFamilies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await createFamily(familyName, motto, region);
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.family) {
        // 创建成功后显示modal
        setCreatedFamilyId(result.family.id);
        setShowModal(true);
      }
    } catch (err) {
      setError('创建家族失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalAction = (addMembers: boolean) => {
    setShowModal(false);
    if (addMembers && createdFamilyId) {
      // 跳转到tree页面添加成员
      router.push(`/family/${createdFamilyId}/tree`);
    } else {
      // 跳转到家族列表页面
      router.push('/family');
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-[#dbead5] dark:bg-primary/10 rounded-full blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-primary/15 rounded-full blur-2xl opacity-40"></div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5 w-full">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-transparent rounded-lg shadow-md">
            <img src="/favicon.ico" alt="Logo" className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#141811] dark:text-white">Ancestry Roots</h2>
        </div>
        <div className="flex items-center gap-6">
          <a className="text-sm font-medium text-[#141811]/70 dark:text-white/70 hover:text-[#141811] dark:hover:text-white" href="#">帮助</a>
          <a className="text-sm font-medium text-[#141811]/70 dark:text-white/70 hover:text-[#141811] dark:hover:text-white flex items-center gap-1" href="/settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>设置</span>
          </a>
          {/* User avatar will be added here */}
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-[420px] backdrop-blur-md bg-white/60 dark:bg-black/40 border border-white/50 dark:border-white/10 rounded-2xl shadow-xl p-6 md:p-9 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-green-800 dark:text-primary">第 1 步 / 共 3 步</span>
            <div className="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
          </div>
          
          <div className="mb-6 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-3 text-[#141811] dark:text-white">开启您的家族传承</h1>
            <p className="text-[#5c6f4b] dark:text-gray-300 text-base leading-relaxed">
              让我们为您种下历史的根基。请输入基本信息以开启您的旅程。
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#141811] dark:text-white/90" htmlFor="family-name">
                家族名称
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-800 transition-colors">
                  <BadgeCheck size={18} />
                </div>
                <input 
                  className="w-full bg-white/80 dark:bg-white/5 border border-[#e0e6db] dark:border-white/10 text-[#141811] dark:text-white rounded-xl py-2.5 pl-10 pr-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium text-sm" 
                  id="family-name" 
                  placeholder="例如：王氏家族" 
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#141811] dark:text-white/90" htmlFor="motto">
                家族家训 <span className="font-normal text-gray-400 ml-1">(选填)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-800 transition-colors">
                  <MessageSquareQuote size={18} />
                </div>
                <input 
                  className="w-full bg-white/80 dark:bg-white/5 border border-[#e0e6db] dark:border-white/10 text-[#141811] dark:text-white rounded-xl py-2.5 pl-10 pr-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium text-sm" 
                  id="motto" 
                  placeholder="例如：家和万事兴" 
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#141811] dark:text-white/90" htmlFor="region">
                发源地/地区
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-800 transition-colors">
                  <Globe size={18} />
                </div>
                <select 
                  className="w-full appearance-none bg-white/80 dark:bg-white/5 border border-[#e0e6db] dark:border-white/10 text-[#141811] dark:text-white rounded-xl py-2.5 pl-10 pr-8 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium cursor-pointer text-sm" 
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                >
                  <option className="text-gray-400"  value="">选择地区</option>
                  <option value="nam">北美洲</option>
                  <option value="sam">南美洲</option>
                  <option value="eu">欧洲</option>
                  <option value="as">亚洲</option>
                  <option value="af">非洲</option>
                  <option value="oc">大洋洲</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
            
            <div className="pt-3 flex flex-col gap-3">
              <button 
                className="w-full bg-primary hover:bg-[#72d411] active:scale-[0.98] transition-all text-[#192210] font-bold text-base py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? '创建中...' : (
                  <>
                    <span>完成创建</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  if (hasFamilies) {
                    router.push('/family');
                  } else {
                    router.push('/onboard');
                  }
                }}
                className="text-center text-sm font-medium text-[#5c6f4b] dark:text-gray-400 hover:text-[#141811] dark:hover:text-white transition-colors w-full bg-transparent border-none cursor-pointer py-2"
              >
                取消并返回
              </button>
            </div>
          </form>
        </div>
        
        {/* Right side illustration */}
        <div className="hidden xl:block absolute right-16 top-1/2 -translate-y-1/2 w-[225px] pointer-events-none opacity-80">
          <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-xl rotate-3 border-3 border-white/50">
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCSmBlrVinMElR5d2X2pOGK3QZI1qWd-p4sBz8RFhMfc9fdnAauplA6uy9XePtXIyYsiRXJ6r01EX2jyoicaAN_8_B84nlHv-4eewHYIB0dpnlvBL0nJZIQmSbq5iqJtXDeSKFxhApTJhKEC7P4lvisyoowiaPcJdjpXVxENPirTcqUjYTuxg_jAW_E-q7JOXDOK6t8vCZJ1Oipa6sKLTZi8q7U5Ldm_hAAEjB0FEbl6KGqpOIhGmz0k7VlWe1fYu73of8E9PdHIoHJ)' }}></div>
            <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <BadgeCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">家族创建成功！</h2>
              <p className="text-gray-600 dark:text-gray-300">
                您的家族已经成功创建，现在您可以选择立即添加家族成员或稍后再添加。
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleModalAction(true)}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                <span>立即添加成员</span>
              </button>
              <button
                onClick={() => handleModalAction(false)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                <span>稍后添加，进入家族</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
