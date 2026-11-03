with open("frontend/src/components/parent-marks-view.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update component declaration & props
target_decl = "export function ParentMarksView() {"
replace_decl = """interface ParentMarksViewProps {
  studentId?: number;
  studentName?: string;
  className?: string;
}

export function ParentMarksView({
  studentId = 1,
  studentName = 'Aarav Sharma',
  className = 'Class 8-B'
}: ParentMarksViewProps = {}) {"""

if target_decl in content:
    content = content.replace(target_decl, replace_decl)

# 2. Add signature state after selectedTerm
target_state = "  const [liveReportCard, setLiveReportCard] = useState<ReportCardItem | null>(null);"
replace_state = """  const [liveReportCard, setLiveReportCard] = useState<ReportCardItem | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signerName, setSignerName] = useState('Rajesh Sharma (Father)');
  const [signRemarks, setSignRemarks] = useState('Reviewed Term 1 results with class teacher feedback.');
  const [isSigning, setIsSigning] = useState(false);"""

if target_state in content:
    content = content.replace(target_state, replace_state)

# 3. Update useEffect and hall ticket
target_fetch = """    try {
      const res = await api.getStudentHallTicket(1);"""
replace_fetch = """    try {
      const res = await api.getStudentHallTicket(studentId);"""
if target_fetch in content:
    content = content.replace(target_fetch, replace_fetch)

target_cards = """      try {
        const cards = await api.getReportCards({ student_id: 1 });"""
replace_cards = """      try {
        const cards = await api.getReportCards({ student_id: studentId });"""
if target_cards in content:
    content = content.replace(target_cards, replace_cards)

target_deps = "    fetchLiveCard();\n  }, []);"
replace_deps = "    fetchLiveCard();\n  }, [studentId]);"
if target_deps in content:
    content = content.replace(target_deps, replace_deps)

# 4. Add handleSignReportCard
sign_fn = """  const handleSignReportCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveReportCard) return;
    setIsSigning(true);
    try {
      const res = await api.signReportCard(liveReportCard.id, {
        signer_name: signerName,
        remarks: signRemarks
      });
      if (res && res.success) {
        setLiveReportCard(prev => prev ? {
          ...prev,
          parent_signed_at: res.parent_signed_at,
          parent_signer_name: res.parent_signer_name,
          parent_signature_hash: res.parent_signature_hash,
          parent_remarks: res.parent_remarks
        } : null);
        setShowSignModal(false);
        setDownloadToast(`✓ Report card digitally acknowledged & sealed by ${signerName}!`);
        setTimeout(() => setDownloadToast(null), 5000);
      }
    } catch (err) {
      console.error('Failed to digitally sign report card', err);
    } finally {
      setIsSigning(false);
    }
  };
"""

target_before_render = "  // Dynamic calculations"
if target_before_render in content:
    content = content.replace(target_before_render, sign_fn + "\n  // Dynamic calculations")

# 5. Dynamic Student Name in Header
target_h2 = '<h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">\n            Aarav Sharma — Examination Marks &amp; Progress Memo\n          </h2>'
replace_h2 = '<h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">\n            {studentName} — Examination Marks &amp; Progress Memo\n          </h2>'
if target_h2 in content:
    content = content.replace(target_h2, replace_h2)

target_p = 'Class 8B • Roll #14 • Board Affiliation #CBSE-103049'
replace_p = '{className} • Roll #14 • Board Affiliation #CBSE-103049'
if target_p in content:
    content = content.replace(target_p, replace_p)

# 6. Add Digital Sign button in the action row
target_buttons = """          <button
            onClick={handleDownloadMemo}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Download Official PDF Memo</span>
          </button>"""

replace_buttons = """          {liveReportCard && liveReportCard.is_published && (
            liveReportCard.parent_signed_at ? (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Digitally Sealed ({liveReportCard.parent_signer_name?.split(' ')[0]})</span>
              </div>
            ) : (
              <button
                onClick={() => setShowSignModal(true)}
                className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Digitally Sign Memo</span>
              </button>
            )
          )}

          <button
            onClick={handleDownloadMemo}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Download Official PDF Memo</span>
          </button>"""

if target_buttons in content:
    content = content.replace(target_buttons, replace_buttons)

# 7. Add Digital Signature Modal at bottom of component
sign_modal_code = """
      {/* ======================================================== */}
      {/* DIGITAL REPORT CARD ACKNOWLEDGMENT & SIGNATURE MODAL     */}
      {/* ======================================================== */}
      {showSignModal && liveReportCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Digitally Acknowledge Report Card
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Official Parent Confirmation &amp; Board Seal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSignModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSignReportCard} className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Candidate:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{studentName} ({className})</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Examination Term:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{liveReportCard.term}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Overall Percentage / Grade:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{liveReportCard.overall_percentage}% ({liveReportCard.overall_grade})</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Legal Signatory Name (Father / Mother / Guardian)
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Parent Remarks / Feedback for Class Teacher
                </label>
                <textarea
                  rows={2}
                  value={signRemarks}
                  onChange={(e) => setSignRemarks(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="Optional acknowledgment remarks..."
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-300 leading-relaxed">
                By clicking below, I confirm that I have reviewed my ward&apos;s academic evaluation memo, teacher narratives, and remedial plans. This digital signature is legally recorded and synchronized with the School Examination Cell.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSigning || !signerName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSigning ? (
                    <span>Stamping Digital Seal...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Confirm &amp; Digitally Seal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
"""

target_end = "      {/* Re-Exam Hall Ticket Pass Modal */}"
if target_end in content:
    content = content.replace(target_end, sign_modal_code + "\n      {/* Re-Exam Hall Ticket Pass Modal */}")

with open("frontend/src/components/parent-marks-view.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("parent-marks-view.tsx updated successfully.")
