import { ReactNode, useEffect, } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const auth: string | null = localStorage.getItem('isAuthenticated');

  useEffect(() => {
    if (!auth) {
      navigate('/');
    }
  }, [auth, navigate]);

  if (auth) {
    return children;
  } else {
    return null;
  }
};

export default ProtectedRoute;
