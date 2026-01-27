'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinFamily } from '@/app/actions/auth';
import { BadgeCheck, LogIn, ChevronLeft } from 'lucide-react';

export default function JoinFamilyPage() {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await joinFamily(inviteCode);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        // 3秒后跳转到家族页面
        setTimeout(() => {
          router.push('/family');
        }, 3000);
      }
    } catch (err) {
      setError('加入家族失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-[#dbead5] dark:bg-primary/10 rounded-full blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5 w-full">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => router.back()}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-transparent rounded-lg shadow-md">
              <img src="/favicon.ico" alt="Logo" className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#141811] dark:text-white">FamilyTree</h2>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md backdrop-blur-md bg-white/60 dark:bg-black/40 border border-white/50 dark:border-white/10 rounded-2xl shadow-xl p-6 md:p-9 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
              <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-3 text-[#141811] dark:text-white">加入现有家族</h1>
            <p className="text-[#5c6f4b] dark:text-gray-300 text-base leading-relaxed">
              输入邀请码加入您的家族，开始探索和贡献家族历史。
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm flex items-center gap-2">
              <BadgeCheck className="w-5 h-5" />
              <span>加入家族成功！正在跳转到家族页面...</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#141811] dark:text-white/90" htmlFor="invite-code">
                邀请码
              </label>
              <input 
                className="w-full bg-white/80 dark:bg-white/5 border border-[#e0e6db] dark:border-white/10 text-[#141811] dark:text-white rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium text-sm"
                id="invite-code"
                placeholder="例如：TREE-ABCD-1234"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
              />
            </div>
            
            <div className="pt-3 flex flex-col gap-3">
              <button 
                className="w-full bg-primary hover:bg-primary-hover active:scale-[0.98] transition-all text-white font-bold text-base py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? '加入中...' : (
                  <>
                    <span>加入家族</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/onboard')}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                返回选择
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
