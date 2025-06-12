import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/database';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const connection = await connectToDatabase();
    const { id } = context.params;
    
    const [rows] = await connection.execute(`
      SELECT wa.*, wa.mail_password, u.emp_no AS linked_emp_no, u.name AS linked_name 
      FROM user_webmail_accounts wa
      LEFT JOIN users u ON wa.user_id = u.id
      WHERE wa.id = ?
    `, [id]);
    
    if (Array.isArray(rows) && rows.length > 0) {
      // 클라이언트에 응답할 때 비밀번호 필드 마스킹 처리
      const account = rows[0] as any;
      account.mail_password = '********'; // 보안상의 이유로 마스킹
      
      return NextResponse.json(account);
    } else {
      return NextResponse.json({ error: '웹메일 계정을 찾을 수 없습니다' }, { status: 404 });
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: '데이터베이스 오류' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const connection = await connectToDatabase();
    const { id } = context.params;
    const body = await request.json();
    
    let { 
      user_id, 
      mail_name, 
      mail_id, 
      mail_password, 
      department, 
      role, 
      status, 
      approval_status,
      otp_usage,
      mail_manager_emp_no
    } = body;
    
    // user_id가 빈 문자열이면 NULL로 설정
    if (user_id === '' || user_id === undefined) {
      user_id = null;
    }
    
    // 패스워드가 변경되었는지 확인 (앞에서 마스킹 처리된 값인지)
    if (mail_password && mail_password !== '********') {
      // 비밀번호가 변경된 경우
      await connection.execute(`
        UPDATE user_webmail_accounts 
        SET user_id = ?, mail_name = ?, mail_id = ?, mail_password = ?, 
            department = ?, role = ?, status = ?, approval_status = ?, 
            otp_usage = ?, mail_manager_emp_no = ?
        WHERE id = ?
      `, [
        user_id, mail_name, mail_id, mail_password, department, 
        role, status, approval_status, otp_usage, mail_manager_emp_no, 
        id
      ]);
    } else {
      // 비밀번호는 변경하지 않는 경우
      await connection.execute(`
        UPDATE user_webmail_accounts 
        SET user_id = ?, mail_name = ?, mail_id = ?, 
            department = ?, role = ?, status = ?, approval_status = ?, 
            otp_usage = ?, mail_manager_emp_no = ?
        WHERE id = ?
      `, [
        user_id, mail_name, mail_id, department, 
        role, status, approval_status, otp_usage, mail_manager_emp_no, 
        id
      ]);
    }
    
    // 연결된 사용자가 있는 경우 이력 기록
    if (user_id) {
      await connection.execute(
        'INSERT INTO user_history (user_id, changed_by, change_type, change_detail) VALUES (?, ?, ?, ?)',
        [
          user_id,
          mail_manager_emp_no || 'system',
          '이메일 계정 수정',
          `이메일 계정 수정: ${mail_id}, 상태: ${status}, 승인: ${approval_status}`
        ]
      );
    }
    // 공용 계정인 경우에도 이력 기록
    else {
      await connection.execute(
        'INSERT INTO user_history (user_id, changed_by, change_type, change_detail) VALUES (?, ?, ?, ?)',
        [
          null,
          mail_manager_emp_no || 'system',
          '이메일 계정 수정 (공용)',
          `공용 이메일 계정 수정: ${mail_id}, 이름: ${mail_name}, 상태: ${status}`
        ]
      );
    }
    
    return NextResponse.json({ message: '웹메일 계정이 수정되었습니다' });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: '웹메일 계정 수정 중 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const connection = await connectToDatabase();
    const { id } = context.params;
    
    // 계정 정보 가져오기 (연결된 사용자 기록을 위해)
    const [accountRows] = await connection.execute(
      'SELECT user_id, mail_id, mail_name FROM user_webmail_accounts WHERE id = ?',
      [id]
    );
    
    if (!Array.isArray(accountRows) || accountRows.length === 0) {
      return NextResponse.json({ error: '웹메일 계정을 찾을 수 없습니다' }, { status: 404 });
    }
    
    const account = accountRows[0] as any;
    
    // 계정 상태를 '탈퇴'로 변경 (실제 삭제하지 않고 상태만 변경)
    await connection.execute(
      'UPDATE user_webmail_accounts SET status = ? WHERE id = ?',
      ['탈퇴', id]
    );
    
    // 연결된 사용자가 있는 경우 이력 기록
    if (account.user_id) {
      await connection.execute(
        'INSERT INTO user_history (user_id, changed_by, change_type, change_detail) VALUES (?, ?, ?, ?)',
        [
          account.user_id,
          'system', // 실제 시스템에서는 현재 로그인한 사용자 정보를 사용
          '이메일 계정 삭제',
          `이메일 계정 삭제: ${account.mail_id}`
        ]
      );
    }
    // 공용 계정인 경우에도 이력 기록
    else {
      await connection.execute(
        'INSERT INTO user_history (user_id, changed_by, change_type, change_detail) VALUES (?, ?, ?, ?)',
        [
          null,
          'system',
          '이메일 계정 삭제 (공용)',
          `공용 이메일 계정 삭제: ${account.mail_id}, 이름: ${account.mail_name}`
        ]
      );
    }
    
    return NextResponse.json({ message: '웹메일 계정이 삭제되었습니다' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: '웹메일 계정 삭제 중 오류가 발생했습니다' }, { status: 500 });
  }
} 