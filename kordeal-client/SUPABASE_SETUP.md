# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 계정 생성
2. 새 프로젝트 생성
3. 프로젝트 URL과 API Key 복사

## 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 정보를 입력합니다:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. PostgreSQL 스키마 생성

Supabase 대시보드의 SQL Editor에서 다음 쿼리를 실행합니다:

### 3.1 Users 테이블

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) CHECK (role IN ('buyer', 'supplier', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  phone VARCHAR(20),
  company_name VARCHAR(255),
  business_registration_number VARCHAR(50),
  country VARCHAR(100),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE
);

-- RLS 정책 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 조회 가능
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 사용자는 자신의 데이터만 수정 가능
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- 인증된 사용자는 다른 사용자의 공개 정보 조회 가능
CREATE POLICY "Authenticated users can view public user info"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');
```

### 3.2 Products 테이블

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  hs_code VARCHAR(20),
  moq INTEGER,
  price_per_unit DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  pricing_tiers JSONB,
  images TEXT[],
  specifications JSONB,
  certifications TEXT[],
  lead_time_days INTEGER,
  shipping_methods TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RLS 정책 설정
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 모든 사용자는 활성화된 상품 조회 가능
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = TRUE);

-- 공급사는 자신의 상품만 수정 가능
CREATE POLICY "Suppliers can update their own products"
  ON products FOR UPDATE
  USING (auth.uid() = supplier_id);

-- 공급사는 자신의 상품만 삭제 가능
CREATE POLICY "Suppliers can delete their own products"
  ON products FOR DELETE
  USING (auth.uid() = supplier_id);

-- 공급사는 상품 생성 가능
CREATE POLICY "Suppliers can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = supplier_id);
```

### 3.3 Orders 테이블

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) CHECK (status IN ('pending', 'confirmed', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed')),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')),
  shipping_address JSONB,
  tracking_number VARCHAR(100),
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RLS 정책 설정
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 바이어는 자신의 주문만 조회 가능
CREATE POLICY "Buyers can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id);

-- 공급사는 자신의 주문만 조회 가능
CREATE POLICY "Suppliers can view their orders"
  ON orders FOR SELECT
  USING (auth.uid() = supplier_id);

-- 바이어는 주문 생성 가능
CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- 바이어는 자신의 주문 수정 가능
CREATE POLICY "Buyers can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = buyer_id);
```

### 3.4 Messages 테이블 (채팅)

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments TEXT[],
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RLS 정책 설정
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 송신자와 수신자만 메시지 조회 가능
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- 인증된 사용자는 메시지 생성 가능
CREATE POLICY "Authenticated users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
```

### 3.5 Escrow_Logs 테이블

```sql
CREATE TABLE escrow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) CHECK (transaction_type IN ('authorization', 'capture', 'release', 'refund', 'hold', 'dispute')),
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) CHECK (status IN ('pending', 'completed', 'failed')),
  payment_gateway VARCHAR(50),
  gateway_transaction_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RLS 정책 설정
ALTER TABLE escrow_logs ENABLE ROW LEVEL SECURITY;

-- 관련 당사자만 에스크로 로그 조회 가능
CREATE POLICY "Users can view related escrow logs"
  ON escrow_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = escrow_logs.order_id
      AND (orders.buyer_id = auth.uid() OR orders.supplier_id = auth.uid())
    )
  );
```

## 4. OAuth 설정

### 4.1 Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com)에 접속
2. 새 프로젝트 생성
3. OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
4. 승인된 리디렉션 URI에 다음 추가:
   - `https://your-project.supabase.co/auth/v1/callback`
5. Supabase 대시보드 → Authentication → Providers → Google에서 설정

### 4.2 Kakao OAuth

1. [Kakao Developers](https://developers.kakao.com)에 접속
2. 새 애플리케이션 생성
3. Kakao Login 활성화
4. 리디렉션 URI 설정:
   - `https://your-project.supabase.co/auth/v1/callback`
5. Supabase 대시보드 → Authentication → Providers → Kakao에서 설정

## 5. 환경 변수 확인

프로젝트 루트의 `.env.local` 파일이 다음과 같이 설정되었는지 확인합니다:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 6. 테스트

개발 서버를 실행하고 로그인/회원가입 페이지에서 테스트합니다:

```bash
npm run dev
```

## 참고 사항

- RLS (Row Level Security)는 데이터베이스 수준에서 보안을 제공합니다
- 모든 민감한 정보는 환경 변수로 관리합니다
- 프로덕션 환경에서는 추가 보안 설정이 필요합니다
