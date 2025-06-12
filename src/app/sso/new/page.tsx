'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewSSOUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    department: '',
    employee_type: '내부직원',
    vendor_name: '',
    duty: '',
    work_scope: '',
    requester: ''
  });
  
  // 폼 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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
      const response = await fetch('/api/sso/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`사용자가 성공적으로 등록되었습니다. 직번: ${data.emp_no}`);
        router.push('/sso');
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
        <h1 className="text-2xl font-bold text-black mb-1">새 SSO 사용자 등록</h1>
        <Link href="/sso" className="text-blue-600 hover:underline">← 사용자 목록으로 돌아가기</Link>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            {/* 외주직원일 경우에만 업체명 표시 */}
            {formData.employee_type === '외주직원' && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">업체명 <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  name="vendor_name"
                  value={formData.vendor_name}
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
                value={formData.duty}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-1">업무 범위</label>
              <textarea
                name="work_scope"
                value={formData.work_scope}
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
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Link 
              href="/sso"
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