// src/app/users/new/page.tsx
'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewUser() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    department: '',
    employee_type: '',
    account_type: 'SSO', // 기본값 'SSO'로 설정
    vendor_name: '',
    duty: '',
    work_scope: '',
    requester: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/');
      } else {
        alert('사용자 등록 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('사용자 등록 중 오류가 발생했습니다.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">새 사용자 등록</h1>
        <Link 
          href="/"
          className="bg-gray-600 text-white text-lg px-6 py-3 rounded-lg hover:bg-gray-700 transition shadow-md"
        >
          목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-300">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-lg font-semibold text-black mb-2">이름</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 text-lg border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-black mb-2">기관명</label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full p-3 text-lg border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-black mb-2">부서</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-3 text-lg border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-black mb-2">직원구분</label>
              <select
                name="employee_type"
                value={formData.employee_type}
                onChange={handleChange}
                className="w-full p-3 text-lg border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                required
              >
                <option value="">선택하세요</option>
                <option value="봉사원">봉사원</option>
                <option value="외주직원">외주직원</option>
                <option value="내부직원">내부직원</option>
              </select>
            </div>
            {/* 계정 유형 선택 필드 추가 */}
            <div>
              <label className="block text-lg font-semibold text-black mb-2">계정 유형</label>
              <select
                name="account_type"
                value={formData.account_type}
                onChange={handleChange}
                className="w-full p-3 text-lg border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                required
              >
                <option value="SSO">SSO</option>
                <option value="WEBMAIL">WEBMAIL</option>
              </select>
            </div>
            <div>
              <label className="block text-lg font-semibold text-black mb-2">업체명</label>
              <input
                type="text"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleChange}
                className="w-full p-3 text-lg border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                placeholder="외주직원인 경우 입력하세요"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-black mb-2">담당업무</label>
              <input
                type="text"
                name="duty"
                value={formData.duty}
                onChange={handleChange}
                className="w-full p-3 text-lg border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-black mb-2">요청자</label>
              <input
                type="text"
                name="requester"
                value={formData.requester}
                onChange={handleChange}
                className="w-full p-3 text-lg border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-lg font-semibold text-black mb-2">업무범위</label>
              <textarea
                name="work_scope"
                value={formData.work_scope}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 text-lg border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
                required
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="submit"
              className="bg-blue-600 text-white text-lg px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow-md font-bold"
            >
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}