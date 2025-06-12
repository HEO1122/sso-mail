import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await connectToDatabase();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [params.id]
    );
    
    if (Array.isArray(rows) && rows.length > 0) {
      return NextResponse.json(rows[0]);
    } else {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: '데이터베이스 오류' }, { status: 500 });
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
      lock_date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    } else if (body.status === '삭제') {
      delete_date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    }
    
    const { name, organization, department, employee_type, vendor_name, duty, work_scope, requester, status } = body;
    
    await connection.execute(
      'UPDATE users SET name = ?, organization = ?, department = ?, employee_type = ?, vendor_name = ?, duty = ?, work_scope = ?, requester = ?, status = ?, lock_date = ?, delete_date = ? WHERE id = ?',
      [name, organization, department, employee_type, vendor_name, duty, work_scope, requester, status, lock_date, delete_date, params.id]
    );
    
    // 변경 이력 저장
    await connection.execute(
      'INSERT INTO user_history (user_id, changed_by, change_type, change_detail) VALUES (?, ?, ?, ?)',
      [
        params.id,
        body.changed_by || 'system',
        '수정',
        `상태: ${status}, 담당자: ${requester}`
      ]
    );
    
    return NextResponse.json({ message: '사용자가 수정되었습니다' });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: '사용자 수정 중 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await connectToDatabase();
    
    // 사용자 상태를 '삭제'로 변경
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    await connection.execute(
      'UPDATE users SET status = ?, delete_date = ? WHERE id = ?',
      ['삭제', currentDate, params.id]
    );
    
    // 변경 이력 저장
    await connection.execute(
      'INSERT INTO user_history (user_id, changed_by, change_type, change_detail) VALUES (?, ?, ?, ?)',
      [
        params.id,
        'system', // 실제 시스템에서는 현재 로그인한 사용자 정보를 사용
        '삭제',
        '계정 삭제 처리'
      ]
    );
    
    return NextResponse.json({ message: '사용자가 삭제되었습니다' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: '사용자 삭제 중 오류가 발생했습니다' }, { status: 500 });
  }
} 