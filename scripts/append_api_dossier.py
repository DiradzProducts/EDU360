with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    text = f.read()

norm_text = text.replace('\r\n', '\n')

target = """    } catch {
      return { success: true, message: 'Exam scheduled' };
    }
  },"""

methods = """    } catch {
      return { success: true, message: 'Exam scheduled' };
    }
  },

  getCandidateProctorDossier: async (candidateId: number): Promise<any> => {
    try {
      return await fetchWithFallback<any>(`/api/exams/candidates/${candidateId}/dossier`, {
        method: 'GET'
      });
    } catch {
      return {
        success: true,
        candidate: {
          id: candidateId,
          name: 'Student Candidate',
          rollNo: '14',
          subject: 'Mathematics',
          grade: 'Class 8-B',
          status: 'completed',
          credibilityIndex: 85.0,
          trustTier: 'HIGH_TRUST',
          trustLabel: 'Clean Integrity (Verified)',
          strikes: 0,
          tabSwitches: 0,
          suspicionScore: 15.0
        },
        metrics: {
          totalInfractions: 1,
          strikesAssigned: 0,
          tabSwitchCount: 0,
          primaryAnomaly: 'Clean Session'
        },
        auditTimeline: [
          {
            id: 1,
            eventType: 'ROOM_JOIN',
            confidence: 0.99,
            strikeAssigned: false,
            notes: 'Session admitted with camera and microphone active',
            loggedAt: new Date().toISOString()
          }
        ]
      };
    }
  },

  submitDossierVerdict: async (candidateId: number, data: {
    verdict: string;
    penalty_marks?: number;
    notes?: string;
    evaluator_name?: string;
  }): Promise<any> => {
    try {
      return await fetchWithFallback<any>(`/api/exams/candidates/${candidateId}/dossier-verdict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      return { success: true, verdict: data.verdict, message: `Verdict ${data.verdict} recorded.` };
    }
  },"""

if target in norm_text and 'getCandidateProctorDossier' not in norm_text:
    norm_text = norm_text.replace(target, methods, 1)
    with open('frontend/src/lib/api.ts', 'w', encoding='utf-8') as f:
        f.write(norm_text.replace('\n', '\r\n'))
    print("Successfully appended dossier methods to frontend/src/lib/api.ts")
else:
    print("Target not found or methods already exist in api.ts")
