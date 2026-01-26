'use client';

import { useState, FormEvent } from 'react';
import { login, register, resetPassword } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

type FormMode = 'login' | 'register';

export const AuthForm = () => {
  const [mode, setMode] = useState<FormMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [forgotPasswordUsername, setForgotPasswordUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmNewPasswordVisibility = () => {
    setShowConfirmNewPassword(!showConfirmNewPassword);
  };

  const openForgotPasswordModal = () => {
    setIsForgotPasswordModalOpen(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess(false);
    setForgotPasswordUsername('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };

  const closeForgotPasswordModal = () => {
    setIsForgotPasswordModalOpen(false);
    setForgotPasswordError('');
    setForgotPasswordSuccess(false);
    setForgotPasswordUsername('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };

  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setForgotPasswordError('');

    if (!forgotPasswordUsername.trim()) {
      setForgotPasswordError('请输入用户名');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotPasswordError('两次输入的密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      setForgotPasswordError('密码长度至少为6位');
      return;
    }

    setForgotPasswordLoading(true);

    try {
      // 根据您的后端API调整参数
      const result = await resetPassword({
        username: forgotPasswordUsername,
        newPassword: newPassword,
        confirmPassword: confirmNewPassword, // 添加确认密码字段
      });

      if (result.error) {
        setForgotPasswordError(result.error);
      } else {
        setForgotPasswordSuccess(true);
      }
    } catch (err) {
      setForgotPasswordError('服务器错误，请稍后再试');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 基础验证
      if (!username.trim() || !password.trim()) {
        setError('用户名和密码不能为空');
        setLoading(false);
        return;
      }

      if (mode === 'register') {
        // 注册验证
        if (!email.trim()) {
          setError('邮箱不能为空');
          setLoading(false);
          return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError('邮箱格式不正确');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('密码长度至少为6位');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('两次输入的密码不一致');
          setLoading(false);
          return;
        }

        const result = await register({
          username,
          password,
          email,
        });

        if (result.error) {
          setError(result.error);
        } else {
          // 注册成功后清理表单
          setUsername('');
          setPassword('');
          setConfirmPassword('');
          setEmail('');
          router.push('/');
        }
      } else {
        // 登录验证
        if (password.length < 6) {
          setError('密码长度至少为6位');
          setLoading(false);
          return;
        }

        const result = await login({
          username,
          password,
        });

        if (result.error) {
          setError(result.error);
        } else {
          // 登录成功后清理表单
          setUsername('');
          setPassword('');
          router.push('/');
        }
      }
    } catch (err) {
      setError('服务器错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleModeChange = (newMode: FormMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="glass-card w-full max-w-[480px] rounded-2xl p-8 sm:p-10 transition-all duration-300">
      <div className="mb-8 text-center">
        <h1 className="text-forest-dark dark:text-white text-3xl font-bold tracking-tight mb-2">
          {mode === 'login' ? '欢迎回来' : '创建账户'}
        </h1>
        <p className="text-sage-text dark:text-gray-400 text-sm">
          {mode === 'login' ? '请输入您的详细信息以访问您的家族传承。' : '注册账户以开始构建您的家族树。'}
        </p>
      </div>
      <div className="mb-8 flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white dark:bg-gray-700 shadow-sm text-forest-dark dark:text-white' : 'bg-transparent text-sage-text hover:text-forest-dark dark:text-gray-400 dark:hover:text-white'}`}
          onClick={() => handleModeChange('login')}
        >
          登录
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${mode === 'register' ? 'bg-white dark:bg-gray-700 shadow-sm text-forest-dark dark:text-white' : 'bg-transparent text-sage-text hover:text-forest-dark dark:text-gray-400 dark:hover:text-white'}`}
          onClick={() => handleModeChange('register')}
        >
          注册
        </button>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-forest-dark dark:text-gray-200">用户名</span>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={50}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-4 py-3 text-base text-forest-dark dark:text-white placeholder-sage-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all hover:bg-white dark:hover:bg-gray-800"
              placeholder="请输入用户名 (3-50个字符)"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-4 top-3.5 h-5 w-5 text-sage-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </label>
        {mode === 'register' && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-forest-dark dark:text-gray-200">电子邮箱</span>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-4 py-3 text-base text-forest-dark dark:text-white placeholder-sage-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all hover:bg-white dark:hover:bg-gray-800"
                placeholder="name@example.com"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-4 top-3.5 h-5 w-5 text-sage-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </label>
        )}
        <label className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-forest-dark dark:text-gray-200">密码</span>
            {mode === 'login' && (
              <a
                href="/auth/reset-password"
                className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline transition-all duration-300 ease-in-out"
              >
                忘记密码？
              </a>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={50}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-4 py-3 text-base text-forest-dark dark:text-white placeholder-sage-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all hover:bg-white dark:hover:bg-gray-800"
              placeholder="请输入密码 (至少6位)"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-4 top-3.5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={showPassword ? "隐藏密码" : "显示密码"}
            >
              {showPassword ? (
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
        </label>
        {mode === 'register' && (
          <label className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-forest-dark dark:text-gray-200">确认密码</span>
              {password && confirmPassword && password !== confirmPassword && (
                <span className="text-xs font-medium text-red-500 dark:text-red-400">两次输入的密码不一致</span>
              )}
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                maxLength={50}
                className={`w-full rounded-xl px-4 py-3 text-base text-forest-dark dark:text-white placeholder-sage-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all hover:bg-white dark:hover:bg-gray-800 ${password && confirmPassword && password !== confirmPassword ? 'border-red-500 dark:border-red-400 bg-red-50/50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50'}`}
                placeholder="请再次输入密码"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-4 top-3.5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={showConfirmPassword ? "隐藏密码" : "显示密码"}
              >
                {showConfirmPassword ? (
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
          </label>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-primary py-3.5 text-base font-bold text-background-dark shadow-md shadow-primary/20 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? '处理中...' : mode === 'login' ? '立即登录' : '注册'}
        </button>
      </form>
      <div className="relative my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
        <span className="text-xs font-medium text-sage-text uppercase tracking-wider">或者使用以下方式登录</span>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div className="flex gap-4 justify-center">
        <button
          type="button"
          aria-label="使用 Google 登录"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-transform hover:-translate-y-1 hover:shadow-md active:scale-95"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
        </button>
        <button
          type="button"
          aria-label="使用 Apple 登录"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-transform hover:-translate-y-1 hover:shadow-md active:scale-95"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s2.57-1.13 4.2-1c.56.02 2.16.24 3.23 1.73-.02.04-1.95 1.09-1.97 4.31.02 3.45 2.94 4.61 3.06 4.68-.02.09-.47 1.58-1.57 3.14-.97 1.39-2.01 2.81-3.66 2.72.01 0 .01 0 0 0zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.17 2.45-2.4 4.34-3.74 4.25z"></path>
          </svg>
        </button>
        <button
          type="button"
          aria-label="使用 Facebook 登录"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-transform hover:-translate-y-1 hover:shadow-md active:scale-95"
        >
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" fill="#1877F2"></path>
          </svg>
        </button>
      </div>
      <p className="mt-8 text-center text-xs text-sage-text">
        注册即表示您同意我们的
        <a href="#" className="underline decoration-sage-text/50 hover:text-forest-dark dark:hover:text-white ml-1">服务条款</a>
        和
        <a href="#" className="underline decoration-sage-text/50 hover:text-forest-dark dark:hover:text-white ml-1">隐私政策</a>。
      </p>
    </div>
);
};