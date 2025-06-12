'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

interface DashboardData {
  monthlyStats: MonthlyStat[];
}

export default function TestDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);

  // 현재 연도 구하기
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  // 대시보드 데이터 가져오기
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      
      const responseData = await res.json();
      setData(responseData);

      // 데이터가 있으면 차트 데이터 준비
      if (responseData.monthlyStats && responseData.monthlyStats.length > 0) {
        prepareChartData(responseData.monthlyStats, selectedYear);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 차트 데이터 준비
  const prepareChartData = (monthlyStats: MonthlyStat[], year: number) => {
    // 선택한 연도의 데이터만 필터링
    const filteredStats = monthlyStats.filter(stat => stat.year === year);
    
    // 월별로 정렬
    filteredStats.sort((a, b) => a.month - b.month);
    
    const months = filteredStats.map(stat => `${stat.year}-${stat.month}`);
    
    const chartData = {
      labels: months,
      datasets: [
        {
          label: '총 건수',
          data: filteredStats.map(stat => stat.total_count),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1
        },
        {
          label: 'SSO 계정',
          data: filteredStats.map(stat => stat.sso_count),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.1
        },
        {
          label: '웹메일 계정',
          data: filteredStats.map(stat => stat.webmail_count),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1
        }
      ]
    };
    
    setChartData(chartData);
  };
  
  // 연도 변경 핸들러
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    if (data?.monthlyStats) {
      prepareChartData(data.monthlyStats, year);
    }
  };
  
  // 초기 데이터 로딩
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
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
          <h1 className="text-2xl font-bold text-black mb-1">추이 대시보드</h1>
          <p className="text-gray-600">월별 계정 관리 통계를 차트로 확인할 수 있습니다.</p>
        </div>
        <div className="flex space-x-2">
          <Link 
            href="/dashboard" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            기본 대시보드
          </Link>
        </div>
      </div>
      
      {/* 차트 영역 */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-black">월별 계정 관리 통계 (꺾은선 그래프)</h2>
          <div>
            <label className="mr-2 font-medium text-black">연도:</label>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        {chartData ? (
          <div className="h-96">
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: `${selectedYear}년 월별 계정 관리 건수`,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center h-96 text-gray-500">
            {data?.monthlyStats && data.monthlyStats.length === 0 
              ? '데이터가 없습니다.' 
              : '차트 데이터를 준비 중입니다...'}
          </div>
        )}
      </div>
      
      {/* 월별 데이터 테이블 */}
      {data?.monthlyStats && data.monthlyStats.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-4 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-black mb-4">월별 데이터 테이블</h2>
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
                {data.monthlyStats
                  .filter(stat => stat.year === selectedYear)
                  .sort((a, b) => b.month - a.month)
                  .map((stat, index) => (
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
  );
} 