'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface WebmailAccount {
  id: number;
  user_id: number | null;
  mail_name: string;
  mail_id: string;
  department: string | null;
  role: string;
  status: string;
  approval_status: string;
  otp_usage: string;
  mail_manager_emp_no: string | null;
  created_at: string;
  updated_at: string;
}

export default function WebmailAccounts() {
  const [accounts, setAccounts] = useState<WebmailAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<WebmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // 검색 조건 상태
  const [searchCriteria, setSearchCriteria] = useState({
    mail_name: '',
    mail_id: '',
    department: '',
    role: '',
    status: '',
    approval_status: '',
    otp_usage: '',
    mail_manager_emp_no: ''
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  // 계정 목록을 가져오는 함수
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webmail/accounts');
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setAccounts(data);
        setFilteredAccounts(data); // 초기에는 모든 계정 표시
      } else {
        console.error('API did not return an array:', data);
        setAccounts([]);
        setFilteredAccounts([]);
      }
    } catch (error) {
      console.error('Error fetching webmail accounts:', error);
      setAccounts([]);
      setFilteredAccounts([]);
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
    const filtered = accounts.filter(account => {
      // 모든 검색 조건을 AND 조건으로 적용
      return (
        (searchCriteria.mail_name === '' || account.mail_name.includes(searchCriteria.mail_name)) &&
        (searchCriteria.mail_id === '' || account.mail_id.includes(searchCriteria.mail_id)) &&
        (searchCriteria.department === '' || (account.department && account.department.includes(searchCriteria.department))) &&
        (searchCriteria.role === '' || account.role === searchCriteria.role) &&
        (searchCriteria.status === '' || account.status === searchCriteria.status) &&
        (searchCriteria.approval_status === '' || account.approval_status === searchCriteria.approval_status) &&
        (searchCriteria.otp_usage === '' || account.otp_usage === searchCriteria.otp_usage) &&
        (searchCriteria.mail_manager_emp_no === '' || (account.mail_manager_emp_no && account.mail_manager_emp_no.includes(searchCriteria.mail_manager_emp_no)))
      );
    });
    
    setFilteredAccounts(filtered);
  };

  // 검색 조건 초기화 함수
  const resetSearch = () => {
    setSearchCriteria({
      mail_name: '',
      mail_id: '',
      department: '',
      role: '',
      status: '',
      approval_status: '',
      otp_usage: '',
      mail_manager_emp_no: ''
    });
    setFilteredAccounts(accounts);
  };

  // 계정 삭제 핸들러
  const handleDelete = async (id: number) => {
    if (confirm('정말로 이 웹메일 계정을 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/webmail/accounts/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchAccounts(); // 삭제 후 목록 새로고침
        }
      } catch (error) {
        console.error('Error deleting webmail account:', error);
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
          <h1 className="text-2xl font-bold text-black mb-1">웹메일 계정 관리</h1>
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
            href="/webmail/new" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            새 웹메일 계정 등록
          </Link>
        </div>
      </div>

      {/* 검색 조건 섹션 */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-black mb-4">검색 조건</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">메일 이름</label>
            <input
              type="text"
              name="mail_name"
              value={searchCriteria.mail_name}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">메일 ID</label>
            <input
              type="text"
              name="mail_id"
              value={searchCriteria.mail_id}
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
            <label className="block text-sm font-medium text-black mb-1">권한</label>
            <select
              name="role"
              value={searchCriteria.role}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">전체</option>
              <option value="일반">일반</option>
              <option value="기관관리자">기관관리자</option>
              <option value="통합관리자">통합관리자</option>
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
              <option value="정상">정상</option>
              <option value="임시">임시</option>
              <option value="중지">중지</option>
              <option value="휴면">휴면</option>
              <option value="탈퇴">탈퇴</option>
              <option value="장미">장미</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">승인 상태</label>
            <select
              name="approval_status"
              value={searchCriteria.approval_status}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">전체</option>
              <option value="승인대기">승인대기</option>
              <option value="승인완료">승인완료</option>
              <option value="반려">반려</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">OTP 사용 여부</label>
            <select
              name="otp_usage"
              value={searchCriteria.otp_usage}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">전체</option>
              <option value="사용안함">사용안함</option>
              <option value="사용">사용</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">담당자 직번</label>
            <input
              type="text"
              name="mail_manager_emp_no"
              value={searchCriteria.mail_manager_emp_no}
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
          <p className="text-black">총 <span className="font-bold">{filteredAccounts.length}</span>개의 웹메일 계정이 검색되었습니다.</p>
        </div>
        {filteredAccounts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-black">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">메일 이름</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">메일 ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">부서</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">권한</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">승인 상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">OTP 사용</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">관리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{account.mail_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{account.mail_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{account.department || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{account.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${account.status === '정상' ? 'bg-green-100 text-green-800' : 
                        account.status === '임시' ? 'bg-blue-100 text-blue-800' : 
                        account.status === '중지' ? 'bg-yellow-100 text-yellow-800' : 
                        account.status === '휴면' ? 'bg-purple-100 text-purple-800' : 
                        'bg-red-100 text-red-800'}`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${account.approval_status === '승인완료' ? 'bg-green-100 text-green-800' : 
                        account.approval_status === '승인대기' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                        {account.approval_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{account.otp_usage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        href={`/webmail/${account.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        상세
                      </Link>
                      <Link 
                        href={`/webmail/${account.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        수정
                      </Link>
                      <button 
                        onClick={() => handleDelete(account.id)}
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