'use client';

import { useState, FormEvent } from 'react';
import { resetPassword } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const router = useRouter();

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmNewPasswordVisibility = () => {
    setShowConfirmNewPassword(!showConfirmNewPassword);
  };

  const handleResetPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }

    if (!newPassword.trim()) {
      setError('请输入新密码');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({
        username,
        newPassword,
        confirmPassword: confirmNewPassword,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('密码重置成功，请使用新密码登录');
        // 3秒后跳转到登录页面
        setTimeout(() => {
          router.push('/auth');
        }, 3000);
      }
    } catch (err) {
      setError('服务器错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="absolute inset-0 z-0 bg-pattern opacity-40 pointer-events-none" style={{ backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-lighten"></div>
      <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-[#dcfce7] dark:bg-[#2d3b22] rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-lighten"></div>
      <div className="relative z-10 flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto">
          {/* 头部 */}
          <header className="flex items-center justify-between px-10 py-6">
            <div className="flex items-center gap-3">
              <div className="size-8 flex items-center justify-center rounded-lg shadow-sm">
                <img src="/favicon.ico" alt="FamilyTree Logo" className="h-5 w-5" />
              </div>
              <h2 className="text-forest-dark dark:text-white text-xl font-bold tracking-tight">FamilyTree</h2>
            </div>
            <a className="text-sm font-medium text-sage-text hover:text-primary transition-colors" href="#">帮助</a>
          </header>
          
          {/* 重置密码容器 */}
          <div className="mt-8 flex justify-center">
            <div className="glass-card w-full max-w-[480px] rounded-2xl p-8 sm:p-10 transition-all duration-300">
              <div className="mb-8 text-center">
                <h1 className="text-forest-dark dark:text-white text-3xl font-bold tracking-tight mb-2">
                  重置密码
                </h1>
                <p className="text-sage-text dark:text-gray-400 text-sm">
                  请输入您的用户名和新密码以重置您的账户密码
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-forest-dark dark:text-gray-200 mb-1.5">
                    用户名
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    maxLength={50}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-4 py-3 text-base text-forest-dark dark:text-white placeholder-sage-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all hover:bg-white dark:hover:bg-gray-800"
                    placeholder="请输入您的用户名"
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-forest-dark dark:text-gray-200 mb-1.5">
                    新密码
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      maxLength={50}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-4 py-3 text-base text-forest-dark dark:text-white placeholder-sage-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all hover:bg-white dark:hover:bg-gray-800"
                      placeholder="请输入新密码 (至少6位)"
                    />
                    <button
                      type="button"
                      onClick={toggleNewPasswordVisibility}
                      className="absolute right-4 top-3.5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label={showNewPassword ? "隐藏密码" : "显示密码"}
                    >
                      {showNewPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sage-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.723m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878l-3.29-3.29m7.532 7.532l3.29 3.29M9.878 9.878a3 3 0 10-4.243-4.243" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sage-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="confirm-new-password" className="block text-sm font-medium text-forest-dark dark:text-gray-200">
                      确认新密码
                    </label>
                    {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                      <span className="text-xs font-medium text-red-500 dark:text-red-400">两次输入的密码不一致</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="confirm-new-password"
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      minLength={6}
                      maxLength={50}
                      className={`w-full rounded-xl px-4 py-3 text-base text-forest-dark dark:text-white placeholder-sage-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all hover:bg-white dark:hover:bg-gray-800 ${newPassword && confirmNewPassword && newPassword !== confirmNewPassword ? 'border-red-500 dark:border-red-400 bg-red-50/50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50'}`}
                      placeholder="请再次输入新密码"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmNewPasswordVisibility}
                      className="absolute right-4 top-3.5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label={showConfirmNewPassword ? "隐藏密码" : "显示密码"}
                    >
                      {showConfirmNewPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sage-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.723m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878l-3.29-3.29m7.532 7.532l3.29 3.29M9.878 9.878a3 3 0 10-4.243-4.243" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sage-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-primary py-3.5 text-base font-bold text-background-dark shadow-md shadow-primary/20 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? '处理中...' : '重置密码'}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push('/auth')}
                    className="text-sm font-medium text-sage-text hover:text-primary transition-all duration-300 ease-in-out"
                  >
                    返回登录
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
