// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../pages/api/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`Getting user with ID: ${params.id}`);
    const connection = await connectToDatabase();
    const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [params.id]);
    
    if (Array.isArray(rows) && rows.length > 0) {
      return NextResponse.json(rows[0]);
    }
    
    return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: '데이터베이스 연결 오류' }, { status: 500 });
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
    
    const { emp_no, name, organization, department, employee_type, vendor_name, duty, work_scope, requester, status } = body;
    
    await connection.execute(
      'UPDATE users SET name = ?, organization = ?, department = ?, employee_type = ?, vendor_name = ?, duty = ?, work_scope = ?, requester = ?, status = ?, lock_date = ?, delete_date = ? WHERE id = ?',
      [name, organization, department, employee_type, vendor_name, duty, work_scope, requester, status, lock_date, delete_date, params.id]
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
    
    await connection.execute(
      'UPDATE users SET status = ?, delete_date = ? WHERE id = ?',
      ['삭제', new Date(), params.id]
    );
    
    return NextResponse.json({ message: '사용자가 삭제되었습니다' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: '사용자 삭제 중 오류가 발생했습니다' }, { status: 500 });
  }
}