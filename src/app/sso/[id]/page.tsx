'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  emp_no: string;
  name: string;
  organization: string;
  department: string;
  employee_type: string;
  vendor_name: string;
  duty: string;
  work_scope: string;
  status: string;
  reg_date: string;
  lock_date: string | null;
  delete_date: string | null;
  requester: string;
}

export default function SSOUserDetail() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = params?.id;
  
  // 사용자 정보 가져오기
  useEffect(() => {
    if (!userId) {
      setError('사용자 ID가 없습니다.');
      setLoading(false);
      return;
    }
    
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/sso/users/${userId}`);
        
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  const handleDelete = async () => {
    if (!userId) return;
    
    if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/sso/users/${userId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          alert('사용자가 삭제되었습니다.');
          router.push('/sso');
        } else {
          alert('사용자 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };
  
  if (loading) {
    return <div className="container mx-auto p-4">로딩 중...</div>;
  }
  
  if (error || !user) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 p-4 rounded">
          <h2 className="text-red-800 font-bold">오류</h2>
          <p className="text-red-700">{error || '사용자 정보를 불러올 수 없습니다.'}</p>
          <Link href="/sso" className="text-blue-600 hover:underline mt-2 inline-block">
            사용자 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }
  
  // 날짜 포매팅 함수
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };
  
  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-1">SSO 사용자 상세 정보</h1>
        <Link href="/sso" className="text-blue-600 hover:underline">← 사용자 목록으로 돌아가기</Link>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-semibold text-black">{user.name}</span>
              <span className="ml-2 text-gray-600">({user.emp_no})</span>
            </div>
            <div>
              <span className={`px-2 py-1 text-xs rounded-full 
                ${user.status === '등록' ? 'bg-green-100 text-green-800' : 
                user.status === '잠금' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">기본 정보</h3>
              <dl className="mt-2 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">직번</dt>
                  <dd className="text-black">{user.emp_no}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">이름</dt>
                  <dd className="text-black">{user.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">기관명</dt>
                  <dd className="text-black">{user.organization}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">소속 부서</dt>
                  <dd className="text-black">{user.department}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">직원 구분</dt>
                  <dd className="text-black">{user.employee_type}</dd>
                </div>
                {user.employee_type === '외주직원' && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">업체명</dt>
                    <dd className="text-black">{user.vendor_name || '-'}</dd>
                  </div>
                )}
              </dl>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">업무 정보</h3>
              <dl className="mt-2 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">담당 업무</dt>
                  <dd className="text-black">{user.duty || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">업무 범위</dt>
                  <dd className="text-black whitespace-pre-line">{user.work_scope || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">요청자</dt>
                  <dd className="text-black">{user.requester}</dd>
                </div>
              </dl>
              
              <h3 className="text-sm font-medium text-gray-500 mt-6">계정 상태 정보</h3>
              <dl className="mt-2 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">등록일</dt>
                  <dd className="text-black">{formatDate(user.reg_date)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">잠금일</dt>
                  <dd className="text-black">{formatDate(user.lock_date)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">삭제일</dt>
                  <dd className="text-black">{formatDate(user.delete_date)}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Link 
              href={`/sso/${user.id}/edit`}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              수정
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 