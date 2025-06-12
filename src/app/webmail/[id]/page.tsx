'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface WebmailAccount {
  id: number;
  user_id: number | null;
  mail_name: string;
  mail_id: string;
  mail_password: string;
  department: string | null;
  role: string;
  status: string;
  approval_status: string;
  otp_usage: string;
  mail_manager_emp_no: string | null;
  created_at: string;
  updated_at: string;
  linked_emp_no?: string;
  linked_name?: string;
}

export default function WebmailAccountDetail() {
  const params = useParams();
  const router = useRouter();
  const accountId = params?.id;
  
  const [account, setAccount] = useState<WebmailAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 계정 정보 가져오기
  useEffect(() => {
    if (!accountId) {
      setError('계정 ID가 없습니다.');
      setLoading(false);
      return;
    }
    
    const fetchAccount = async () => {
      try {
        const res = await fetch(`/api/webmail/accounts/${accountId}`);
        
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        
        const data = await res.json();
        setAccount(data);
      } catch (error) {
        console.error('Error fetching webmail account:', error);
        setError('계정 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccount();
  }, [accountId]);
  
  const handleDelete = async () => {
    if (!accountId) return;
    
    if (confirm('정말로 이 웹메일 계정을 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/webmail/accounts/${accountId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          alert('웹메일 계정이 삭제되었습니다.');
          router.push('/webmail');
        } else {
          alert('웹메일 계정 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error deleting webmail account:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };
  
  if (loading) {
    return <div className="container mx-auto p-4">로딩 중...</div>;
  }
  
  if (error || !account) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 p-4 rounded">
          <h2 className="text-red-800 font-bold">오류</h2>
          <p className="text-red-700">{error || '계정 정보를 불러올 수 없습니다.'}</p>
          <Link href="/webmail" className="text-blue-600 hover:underline mt-2 inline-block">
            웹메일 계정 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }
  
  // 날짜 포매팅 함수
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR');
  };
  
  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-1">웹메일 계정 상세 정보</h1>
        <Link href="/webmail" className="text-blue-600 hover:underline">← 웹메일 계정 목록으로 돌아가기</Link>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-semibold text-black">{account.mail_name}</span>
              <span className="ml-2 text-gray-600">({account.mail_id})</span>
            </div>
            <div className="flex space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full 
                ${account.status === '정상' ? 'bg-green-100 text-green-800' : 
                account.status === '임시' ? 'bg-blue-100 text-blue-800' : 
                account.status === '중지' ? 'bg-yellow-100 text-yellow-800' : 
                account.status === '휴면' ? 'bg-purple-100 text-purple-800' : 
                'bg-red-100 text-red-800'}`}>
                {account.status}
              </span>
              
              <span className={`px-2 py-1 text-xs rounded-full 
                ${account.approval_status === '승인완료' ? 'bg-green-100 text-green-800' : 
                account.approval_status === '승인대기' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}`}>
                {account.approval_status}
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
                  <dt className="text-sm font-medium text-gray-500">메일 이름/별칭</dt>
                  <dd className="text-black">{account.mail_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">메일 ID</dt>
                  <dd className="text-black">{account.mail_id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">비밀번호</dt>
                  <dd className="text-black">{account.mail_password}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">소속 부서</dt>
                  <dd className="text-black">{account.department || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">연결된 SSO 사용자</dt>
                  <dd className="text-black">
                    {account.linked_name ? 
                      `${account.linked_name} (${account.linked_emp_no})` : 
                      '공용 계정 (연결된 SSO 사용자 없음)'}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">권한 및 상태 정보</h3>
              <dl className="mt-2 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">권한</dt>
                  <dd className="text-black">{account.role}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">상태</dt>
                  <dd className="text-black">{account.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">승인 상태</dt>
                  <dd className="text-black">{account.approval_status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">OTP 사용 여부</dt>
                  <dd className="text-black">{account.otp_usage}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">메일 담당자</dt>
                  <dd className="text-black">{account.mail_manager_emp_no || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">생성일</dt>
                  <dd className="text-black">{formatDate(account.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">마지막 수정일</dt>
                  <dd className="text-black">{formatDate(account.updated_at)}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Link 
              href={`/webmail/${account.id}/edit`}
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