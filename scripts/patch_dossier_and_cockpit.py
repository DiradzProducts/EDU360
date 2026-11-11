with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update loadCandidates to preserve candidate strikes and telemetry from being wiped out
target_load = """      const res = await api.getExamCandidates();
      if (res && res.success && res.candidates && res.candidates.length > 0) {
        setCandidates(res.candidates);
      }"""

repl_load = """      const res = await api.getExamCandidates();
      if (res && res.success && res.candidates && res.candidates.length > 0) {
        setCandidates(prev => {
          return res.candidates.map((newCand: ProctorCandidate) => {
            const existing = prev.find(p => p.id === newCand.id || p.studentId === newCand.studentId);
            if (!existing) return newCand;
            const effectiveStrikes = Math.max(existing.strikes || 0, newCand.strikes || 0);
            return {
              ...newCand,
              strikes: effectiveStrikes,
              status: effectiveStrikes >= 2 ? 'critical' : effectiveStrikes === 1 ? 'warning' : (existing.isPaused ? 'paused' : newCand.status),
              anomalyType: existing.anomalyType || newCand.anomalyType,
              isPaused: existing.isPaused !== undefined ? existing.isPaused : newCand.isPaused,
              decibels: existing.decibels !== undefined ? existing.decibels : newCand.decibels,
              gaze: existing.gaze || newCand.gaze
            };
          });
        });
      }"""

if target_load in text:
    text = text.replace(target_load, repl_load, 1)
    print("Updated loadCandidates to preserve active strikes and telemetry")

# 2. Update handleToggleIntercom to dynamically customize message based on detected anomaly
target_intercom_msg = "message: `${candidate.name}, please adjust your device camera so that your physical paper booklet and hands remain visible on your desk.`"

repl_intercom_msg = """message: (candidate.anomalyType && candidate.anomalyType.includes('CELL_PHONE'))
            ? `${candidate.name}, put away the unauthorized mobile device immediately! Strike ${candidate.strikes || 1} has been recorded in your Analysis Sheet.`
            : (candidate.anomalyType && candidate.anomalyType.includes('MULTIPLE_PERSONS'))
            ? `${candidate.name}, multiple persons detected in your room. Ensure you are alone during this exam.`
            : `${candidate.name}, please adjust your device camera so that your physical paper booklet and hands remain visible on your desk.`"""

if target_intercom_msg in text:
    text = text.replace(target_intercom_msg, repl_intercom_msg, 1)
    print("Updated handleToggleIntercom message with smart contextual warning")

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved live-invigilator-cockpit.tsx")

# Now update proctor-integrity-dossier-modal.tsx
with open('frontend/src/components/proctor/proctor-integrity-dossier-modal.tsx', 'r', encoding='utf-8') as f:
    dossier_text = f.read()

target_dossier_effect = """    return () => {
      mounted = false;
    };
  }, [isOpen, candidateId]);"""

repl_dossier_effect = """    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.onmessage = (e) => {
        const data = e.data;
        if (!data || !mounted) return;
        if (data.type === 'STUDENT_TELEMETRY' && (data.candidateId === candidateId || !data.candidateId)) {
          if (data.analysisEntry) {
            const entry = data.analysisEntry;
            setTimeline(prev => [
              {
                id: Date.now(),
                eventType: entry.category,
                confidence: entry.confidence,
                strikeAssigned: entry.actionTaken === 'STRIKE',
                suspicionIncrement: entry.actionTaken === 'STRIKE' ? 25 : 10,
                notes: `${entry.title}: ${entry.ruleTriggered}`,
                loggedAt: entry.timestamp
              },
              ...prev
            ]);
          }
        }
      };
    } catch {}

    return () => {
      mounted = false;
      if (channel) channel.close();
    };
  }, [isOpen, candidateId]);"""

if target_dossier_effect in dossier_text:
    dossier_text = dossier_text.replace(target_dossier_effect, repl_dossier_effect, 1)
    print("Added live BroadcastChannel synchronization to proctor-integrity-dossier-modal.tsx")

with open('frontend/src/components/proctor/proctor-integrity-dossier-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(dossier_text)

print("Saved proctor-integrity-dossier-modal.tsx")
