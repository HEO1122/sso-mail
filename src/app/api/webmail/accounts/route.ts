import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/database';

interface WebmailAccount {
  id: number;
  user_id: number | null;
  mail_name: string;
  mail_id: string;
  mail_password: string;
  department: string | null;
  role: string;
  status: string;
  approval_status: string;
  otp_usage: string;
  mail_manager_emp_no: string | null;
}

export async function GET() {
  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.execute(`
      SELECT wa.*, u.emp_no AS linked_emp_no, u.name AS linked_name
      FROM user_webmail_accounts wa
      LEFT JOIN users u ON wa.user_id = u.id
    `);
    
    // 결과가 배열임을 확인하고 반환
    if (Array.isArray(rows)) {
      // 비밀번호는 API 응답에서 제외
      const sanitizedData = (rows as any[]).map(account => {
        const { mail_password, ...rest } = account;
        return rest;
      });
      
      return NextResponse.json(sanitizedData);
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
    let { 
      user_id, 
      mail_name, 
      mail_id, 
      mail_password, 
      department, 
      role = '일반', 
      status = '정상', 
      approval_status = '승인대기',
      otp_usage = '사용안함',
      mail_manager_emp_no
    } = body;
    
    // user_id가 빈 문자열이면 NULL로 설정
    if (user_id === '' || user_id === undefined) {
      user_id = null;
    }
    
    // 현재 시간은 MySQL이 자동으로 설정함 (CURRENT_TIMESTAMP)
    
    // 이메일 계정 저장
    const [result] = await connection.execute(
      `INSERT INTO user_webmail_accounts 
       (user_id, mail_name, mail_id, mail_password, department, role, status, approval_status, otp_usage, mail_manager_emp_no)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, mail_name, mail_id, mail_password, department, role, status, approval_status, otp_usage, mail_manager_emp_no]
    );
    
    // 생성된 계정의 ID
    const webmailAccountId = (result as any).insertId;
    
    // 이력 기록 - 연결된 사용자가 있는 경우
    if (user_id) {
      await connection.execute(
        'INSERT INTO user_history (user_id, changed_by, change_type, change_detail) VALUES (?, ?, ?, ?)',
        [
          user_id,
          mail_manager_emp_no || 'system',
          '이메일 계정 생성',
          `이메일 계정 생성: ${mail_id}`
        ]
      );
    } 
    // 공용 계정(user_id가 null)인 경우에도 이력 추가
    else {
      await connection.execute(
        'INSERT INTO user_history (user_id, changed_by, change_type, change_detail) VALUES (?, ?, ?, ?)',
        [
          null,
          mail_manager_emp_no || 'system',
          '이메일 계정 생성 (공용)',
          `공용 이메일 계정 생성: ${mail_id}, 이름: ${mail_name}`
        ]
      );
    }
    
    return NextResponse.json({ 
      message: '웹메일 계정이 생성되었습니다', 
      id: webmailAccountId
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating webmail account:', error);
    return NextResponse.json({ error: '웹메일 계정 생성 중 오류가 발생했습니다' }, { status: 500 });
  }
} 