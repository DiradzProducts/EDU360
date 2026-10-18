'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, UserRole } from './types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  mounted: boolean;
  loginAs: (role: UserRole) => void;
  loginWithCredentials: (user: User) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const defaultUsers: Record<UserRole, User> = {
  admin: {
    id: 1,
    name: 'Dr. Sunita Kapoor',
    email: 'principal@edu360.internal',
    role: 'admin',
    school_code: 'EDU-GLOBAL-360',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    phone: '+91 98111 00001'
  },
  teacher: {
    id: 2,
    name: 'Mrs. Ananya Verma',
    email: 'ananya.verma@edu360.internal',
    role: 'teacher',
    school_code: 'EDU-GLOBAL-360',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    phone: '+91 98111 00002'
  },
  parent: {
    id: 3,
    name: 'Mr. Rajesh Sharma',
    email: 'rajesh.sharma@example.com',
    role: 'parent',
    school_code: 'EDU-GLOBAL-360',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '+91 98111 00003'
  },
  student: {
    id: 4,
    name: 'Aarav Sharma',
    email: 'aarav.sharma@student.edu360.internal',
    role: 'student',
    school_code: 'EDU-GLOBAL-360',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    phone: '+91 98111 00004'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  // Helper to set session cookie for Next.js route protection
  const syncSessionCookie = (activeRole: string | null) => {
    if (typeof document !== 'undefined') {
      if (activeRole) {
        document.cookie = `edu360_session=${activeRole}; path=/; max-age=86400; SameSite=Lax`;
      } else {
        document.cookie = 'edu360_session=; path=/; max-age=0; SameSite=Lax';
      }
    }
  };

  // Initialize from localStorage (requires explicit login)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('edu360_active_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        syncSessionCookie(parsed.role);
      } else {
        // Unauthenticated session - requires login with credentials
        setUser(null);
        syncSessionCookie(null);
      }
    } catch {
      setUser(null);
      syncSessionCookie(null);
    }
    setMounted(true);
  }, []);

  // Sync state when user changes
  useEffect(() => {
    if (!mounted) return;
    if (user) {
      localStorage.setItem('edu360_active_user', JSON.stringify(user));
      syncSessionCookie(user.role);
    } else {
      localStorage.removeItem('edu360_active_user');
      syncSessionCookie(null);
    }
  }, [user, mounted]);

  const loginAs = (role: UserRole) => {
    const selected = defaultUsers[role];
    setUser(selected);
    localStorage.setItem('edu360_active_user', JSON.stringify(selected));
    syncSessionCookie(role);
    router.push(`/${role}`);
  };

  const loginWithCredentials = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('edu360_active_user', JSON.stringify(newUser));
    syncSessionCookie(newUser.role);
    router.push(`/${newUser.role}`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('edu360_active_user');
    syncSessionCookie(null);
    router.push('/login');
  };

  const switchRole = (newRole: UserRole) => {
    const selected = defaultUsers[newRole];
    setUser(selected);
    localStorage.setItem('edu360_active_user', JSON.stringify(selected));
    syncSessionCookie(newRole);
    router.push(`/${newRole}`);
  };

  const role: UserRole = user ? user.role : 'teacher';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        mounted,
        loginAs,
        loginWithCredentials,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
