'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function SSOUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // 검색 조건 상태
  const [searchCriteria, setSearchCriteria] = useState({
    emp_no: '',
    name: '',
    organization: '',
    department: '',
    employee_type: '',
    status: '',
    requester: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // 사용자 목록을 가져오는 함수
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sso/users');
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setUsers(data);
        setFilteredUsers(data); // 초기에는 모든 사용자 표시
      } else {
        console.error('API did not return an array:', data);
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 조건 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchCriteria({
      ...searchCriteria,
      [name]: value
    });
  };

  // 검색 실행 함수
  const handleSearch = () => {
    const filtered = users.filter(user => {
      // 모든 검색 조건을 AND 조건으로 적용
      return (
        (searchCriteria.emp_no === '' || user.emp_no.includes(searchCriteria.emp_no)) &&
        (searchCriteria.name === '' || user.name.includes(searchCriteria.name)) &&
        (searchCriteria.organization === '' || user.organization.includes(searchCriteria.organization)) &&
        (searchCriteria.department === '' || user.department.includes(searchCriteria.department)) &&
        (searchCriteria.employee_type === '' || user.employee_type === searchCriteria.employee_type) &&
        (searchCriteria.status === '' || user.status === searchCriteria.status) &&
        (searchCriteria.requester === '' || user.requester.includes(searchCriteria.requester))
      );
    });
    
    setFilteredUsers(filtered);
  };

  // 검색 조건 초기화 함수
  const resetSearch = () => {
    setSearchCriteria({
      emp_no: '',
      name: '',
      organization: '',
      department: '',
      employee_type: '',
      status: '',
      requester: ''
    });
    setFilteredUsers(users);
  };

  // 사용자 삭제 핸들러
  const handleDelete = async (id: number) => {
    if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/sso/users/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchUsers(); // 삭제 후 목록 새로고침
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">SSO 사용자 계정 관리</h1>
        </div>
        <div className="flex space-x-2">
          <Link 
            href="/dashboard" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            대시보드
          </Link>
          <Link 
            href="/test-dashboard" 
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            테스트 대시보드
          </Link>
          <Link 
            href="/sso/new" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            새 SSO 사용자 등록
          </Link>
        </div>
      </div>

      {/* 검색 조건 섹션 */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-black mb-4">검색 조건</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">직번</label>
            <input
              type="text"
              name="emp_no"
              value={searchCriteria.emp_no}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">이름</label>
            <input
              type="text"
              name="name"
              value={searchCriteria.name}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">기관명</label>
            <input
              type="text"
              name="organization"
              value={searchCriteria.organization}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">부서</label>
            <input
              type="text"
              name="department"
              value={searchCriteria.department}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">직원구분</label>
            <select
              name="employee_type"
              value={searchCriteria.employee_type}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">전체</option>
              <option value="봉사원">봉사원</option>
              <option value="외주직원">외주직원</option>
              <option value="내부직원">내부직원</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">상태</label>
            <select
              name="status"
              value={searchCriteria.status}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">전체</option>
              <option value="등록">등록</option>
              <option value="잠금">잠금</option>
              <option value="삭제">삭제</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">요청자</label>
            <input
              type="text"
              name="requester"
              value={searchCriteria.requester}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <button 
            onClick={resetSearch}
            className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            초기화
          </button>
          <button 
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            검색
          </button>
        </div>
      </div>

      {/* 검색 결과 표시 */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <p className="text-black">총 <span className="font-bold">{filteredUsers.length}</span>명의 사용자가 검색되었습니다.</p>
        </div>
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-black">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">직번</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">기관명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">부서</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">직원구분</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">요청자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">관리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.emp_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.organization}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.employee_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.status === '등록' ? 'bg-green-100 text-green-800' : 
                        user.status === '잠금' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.requester}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        href={`/sso/${user.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        상세
                      </Link>
                      <Link 
                        href={`/sso/${user.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        수정
                      </Link>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 