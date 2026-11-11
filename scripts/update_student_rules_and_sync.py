with open('frontend/src/app/student/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add cross-window storage listener
target_load_effect = """        if (rcRes && rcRes.length > 0) {
          setStudentReportCard(rcRes[0]);
        }
        await loadDescriptiveExams();
      } catch (err) {
        console.error('Error fetching student data', err);
      }
    }
    loadPortalData();
  }, []);"""

repl_load_effect = """        if (rcRes && rcRes.length > 0) {
          setStudentReportCard(rcRes[0]);
        }
        await loadDescriptiveExams();
      } catch (err) {
        console.error('Error fetching student data', err);
      }
    }
    loadPortalData();
  }, []);

  // Multi-window role testing sync: automatically update schedules when Exam Coordinator creates new slots in other windows
  useEffect(() => {
    const syncSchedulesFromStorage = () => {
      api.getExamSchedules().then(res => {
        if (res && Array.isArray(res) && res.length > 0) {
          setStudentExamSchedules(res);
        }
      }).catch(() => {});
    };

    window.addEventListener('storage', syncSchedulesFromStorage);
    window.addEventListener('edu360_exam_schedules_updated', syncSchedulesFromStorage);
    return () => {
      window.removeEventListener('storage', syncSchedulesFromStorage);
      window.removeEventListener('edu360_exam_schedules_updated', syncSchedulesFromStorage);
    };
  }, []);"""

if target_load_effect in text:
    text = text.replace(target_load_effect, repl_load_effect, 1)
    print("Added cross-window schedule sync to student page!")
else:
    print("Warning: target_load_effect not found directly")

# 2. Replace static 4-bullet card with comprehensive Official Examination Rules & Protocol Card
old_hall_card = """                  {/* HALL PROTOCOL & CODE OF CONDUCT CARD */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                    <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block text-[10px]">
                      CBSE Candidate Rules &amp; Hall Discipline Instructions:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc list-inside text-[11px]">
                      <li>Candidates must be seated by 09:00 AM sharp. Late entry after 09:15 AM is prohibited.</li>
                      <li>Physical Hall Ticket with official principal seal is mandatory at entry gate.</li>
                      <li>Smartwatches, programmable calculators, and electronic gadgets are strictly banned.</li>
                      <li>15-minute cool-off reading time is provided from 09:15 AM to 09:30 AM before writing.</li>
                    </ul>
                  </div>"""

new_hall_card = """                  {/* OFFICIAL CBSE CANDIDATE EXAMINATION PROTOCOL & HYBRID RULES */}
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-violet-50/70 via-indigo-50/40 to-purple-50/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30 border border-violet-200 dark:border-violet-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-3.5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-200/60 dark:border-violet-900/40 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                            Official Candidate Examination Rules &amp; Hybrid Proctoring Protocol
                          </h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">CBSE Central Examination Cell Directives (Affiliation #830029)</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border border-violet-200 dark:border-violet-800 w-fit">
                        Official Academic Code of Conduct
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
                        <span className="font-black text-violet-700 dark:text-violet-300 text-xs block">
                          ✍️ 1. Physical Paper Writing
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          Write all working on standard physical ruled answer sheets with blue/black pen. Write Roll Number (#14) on every sheet.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
                        <span className="font-black text-violet-700 dark:text-violet-300 text-xs block">
                          📷 2. Unbroken Camera Custody
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          Keep your web camera focused on your face, hands, and desk workspace. Head turns away from desk trigger AI proctor alerts.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
                        <span className="font-black text-rose-600 dark:text-rose-400 text-xs block">
                          🚫 3. Prohibited Devices &amp; Penalty
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          Smartphones, smartwatches, and second screens are banned. Repeated infractions incur an official 5-mark penalty or eviction.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
                        <span className="font-black text-violet-700 dark:text-violet-300 text-xs block">
                          🎙️ 4. Invigilator Voice Intercom
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          Chief Invigilator (Mrs. Ananya Verma) has live push-to-talk voice access. Listen and follow verbal instructions promptly.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs block">
                          🔐 5. Dynamic Submission Seal
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          A 6-digit seal code (#HYBRID-8492) pops when time finishes. Write this in ink on every sheet before scanning &amp; uploading.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
                        <span className="font-black text-violet-700 dark:text-violet-300 text-xs block">
                          ⏱️ 6. 15-Min Scan Grace Window
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          Writing must cease promptly when timer expires. A dedicated 15-minute window is provided exclusively for scanning pages.
                        </p>
                      </div>
                    </div>
                  </div>"""

if old_hall_card in text:
    text = text.replace(old_hall_card, new_hall_card, 1)
    print("Replaced static rules card with comprehensive Official Rules & Protocol card!")
else:
    print("Warning: old_hall_card not found directly")

with open('frontend/src/app/student/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Saved student/page.tsx!")
