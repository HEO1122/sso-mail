// src/app/page.tsx
'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to SSO management page
    router.replace('/sso');
  }, [router]);

  // Return a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-2">리다이렉트 중...</p>
      </div>
    </div>
  );
}