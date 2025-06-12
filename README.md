# SSO 계정 관리 시스템 및 웹메일 계정 관리 시스템

Next.js 13+와 MySQL을 사용하여 구축된 계정 관리 시스템입니다. 이 시스템은 SSO 계정과 웹메일 계정을 관리할 수 있는 기능을 제공합니다.

## 기능 개요

### SSO 계정 관리
- 사용자 계정 등록, 조회, 수정, 삭제
- 직번 자동 생성 (Z + 현재년도 + 일련번호)
- 계정 상태 관리 (등록, 잠금, 삭제)
- 사용자 검색 및 필터링

### 웹메일 계정 관리
- 개인 및 공용 계정 등록, 조회, 수정, 삭제
- SSO 계정과의 연동
- 계정 상태 및 승인 상태 관리
- 사용자 검색 및 필터링

## 기술 스택

- **프론트엔드**: Next.js 13+, React, TailwindCSS
- **백엔드**: Next.js API Routes
- **데이터베이스**: MySQL

## 프로젝트 구조

```
project/
├── public/           # 정적 파일
├── src/
│   ├── app/
│   │   ├── api/      # API 엔드포인트
│   │   │   ├── sso/users/        # SSO 사용자 API
│   │   │   └── webmail/accounts/ # 웹메일 계정 API
│   │   ├── sso/      # SSO 사용자 관리 페이지
│   │   ├── webmail/  # 웹메일 계정 관리 페이지
│   │   ├── page.tsx  # 메인 페이지
│   │   └── layout.tsx
│   └── lib/
│       └── database.ts   # 데이터베이스 연결 및 초기화
├── package.json
└── README.md
```

## 설치 및 실행 방법

### 사전 요구사항

- Node.js 18.0.0 이상
- MySQL 서버 (로컬 또는 원격)

### 설치

1. 저장소 클론
```bash
git clone <repository-url>
cd <repository-directory>
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가합니다:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=0000
DB_NAME=accounts_management
```

4. 개발 서버 실행
```bash
npm run dev
```

5. 브라우저에서 `http://localhost:3000` 접속

### 데이터베이스 초기화

애플리케이션이 처음 시작될 때 `src/lib/database.ts`의 `initializeDatabase` 함수가 자동으로 실행되어 필요한 테이블을 생성하고 샘플 데이터를 추가합니다.

## 테이블 구조

### 사용자(users) 테이블
- **id**: 고유 식별자 (자동 증가)
- **emp_no**: 직번 (예: Z2023001)
- **name**: 사용자 이름
- **organization**: 기관명
- **department**: 소속 부서
- **employee_type**: 직원 구분 (봉사원, 외주직원, 내부직원)
- **vendor_name**: 업체명 (외주직원인 경우)
- **duty**: 담당 업무
- **work_scope**: 업무 범위 설명
- **status**: 계정 상태 (등록, 잠금, 삭제)
- **reg_date**: 등록일
- **lock_date**: 잠금일
- **delete_date**: 삭제일
- **requester**: 계정 요청자
- **created_at**: 생성 시각
- **updated_at**: 수정 시각

### 웹메일 계정(user_webmail_accounts) 테이블
- **id**: 고유 식별자 (자동 증가)
- **user_id**: 연결된 사용자 ID (외래 키)
- **mail_name**: 메일 이름 또는 별칭
- **mail_id**: 메일 주소 (아이디)
- **mail_password**: 메일 비밀번호
- **department**: 소속 부서
- **role**: 권한 (일반, 기관관리자, 통합관리자)
- **status**: 상태 (정상, 임시, 중지, 휴면, 탈퇴, 장미)
- **approval_status**: 승인 상태 (승인대기, 승인완료, 반려)
- **otp_usage**: OTP 사용 여부 (사용안함, 사용)
- **mail_manager_emp_no**: 메일 담당자 직번
- **created_at**: 생성 시각
- **updated_at**: 수정 시각

### 사용자 이력(user_history) 테이블
- **id**: 고유 식별자 (자동 증가)
- **user_id**: 대상 사용자 ID (외래 키)
- **changed_by**: 변경한 사용자
- **change_date**: 변경 일시
- **change_type**: 변경 유형 (등록, 수정, 잠금, 삭제 등)
- **change_detail**: 변경 상세 내용
