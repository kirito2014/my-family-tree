import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from './lib/session';

// 不需要认证的路径
const publicPaths = ['/auth', '/api', '/_next', '/favicon.ico'];

// 会话超时时间（30分钟，单位：毫秒）
const SESSION_TIMEOUT = 30 * 60 * 1000;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 检查是否是公共路径
  const isPublicPath = publicPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 获取 token
  const token = cookies().get('auth-token')?.value;

  if (!token) {
    // 重定向到登录页面
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // 验证 token
  const userId = await verifyToken(token);

  if (!userId) {
    // 清除无效的 token
    cookies().delete('auth-token');
    // 重定向到登录页面
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // 检查最后活动时间
  const lastActivity = cookies().get('last-activity')?.value;
  const now = Date.now();

  if (lastActivity) {
    const lastActivityTime = parseInt(lastActivity);
    // 检查是否超时
    if (now - lastActivityTime > SESSION_TIMEOUT) {
      // 清除 token
      cookies().delete('auth-token');
      cookies().delete('last-activity');
      // 重定向到登录页面
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // 更新最后活动时间
  const response = NextResponse.next();
  response.cookies.set('last-activity', now.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: '/',
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
