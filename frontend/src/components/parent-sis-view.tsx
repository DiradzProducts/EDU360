'use client';

import React from 'react';
import { UnifiedSISView } from '@/components/unified-sis-view';
import { Student } from '@/lib/types';

interface ParentSisViewProps {
  studentId?: number;
}

export function ParentSisView({ studentId = 1 }: ParentSisViewProps) {
  const isAnanya = studentId === 7;
  const mockStudent: Student = isAnanya ? {
    id: 7,
    name: 'Ananya Sharma',
    roll_no: '8',
    class_name: 'Class 3',
    section: 'A',
    admission_no: 'EDU-2025-119',
    guardian_name: 'Mr. Rajesh Sharma',
    guardian_phone: '+91 98111 00003',
    guardian_email: 'rajesh.sharma@example.com',
    attendance_pct: 98.2,
    bus_route_id: 4,
    academic_average_pct: 96.5,
    status: 'Active'
  } : {
    id: 1,
    name: 'Aarav Sharma',
    roll_no: '14',
    class_name: 'Class 8',
    section: 'B',
    admission_no: 'EDU-2024-082',
    guardian_name: 'Mr. Rajesh Sharma',
    guardian_phone: '+91 98111 00003',
    guardian_email: 'rajesh.sharma@example.com',
    attendance_pct: 94.2,
    bus_route_id: 4,
    academic_average_pct: 88.8,
    status: 'Active'
  };

  return (
    <div className="space-y-6">
      <UnifiedSISView
        studentId={studentId}
        student={mockStudent}
        viewerRole="parent"
      />
    </div>
  );
}
