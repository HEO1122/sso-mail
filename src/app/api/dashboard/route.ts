import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const connection = await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    
    // 검색 파라미터
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const changeType = searchParams.get('changeType');
    const changedBy = searchParams.get('changedBy');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const accountType = searchParams.get('accountType'); // SSO 또는 웹메일 필터
    
    // 기본 쿼리 및 파라미터
    let query = `
      SELECT 
        uh.id, 
        uh.user_id, 
        u.name as user_name,
        u.emp_no,
        u.department,
        uh.changed_by, 
        uh.change_date, 
        uh.change_type, 
        uh.change_detail,
        CASE 
          WHEN uh.change_type LIKE '%이메일%' THEN '웹메일'
          ELSE 'SSO'
        END as account_type
      FROM user_history uh
      LEFT JOIN users u ON uh.user_id = u.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    // 필터 조건 추가
    if (year) {
      query += ' AND YEAR(uh.change_date) = ?';
      queryParams.push(year);
    }
    
    if (month) {
      query += ' AND MONTH(uh.change_date) = ?';
      queryParams.push(month);
    }
    
    if (changeType) {
      query += ' AND uh.change_type = ?';
      queryParams.push(changeType);
    }
    
    if (changedBy) {
      query += ' AND uh.changed_by LIKE ?';
      queryParams.push(`%${changedBy}%`);
    }
    
    if (startDate) {
      query += ' AND DATE(uh.change_date) >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ' AND DATE(uh.change_date) <= ?';
      queryParams.push(endDate);
    }
    
    if (accountType) {
      if (accountType === 'SSO') {
        query += ' AND uh.change_type NOT LIKE "%이메일%"';
      } else if (accountType === 'webmail') {
        query += ' AND uh.change_type LIKE "%이메일%"';
      }
    }
    
    // 정렬
    query += ' ORDER BY uh.change_date DESC';
    
    // 변경 이력 데이터 조회
    const [historyRows] = await connection.execute(query, queryParams);
    
    // 총 이력 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM user_history uh
      WHERE 1=1
    `;
    
    // 동일한 필터 조건 적용
    let countQueryWithFilters = countQuery;
    if (year) {
      countQueryWithFilters += ' AND YEAR(uh.change_date) = ?';
    }
    
    if (month) {
      countQueryWithFilters += ' AND MONTH(uh.change_date) = ?';
    }
    
    if (changeType) {
      countQueryWithFilters += ' AND uh.change_type = ?';
    }
    
    if (changedBy) {
      countQueryWithFilters += ' AND uh.changed_by LIKE ?';
    }
    
    if (startDate) {
      countQueryWithFilters += ' AND DATE(uh.change_date) >= ?';
    }
    
    if (endDate) {
      countQueryWithFilters += ' AND DATE(uh.change_date) <= ?';
    }
    
    if (accountType) {
      if (accountType === 'SSO') {
        countQueryWithFilters += ' AND uh.change_type NOT LIKE "%이메일%"';
      } else if (accountType === 'webmail') {
        countQueryWithFilters += ' AND uh.change_type LIKE "%이메일%"';
      }
    }
    
    const [countResult] = await connection.execute(countQueryWithFilters, queryParams);
    const totalCount = (countResult as any[])[0].total;
    
    // 월별 통계 쿼리 (SSO와 웹메일 구분)
    const monthlyStatsQuery = `
      SELECT 
        YEAR(change_date) as year,
        MONTH(change_date) as month,
        COUNT(*) as total_count,
        SUM(CASE WHEN change_type LIKE '%생성%' THEN 1 ELSE 0 END) as create_count,
        SUM(CASE WHEN change_type LIKE '%수정%' THEN 1 ELSE 0 END) as update_count,
        SUM(CASE WHEN change_type LIKE '%삭제%' THEN 1 ELSE 0 END) as delete_count,
        SUM(CASE WHEN change_type LIKE '%이메일%' THEN 1 ELSE 0 END) as webmail_count,
        SUM(CASE WHEN change_type NOT LIKE '%이메일%' THEN 1 ELSE 0 END) as sso_count
      FROM user_history
      GROUP BY YEAR(change_date), MONTH(change_date)
      ORDER BY YEAR(change_date) DESC, MONTH(change_date) DESC
    `;
    
    const [monthlyStatsRows] = await connection.execute(monthlyStatsQuery);
    
    // 연도별 통계 쿼리 (누적)
    const yearlyStatsQuery = `
      SELECT 
        YEAR(change_date) as year,
        COUNT(*) as total_count,
        SUM(CASE WHEN change_type LIKE '%생성%' THEN 1 ELSE 0 END) as create_count,
        SUM(CASE WHEN change_type LIKE '%수정%' THEN 1 ELSE 0 END) as update_count,
        SUM(CASE WHEN change_type LIKE '%삭제%' THEN 1 ELSE 0 END) as delete_count,
        SUM(CASE WHEN change_type LIKE '%이메일%' THEN 1 ELSE 0 END) as webmail_count,
        SUM(CASE WHEN change_type NOT LIKE '%이메일%' THEN 1 ELSE 0 END) as sso_count
      FROM user_history
      GROUP BY YEAR(change_date)
      ORDER BY YEAR(change_date) DESC
    `;
    
    const [yearlyStatsRows] = await connection.execute(yearlyStatsQuery);
    
    // 유형별 통계 쿼리 (SSO와 웹메일 구분)
    const typeStatsQuery = `
      SELECT 
        change_type,
        COUNT(*) as count,
        CASE 
          WHEN change_type LIKE '%이메일%' THEN '웹메일'
          ELSE 'SSO'
        END as account_type
      FROM user_history
      GROUP BY change_type
      ORDER BY count DESC
    `;
    
    const [typeStatsRows] = await connection.execute(typeStatsQuery);
    
    return NextResponse.json({
      history: historyRows,
      totalCount,
      monthlyStats: monthlyStatsRows,
      yearlyStats: yearlyStatsRows,
      typeStats: typeStatsRows
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return NextResponse.json({ error: '대시보드 데이터 조회 중 오류가 발생했습니다' }, { status: 500 });
  }
} 