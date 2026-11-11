with open('frontend/src/app/student/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add onlineExamMode state
old_exam_state = "const [onlineExamMaxMarks, setOnlineExamMaxMarks] = useState<number>(20);"
new_exam_state = """const [onlineExamMaxMarks, setOnlineExamMaxMarks] = useState<number>(20);
  const [onlineExamMode, setOnlineExamMode] = useState<'MODE_CBT' | 'MODE_HYBRID_SCAN'>('MODE_HYBRID_SCAN');"""

if old_exam_state in text:
    text = text.replace(old_exam_state, new_exam_state, 1)
    print("Added onlineExamMode state")
else:
    print("Warning: old_exam_state not found")

# 2. Update handleLaunchExam signature and body
old_launch_fn = """  const handleLaunchExam = (
    subject: string = 'Mathematics',
    topic: string = 'Quadratic Equations Quiz',
    duration: number = 20,
    prompt?: string,
    maxMarks: number = 20
  ) => {
    setOnlineExamSubject(subject);
    setOnlineExamTopic(topic);
    setOnlineExamDuration(duration);
    setOnlineExamPrompt(prompt);
    setOnlineExamMaxMarks(maxMarks);
    setIsOnlineExamOpen(true);
  };"""

new_launch_fn = """  const handleLaunchExam = (
    subject: string = 'Mathematics',
    topic: string = 'Quadratic Equations Quiz',
    duration: number = 20,
    prompt?: string,
    maxMarks: number = 20,
    mode: 'MODE_CBT' | 'MODE_HYBRID_SCAN' = 'MODE_HYBRID_SCAN'
  ) => {
    setOnlineExamSubject(subject);
    setOnlineExamTopic(topic);
    setOnlineExamDuration(duration);
    setOnlineExamPrompt(prompt);
    setOnlineExamMaxMarks(maxMarks);
    setOnlineExamMode(mode);
    setIsOnlineExamOpen(true);
  };"""

if old_launch_fn in text:
    text = text.replace(old_launch_fn, new_launch_fn, 1)
    print("Updated handleLaunchExam function")
else:
    print("Warning: old_launch_fn not found")

# 3. Update the active card button to "Join Proctored Exam Room"
old_card_btn = """                      <button
                        onClick={() => {
                          const active = studentExamSchedules[0];
                          if (active?.exam_mode === 'MODE_HYBRID_SCAN') {
                            setExamSubTab('results');
                            triggerToast(`Opening Descriptive Submission Drawer for ${active.title}`);
                            return;
                          }
                          const prompt = active?.question_paper_title
                            ? `Official CBSE Timetable Exam: ${active.title}. Blueprint Reference: ${active.question_paper_title}. Step-wise analytical reasoning required.`
                            : undefined;
                          handleLaunchExam(
                            active?.subject || 'Mathematics',
                            active?.title || 'Online CBT Assessment',
                            20,
                            prompt,
                            25
                          );
                        }}
                        className="shrink-0 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{studentExamSchedules[0]?.exam_mode === 'MODE_HYBRID_SCAN' ? 'Submit Paper Scan' : 'Start Test'}</span>
                      </button>"""

new_card_btn = """                      <button
                        onClick={() => {
                          const active = studentExamSchedules[0];
                          const targetMode = active?.exam_mode === 'MODE_CBT' ? 'MODE_CBT' : 'MODE_HYBRID_SCAN';
                          const prompt = active?.question_paper_title
                            ? `Official CBSE Board Timetable Exam: ${active.title}. Question Reference: ${active.question_paper_title}. Step-wise handwritten working required on physical paper booklet.`
                            : 'Official CBSE Assessment: Solve questions on physical paper booklet under active webcam/YOLO proctoring. Verify and upload final scan with session token.';
                          handleLaunchExam(
                            active?.subject || 'Mathematics',
                            active?.title || 'Term 1 Hybrid Proctored Assessment',
                            active?.duration_minutes || 60,
                            prompt,
                            100,
                            targetMode
                          );
                        }}
                        className="shrink-0 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-black text-xs px-5 py-3 shadow-lg shadow-purple-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                        </span>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Join Proctored Exam Room</span>
                      </button>"""

if old_card_btn in text:
    text = text.replace(old_card_btn, new_card_btn, 1)
    print("Updated active card button to Join Proctored Exam Room")
else:
    print("Warning: old_card_btn not found")

# 4. Pass examMode to OnlineExamModal
old_modal_call = """      <OnlineExamModal
        isOpen={isOnlineExamOpen}
        onClose={() => setIsOnlineExamOpen(false)}
        examTitle={`${onlineExamSubject}: ${onlineExamTopic}`}
        subject={onlineExamSubject}
        durationMinutes={onlineExamDuration}
        questionPrompt={onlineExamPrompt}
        maxMarks={onlineExamMaxMarks}
        studentName={user?.name || 'Aarav Sharma'}"""

new_modal_call = """      <OnlineExamModal
        isOpen={isOnlineExamOpen}
        onClose={() => setIsOnlineExamOpen(false)}
        examTitle={`${onlineExamSubject}: ${onlineExamTopic}`}
        subject={onlineExamSubject}
        durationMinutes={onlineExamDuration}
        questionPrompt={onlineExamPrompt}
        maxMarks={onlineExamMaxMarks}
        examMode={onlineExamMode}
        studentName={user?.name || 'Aarav Sharma'}"""

if old_modal_call in text:
    text = text.replace(old_modal_call, new_modal_call, 1)
    print("Passed examMode to OnlineExamModal")
else:
    print("Warning: old_modal_call not found")

with open('frontend/src/app/student/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated student/page.tsx!")
