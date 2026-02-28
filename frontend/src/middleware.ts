import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply to /api-proxy/*
  if (request.nextUrl.pathname.startsWith('/api-proxy/')) {
    // Determine the external backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://socialmedia-0qzd.onrender.com";
    
    // Rewrite path from /api-proxy/foo to /foo
    const newPath = request.nextUrl.pathname.replace(/^\/api-proxy/, '');
    const url = new URL(newPath + request.nextUrl.search, backendUrl);
    
    // Create new headers
    const headers = new Headers(request.headers);
    const token = request.cookies.get('token')?.value;
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Return rewritten response with modified headers
    return NextResponse.rewrite(url, {
      request: {
        headers,
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api-proxy/:path*',
};
