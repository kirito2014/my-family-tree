'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, Users, LogIn, ChevronRight, Heart } from 'lucide-react';

export default function OnboardPage() {
  const router = useRouter();

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
          <h2 className="text-xl font-bold tracking-tight text-[#141811] dark:text-white">FamilyTree</h2>
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
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Hero section */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 text-[#141811] dark:text-white">
              开始您的家族传承之旅
            </h1>
            <p className="text-lg md:text-xl text-[#5c6f4b] dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              连接过去，拥抱未来。创建您的家族树，记录珍贵的家族历史，与亲人分享美好的回忆。
            </p>
          </div>

          {/* Action cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Create new family card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">创建新家族</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                开始构建您的家族树，添加家族成员，记录重要事件和传统。
              </p>
              <button
                onClick={() => router.push('/family/create')}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>开始创建</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Join existing family card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">加入现有家族</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                使用邀请码加入您的家族，查看和贡献家族历史。
              </p>
              <button
                onClick={() => router.push('/family/join')}
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>加入家族</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Features section */}
          <div className="mt-24 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-12">为什么选择 FamilyTree</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                  <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">记录家族历史</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  保存珍贵的家族故事、照片和重要事件，让历史代代相传。
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
                  <Users className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">连接家族成员</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  邀请家族成员加入，共同构建和管理家族树，加强亲情纽带。
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                  <BadgeCheck className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">安全可靠</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  您的家族数据受到保护，只有授权成员才能访问和修改。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
