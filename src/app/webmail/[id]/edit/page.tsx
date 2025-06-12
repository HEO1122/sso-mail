'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SSOUser {
  id: number;
  emp_no: string;
  name: string;
  department: string;
}

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
  linked_emp_no?: string;
  linked_name?: string;
}

export default function EditWebmailAccount() {
  const params = useParams();
  const router = useRouter();
  const accountId = params?.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ssoUsers, setSsoUsers] = useState<SSOUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState<WebmailAccount | null>(null);
  
  // SSO 사용자 목록 가져오기
  useEffect(() => {
    const fetchSSOUsers = async () => {
      try {
        const res = await fetch('/api/sso/users');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSsoUsers(data);
          }
        }
      } catch (error) {
        console.error('Error fetching SSO users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchSSOUsers();
  }, []);
  
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
        setFormData(data);
      } catch (error) {
        console.error('Error fetching webmail account:', error);
        setError('계정 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccount();
  }, [accountId]);
  
  // 폼 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    
    // SSO 사용자 선택 시 해당 부서 자동 설정
    if (name === 'user_id') {
      if (value === '') {
        // 빈 값인 경우 null로 설정
        setFormData({
          ...formData,
          user_id: null,
          department: ''
        });
        return;
      }
      
      const userId = parseInt(value, 10);
      const selectedUser = ssoUsers.find(user => user.id === userId);
      
      if (selectedUser) {
        setFormData({
          ...formData,
          user_id: userId,
          department: selectedUser.department
        });
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !accountId) return;
    
    setSaving(true);
    
    try {
      const response = await fetch(`/api/webmail/accounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('웹메일 계정 정보가 성공적으로 수정되었습니다.');
        router.push(`/webmail/${accountId}`);
      } else {
        const errorData = await response.json();
        alert(`수정 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Error updating webmail account:', error);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading || loadingUsers) {
    return <div className="container mx-auto p-4">로딩 중...</div>;
  }
  
  if (error || !formData) {
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
  
  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-1">웹메일 계정 정보 수정</h1>
        <Link href={`/webmail/${accountId}`} className="text-blue-600 hover:underline">← 계정 상세정보로 돌아가기</Link>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">연결할 SSO 사용자</label>
              <select
                name="user_id"
                value={formData.user_id?.toString() || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="">공용 계정 (연결 없음)</option>
                {ssoUsers.map(user => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.emp_no} - {user.name} ({user.department})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">메일 이름/별칭 <span className="text-red-600">*</span></label>
              <input
                type="text"
                name="mail_name"
                value={formData.mail_name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">메일 ID <span className="text-red-600">*</span></label>
              <input
                type="text"
                name="mail_id"
                value={formData.mail_id}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">메일 비밀번호</label>
              <input
                type="password"
                name="mail_password"
                value={formData.mail_password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="변경하려면 새 비밀번호 입력"
              />
              <p className="mt-1 text-sm text-gray-500">비밀번호를 변경하려면 새 비밀번호를 입력하세요. 유지하려면 비워두세요.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">소속 부서</label>
              <input
                type="text"
                name="department"
                value={formData.department || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">권한 <span className="text-red-600">*</span></label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="일반">일반</option>
                <option value="기관관리자">기관관리자</option>
                <option value="통합관리자">통합관리자</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">상태 <span className="text-red-600">*</span></label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="정상">정상</option>
                <option value="임시">임시</option>
                <option value="중지">중지</option>
                <option value="휴면">휴면</option>
                <option value="탈퇴">탈퇴</option>
                <option value="장미">장미</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">승인 상태 <span className="text-red-600">*</span></label>
              <select
                name="approval_status"
                value={formData.approval_status}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="승인대기">승인대기</option>
                <option value="승인완료">승인완료</option>
                <option value="반려">반려</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">OTP 사용 여부 <span className="text-red-600">*</span></label>
              <select
                name="otp_usage"
                value={formData.otp_usage}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="사용안함">사용안함</option>
                <option value="사용">사용</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">메일 담당자 직번</label>
              <input
                type="text"
                name="mail_manager_emp_no"
                value={formData.mail_manager_emp_no || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Link 
              href={`/webmail/${accountId}`}
              className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 transition"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 