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
            <a className="text-sm font-medium text-sage-text hover:text-primary transition-colors" href="#">帮助</a>
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
