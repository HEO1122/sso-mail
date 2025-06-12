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

export default function EditSSOUser() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState<User | null>(null);
  
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
        setFormData(data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  // 폼 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !userId) return;
    
    setSaving(true);
    
    try {
      const response = await fetch(`/api/sso/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          changed_by: 'admin' // 실제 시스템에서는 현재 로그인한 사용자 정보를 사용
        }),
      });
      
      if (response.ok) {
        alert('사용자 정보가 성공적으로 수정되었습니다.');
        router.push(`/sso/${userId}`);
      } else {
        const errorData = await response.json();
        alert(`수정 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="container mx-auto p-4">로딩 중...</div>;
  }
  
  if (error || !formData) {
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
  
  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-1">SSO 사용자 정보 수정</h1>
        <Link href={`/sso/${userId}`} className="text-blue-600 hover:underline">← 사용자 상세정보로 돌아가기</Link>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">직번</label>
              <input
                type="text"
                value={formData.emp_no}
                disabled
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-black"
              />
              <p className="mt-1 text-sm text-gray-500">직번은 수정할 수 없습니다.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">이름 <span className="text-red-600">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">기관명 <span className="text-red-600">*</span></label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">소속 부서 <span className="text-red-600">*</span></label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">직원 구분 <span className="text-red-600">*</span></label>
              <select
                name="employee_type"
                value={formData.employee_type}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="내부직원">내부직원</option>
                <option value="외주직원">외주직원</option>
                <option value="봉사원">봉사원</option>
              </select>
            </div>
            
            {formData.employee_type === '외주직원' && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">업체명 <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  name="vendor_name"
                  value={formData.vendor_name || ''}
                  onChange={handleChange}
                  required={formData.employee_type === '외주직원'}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">담당 업무</label>
              <input
                type="text"
                name="duty"
                value={formData.duty || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-1">업무 범위</label>
              <textarea
                name="work_scope"
                value={formData.work_scope || ''}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">요청자 <span className="text-red-600">*</span></label>
              <input
                type="text"
                name="requester"
                value={formData.requester}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-1">계정 상태 <span className="text-red-600">*</span></label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="등록">등록</option>
                <option value="잠금">잠금</option>
                <option value="삭제">삭제</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                상태 변경 시 자동으로 날짜가 기록됩니다:
                {formData.status === '잠금' && ' 잠금일이 현재 날짜로 설정됩니다.'}
                {formData.status === '삭제' && ' 삭제일이 현재 날짜로 설정됩니다.'}
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Link 
              href={`/sso/${userId}`}
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