'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { LeadDossierView } from '@/components/admissions/lead-dossier-view';

function LeadDossierContent() {
  const params = useParams();
  const idNum = Number(params?.id) || 1;

  return (
    <LeadDossierView 
      enquiryId={idNum} 
      backUrl="/admin" 
      role="admin" 
    />
  );
}

export default function AdminLeadDossierPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Lead Dossier...</div>}>
        <LeadDossierContent />
      </Suspense>
    </div>
  );
}
