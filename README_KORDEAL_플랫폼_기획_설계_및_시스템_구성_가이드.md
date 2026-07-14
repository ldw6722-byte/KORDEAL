# KORDEAL 플랫폼 기획, 설계 및 시스템 구성 가이드

이 문서는 한국 제조·도매 공급사와 글로벌 바이어를 연결하는 글로벌 B2B 플랫폼 **KORDEAL**의 통합 아키텍처 및 보안 설계안입니다. OWASP Top 10 보안 표준을 준수하며, 프론트엔드부터 인프라까지 전 영역의 상세 구축 컴포넌트를 포함합니다.

---

## 1. 기술 스택 (Technology Stack)

플랫폼의 확장성과 보안, 실시간성을 확보하기 위한 핵심 기술 조합입니다.

| 영역 | 기술 |
|------|------|
| **Frontend** | React + Tailwind CSS (사용자 인터페이스 및 상태 관리) |
| **Backend** | Spring Boot (Java 17/21 기반 핵심 비즈니스 로직 및 에스크로 엔진) |
| **Database & BaaS** | Supabase (PostgreSQL, Realtime 엔진, Storage) |
| **AI Engine** | Claude API (B2B 전문 번역 및 상품 분류) |
| **External APIs** | Stripe (결제), AfterShip (물류 추적), DeepL (보조 번역) <-차후 시장방향에 맞는 플렛폼 적용|

결제 (에스크로) 가능 플랫폼

| 거래 성격                 | 추천 플랫폼          | 이유                          |
| :-------------------- | :-------------- | :-------------------------- |
| **일회성 IT 프로젝트 / 도메인** | **Escrow.com** | 전용 에스크로 시스템으로 분쟁 해결이 명확함    |
| **정기적 B2B 비즈니스**        | **Payoneer**    | 한국 계좌 인출이 가장 편리하고 수수료가 합리적임 |
| **대규모 물품 수출**           | **Tridge Pay**  | KOTRA 협력 서비스로 무역 신뢰도 확보 가능  |
| **개인/소규모 판매**           | **PayPal**      | 바이어 접근성이 가장 좋고 결제가 간편함      |
 

---

## 2. 상세 시스템 구성 트리 (Security-First System Tree)

보안(OWASP 기반)과 비즈니스 로직을 결합한 상세 구성입니다. 제작이 필요한 모든 컴포넌트를 명시합니다.

