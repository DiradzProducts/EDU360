'use client';
import { Footer } from '@/components/footer';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UnifiedSISView } from '@/components/unified-sis-view';
import { RoleGuard } from '@/components/role-guard';

export default function TeacherStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = Number(params?.id || 1);

  return (
    <RoleGuard allowedRole="teacher">
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <UnifiedSISView
            studentId={studentId}
            viewerRole="teacher"
            onBack={() => router.back()}
          />
          <Footer />
        </div>
      </div>
    </RoleGuard>
  );
}
