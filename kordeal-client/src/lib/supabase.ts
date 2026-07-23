import { createClient } from '@supabase/supabase-js';

// Supabase URL과 API Key는 환경 변수에서 가져옵니다
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 인증 관련 함수들
export const authAPI = {
  // Google OAuth 로그인
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  },

  // Kakao OAuth 로그인
  async signInWithKakao() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  },

  // 이메일/비밀번호 로그인
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // 이메일/비밀번호 회원가입
  async signUpWithEmail(email: string, password: string, userData?: Record<string, any>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  // 로그아웃
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 현재 사용자 정보 가져오기
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // 세션 정보 가져오기
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // 인증 상태 변화 감시
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};

// 데이터베이스 관련 함수들
export const dbAPI = {
  // 사용자 프로필 가져오기
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // 사용자 프로필 업데이트
  async updateUserProfile(userId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // 상품 목록 가져오기
  async getProducts(limit: number = 10, offset: number = 0) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .range(offset, offset + limit - 1);
    return { data, error };
  },

  // 상품 상세 정보 가져오기
  async getProductById(productId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    return { data, error };
  },

  // 주문 목록 가져오기
  async getOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);
    return { data, error };
  },

  // 주문 생성
  async createOrder(orderData: Record<string, any>) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    return { data, error };
  },
};
