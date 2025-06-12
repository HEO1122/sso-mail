import mysql from 'mysql2/promise';

export async function connectToDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0000',
    database: 'sso_project', // 여기에 실제 데이터베이스 이름을 입력하세요
    port: 3306,
  });

  return connection;
}