'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { RoleGuard } from '@/components/role-guard';
import { JuniorStudentDashboard } from '@/components/junior/JuniorStudentDashboard';
import { User } from '@/lib/types';

export default function JuniorPortalPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Junior K-5 student context bound to Ananya Sharma (Class 3-A)
  const juniorUser: User = {
    id: user?.id || 7,
    email: user?.email || 'ananya.junior@edu360.com',
    name: user?.name || 'Ananya Sharma',
    role: 'student',
    school_code: user?.school_code || 'OAK-2026',
    grade_tier: 'k5',
    is_junior_k5: true,
    student_id: user?.student_id || 7
  };

  return (
    <RoleGuard allowedRole="student">
      <JuniorStudentDashboard
        user={juniorUser}
        onLogout={logout}
      />
    </RoleGuard>
  );
}
