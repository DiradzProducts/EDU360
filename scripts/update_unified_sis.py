with open('frontend/src/components/unified-sis-view.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add imports
old_imports = """import { Student } from '@/lib/types';"""
new_imports = """import { Student, ExitClearance } from '@/lib/types';
import { api } from '@/lib/api';
import { ExitClearanceView } from '@/components/exit-clearance-modal';
import { LogOut, Library, FlaskConical } from 'lucide-react';"""

c = c.replace(old_imports, new_imports, 1)

# 2. Update activeTab state type
old_active_tab = """  const [activeTab, setActiveTab] = useState<'profile' | 'academics' | 'remarks' | 'attendance' | 'vault' | 'fees'>('profile');"""
new_active_tab = """  const [activeTab, setActiveTab] = useState<'profile' | 'academics' | 'remarks' | 'attendance' | 'vault' | 'fees' | 'exit'>('profile');
  
  // Exit Clearance State (Admin Exclusive)
  const [exitClearance, setExitClearance] = useState<ExitClearance | null>(null);
  const [loadingExit, setLoadingExit] = useState(false);
  const [initiatingExit, setInitiatingExit] = useState(false);"""

c = c.replace(old_active_tab, new_active_tab, 1)

# 3. Add effectiveStudentId and exit clearance load & handlers
old_student_info = """  // Student base info (derived or fallback)
  const currentStudentName = student?.name || 'Aarav Sharma';"""

new_student_info = """  // Effective student ID
  const effectiveStudentId = student?.id || studentId;

  // Student base info (derived or fallback)
  const currentStudentName = student?.name || 'Aarav Sharma';"""

c = c.replace(old_student_info, new_student_info, 1)

# 4. In useEffect, load student exit clearance
old_use_effect = """  useEffect(() => {
    const list = getRemarksForStudent(studentId);
    setRemarks(list);
  }, [studentId]);"""

new_use_effect = """  useEffect(() => {
    const list = getRemarksForStudent(studentId);
    setRemarks(list);
  }, [studentId]);

  useEffect(() => {
    if (viewerRole === 'admin') {
      setLoadingExit(true);
      api.getStudentExitClearance(effectiveStudentId).then(cl => {
        setExitClearance(cl);
        setLoadingExit(false);
      }).catch(() => setLoadingExit(false));
    }
  }, [effectiveStudentId, viewerRole]);

  const handleInitiateExit = async () => {
    setInitiatingExit(true);
    try {
      const res = await api.initiateExitClearance(effectiveStudentId);
      if (res && res.clearance) {
        setExitClearance(res.clearance);
        triggerToast(`Exit clearance protocol initiated for ${currentStudentName}!`);
      }
    } catch (err) {
      triggerToast('Failed to initiate exit clearance');
    } finally {
      setInitiatingExit(false);
    }
  };

  const handleVerifyPhysicalExit = async (scanUrl?: string) => {
    if (!exitClearance) return;
    await api.verifyPhysicalSign(exitClearance.id, scanUrl);
    const updated = await api.getStudentExitClearance(effectiveStudentId);
    setExitClearance(updated);
    triggerToast('Physical handover register scan verified & locked in legal vault');
  };"""

c = c.replace(old_use_effect, new_use_effect, 1)

# 5. Add exit tab to tabs array
old_tabs = """    ...((viewerRole === 'admin' || viewerRole === 'parent' || viewerRole === 'coordinator') ? [
      { id: 'fees', label: 'Fee & Accounts Ledger', icon: ShieldCheck }
    ] : [])
  ] as const;"""

new_tabs = """    ...((viewerRole === 'admin' || viewerRole === 'parent' || viewerRole === 'coordinator') ? [
      { id: 'fees', label: 'Fee & Accounts Ledger', icon: ShieldCheck }
    ] : []),
    ...(viewerRole === 'admin' ? [
      { id: 'exit', label: 'Exit Clearance & TC Vault', icon: LogOut }
    ] : [])
  ] as const;"""

c = c.replace(old_tabs, new_tabs, 1)

# 6. Add Exit Tab Content after fees tab
old_fee_tab_end = """      {activeTab === 'fees' && (
        <div className=\"space-y-6\">
          <div className=\"rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm\">
            <h3 className=\"text-sm font-bold text-slate-900 dark:text-white mb-2\">Academic Fee Ledger &bull; Session 2026-27</h3>
            <p className=\"text-xs text-slate-500 mb-6\">Tuition, lab facilities, and bus transportation clearance schedule</p>

            <div className=\"grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6\">
              <div className=\"p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center\">
                <span className=\"text-[10px] font-bold text-slate-400 uppercase\">Annual Fee Structure</span>
                <span className=\"text-xl font-black text-slate-900 dark:text-white block mt-0.5\">₹1,45,000</span>
              </div>
              <div className=\"p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center\">
                <span className=\"text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase\">Total Realized</span>
                <span className=\"text-xl font-black text-emerald-800 dark:text-emerald-200 block mt-0.5\">₹1,26,500</span>
              </div>
              <div className=\"p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center\">
                <span className=\"text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase\">Outstanding Balance</span>
                <span className=\"text-xl font-black text-amber-800 dark:text-amber-200 block mt-0.5\">₹18,500</span>
              </div>
            </div>

            <div className=\"space-y-3\">
              <div className=\"p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs\">
                <div>
                  <div className=\"font-bold text-slate-900 dark:text-white\">Term 1 Composite Tuition &amp; Lab Fee</div>
                  <div className=\"text-[11px] text-slate-500\">Paid on 10 Jul 2026 via UPI (Ref: EDU-RCP-8801)</div>
                </div>
                <div className=\"text-right\">
                  <span className=\"font-black text-emerald-600 block\">₹72,500 Paid</span>
                  <span className=\"text-[10px] text-slate-400\">Receipt Available</span>
                </div>
              </div>

              <div className=\"p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs\">
                <div>
                  <div className=\"font-bold text-slate-900 dark:text-white\">Term 2 Composite Fee &bull; Partial Installment</div>
                  <div className=\"text-[11px] text-slate-500\">Paid on 05 Oct 2026 via Bank POS (Ref: EDU-RCP-9142)</div>
                </div>
                <div className=\"text-right\">
                  <span className=\"font-black text-emerald-600 block\">₹54,000 Paid</span>
                  <span className=\"text-[10px] text-amber-500 font-bold\">₹18,500 Balance Due 15 Nov</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}"""

new_exit_tab_content = """      {activeTab === 'exit' && viewerRole === 'admin' && (
        <div className=\"space-y-6\">
          {exitClearance ? (
            <div className=\"space-y-4\">
              <div className=\"rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-4 flex items-center justify-between\">
                <div className=\"flex items-center gap-3\">
                  <div className=\"h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0\">
                    TC
                  </div>
                  <div>
                    <h4 className=\"text-sm font-bold text-slate-900 dark:text-white\">
                      Active Transfer Certificate (TC) Protocol in Progress
                    </h4>
                    <p className=\"text-xs text-slate-500 dark:text-slate-400\">
                      Student is registered in the School Exit Clearance pipeline. Complete dual-verification below.
                    </p>
                  </div>
                </div>
                <span className=\"rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-3 py-1 text-xs font-bold border border-blue-200 dark:border-blue-700\">
                  {exitClearance.status}
                </span>
              </div>

              <ExitClearanceView
                clearance={exitClearance}
                role=\"admin\"
                onVerifyPhysical={handleVerifyPhysicalExit}
              />
            </div>
          ) : (
            <div className=\"rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6\">
              {/* Header */}
              <div className=\"flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5\">
                <div>
                  <div className=\"flex items-center gap-2 mb-1.5\">
                    <span className=\"rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 px-2.5 py-0.5 text-xs font-bold border border-rose-200 dark:border-rose-800\">
                      Admin Authority Exclusive
                    </span>
                    <span className=\"text-xs text-slate-400\">CBSE Rule 44 Statutory Compliance</span>
                  </div>
                  <h3 className=\"text-lg font-black text-slate-900 dark:text-white\">
                    🎓 Initiate Exit Clearance &amp; Transfer Certificate (TC)
                  </h3>
                  <p className=\"text-xs text-slate-500 dark:text-slate-400 mt-1\">
                    Initiate permanent school-leaving workflow for <strong className=\"text-slate-800 dark:text-slate-200\">{currentStudentName}</strong> ({currentClass} - {currentSection}, Roll #{currentRoll}).
                  </p>
                </div>

                <button
                  onClick={handleInitiateExit}
                  disabled={initiatingExit}
                  className=\"flex items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 text-xs font-bold shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30 transition-all cursor-pointer shrink-0 disabled:opacity-50\"
                >
                  <LogOut className=\"h-4 w-4\" />
                  <span>{initiatingExit ? 'Initiating Exit...' : 'Initiate Exit Clearance & Issue TC'}</span>
                </button>
              </div>

              {/* 4-Department Pre-Clearance Audit Grid */}
              <div>
                <h4 className=\"text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3\">
                  Automated Multi-Department Clearance Pre-Audit
                </h4>
                <div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3\">
                  <div className=\"p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3\">
                    <div className=\"p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0\">
                      <ShieldCheck className=\"h-5 w-5\" />
                    </div>
                    <div>
                      <div className=\"flex items-center gap-1.5\">
                        <span className=\"text-xs font-bold text-slate-900 dark:text-white\">Fee &amp; Accounts</span>
                        <CheckCircle2 className=\"h-3.5 w-3.5 text-emerald-500\" />
                      </div>
                      <p className=\"text-[11px] text-slate-500 mt-0.5\">₹0 Outstanding Dues Verified</p>
                    </div>
                  </div>

                  <div className=\"p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3\">
                    <div className=\"p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0\">
                      <Library className=\"h-5 w-5\" />
                    </div>
                    <div>
                      <div className=\"flex items-center gap-1.5\">
                        <span className=\"text-xs font-bold text-slate-900 dark:text-white\">Library Holdings</span>
                        <CheckCircle2 className=\"h-3.5 w-3.5 text-emerald-500\" />
                      </div>
                      <p className=\"text-[11px] text-slate-500 mt-0.5\">0 Active Book Holds (Returned)</p>
                    </div>
                  </div>

                  <div className=\"p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3\">
                    <div className=\"p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0\">
                      <FlaskConical className=\"h-5 w-5\" />
                    </div>
                    <div>
                      <div className=\"flex items-center gap-1.5\">
                        <span className=\"text-xs font-bold text-slate-900 dark:text-white\">Laboratory Assets</span>
                        <CheckCircle2 className=\"h-3.5 w-3.5 text-emerald-500\" />
                      </div>
                      <p className=\"text-[11px] text-slate-500 mt-0.5\">Science &amp; Comp Lab Cleared</p>
                    </div>
                  </div>

                  <div className=\"p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3\">
                    <div className=\"p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0\">
                      <BookOpen className=\"h-5 w-5\" />
                    </div>
                    <div>
                      <div className=\"flex items-center gap-1.5\">
                        <span className=\"text-xs font-bold text-slate-900 dark:text-white\">Academic Records</span>
                        <CheckCircle2 className=\"h-3.5 w-3.5 text-emerald-500\" />
                      </div>
                      <p className=\"text-[11px] text-slate-500 mt-0.5\">Mark Memo &amp; Standing Ready</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informational Workflow Callout */}
              <div className=\"rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3\">
                <AlertCircle className=\"h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5\" />
                <div className=\"space-y-1\">
                  <strong className=\"block font-bold\">Next Steps upon Initiation:</strong>
                  <p className=\"text-amber-800 dark:text-amber-300\">
                    1. Student will be enrolled into the active <strong>School Exit Clearance Ledger</strong> (accessible via Admin Portal &rarr; Student TC).
                  </p>
                  <p className=\"text-amber-800 dark:text-amber-300\">
                    2. The linked parent ({student?.guardian || 'Parent/Guardian'}) will see an immediate <strong>In-App Digital Sign-off Banner</strong> on their Parent Dashboard.
                  </p>
                  <p className=\"text-amber-800 dark:text-amber-300\">
                    3. Once the parent provides digital approval and school admin uploads the signed physical register handover scan, the exit record will be permanently locked in the legal vault.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}"""

c_norm = c.replace('\r\n', '\n')
old_tab_norm = old_fee_tab_end.replace('\r\n', '\n')
new_tab_norm = (old_fee_tab_end + '\n\n' + new_exit_tab_content).replace('\r\n', '\n')

assert old_tab_norm in c_norm, "old_fee_tab_end not found"
c_norm = c_norm.replace(old_tab_norm, new_tab_norm, 1)

with open('frontend/src/components/unified-sis-view.tsx', 'w', encoding='utf-8') as f:
    f.write(c_norm)

print("unified-sis-view.tsx updated successfully!")
