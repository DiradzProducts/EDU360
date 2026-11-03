with open("frontend/src/app/teacher/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

target = """  useEffect(() => {
    const timer = setInterval(() => {
      setScheduleActivePeriodSeconds(prev => (prev > 0 ? prev - 1 : 2700));
    }, 1000);
    return () => clearInterval(timer);
  }, []);"""

addition = """  useEffect(() => {
    const timer = setInterval(() => {
      setScheduleActivePeriodSeconds(prev => (prev > 0 ? prev - 1 : 2700));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Synchronize teacher chat with shared parent-teacher API/cache in real-time
  useEffect(() => {
    if (activeTab === 'parent_chat') {
      api.getParentChatMessages(selectedChatStudentId).then((allMsgs) => {
        if (allMsgs && allMsgs.length > 0) {
          const mapped = allMsgs.map((m) => ({
            id: m.id,
            sender: m.sender_role === 'TEACHER' ? ('teacher' as const) : ('parent' as const),
            text: m.message_text,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachment: m.attachment_name ? { name: m.attachment_name, size: '250 KB', type: 'application/pdf' } : undefined
          }));
          setConversations((prev) => ({
            ...prev,
            [selectedChatStudentId]: mapped
          }));
        }
      }).catch(console.error);
    }
  }, [activeTab, selectedChatStudentId]);"""

if target in code:
    code = code.replace(target, addition)
    with open("frontend/src/app/teacher/page.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("teacher.py updated with live chat synchronization!")
else:
    print("target not found in teacher/page.tsx")
