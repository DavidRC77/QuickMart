import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '../lib/models/types';
import { AuthController } from '../lib/controllers/authController';

export function useAuth(requiredRole?: UserRole) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = AuthController.getSessionUser();
    if (!currentUser) {
      setUser(null);
      setLoading(false);
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        router.push('/login');
      }
      return;
    }

    if (requiredRole && !AuthController.isAuthorized(currentUser, requiredRole)) {
      if (currentUser.rol === 'cajero') {
        router.push('/pos');
      } else {
        router.push('/admin');
      }
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [requiredRole, router]);

  const login = async (email: string, pass: string) => {
    const loggedUser = await AuthController.login(email, pass);
    setUser(loggedUser);
    if (loggedUser.rol === 'cajero') {
      router.push('/pos');
    } else {
      router.push('/admin');
    }
  };

  const logout = () => {
    AuthController.logout();
    setUser(null);
    router.push('/login');
  };

  return { user, loading, login, logout };
}
