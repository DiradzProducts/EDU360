# -*- coding: utf-8 -*-
"""
Patch live-invigilator-cockpit.tsx to ensure:
1. Guaranteed sync with localStorage 'edu360_candidate_14_status' on mount, on storage event, and every 1000ms.
2. Immediate relocation of Candidate #14 to Top-Left when paused/3 strikes.
3. Enhanced red border and badge for top-left paused student card.
4. Automatic spotlighting and Analysis Sheet opening.
5. Updating localStorage on Pardon & Disqualify so student unpauses instantly.
"""

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add localStorage cross-tab polling and storage event listener
storage_sync_hook = """  // Guaranteed multi-channel sync: Listen to localStorage & storage events from student terminal
  useEffect(() => {
    const syncStatusFromStorage = () => {
      try {
        const raw = localStorage.getItem('edu360_candidate_14_status');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.strikes !== undefined || parsed.isPaused !== undefined)) {
            setCandidates(prev => {
              let changed = false;
              const next = prev.map(c => {
                if (c.rollNo === '14' || c.id === 1) {
                  const strikes = parsed.strikes !== undefined ? parsed.strikes : c.strikes;
                  const isPaused = parsed.isPaused !== undefined ? parsed.isPaused : (strikes >= 3);
                  const updatedSheet = parsed.analysisSheet && parsed.analysisSheet.length > 0 
                    ? parsed.analysisSheet 
                    : c.analysisSheet;

                  if (c.strikes !== strikes || c.isPaused !== isPaused || c.analysisSheet.length !== updatedSheet.length) {
                    changed = true;
                    return {
                      ...c,
                      strikes,
                      isPaused,
                      status: isPaused ? ('critical' as const) : (strikes >= 2 ? ('critical' as const) : strikes === 1 ? ('warning' as const) : ('normal' as const)),
                      suspicionScore: Math.min(100, strikes * 33 + (updatedSheet?.length || 0) * 8),
                      analysisSheet: updatedSheet
                    };
                  }
                }
                return c;
              });

              if (changed) {
                // If paused or 3 strikes, auto spotlight and trigger inquiry
                const candidate14 = next.find(c => c.rollNo === '14' || c.id === 1);
                if (candidate14 && (candidate14.isPaused || candidate14.strikes >= 3)) {
                  setSpotlightCandidateId(candidate14.id);
                }
              }

              return changed ? next : prev;
            });
          }
        }
      } catch {}
    };

    syncStatusFromStorage();
    window.addEventListener('storage', syncStatusFromStorage);
    const interval = setInterval(syncStatusFromStorage, 1000);

    return () => {
      window.removeEventListener('storage', syncStatusFromStorage);
      clearInterval(interval);
    };
  }, []);"""

if 'Guaranteed multi-channel sync: Listen to localStorage' not in code:
    code = code.replace(
        "  // 1. Initialize Teacher Camera Stream",
        f"{storage_sync_hook}\n\n  // 1. Initialize Teacher Camera Stream"
    )

# 2. In handlePardonCandidate: clear localStorage hard suspended flag
old_pardon_clean = """    triggerToast(`🟢 Permitted: ${candidate.name} pardoned. Resumed and returned to original grid position.`);"""

new_pardon_clean = """    // Clear hard suspension from localStorage so student terminal unpauses immediately
    try {
      localStorage.removeItem('edu360_student_hard_suspended');
      localStorage.setItem('edu360_candidate_14_status', JSON.stringify({
        candidateId: candidate.id,
        rollNo: candidate.rollNo,
        studentName: candidate.name,
        strikes: 0,
        isPaused: false,
        analysisSheet: [decisionEntry, ...candidate.analysisSheet],
        pardonedAt: Date.now()
      }));
    } catch {}

    triggerToast(`🟢 Permitted: ${candidate.name} pardoned. Resumed and returned to original grid position.`);"""

code = code.replace(old_pardon_clean, new_pardon_clean)

# 3. In handleConfirmDisqualification: set hard suspended flag
old_disqualify_clean = """    triggerToast(`🔴 Disqualified: ${candidate.name} disqualified from examination hall.`);"""

new_disqualify_clean = """    try {
      localStorage.setItem('edu360_student_hard_suspended', 'true');
      localStorage.setItem('edu360_candidate_14_status', JSON.stringify({
        candidateId: candidate.id,
        rollNo: candidate.rollNo,
        studentName: candidate.name,
        strikes: 3,
        isPaused: true,
        isDisqualified: true,
        analysisSheet: [decisionEntry, ...candidate.analysisSheet],
        disqualifiedAt: Date.now()
      }));
    } catch {}

    triggerToast(`🔴 Disqualified: ${candidate.name} disqualified from examination hall.`);"""

code = code.replace(old_disqualify_clean, new_disqualify_clean)

# 4. Enhance Top-Left card styling in the 40-student grid
old_card_styling = """                className={`group relative rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-md flex flex-col bg-slate-900 cursor-pointer hover:shadow-xl ${
                  isTopLeft
                    ? 'border-rose-500 ring-4 ring-rose-500/40 bg-gradient-to-b from-rose-950/80 to-slate-900 shadow-rose-950/50 scale-[1.01]'"""

new_card_styling = """                className={`group relative rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-md flex flex-col bg-slate-900 cursor-pointer hover:shadow-xl ${
                  isTopLeft
                    ? 'border-4 border-rose-600 ring-4 ring-rose-500/70 bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 shadow-2xl shadow-rose-950 scale-[1.03] animate-pulse z-20'"""

code = code.replace(old_card_styling, new_card_styling)

# 5. Enhance status indicator on card header
old_paused_badge = """                  {/* Status Indicator */}
                  {isTopLeft ? (
                    <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-black text-[9px] animate-pulse">
                      🚨 PAUSED
                    </span>"""

new_paused_badge = """                  {/* Status Indicator */}
                  {isTopLeft ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] animate-bounce shadow-md">
                      🚨 SUSPENDED (3 STRIKES)
                    </span>"""

code = code.replace(old_paused_badge, new_paused_badge)

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Successfully patched live-invigilator-cockpit.tsx with localStorage sync and prominent Top-Left relocation!")
