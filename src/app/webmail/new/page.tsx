'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SSOUser {
  id: number;
  emp_no: string;
  name: string;
  department: string;
}

export default function NewWebmailAccount() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ssoUsers, setSsoUsers] = useState<SSOUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    user_id: '',
    mail_name: '',
    mail_id: '',
    mail_password: '',
    department: '',
    role: '일반',
    status: '정상',
    approval_status: '승인대기',
    otp_usage: '사용안함',
    mail_manager_emp_no: ''
  });
  
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
  
  // 폼 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // SSO 사용자 선택 시 해당 부서 자동 설정
    if (name === 'user_id' && value) {
      const selectedUser = ssoUsers.find(user => user.id.toString() === value);
      if (selectedUser) {
        setFormData({
          ...formData,
          [name]: value,
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
    setLoading(true);
    
    try {
      const response = await fetch('/api/webmail/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`웹메일 계정이 성공적으로 등록되었습니다.`);
        router.push('/webmail');
      } else {
        const errorData = await response.json();
        alert(`등록 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-1">새 웹메일 계정 등록</h1>
        <Link href="/webmail" className="text-blue-600 hover:underline">← 웹메일 계정 목록으로 돌아가기</Link>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">연결할 SSO 사용자</label>
              <select
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="">공용 계정 (연결 없음)</option>
                {loadingUsers ? (
                  <option disabled>로딩 중...</option>
                ) : (
                  ssoUsers.map(user => (
                    <option key={user.id} value={user.id.toString()}>
                      {user.emp_no} - {user.name} ({user.department})
                    </option>
                  ))
                )}
              </select>
              <p className="mt-1 text-sm text-gray-500">공용 계정은 비워두세요.</p>
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
              <label className="block text-sm font-medium text-black mb-1">메일 비밀번호 <span className="text-red-600">*</span></label>
              <input
                type="password"
                name="mail_password"
                value={formData.mail_password}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">소속 부서</label>
              <input
                type="text"
                name="department"
                value={formData.department}
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
                value={formData.mail_manager_emp_no}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="예: Z2023001"
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Link 
              href="/webmail"
              className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 transition"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? '처리 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 