with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

norm_text = text.replace('\r\n', '\n')

target = """              </div>
            </div>
          )}

          {/* ── TAB 4: LIVE TEACHER MARKS SUBMISSION TRACKER & MODERATION ── */}"""

replacement = """              </div>
            </div>
          )}

          {/* ── TAB: LIVE AI PROCTOR COCKPIT ── */}
          {activeTab === 'cockpit' && (
            <div className="space-y-6">
              <LiveInvigilatorCockpit />
            </div>
          )}

          {/* ── TAB 4: LIVE TEACHER MARKS SUBMISSION TRACKER & MODERATION ── */}"""

if target in norm_text:
    norm_text = norm_text.replace(target, replacement, 1)
    with open('frontend/src/app/exam_coordinator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(norm_text.replace('\n', '\r\n'))
    print("Successfully hooked LiveInvigilatorCockpit into exam_coordinator/page.tsx")
else:
    print("Target not found in exam_coordinator/page.tsx")
