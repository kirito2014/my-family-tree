'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TreeDeciduous, Users, ArrowRight, UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { joinFamily, createFamily } from '@/app/actions/auth';
import Link from 'next/link';

export default function FamilyOnboarding() {
  const [view, setView] = useState<'initial' | 'join' | 'create'>('initial');
  const [joinCode, setJoinCode] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await joinFamily(joinCode);
      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(result.error || '加入失败，请检查邀请码');
      }
    } catch (err) {
      setError('发生系统错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await createFamily(familyName);
      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(result.error || '创建失败');
      }
    } catch (err) {
      setError('发生系统错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 修改点 1: 添加 [scrollbar-gutter:stable] 防止滚动条导致的布局偏移
    // 修改点 2: 保持 overflow-x-hidden 防止水平溢出
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f7f8f6] [scrollbar-gutter:stable]">
      {/* 背景装饰 - 保持 fixed 定位以免干扰布局 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-[#80ec13]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="w-full px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-[#141811] font-bold text-xl select-none">
          <div className="p-2 bg-[#80ec13] rounded-lg shadow-sm">
            <TreeDeciduous size={24} className="text-[#192210]" />
          </div>
          <span>FamilyTree</span>
        </div>
        
        {/* 右侧按钮区域 - 使用固定的最小宽度容器，防止按钮文字长度不同导致的微小位移 */}
        <div className="flex justify-end min-w-[100px]">
          {view === 'initial' && (
            <button 
              onClick={() => router.push('/auth')}
              className="px-5 py-2.5 rounded-xl bg-white text-[#141811] font-bold shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-100"
            >
              登录
            </button>
          )}

          {view !== 'initial' && (
            <button 
              onClick={() => {
                setView('initial');
                setError('');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/80 hover:bg-white text-[#5c6f4b] hover:text-[#141811] font-medium transition-all active:scale-95 backdrop-blur-sm"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">返回</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full max-w-5xl mx-auto">
        
        {/* 初始选择界面 */}
        {view === 'initial' && (
          <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-500">
            {/* 加入家族卡片 */}
            <button 
              onClick={() => setView('join')}
              className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 text-center h-[400px] overflow-hidden border border-transparent hover:border-[#80ec13]/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#80ec13]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-24 h-24 bg-[#f7f8f6] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users size={40} className="text-[#5c6f4b] group-hover:text-[#80ec13] transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-[#141811] mb-3">加入现有家族</h2>
              <p className="text-[#5c6f4b] px-8 mb-8">
                使用邀请码加入您家人的空间，立即查看完整的家族树。
              </p>
              <div className="flex items-center gap-2 text-[#80ec13] font-bold group-hover:gap-4 transition-all">
                <span>开始加入</span>
                <ArrowRight size={20} />
              </div>
            </button>

            {/* 创建家族卡片 */}
            <Link 
              href="/family/create"
              className="group relative flex flex-col items-center justify-center p-8 bg-[#141811] rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 text-center h-[400px] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#80ec13]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                <UserPlus size={40} className="text-[#80ec13]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">创建新家族</h2>
              <p className="text-gray-400 px-8 mb-8">
                从零开始建立您的数字家谱，邀请亲人共同协作。
              </p>
              <div className="flex items-center gap-2 text-[#80ec13] font-bold group-hover:gap-4 transition-all">
                <span>创建家族</span>
                <ArrowRight size={20} />
              </div>
            </Link>
          </div>
        )}

        {/* 加入家族表单 */}
        {view === 'join' && (
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#f7f8f6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-[#80ec13]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#141811]">加入家族</h2>
                  <p className="text-[#5c6f4b] mt-2">请输入管理员分享给您的邀请码</p>
                </div>

                <form onSubmit={handleJoinSubmit} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      placeholder="输入邀请码 (例如: FAM-123456)"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="w-full px-6 py-4 bg-[#f7f8f6] border-2 border-transparent focus:border-[#80ec13] rounded-2xl outline-none transition-all text-center text-lg font-bold tracking-wider placeholder:font-normal"
                      autoFocus
                    />
                    {error && (
                      <p className="text-red-500 text-sm text-center mt-2 animate-pulse">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !joinCode}
                    className="w-full bg-[#80ec13] hover:bg-[#72d411] disabled:opacity-50 disabled:cursor-not-allowed text-[#192210] font-bold py-4 rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" /> 正在验证...
                      </>
                    ) : (
                      <>
                        确认加入 <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}