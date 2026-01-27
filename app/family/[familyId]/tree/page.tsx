'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Home, Users, Settings, Menu, X, ChevronLeft } from 'lucide-react';

export default function FamilyTreePage() {
  const router = useRouter();
  const params = useParams();
  const familyId = params.familyId as string;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => router.back()}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 bg-primary/20 rounded-xl text-primary-dark">
              <img src="/favicon.ico" alt="Logo" className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[#141811] dark:text-white">家族树</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Settings size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Users size={20} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            家族树编辑器
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            这里是家族树的编辑界面，您可以在此添加和管理家族成员。
          </p>
          <div className="w-64 h-64 bg-white dark:bg-gray-900 rounded-xl shadow-md flex items-center justify-center border border-gray-200 dark:border-gray-800">
            <p className="text-gray-400 dark:text-gray-600">Canvas 渲染区域</p>
          </div>
        </div>
      </main>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden">
          <div className="absolute top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 bg-primary/20 rounded-xl text-primary-dark">
                  <img src="/favicon.ico" alt="Logo" className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-[#141811] dark:text-white">FamilyTree</h2>
              </div>
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              <button
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  router.push('/');
                  setIsMenuOpen(false);
                }}
              >
                <Home size={18} />
                <span>首页</span>
              </button>
              <button
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  router.push('/family');
                  setIsMenuOpen(false);
                }}
              >
                <Users size={18} />
                <span>家族</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
