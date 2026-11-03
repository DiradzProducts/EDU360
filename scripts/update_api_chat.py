with open("frontend/src/lib/api.ts", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add fallbackChatMessages at top
triage_target = "let fallbackTriage: TriageAlert[] = ["
fallback_chat_def = """let fallbackChatMessages: ParentTeacherChatMessage[] = [
  {
    id: 1,
    student_id: 1,
    student_name: 'Aarav Sharma',
    sender_role: 'PARENT',
    sender_name: 'Rajesh Sharma',
    receiver_role: 'TEACHER',
    receiver_name: 'Mrs. Ananya Verma',
    message_text: "Hello Mrs. Verma, I noticed the Quadratic Equations note in Aarav's Focus Table. We completed Day 2 factoring problems in his rough notebook yesterday.",
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 2,
    student_id: 1,
    student_name: 'Aarav Sharma',
    sender_role: 'TEACHER',
    sender_name: 'Mrs. Ananya Verma',
    receiver_role: 'PARENT',
    receiver_name: 'Rajesh Sharma',
    message_text: "Thank you Mr. Rajesh Sharma! I reviewed his factoring steps in Period 3 today. He understood splitting the middle term well. Day 3 word problems have been assigned.",
    attachment_name: "Day3_Quadratic_Practice.pdf",
    attachment_url: "/attachments/Day3_Quadratic_Practice.pdf",
    is_read: true,
    created_at: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 3,
    student_id: 1,
    student_name: 'Aarav Sharma',
    sender_role: 'TEACHER',
    sender_name: 'Dr. K. Raman',
    receiver_role: 'PARENT',
    receiver_name: 'Rajesh Sharma',
    message_text: "Good afternoon Mr. Sharma! Aarav performed very well in today's Optics Ray Diagram virtual simulation. Please ensure he submits the convex lens focal length observations.",
    attachment_name: "Optics_Ray_Diagram_Lab.pdf",
    attachment_url: "/attachments/Optics_Ray_Diagram_Lab.pdf",
    is_read: true,
    created_at: new Date(Date.now() - 25000000).toISOString()
  },
  {
    id: 4,
    student_id: 1,
    student_name: 'Aarav Sharma',
    sender_role: 'PARENT',
    sender_name: 'Rajesh Sharma',
    receiver_role: 'TEACHER',
    receiver_name: 'Dr. K. Raman',
    message_text: "Thank you Dr. Raman. He has completed the ray diagram table in his science journal. We will upload it before 6 PM.",
    is_read: true,
    created_at: new Date(Date.now() - 18000000).toISOString()
  },
  {
    id: 5,
    student_id: 1,
    student_name: 'Aarav Sharma',
    sender_role: 'TEACHER',
    sender_name: 'Ms. Deepa Menon',
    receiver_role: 'PARENT',
    receiver_name: 'Rajesh Sharma',
    message_text: "Hello Mr. Sharma, Aarav wrote a wonderful critical essay on 'The Road Not Taken'. His vocabulary has expanded nicely.",
    is_read: true,
    created_at: new Date(Date.now() - 36000000).toISOString()
  },
  {
    id: 6,
    student_id: 1,
    student_name: 'Aarav Sharma',
    sender_role: 'TEACHER',
    sender_name: 'Mr. Rajesh Nair',
    receiver_role: 'PARENT',
    receiver_name: 'Rajesh Sharma',
    message_text: "Namaste Mr. Sharma, just reminding that the Indian Constitution Civics project chart is due on Friday.",
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

"""

if "let fallbackChatMessages:" not in content:
    content = content.replace(triage_target, fallback_chat_def + triage_target)

# 2. Update getParentChatMessages and sendParentChatMessage implementation
old_chat_block = """  getParentChatMessages: async (studentId: number = 1): Promise<ParentTeacherChatMessage[]> => {
    try {
      return await fetchWithFallback<ParentTeacherChatMessage[]>(`/api/parent/chat/${studentId}`, undefined, [
        {
          id: 1,
          student_id: studentId,
          sender_role: 'PARENT',
          sender_name: 'Rajesh Sharma',
          receiver_role: 'TEACHER',
          receiver_name: 'Mrs. Ananya Verma',
          message_text: "Hello Mrs. Verma, I noticed the Quadratic Equations note in Aarav's Focus Table. We completed Day 2 factoring problems in his rough notebook yesterday.",
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 2,
          student_id: studentId,
          sender_role: 'TEACHER',
          sender_name: 'Mrs. Ananya Verma',
          receiver_role: 'PARENT',
          receiver_name: 'Rajesh Sharma',
          message_text: "Thank you Mr. Rajesh Sharma! I reviewed his factoring steps in Period 3 today. He understood splitting the middle term well. Day 3 word problems have been assigned.",
          attachment_name: "Day3_Quadratic_Practice.pdf",
          attachment_url: "/attachments/Day3_Quadratic_Practice.pdf",
          is_read: true,
          created_at: new Date(Date.now() - 43200000).toISOString()
        }
      ]);
    } catch {
      return [];
    }
  },

  sendParentChatMessage: async (data: {
    student_id: number;
    sender_name: string;
    receiver_name: string;
    message_text: string;
    attachment_name?: string;
    attachment_url?: string;
    sender_role?: 'PARENT' | 'TEACHER';
    receiver_role?: 'PARENT' | 'TEACHER';
  }): Promise<ParentTeacherChatMessage> => {
    return await fetchWithFallback<ParentTeacherChatMessage>('/api/parent/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: data.student_id,
        sender_role: data.sender_role || 'PARENT',
        sender_name: data.sender_name,
        receiver_role: data.receiver_role || 'TEACHER',
        receiver_name: data.receiver_name,
        message_text: data.message_text,
        attachment_name: data.attachment_name,
        attachment_url: data.attachment_url
      })
    });
  },"""

new_chat_block = """  getParentChatMessages: async (studentId: number = 1, teacherName?: string): Promise<ParentTeacherChatMessage[]> => {
    try {
      const q = teacherName ? `?teacher_name=${encodeURIComponent(teacherName)}` : '';
      const serverMsgs = await fetchWithFallback<ParentTeacherChatMessage[]>(`/api/parent/chat/${studentId}${q}`, undefined, null as any);
      if (serverMsgs && Array.isArray(serverMsgs) && serverMsgs.length > 0) {
        for (const sm of serverMsgs) {
          const exists = fallbackChatMessages.some(m => m.id === sm.id || (m.created_at === sm.created_at && m.message_text === sm.message_text));
          if (!exists) {
            fallbackChatMessages.push(sm);
          }
        }
      }
    } catch {
      // Fallback in-memory cache active
    }

    const targetIds = (studentId === 1 || studentId === 6) ? [1, 6] : [studentId];
    return fallbackChatMessages.filter(m => {
      const matchKid = targetIds.includes(m.student_id);
      if (!matchKid) return false;
      if (teacherName) {
        return m.sender_name.toLowerCase().includes(teacherName.toLowerCase()) ||
               m.receiver_name.toLowerCase().includes(teacherName.toLowerCase());
      }
      return true;
    });
  },

  sendParentChatMessage: async (data: {
    student_id: number;
    sender_name: string;
    receiver_name: string;
    message_text: string;
    attachment_name?: string;
    attachment_url?: string;
    sender_role?: 'PARENT' | 'TEACHER';
    receiver_role?: 'PARENT' | 'TEACHER';
  }): Promise<ParentTeacherChatMessage> => {
    const newMsg: ParentTeacherChatMessage = {
      id: Date.now(),
      student_id: data.student_id,
      student_name: (data.student_id === 1 || data.student_id === 6) ? 'Aarav Sharma' : 'Student',
      sender_role: data.sender_role || 'PARENT',
      sender_name: data.sender_name,
      receiver_role: data.receiver_role || 'TEACHER',
      receiver_name: data.receiver_name,
      message_text: data.message_text,
      attachment_name: data.attachment_name,
      attachment_url: data.attachment_url,
      is_read: false,
      created_at: new Date().toISOString()
    };
    fallbackChatMessages.push(newMsg);

    try {
      const endpoint = data.sender_role === 'TEACHER' ? '/api/teacher/chat/send' : '/api/parent/chat/send';
      const res = await fetchWithFallback<ParentTeacherChatMessage>(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: data.student_id,
          sender_role: data.sender_role || 'PARENT',
          sender_name: data.sender_name,
          receiver_role: data.receiver_role || 'TEACHER',
          receiver_name: data.receiver_name,
          message_text: data.message_text,
          attachment_name: data.attachment_name,
          attachment_url: data.attachment_url
        })
      });
      if (res && res.id) {
        newMsg.id = res.id;
      }
    } catch (e) {
      // Retained in fallbackChatMessages successfully
    }
    return newMsg;
  },"""

if old_chat_block in content:
    content = content.replace(old_chat_block, new_chat_block)
    print("api.ts updated successfully with shared fallbackChatMessages!")
else:
    print("old_chat_block not matched in api.ts!")

with open("frontend/src/lib/api.ts", "w", encoding="utf-8") as f:
    f.write(content)
