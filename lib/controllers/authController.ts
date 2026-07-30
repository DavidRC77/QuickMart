import { User, UserRole } from '../models/types';
import { UserModel } from '../models/userModel';

const SESSION_KEY = 'quickmart_auth_user';

export class AuthController {
  static getSessionUser(): User | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static async login(email: string, pass: string): Promise<User> {
    const user = await UserModel.authenticate(email, pass);
    if (!user) {
      throw new Error('Credenciales inválidas. Verifique su correo y contraseña.');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
    return user;
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  static isAuthorized(user: User | null, requiredRole?: UserRole): boolean {
    if (!user) return false;
    if (!requiredRole) return true;
    if (requiredRole === 'administrador') {
      return user.rol === 'administrador';
    }
    return true; // Cajero or Admin can access POS
  }
}