```
KORDEAL Platform
├── 🌐 Frontend Layer (React + Tailwind)
│   ├── 🛡️ Application Security
│   │   ├── XSS 방어: React 기본 Sanitization 및 DOMPurify 도입
│   │   ├── CSRF 보호: Supabase Auth 토큰 기반 요청 검증
│   │   └── CSP 설정: 신뢰할 수 없는 스크립트 실행 차단
│   ├── 👤 Account Management
│   │   ├── Supabase Auth 연동 (Google, Kakao OAuth 2.0)
│   │   ├── MFA (Multi-Factor Authentication) 지원 로직
│   │   └── 세션 타임아웃 및 동시 접속 제어 UI
│   ├── 🛍️ Sourcing Engine
│   │   ├── AI 기반 다국어 검색 및 필터 인터페이스
│   │   ├── 카테고리 맵 (문구, 반려동물, 패션, 뷰티 등 전 카테고리)
│   │   └── '장인 마켓' (Jangin Market) 특화 섹션 인터페이스
│   └── 💬 Communication & Order
│       ├── 에스크로 결제 UI (Stripe Elements 보안 결제창 연동)
│       ├── 실시간 다국어 번역 내장 채팅 UI
│       └── 실시간 배송 추적 대시보드 (AfterShip 연동)
│
├── ⚙️ Backend Layer (Spring Boot)
│   ├── 🛡️ API Security (OWASP Top 10 대응)
│   │   ├── 인증/인가: Spring Security + JWT(Supabase) 연동으로 권한 우회 차단
│   │   ├── 입력 데이터 검증: SQL Injection 방지를 위한 JPA/QueryDSL 사용 및 유효성 검사
│   │   ├── Rate Limiting: 무차별 대입 공격(Brute Force) 방지를 위한 API 호출 제한
│   │   └── 에러 핸들링: 민감한 스택 트레이스 노출 차단 및 공통 예외 처리
│   ├── 🧠 Logic Core
│   │   ├── 에스크로 정산 엔진 (PAID → SHIPPED → COMPLETED 상태 전이 자동화)
│   │   ├── 정산금 자동 계산 및 환율 변동 처리 모듈
│   │   ├── AI 자동 번역 서비스 (Claude API 시스템 프롬프트 최적화 및 결과 관리)
│   │   └── 국가별 무역 규제(FDA, CE 등) 및 관세 안내 매트릭스 엔진
│   └── 🔌 External Integration
│       ├── 글로벌 결제 게이트웨이 연동 (Stripe, Wise)
│       ├── 물류 API 연동 (AfterShip, CJ대한통운, DHL 등)
│       └── AI 번역 API 연동 (Claude, DeepL)
│
└── 🗄️ Database & Infra (Supabase)
    ├── 🛡️ Data Security
    │   ├── RLS (Row Level Security): 사용자가 자신의 데이터만 접근 가능하도록 강제 (IDOR 방지)
    │   ├── RBAC (Role-Based Access Control): 바이어/공급사/관리자 역할별 정교한 권한 제어
    │   └── 데이터 암호화: DB 저장 시 민감 정보 AES-256 암호화 및 TLS 전송 계층 보안
    ├── 📁 PostgreSQL Database
    │   ├── 상품, 재고, 수량별 가격 티어(JSONB) 테이블
    │   ├── 주문 상태 및 에스크로 자금 흐름 로그 (Audit Trail)
    │   └── 실시간 채팅 메시지 저장소
    └── ☁️ Storage
        └── 공급사 인증 서류(사업자 등록증 PDF) 및 상품 이미지 보안 저장소
```

---

## 3. 데이터베이스 스키마 설계 (Entity Relationship)

시스템의 데이터 무결성과 보안 감사를 위한 핵심 테이블 구조입니다.

| 테이블명 | 주요 컬럼 (PK/FK/필드) | 보안 및 비즈니스 용도 |
|----------|------------------------|----------------------|
| **Users** | id(PK), email, role, membership_level | 권한 기반 접근 제어(RBAC) 및 서비스 등급 관리 |
| **Products** | id(PK), seller_id(FK), original_ko_desc, translated_en_desc, moq, price_tiers(JSONB) | 다국어 상품 정보 및 수량별 구간 가격(Tier) 데이터 관리 |
| **Orders** | id(PK), buyer_id(FK), product_id(FK), status, escrow_amount | 에스크로 대금 보호 및 주문 프로세스 추적 |
| **Escrow_Logs** | id(PK), order_id(FK), action, amount, created_at | **보안 감사 기록**: 모든 자금 이동에 대한 상세 경로 기록 |
| **Chat_Rooms** | id(PK), buyer_id(FK), seller_id(FK), created_at | 바이어-공급사 간 1:1 실시간 상담 및 번역 데이터 보관 |

---

## 4. OWASP 보안 구현 Critical Insight

### Broken Access Control 대응
모든 DB 쿼리에 Supabase **RLS**를 적용하여 바이어가 타인의 주문 ID를 추측해 정보를 탈취하는 **IDOR 공격을 원천 차단**합니다.

### Security Logging and Monitoring
`Escrow_Logs` 테이블은 금전적 거래의 이상 징후를 실시간 탐지하고 사후 추적을 가능하게 하는 보안 필수 요소입니다.

### Injection 방지
상품 등록 시 한국어 원문을 AI로 번역하는 과정에서 외부 입력을 그대로 사용하지 않고, **백엔드에서 데이터 검증 후 Claude API를 호출**하여 데이터 오염을 방지합니다.

---

> 이 아키텍처는 기술 스택의 강점을 극대화하면서 글로벌 B2B 거래의 신뢰성과 보안을 동시에 확보하도록 설계되었습니다.
