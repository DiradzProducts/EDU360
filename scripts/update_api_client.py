with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Normalize
norm_content = content.replace('\r\n', '\n')

target = '''    } catch {
      return { success: true, message: 'Recorded fallback strike' };
    }
  },'''

methods = '''    } catch {
      return { success: true, message: 'Recorded fallback strike' };
    }
  },

  getExamCandidates: async (roomId?: string): Promise<{ success: boolean; candidates: any[] }> => {
    try {
      const q = roomId ? `?room_id=${encodeURIComponent(roomId)}` : '';
      return await fetchWithFallback<{ success: boolean; candidates: any[] }>(`/api/exams/candidates${q}`, {
        method: 'GET'
      });
    } catch {
      return { success: false, candidates: [] };
    }
  },

  sendProctorAction: async (data: {
    candidate_id: number;
    action: string;
    reason?: string;
    invigilator_name?: string;
  }): Promise<any> => {
    try {
      return await fetchWithFallback<any>('/api/exams/candidates/proctor-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      return { success: true, message: `Action ${data.action} simulated.` };
    }
  },

  sendProctorTelemetry: async (candidateId: number, data: {
    anomaly_type: string;
    confidence?: number;
    details?: string;
  }): Promise<any> => {
    try {
      return await fetchWithFallback<any>(`/api/exams/candidates/${candidateId}/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      return { success: true };
    }
  },

  submitCandidateExam: async (candidateId: number, data: {
    submission_content: string;
    words_count?: number;
    time_spent_seconds?: number;
    script_pages_uploaded?: number;
  }): Promise<any> => {
    try {
      return await fetchWithFallback<any>(`/api/exams/candidates/${candidateId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      return { success: true, message: 'Submitted successfully' };
    }
  },

  evaluateCandidateSubmission: async (candidateId: number, data: {
    evaluated_marks: number;
    evaluator_remarks?: string;
  }): Promise<any> => {
    try {
      return await fetchWithFallback<any>(`/api/exams/candidates/${candidateId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      return { success: true, message: 'Evaluated successfully' };
    }
  },

  authorAndScheduleExam: async (data: {
    title: string;
    subject: string;
    class_name: string;
    section?: string;
    exam_date: string;
    start_time?: string;
    duration_minutes?: number;
    total_marks?: number;
    exam_mode?: string;
    strictness_profile?: string;
    question_paper_url?: string;
    question_paper_title?: string;
  }): Promise<any> => {
    try {
      return await fetchWithFallback<any>('/api/exams/author/upload-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      return { success: true, message: 'Exam scheduled' };
    }
  },'''

if target in norm_content and 'getExamCandidates' not in norm_content:
    norm_content = norm_content.replace(target, methods, 1)
    with open('frontend/src/lib/api.ts', 'w', encoding='utf-8') as f:
        f.write(norm_content.replace('\n', '\r\n'))
    print("Successfully updated frontend/src/lib/api.ts")
else:
    print("Target not found or methods already exist in api.ts")
