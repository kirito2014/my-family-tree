'use client';

import { useState, useEffect } from 'react';
import { FamilyTreeCanvas } from '@/components/FamilyTreeCanvas';
import { getCurrentUser } from '@/app/actions/auth';
import { FamilyOnboarding } from '@/components/FamilyOnboarding';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [hasFamilies, setHasFamilies] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserFamilies = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // 这里应该检查用户是否有家族，暂时假设用户没有家族
          // 实际项目中，应该调用API检查用户的家族关系
          setHasFamilies(false);
        }
      } catch (error) {
        console.error('检查用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserFamilies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {hasFamilies ? (
        <>
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">家族树</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/settings')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  进入设置
                </button>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">家族关系图谱</h2>
              <FamilyTreeCanvas />
            </div>
          </main>
        </>
      ) : (
        <FamilyOnboarding />
      )}
    </div>
  );
}