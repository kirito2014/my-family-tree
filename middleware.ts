import { NextRequest, NextResponse } from 'next/server';
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
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // 重定向到登录页面
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // 验证 token
  const userId = await verifyToken(token);

  if (!userId) {
    // 清除无效的 token
    // 在重定向响应中删除cookie
    const response = NextResponse.redirect(new URL('/auth', request.url));
    response.cookies.delete('auth-token');
    return response;
  }

  // 检查最后活动时间
  const lastActivity = request.cookies.get('last-activity')?.value;
  const now = Date.now();

  if (lastActivity) {
    const lastActivityTime = parseInt(lastActivity);
    // 检查是否超时
    if (now - lastActivityTime > SESSION_TIMEOUT) {
      // 清除 token
      // 在重定向响应中删除cookies
      const timeoutResponse = NextResponse.redirect(new URL('/auth', request.url));
      timeoutResponse.cookies.delete('auth-token');
      timeoutResponse.cookies.delete('last-activity');
      return timeoutResponse;
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
