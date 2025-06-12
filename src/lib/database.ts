import mysql from 'mysql2/promise';

// MySQL 연결 설정
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '0000',
  database: process.env.DB_NAME || 'accounts_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// MySQL 연결 함수
export async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// 데이터베이스 및 테이블 초기화 함수
export async function initializeDatabase() {
  try {
    // MySQL 서버에 연결 (데이터베이스 이름 없이)
    const serverConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    // 데이터베이스가 없으면 생성
    await serverConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`Database '${dbConfig.database}' created or already exists`);
    
    // 데이터베이스 사용
    await serverConnection.query(`USE ${dbConfig.database}`);

    // users 테이블 생성
    await serverConnection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '사용자 고유 ID',
        emp_no VARCHAR(20) NOT NULL UNIQUE COMMENT '직번(사번)',
        name VARCHAR(50) NOT NULL COMMENT '사용자 이름',
        organization VARCHAR(100) NOT NULL COMMENT '기관명',
        department VARCHAR(100) NOT NULL COMMENT '소속 부서',
        employee_type ENUM('봉사원','외주직원','내부직원') NOT NULL COMMENT '직원 구분',
        vendor_name VARCHAR(100) NULL COMMENT '외주직원일 경우 업체명',
        duty VARCHAR(100) NULL COMMENT '담당 업무',
        work_scope TEXT NULL COMMENT '업무 범위 설명',
        status ENUM('등록','잠금','삭제') DEFAULT '등록' COMMENT '계정 상태',
        reg_date DATE NULL COMMENT '등록일',
        lock_date DATE NULL COMMENT '잠금일',
        delete_date DATE NULL COMMENT '삭제일',
        requester VARCHAR(100) NOT NULL COMMENT '계정 요청자',
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각'
      ) COMMENT='SSO 사용자 계정 관리 테이블'
    `);
    console.log('Users table created or already exists');

    // user_webmail_accounts 테이블 생성
    await serverConnection.query(`
      CREATE TABLE IF NOT EXISTS user_webmail_accounts (
        id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '웹메일 계정 고유 ID',
        user_id BIGINT NULL COMMENT '개인 사용자와 연결되는 경우 users.id (공용 계정일 경우 NULL)',
        mail_name VARCHAR(100) NOT NULL COMMENT '메일 이름 또는 별칭',
        mail_id VARCHAR(100) NOT NULL UNIQUE COMMENT '메일 주소 (아이디)',
        mail_password VARCHAR(255) NOT NULL COMMENT '메일 비밀번호 (암호화 저장 권장)',
        department VARCHAR(100) NULL COMMENT '소속 부서',
        role ENUM('일반','기관관리자','통합관리자') NOT NULL DEFAULT '일반' COMMENT '웹메일 사용자 권한',
        status ENUM('정상','임시','중지','휴면','탈퇴','장미') NOT NULL DEFAULT '정상' COMMENT '메일 계정 상태',
        approval_status ENUM('승인대기','승인완료','반려') NOT NULL DEFAULT '승인대기' COMMENT '메일 계정 승인 상태',
        otp_usage ENUM('사용안함','사용') NOT NULL DEFAULT '사용안함' COMMENT 'OTP 사용 여부',
        mail_manager_emp_no VARCHAR(20) NULL COMMENT '메일 담당자 직번',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) COMMENT='웹메일 계정 관리 테이블 (개인/공용 계정 포함)'
    `);
    console.log('User webmail accounts table created or already exists');

    // 사용자 이력 테이블 생성
    await serverConnection.query(`
      CREATE TABLE IF NOT EXISTS user_history (
        id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '이력 로그 ID',
        user_id BIGINT NULL COMMENT '대상 사용자 ID',
        changed_by VARCHAR(100) NOT NULL COMMENT '변경한 사용자',
        change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '변경 일시',
        change_type VARCHAR(50) NOT NULL COMMENT '변경 유형 (등록, 수정, 잠금, 삭제 등)',
        change_detail TEXT NULL COMMENT '변경 상세 내용',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) COMMENT='사용자 계정 변경 이력'
    `);
    console.log('User history table created or already exists');

    // 샘플 데이터 추가 (있으면 건너뜀)
    const [userRows] = await serverConnection.query('SELECT COUNT(*) as count FROM users');
    const userCount = (userRows as any)[0].count;

    if (userCount === 0) {
      const currentDate = new Date().toISOString().split('T')[0];
      
      // 샘플 사용자 데이터 추가
      await serverConnection.query(`
        INSERT INTO users (emp_no, name, organization, department, employee_type, vendor_name, duty, work_scope, status, reg_date, requester) VALUES
        ('Z2023001', '홍길동', '본사', '개발팀', '내부직원', NULL, '백엔드 개발', '인증 시스템 개발 및 유지보수', '등록', '${currentDate}', '김관리'),
        ('Z2023002', '김철수', '본사', '인사팀', '내부직원', NULL, '인사 담당', '직원 인사 관리', '등록', '${currentDate}', '김관리'),
        ('Z2023003', '이영희', '지사', '영업팀', '내부직원', NULL, '영업 담당', '신규 고객 영업', '등록', '${currentDate}', '박부장'),
        ('Z2023004', '박민수', '지사', '지원팀', '외주직원', '에이스 솔루션', '전산 지원', '서버 관리 및 유지보수', '등록', '${currentDate}', '이담당'),
        ('Z2023005', '최지원', '본사', '개발팀', '봉사원', NULL, '프론트엔드 개발', 'UI/UX 개발', '등록', '${currentDate}', '김관리')
      `);
      console.log('Sample user data added');

      // 샘플 웹메일 계정 데이터 추가
      await serverConnection.query(`
        INSERT INTO user_webmail_accounts (user_id, mail_name, mail_id, mail_password, department, role, status, approval_status, otp_usage, mail_manager_emp_no) VALUES
        (1, '홍길동', 'hong@example.com', 'password123', '개발팀', '일반', '정상', '승인완료', '사용안함', 'Z2023001'),
        (2, '김철수', 'kim@example.com', 'password123', '인사팀', '기관관리자', '정상', '승인완료', '사용', 'Z2023001'),
        (NULL, '고객지원', 'support@example.com', 'password123', '지원팀', '일반', '정상', '승인완료', '사용안함', 'Z2023004'),
        (3, '이영희', 'lee@example.com', 'password123', '영업팀', '일반', '임시', '승인대기', '사용안함', 'Z2023001'),
        (4, '박민수', 'park@example.com', 'password123', '지원팀', '일반', '정상', '승인완료', '사용', 'Z2023001')
      `);
      console.log('Sample webmail account data added');
    }

    await serverConnection.end();
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// 애플리케이션 시작 시 데이터베이스 초기화 실행
if (process.env.NODE_ENV !== 'test') {
  initializeDatabase().catch(console.error);
} 