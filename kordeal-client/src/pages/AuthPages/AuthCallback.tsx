import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      // 인증 완료 후 대시보드로 이동
      navigate("/");
    } else if (!isLoading && !user) {
      // 인증 실패 시 로그인 페이지로 이동
      navigate("/signin");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Processing authentication...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
