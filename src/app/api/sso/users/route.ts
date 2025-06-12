import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/database';

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
  requester: string;
  status: string;
  reg_date: string;
  lock_date: string | null;
  delete_date: string | null;
}

export async function GET() {
  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.execute('SELECT * FROM users');
    
    // 결과가 배열임을 확인하고 반환
    if (Array.isArray(rows)) {
      return NextResponse.json(rows);
    } else {
      console.error("Query did not return an array");
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json([]);  // 오류 시 빈 배열 반환
  }
}

export async function POST(request: NextRequest) {
  try {
    const connection = await connectToDatabase();
    const body = await request.json();
    const { name, organization, department, employee_type, vendor_name, duty, work_scope, requester } = body;
    
    // 현재 년도 가져오기
    const currentYear = new Date().getFullYear();
    
    // 현재 년도에 생성된 마지막 직번 조회
    const [lastEmpNoResult] = await connection.execute(
      'SELECT emp_no FROM users WHERE emp_no LIKE ? ORDER BY emp_no DESC LIMIT 1',
      [`Z${currentYear}%`]
    );
    
    // 일련번호 생성
    let sequenceNumber = 1;
    
    if (Array.isArray(lastEmpNoResult) && lastEmpNoResult.length > 0) {
      // 마지막 직번에서 일련번호 부분 추출 (Z202401 -> 001)
      const lastEmpNo = (lastEmpNoResult[0] as any).emp_no;
      const lastSequence = parseInt(lastEmpNo.substring(5), 10);
      sequenceNumber = lastSequence + 1;
    }
    
    // 직번 생성 (Z + 년도 + 일련번호 3자리)
    const emp_no = `Z${currentYear}${sequenceNumber.toString().padStart(3, '0')}`;
    
    console.log(`Generated employee number: ${emp_no}`);
    
    // 현재 날짜 가져오기
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    // 사용자 저장
    const [result] = await connection.execute(
      'INSERT INTO users (emp_no, name, organization, department, employee_type, vendor_name, duty, work_scope, requester, status, reg_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [emp_no, name, organization, department, employee_type, vendor_name, duty, work_scope, requester, '등록', currentDate]
    );
    
    // 생성된 사용자의 ID 가져오기
    const userId = (result as any).insertId;
    
    // 사용자 이력 추가
    await connection.execute(
      'INSERT INTO user_history (user_id, changed_by, change_type, change_detail) VALUES (?, ?, ?, ?)',
      [
        userId,
        requester || 'system',
        '사용자 생성',
        `사용자 생성: ${name}, 직번: ${emp_no}, 부서: ${department}`
      ]
    );
    
    return NextResponse.json({ message: '사용자가 생성되었습니다', emp_no }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: '사용자 생성 중 오류가 발생했습니다' }, { status: 500 });
  }
} 