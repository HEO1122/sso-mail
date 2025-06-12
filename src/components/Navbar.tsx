'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname() || '';
  
  // Function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path === '/sso' && (pathname === '/sso' || pathname.startsWith('/sso/'))) return true;
    if (path === '/webmail' && (pathname === '/webmail' || pathname.startsWith('/webmail/'))) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-lg font-bold text-blue-600">계정 관리 시스템</span>
            </div>
            <div className="ml-10 flex items-center space-x-4">
              <Link 
                href="/sso"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/sso') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                SSO 계정 관리
              </Link>
              <Link 
                href="/webmail"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/webmail') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                웹메일 계정 관리
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 