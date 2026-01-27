import { AuthForm } from '@/components/AuthForm';

export default function AuthPage() {
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
        <div className="flex items-center gap-6">
          <a className="text-sm font-medium text-sage-text hover:text-primary transition-colors" href="#">帮助</a>
          <a className="text-sm font-medium text-sage-text hover:text-primary transition-colors flex items-center gap-1" href="/settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>设置</span>
          </a>
        </div>
          </header>
          
          {/* 登录注册容器 */}
          <div className="mt-8 flex justify-center">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  );
}
