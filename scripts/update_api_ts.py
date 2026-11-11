with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update fallbackExitClearance to remove Aarav Sharma
old_fallback = """let fallbackExitClearance: ExitClearance[] = [
  {
    id: 1,
    student_id: 1,
    student_name: "Aarav Sharma (Sample Exit Flow)",
    class_name: "Class 8B",
    fee_cleared: true,
    library_cleared: true,
    inventory_cleared: true,
    tc_ready: true,
    digital_parent_approved: false,
    digital_approval_timestamp: undefined,
    physical_scan_url: undefined,
    physical_sign_verified: false,
    status: "Pending Parent Digital Approval"
  },
  {
    id: 2,
    student_id: 2,
    student_name: "Karan Malhotra",
    class_name: "Class 10A",
    fee_cleared: true,
    library_cleared: true,
    inventory_cleared: true,
    tc_ready: true,
    digital_parent_approved: true,
    digital_approval_timestamp: "12 Oct 2026, 04:15 PM UTC",
    physical_scan_url: "/assets/scanned_register_karan_malhotra.png",
    physical_sign_verified: true,
    status: "Completed & Permanently Archived"
  }
];"""

new_fallback = """let fallbackExitClearance: ExitClearance[] = [
  {
    id: 1,
    student_id: 999,
    student_name: "Karan Malhotra",
    class_name: "Class 10A",
    fee_cleared: true,
    library_cleared: true,
    inventory_cleared: true,
    tc_ready: true,
    digital_parent_approved: true,
    digital_approval_timestamp: "12 Oct 2026, 04:15 PM UTC",
    physical_scan_url: "/assets/scanned_register_karan_malhotra.png",
    physical_sign_verified: true,
    status: "Completed & Permanently Archived"
  }
];"""

c_norm = c.replace('\r\n', '\n')
old_fb_norm = old_fallback.replace('\r\n', '\n')
new_fb_norm = new_fallback.replace('\r\n', '\n')

assert old_fb_norm in c_norm, "old_fallback not found"
c_norm = c_norm.replace(old_fb_norm, new_fb_norm, 1)

# 2. Add initiateExitClearance, getStudentExitClearance and remove resetExitClearance
old_methods = """  getExitClearances: async () => {
    return fetchWithFallback<ExitClearance[]>('/api/admin/exit-clearances', undefined, fallbackExitClearance);
  },
  verifyPhysicalSign: async (id: number, physicalScanUrl?: string) => {
    try {
      return await fetchWithFallback(`/api/admin/exit-clearances/${id}/verify-physical`, {
        method: 'POST',
        body: JSON.stringify({ physical_scan_url: physicalScanUrl || '/assets/scanned_register_signed.png' })
      });
    } catch {
      fallbackExitClearance = fallbackExitClearance.map(ec => ec.id === id ? {
        ...ec,
        physical_sign_verified: true,
        physical_scan_url: physicalScanUrl || '/assets/scanned_register_signed.png',
        status: ec.digital_parent_approved ? 'Completed & Permanently Archived' : 'Physical Verified - Awaiting Digital'
      } : ec);
      return { success: true, message: 'Physical scan verified in legal register' };
    }
  },
  resetExitClearance: async (id: number) => {
    try {
      return await fetchWithFallback(`/api/admin/exit-clearances/${id}/reset`, {
        method: 'POST'
      });
    } catch {
      fallbackExitClearance = fallbackExitClearance.map(ec => ec.id === id ? {
        ...ec,
        digital_parent_approved: false,
        digital_approval_timestamp: undefined,
        physical_scan_url: undefined,
        physical_sign_verified: false,
        status: 'Pending Dual Verification'
      } : ec);
      return { success: true, message: 'Exit clearance reset' };
    }
  },"""

new_methods = """  getExitClearances: async () => {
    return fetchWithFallback<ExitClearance[]>('/api/admin/exit-clearances', undefined, fallbackExitClearance);
  },
  getStudentExitClearance: async (studentId: number) => {
    try {
      return await fetchWithFallback<ExitClearance | null>(`/api/admin/exit-clearances/student/${studentId}`, undefined, null);
    } catch {
      return fallbackExitClearance.find(ec => ec.student_id === studentId) || null;
    }
  },
  initiateExitClearance: async (studentId: number) => {
    try {
      return await fetchWithFallback<{ success: boolean; message: string; clearance: ExitClearance }>(
        '/api/admin/exit-clearances/initiate',
        {
          method: 'POST',
          body: JSON.stringify({
            student_id: studentId,
            fee_cleared: true,
            library_cleared: true,
            inventory_cleared: true,
            tc_ready: true
          })
        }
      );
    } catch {
      const newCl: ExitClearance = {
        id: Date.now(),
        student_id: studentId,
        student_name: studentId === 12 ? 'John Fernandes' : 'Student Exit Record',
        class_name: studentId === 12 ? 'Class 10-A' : 'Class 10',
        fee_cleared: true,
        library_cleared: true,
        inventory_cleared: true,
        tc_ready: true,
        digital_parent_approved: false,
        digital_approval_timestamp: undefined,
        physical_scan_url: undefined,
        physical_sign_verified: false,
        status: 'Pending Dual Verification'
      };
      fallbackExitClearance.unshift(newCl);
      return { success: true, message: 'Exit clearance initiated successfully', clearance: newCl };
    }
  },
  verifyPhysicalSign: async (id: number, physicalScanUrl?: string) => {
    try {
      return await fetchWithFallback(`/api/admin/exit-clearances/${id}/verify-physical`, {
        method: 'POST',
        body: JSON.stringify({ physical_scan_url: physicalScanUrl || '/assets/scanned_register_signed.png' })
      });
    } catch {
      fallbackExitClearance = fallbackExitClearance.map(ec => ec.id === id ? {
        ...ec,
        physical_sign_verified: true,
        physical_scan_url: physicalScanUrl || '/assets/scanned_register_signed.png',
        status: ec.digital_parent_approved ? 'Completed & Permanently Archived' : 'Physical Verified - Awaiting Digital'
      } : ec);
      return { success: true, message: 'Physical scan verified in legal register' };
    }
  },"""

old_m_norm = old_methods.replace('\r\n', '\n')
new_m_norm = new_methods.replace('\r\n', '\n')

assert old_m_norm in c_norm, "old_methods not found"
c_norm = c_norm.replace(old_m_norm, new_m_norm, 1)

with open('frontend/src/lib/api.ts', 'w', encoding='utf-8') as f:
    f.write(c_norm)

print("frontend/src/lib/api.ts updated successfully!")
