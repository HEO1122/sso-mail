'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HistoryItem {
  id: number;
  user_id: number;
  user_name: string;
  emp_no: string;
  department: string;
  changed_by: string;
  change_date: string;
  change_type: string;
  change_detail: string;
  account_type: string;
}

interface MonthlyStat {
  year: number;
  month: number;
  total_count: number;
  create_count: number;
  update_count: number;
  delete_count: number;
  webmail_count: number;
  sso_count: number;
}

interface YearlyStat {
  year: number;
  total_count: number;
  create_count: number;
  update_count: number;
  delete_count: number;
  webmail_count: number;
  sso_count: number;
}

interface TypeStat {
  change_type: string;
  count: number;
  account_type: string;
}

interface DashboardData {
  history: HistoryItem[];
  monthlyStats: MonthlyStat[];
  yearlyStats: YearlyStat[];
  typeStats: TypeStat[];
  totalCount: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'yearly' | 'monthly'>('yearly');
  
  // 검색 필터 상태
  const [filters, setFilters] = useState({
    year: '',
    month: '',
    changeType: '',
    changedBy: '',
    startDate: '',
    endDate: '',
    accountType: ''
  });
  
  // 현재 연도 구하기
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // 대시보드 데이터 가져오기
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let url = '/api/dashboard?';
      
      // 필터 파라미터 추가
      if (filters.year) url += `year=${filters.year}&`;
      if (filters.month) url += `month=${filters.month}&`;
      if (filters.changeType) url += `changeType=${filters.changeType}&`;
      if (filters.changedBy) url += `changedBy=${filters.changedBy}&`;
      if (filters.startDate) url += `startDate=${filters.startDate}&`;
      if (filters.endDate) url += `endDate=${filters.endDate}&`;
      if (filters.accountType) url += `accountType=${filters.accountType}&`;
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      
      const responseData = await res.json();
      setData(responseData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 초기 데이터 로딩
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // 필터 변경 핸들러
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // 검색 실행
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboardData();
  };
  
  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      year: '',
      month: '',
      changeType: '',
      changedBy: '',
      startDate: '',
      endDate: '',
      accountType: ''
    });
  };
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return <div className="container mx-auto p-4">로딩 중...</div>;
  }
  
  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }
  
  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">계정 관리 대시보드</h1>
          <p className="text-gray-600">SSO 사용자 계정 및 웹메일 계정 생성/수정/삭제 이력을 확인할 수 있습니다.</p>
        </div>
        <div className="flex space-x-2">
          <Link 
            href="/sso" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            SSO 사용자 관리
          </Link>
          <Link 
            href="/webmail" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            웹메일 계정 관리
          </Link>
          <Link 
            href="/test-dashboard" 
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            추이 대시보드
          </Link>
        </div>
      </div>
      
      {/* 통계 탭 */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6 border border-gray-200">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'yearly' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('yearly')}
          >
            연도별 통계 (누적)
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'monthly' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('monthly')}
          >
            월별 통계
          </button>
        </div>
        
        {/* 연도별 통계 (누적) */}
        {activeTab === 'yearly' && data?.yearlyStats && data.yearlyStats.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-black mb-4">연도별 계정 관리 통계</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연도</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 건수</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수정</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">삭제</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">SSO 계정</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">웹메일 계정</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.yearlyStats.map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.total_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{stat.create_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{stat.update_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{stat.delete_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{stat.sso_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{stat.webmail_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* 월별 통계 */}
        {activeTab === 'monthly' && data?.monthlyStats && data.monthlyStats.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-black mb-4">월별 계정 관리 통계</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연도</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">월</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 건수</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수정</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">삭제</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">SSO 계정</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">웹메일 계정</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.monthlyStats.map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.total_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{stat.create_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{stat.update_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{stat.delete_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{stat.sso_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{stat.webmail_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* 유형별 통계 */}
      {data?.typeStats && data.typeStats.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-4 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-black mb-4">변경 유형별 통계</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-md font-medium text-blue-600 mb-2">SSO 계정</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.typeStats
                  .filter(stat => stat.account_type === 'SSO')
                  .map((stat, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-md font-medium text-black">{stat.change_type}</h3>
                      <p className="text-2xl font-bold text-blue-600 mt-2">{stat.count}건</p>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium text-green-600 mb-2">웹메일 계정</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.typeStats
                  .filter(stat => stat.account_type === '웹메일')
                  .map((stat, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-md font-medium text-black">{stat.change_type}</h3>
                      <p className="text-2xl font-bold text-green-600 mt-2">{stat.count}건</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 검색 필터 */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-black mb-4">이력 검색</h2>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">연도</label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">전체 연도</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">월</label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">전체 월</option>
              {months.map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">계정 유형</label>
            <select
              name="accountType"
              value={filters.accountType}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">전체</option>
              <option value="SSO">SSO 계정</option>
              <option value="webmail">웹메일 계정</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">변경 유형</label>
            <select
              name="changeType"
              value={filters.changeType}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">전체 유형</option>
              {data?.typeStats?.map(stat => (
                <option key={stat.change_type} value={stat.change_type}>{stat.change_type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">변경자</label>
            <input
              type="text"
              name="changedBy"
              value={filters.changedBy}
              onChange={handleFilterChange}
              placeholder="변경자 입력"
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">기간</label>
            <div className="flex space-x-2">
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              />
              <span className="self-center">~</span>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
          </div>
          <div className="md:col-span-3 flex justify-end space-x-2 mt-2">
            <button
              type="button"
              onClick={resetFilters}
              className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              초기화
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              검색
            </button>
          </div>
        </form>
      </div>
      
      {/* 이력 목록 */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-black">계정 변경 이력</h2>
          {data && (
            <div className="text-sm text-gray-600">
              총 <span className="font-medium text-blue-600">{data.totalCount}</span>건의 이력이 있습니다
            </div>
          )}
        </div>
        {data?.history && data.history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직번</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">부서</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계정 유형</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">변경 유형</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">변경자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상세 내용</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.change_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.emp_no || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.user_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.department || '-'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      item.account_type === 'SSO' ? 'text-blue-600' : 'text-green-600'
                    }`}>{item.account_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.change_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.changed_by}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.change_detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            이력 데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  );
} 