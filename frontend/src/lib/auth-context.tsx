'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    username: 'admin',
    email: 'principal@edu360.internal',
    role: 'admin',
    school_code: 'EDU-GLOBAL-360',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    phone: '+91 98111 00001'
  },
  academic_coordinator: {
    id: 6,
    name: 'Prof. Rajeshwari Nair',
    username: 'academic_coord',
    email: 'academic.coord@edu360.internal',
    role: 'academic_coordinator',
    school_code: 'EDU-GLOBAL-360',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150',
    phone: '+91 98111 00006'
  },
  exam_coordinator: {
    id: 8,
    name: 'Dr. Hemanth Sen',
    username: 'exam_coord',
    email: 'exam.cell@edu360.internal',
    role: 'exam_coordinator',
    school_code: 'EDU-GLOBAL-360',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    phone: '+91 98111 00008'
  },
  transport_coordinator: {
    id: 7,
    name: 'Mr. Vikram Malhotra',
    username: 'transport_coord',
    email: 'transport.lead@edu360.internal',
    role: 'transport_coordinator',
    school_code: 'EDU-GLOBAL-360',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    phone: '+91 98111 00007'
  },
  inventory_coordinator: {
    id: 9,
    name: 'Mrs. Shalini Rao',
    username: 'inventory_coord',
    email: 'inventory.store@edu360.internal',
    role: 'inventory_coordinator',
    school_code: 'EDU-GLOBAL-360',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    phone: '+91 98111 00009'
  },
  admissions_coordinator: {
    id: 10,
    name: 'Ms. Sneha Kulkarni',
    username: 'admissions_coord',
    email: 'admissions.crm@edu360.internal',
    role: 'admissions_coordinator',
    school_code: 'EDU-GLOBAL-360',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '+91 98111 00010'
  },
  accounts_coordinator: {
    id: 11,
    name: 'Mr. Arvind Krishnan',
    username: 'accounts_coord',
    email: 'accounts.bursar@edu360.internal',
    role: 'accounts_coordinator',
    school_code: 'EDU-GLOBAL-360',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    phone: '+91 98111 00011'
  },
  teacher: {
    id: 2,
    name: 'Mrs. Ananya Verma',
    username: 'teacher_mat',
    email: 'ananya.verma@edu360.internal',
    role: 'teacher',
    school_code: 'EDU-GLOBAL-360',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    phone: '+91 98111 00002'
  },
  parent: {
    id: 3,
    name: 'Mr. Rajesh Sharma',
    username: 'parent',
    email: 'rajesh.sharma@example.com',
    role: 'parent',
    school_code: 'EDU-GLOBAL-360',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '+91 98111 00003'
  },
  student: {
    id: 4,
    name: 'Aarav Sharma',
    username: 'sr_student',
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

  // BFCache (Back-Forward Cache) Protection:
  // If user navigates via browser Back/Forward after logout, prevent viewing stale cached portal snapshot
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('edu360_active_user') : null;
        const hasCookie = typeof document !== 'undefined' && document.cookie.includes('edu360_session=');
        if (!stored || !hasCookie) {
          window.location.replace('/login');
        }
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const getRoleRoute = (targetRole: UserRole): string => {
    return `/${targetRole}`;
  };

  const loginAs = (role: UserRole) => {
    const selected = defaultUsers[role];
    setUser(selected);
    localStorage.setItem('edu360_active_user', JSON.stringify(selected));
    syncSessionCookie(role);
    if (typeof window !== 'undefined') {
      window.location.replace(getRoleRoute(role));
    } else {
      router.replace(getRoleRoute(role));
    }
  };

  const loginWithCredentials = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('edu360_active_user', JSON.stringify(newUser));
    syncSessionCookie(newUser.role);
    if (typeof window !== 'undefined') {
      window.location.replace(getRoleRoute(newUser.role));
    } else {
      router.replace(getRoleRoute(newUser.role));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('edu360_active_user');
    syncSessionCookie(null);
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    } else {
      router.replace('/login');
    }
  };

  const switchRole = (newRole: UserRole) => {
    const selected = defaultUsers[newRole];
    setUser(selected);
    localStorage.setItem('edu360_active_user', JSON.stringify(selected));
    syncSessionCookie(newRole);
    if (typeof window !== 'undefined') {
      window.location.replace(getRoleRoute(newRole));
    } else {
      router.replace(getRoleRoute(newRole));
    }
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
