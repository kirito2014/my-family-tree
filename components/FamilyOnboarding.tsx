'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FamilyOnboardingProps {
  // 可以添加任何需要的 props
}

export const FamilyOnboarding = ({}: FamilyOnboardingProps) => {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreateFamily = () => {
    // 这里应该导航到创建家族的页面
    // 暂时跳转到主页，实际项目中应该跳转到创建家族的表单页面
    router.push('/');
  };

  const handleJoinFamily = () => {
    setShowJoinForm(true);
    setError('');
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!joinCode.trim()) {
      setError('请输入加入码');
      return;
    }

    // 这里应该调用 API 来加入家族
    // 暂时跳转到主页，实际项目中应该验证加入码并加入家族
    console.log('加入家族，代码:', joinCode);
    router.push('/');
  };

  const handleBack = () => {
    setShowJoinForm(false);
    setJoinCode('');
    setError('');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="absolute inset-0 z-0 bg-pattern opacity-40 pointer-events-none" style={{ backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-lighten"></div>
      <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-[#dcfce7] dark:bg-[#2d3b22] rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-lighten"></div>
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="w-full max-w-7xl mx-auto">
          <header className="flex items-center justify-between px-10 py-6">
            <div className="flex items-center gap-3">
              <div className="size-8 flex items-center justify-center rounded-lg shadow-sm">
                <img src="/favicon.ico" alt="FamilyTree Logo" className="h-5 w-5" />
              </div>
              <h2 className="text-forest-dark dark:text-white text-xl font-bold tracking-tight">FamilyTree</h2>
            </div>
            <div className="flex items-center gap-3">
              {/* 进入设置按钮 */}
              <button
                onClick={() => router.push('/settings')}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                进入设置
              </button>
            </div>
          </header>

          <main className="flex flex-col items-center justify-center px-4 py-16">
            {!showJoinForm ? (
              <div className="w-full max-w-4xl text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">欢迎来到您的家族树</h1>
                <p className="text-gray-600 mb-12">您今天想如何开始？请选择以下选项开启您的旅程。</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 创建新家族 */}
                  <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow transition-transform duration-300 hover:scale-105">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">创建新家族</h2>
                      <p className="text-gray-600 mb-6">从零开始建立您的家族树。您将成为新数字遗产的第一个分支。</p>
                      <button
                        onClick={handleCreateFamily}
                        className="text-green-600 font-medium flex items-center gap-2 hover:text-green-700 transition-colors"
                      >
                        开始设置
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* 加入现有家族 */}
                  <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow transition-transform duration-300 hover:scale-105">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">加入现有家族</h2>
                      <p className="text-gray-600 mb-6">拥有邀请码？立即与亲戚联系并探索你们共同的历史。</p>
                      <button
                        onClick={handleJoinFamily}
                        className="text-green-600 font-medium flex items-center gap-2 hover:text-green-700 transition-colors"
                      >
                        输入代码
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center gap-2 mb-6">
                  <button
                    onClick={handleBack}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">加入现有家族</h2>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleJoinSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="join-code" className="block text-sm font-medium text-gray-700 mb-1">
                      邀请码
                    </label>
                    <input
                      id="join-code"
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="请输入邀请码"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      加入家族
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>

          <footer className="py-8 px-4 text-center text-sm text-gray-500">
            <div className="flex justify-center gap-4 mb-4">
              <a href="#" className="hover:text-primary transition-colors">隐私政策</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">服务条款</a>
            </div>
            <p>© 2023 FamilyTree. 保留所有权利。</p>
          </footer>
        </div>
      </div>
    </div>
  );
};
