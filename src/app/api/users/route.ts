// This file is deprecated. See /src/app/api/sso/users/route.ts and /src/app/api/webmail/accounts/route.ts instead.

// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../pages/api/database';

interface User {
  id: number;
  emp_no: string;
  name: string;
  organization: string;
  department: string;
  employee_type: string;
  account_type: 'SSO' | 'WEBMAIL';
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
    const { name, organization, department, employee_type, account_type, vendor_name, duty, work_scope, requester } = body;
    
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
    
    // 사용자 저장 (account_type 필드 추가)
    await connection.execute(
      'INSERT INTO users (emp_no, name, organization, department, employee_type, account_type, vendor_name, duty, work_scope, requester, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [emp_no, name, organization, department, employee_type, account_type, vendor_name, duty, work_scope, requester, '등록']
    );
    
    return NextResponse.json({ message: '사용자가 생성되었습니다', emp_no }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: '사용자 생성 중 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await connectToDatabase();
    const body = await request.json();
    
    let lock_date = null;
    let delete_date = null;
    
    if (body.status === '잠금') {
      lock_date = new Date();
    } else if (body.status === '삭제') {
      delete_date = new Date();
    }
    
    const { name, organization, department, employee_type, account_type, vendor_name, duty, work_scope, requester, status } = body;
    
    await connection.execute(
      'UPDATE users SET name = ?, organization = ?, department = ?, employee_type = ?, account_type = ?, vendor_name = ?, duty = ?, work_scope = ?, requester = ?, status = ?, lock_date = ?, delete_date = ? WHERE id = ?',
      [name, organization, department, employee_type, account_type, vendor_name, duty, work_scope, requester, status, lock_date, delete_date, params.id]
    );
    
    return NextResponse.json({ message: '사용자가 수정되었습니다' });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: '사용자 수정 중 오류가 발생했습니다' }, { status: 500 });
  }
}