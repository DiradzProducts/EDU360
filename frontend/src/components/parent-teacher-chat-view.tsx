'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Clock,
  CheckCheck,
  User,
  GraduationCap,
  Sparkles,
  FileText,
  X,
  Phone,
  Video,
  AlertCircle,
  HelpCircle,
  Download,
  Search,
  BookOpen,
  Filter
} from 'lucide-react';
import { api } from '@/lib/api';
import { ParentTeacherChatMessage } from '@/lib/types';
import { playButtonClick, playStarCollect } from '@/lib/sound-effects';

export interface SubjectTeacherProfile {
  id: string;
  name: string;
  role: string;
  subject: string;
  email: string;
  phone: string;
  officeHours: string;
  avatarBg: string;
  isHomeroom?: boolean;
  quickPrompts: string[];
}

const SECONDARY_FACULTY_DIRECTORY: SubjectTeacherProfile[] = [
  {
    id: 'ananya',
    name: 'Mrs. Ananya Verma',
    role: 'Homeroom Class Teacher & Senior Mentor',
    subject: 'Mathematics',
    email: 'ananya.verma@edu360.internal',
    phone: '+91 98111 00002',
    officeHours: 'Mon - Fri • 03:30 PM - 04:30 PM',
    avatarBg: 'bg-indigo-600',
    isHomeroom: true,
    quickPrompts: [
      "Can you clarify Q4 of today's homework?",
      "Completed Day 2 factoring in rough notebook",
      "Aarav solved 10 middle-term splitting problems",
      "Requesting 10 mins discussion in next PTM"
    ]
  },
  {
    id: 'raman',
    name: 'Dr. K. Raman',
    role: 'Head of Science & Physics Lab Director',
    subject: 'Science & Physics',
    email: 'raman.k@edu360.internal',
    phone: '+91 98111 22332',
    officeHours: 'Tue, Thu • 04:00 PM - 05:00 PM',
    avatarBg: 'bg-blue-600',
    quickPrompts: [
      "Doubts regarding today's Optics Ray Diagram",
      "Submitted convex lens observations table",
      "Aarav completed the chemical balancing worksheet",
      "Inquiry about upcoming online physics quiz"
    ]
  },
  {
    id: 'deepa',
    name: 'Ms. Deepa Menon',
    role: 'English Department Head & Literary Mentor',
    subject: 'English Literature',
    email: 'deepa.menon@edu360.internal',
    phone: '+91 98111 22334',
    officeHours: 'Wed, Fri • 03:00 PM - 04:00 PM',
    avatarBg: 'bg-emerald-600',
    quickPrompts: [
      "Inquiry about term reading list books",
      "Feedback on poetry P.E.E.L essay structure",
      "Aarav submitted audio recording for speech recitation",
      "Requesting grammar worksheet suggestions"
    ]
  },
  {
    id: 'sunitha',
    name: 'Mrs. Sunitha Rao',
    role: 'Senior Secondary Mathematics Specialist',
    subject: 'Advanced Algebra',
    email: 'sunitha.rao@edu360.internal',
    phone: '+91 98111 22331',
    officeHours: 'Mon, Wed • 03:30 PM - 04:30 PM',
    avatarBg: 'bg-purple-600',
    quickPrompts: [
      "Help needed on algebraic fraction signs",
      "Remedial Day 3 word problems completed",
      "Quadratic discriminant doubt in question 7",
      "Requesting extra practice worksheet"
    ]
  },
  {
    id: 'rajesh_nair',
    name: 'Mr. Rajesh Nair',
    role: 'Faculty of Social Studies & Civics',
    subject: 'Social Studies & Civics',
    email: 'rajesh.nair@edu360.internal',
    phone: '+91 98111 22335',
    officeHours: 'Tue, Fri • 03:30 PM - 04:30 PM',
    avatarBg: 'bg-amber-600',
    quickPrompts: [
      "Indian Constitution Civics chart submitted",
      "Clarification on 1857 Revolt history timeline",
      "World climate map activity doubt",
      "Confirmed topic for group presentation"
    ]
  },
  {
    id: 'amit_coding',
    name: 'Mr. Amit Sengupta',
    role: 'Coding, AI & Robotics Lab Instructor',
    subject: 'Computer Science & AI',
    email: 'amit.s@edu360.internal',
    phone: '+91 98111 22336',
    officeHours: 'Mon, Thu • 04:00 PM - 05:00 PM',
    avatarBg: 'bg-teal-600',
    quickPrompts: [
      "Python loop debugging doubt in assignment",
      "Robotics simulation project link submitted",
      "Completed AI ethics quiz module",
      "Requesting GitHub repo review"
    ]
  }
];

const JUNIOR_FACULTY_DIRECTORY: SubjectTeacherProfile[] = [
  {
    id: 'priya',
    name: 'Ms. Priya Nair',
    role: 'Homeroom Class Teacher & Story Magic',
    subject: 'Early Phonics & English',
    email: 'priya.nair@edu360.internal',
    phone: '+91 98111 44551',
    officeHours: 'Mon - Fri • 02:30 PM - 03:30 PM',
    avatarBg: 'bg-pink-600',
    isHomeroom: true,
    quickPrompts: [
      "Ananya practiced today's phonetic sound cards",
      "Read 2 storybook chapters aloud at home",
      "Sight words coloring sheet completed",
      "Feedback on story narration video"
    ]
  },
  {
    id: 'kavitha',
    name: 'Mrs. Kavitha Reddy',
    role: 'Junior Mathematics & Number Fun',
    subject: 'Junior Mathematics',
    email: 'kavitha.reddy@edu360.internal',
    phone: '+91 98111 44552',
    officeHours: 'Tue, Thu • 02:30 PM - 03:30 PM',
    avatarBg: 'bg-emerald-600',
    quickPrompts: [
      "Completed 2-digit addition worksheet",
      "Multiplication table 4 practiced",
      "Number line jumping activity finished"
    ]
  }
];

interface ParentTeacherChatViewProps {
  studentId: number;
  studentName: string;
  className: string;
  homeroomFaculty?: string;
}

export function ParentTeacherChatView({
  studentId,
  studentName,
  className,
  homeroomFaculty = 'Mrs. Ananya Verma'
}: ParentTeacherChatViewProps) {
  // Determine faculty directory based on student tier
  const isJunior = className.includes('3') || className.includes('K5');
  const facultyList = isJunior ? JUNIOR_FACULTY_DIRECTORY : SECONDARY_FACULTY_DIRECTORY;

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(facultyList[0].id);
  const selectedTeacher = facultyList.find((f) => f.id === selectedTeacherId) || facultyList[0];

  const [messages, setMessages] = useState<ParentTeacherChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTeacherQuery, setSearchTeacherQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; url: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages from shared API/cache
  const fetchMessages = async () => {
    try {
      const allMsgs = await api.getParentChatMessages(studentId);
      setMessages(allMsgs || []);
      api.markParentChatRead(studentId).catch(() => {});
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMessages();

    // Auto-polling every 3.5 seconds to pull new messages from teachers in real-time
    const interval = setInterval(() => {
      fetchMessages();
    }, 3500);

    return () => clearInterval(interval);
  }, [studentId]);

  // Reset selected teacher when student changes
  useEffect(() => {
    setSelectedTeacherId(facultyList[0].id);
  }, [studentId, className]);

  // Filter messages for the currently selected teacher
  const filteredMessages = messages.filter((m) => {
    const tName = selectedTeacher.name.toLowerCase();
    const senderMatch = m.sender_name.toLowerCase().includes(tName);
    const receiverMatch = m.receiver_name.toLowerCase().includes(tName);
    // If homeroom and message has no specific receiver or matches homeroom
    if (selectedTeacher.isHomeroom && (m.receiver_role === 'TEACHER' && !m.receiver_name.includes('Dr.') && !m.receiver_name.includes('Mr.'))) {
      return true;
    }
    return senderMatch || receiverMatch;
  });

  // Calculate unread count per teacher
  const getUnreadCountForTeacher = (teacherName: string) => {
    return messages.filter(
      (m) =>
        m.sender_role === 'TEACHER' &&
        m.sender_name.toLowerCase().includes(teacherName.toLowerCase()) &&
        !m.is_read
    ).length;
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [filteredMessages.length, sending]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachment) return;

    const text = inputText.trim();
    const currentAttachment = attachment;

    setInputText('');
    setAttachment(null);
    setSending(true);
    playButtonClick();

    try {
      const saved = await api.sendParentChatMessage({
        student_id: studentId,
        sender_role: 'PARENT',
        sender_name: 'Rajesh Sharma',
        receiver_role: 'TEACHER',
        receiver_name: selectedTeacher.name,
        message_text: text || `[Attached file: ${currentAttachment?.name}]`,
        attachment_name: currentAttachment?.name,
        attachment_url: currentAttachment?.url
      });

      playStarCollect();
      setMessages((prev) => [...prev, saved]);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  const visibleTeachers = facultyList.filter((f) => {
    if (!searchTeacherQuery.trim()) return true;
    const q = searchTeacherQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.subject.toLowerCase().includes(q) ||
      f.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3 py-0.5 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
              <MessageSquare className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Online Faculty Multi-Subject Communication Desk
            </span>
            <span className="text-xs text-slate-400">
              {className} &bull; {facultyList.length} Subject Teachers Available
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Direct 1-on-1 Teacher Messages for {studentName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select any subject faculty from the directory below to send homework queries, remedial follow-ups, and receive real-time updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync Active
          </span>
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden min-h-[620px]">
        {/* ========================================================= */}
        {/* LEFT PANEL: SUBJECT FACULTY DIRECTORY (4 COLS)            */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3.5 bg-slate-50/60 dark:bg-slate-950/40">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
              Select Subject Teacher ({facultyList.length})
            </span>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by teacher or subject..."
                value={searchTeacherQuery}
                onChange={(e) => setSearchTeacherQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Teacher Contact List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px]">
            {visibleTeachers.map((faculty) => {
              const isSelected = faculty.id === selectedTeacherId;
              const unreadCount = getUnreadCountForTeacher(faculty.name);
              const initials = faculty.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('');

              return (
                <div
                  key={faculty.id}
                  onClick={() => {
                    setSelectedTeacherId(faculty.id);
                    playButtonClick();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-sm ring-2 ring-indigo-500/10'
                      : 'bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`h-11 w-11 rounded-2xl ${faculty.avatarBg} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs`}
                  >
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {faculty.name}
                      </h4>
                      {unreadCount > 0 && (
                        <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md truncate">
                        {faculty.subject}
                      </span>
                      {faculty.isHomeroom && (
                        <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded-md shrink-0">
                          Homeroom
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                      {faculty.role}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: ACTIVE CHAT CONVERSATION WINDOW (8 COLS)     */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 flex flex-col justify-between p-4 sm:p-6 bg-white dark:bg-slate-900">
          {/* Header of Active Teacher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-12 w-12 rounded-2xl ${selectedTeacher.avatarBg} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs`}
              >
                {selectedTeacher.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {selectedTeacher.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online via Faculty Portal
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedTeacher.subject}</strong> &bull; {selectedTeacher.role} &bull; {selectedTeacher.officeHours}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`mailto:${selectedTeacher.email}`}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title={`Email ${selectedTeacher.name}`}
              >
                <BookOpen className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Chat Message Scroll Window */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 my-3 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 max-h-[420px]"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-2">
                <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium">Connecting to direct teacher channel...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-52 text-center max-w-sm mx-auto space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Start thread with {selectedTeacher.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ask academic doubts in {selectedTeacher.subject}, review homework progress, or leave feedback.
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isParent = msg.sender_role === 'PARENT';
                const formattedTime = new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isParent ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {isParent ? 'You (Parent)' : msg.sender_name}
                      </span>
                      <span className="text-[9px] text-slate-400">&bull; {formattedTime}</span>
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        isParent
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.message_text}</p>

                      {msg.attachment_name && (
                        <div
                          className={`mt-2 flex items-center justify-between gap-2 p-2 rounded-xl border text-[11px] font-medium ${
                            isParent
                              ? 'bg-indigo-700/60 border-indigo-400/40 text-indigo-100'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4 shrink-0 text-amber-400" />
                            <span className="truncate">{msg.attachment_name}</span>
                          </div>
                          <a
                            href={msg.attachment_url || '#'}
                            download={msg.attachment_name}
                            onClick={(e) => {
                              if (!msg.attachment_url || msg.attachment_url === '#') {
                                e.preventDefault();
                                alert(`Downloading official document: ${msg.attachment_name}`);
                              }
                            }}
                            className={`p-1 rounded-lg shrink-0 hover:bg-white/10 ${
                              isParent ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
                            }`}
                            title="Download attachment"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Prompts Tailored to Subject */}
          <div className="px-1 py-1.5 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              {selectedTeacher.subject} Prompts:
            </span>
            {selectedTeacher.quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(prompt)}
                className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap transition-colors cursor-pointer text-[10px] font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Attachment Preview Chip */}
          {attachment && (
            <div className="my-2 p-2 px-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200">
                <FileText className="h-4 w-4 text-indigo-600" />
                <span className="font-bold">{attachment.name}</span>
                <span className="text-[10px] text-slate-400">({attachment.size})</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const kb = Math.round(file.size / 1024);
                  setAttachment({
                    name: file.name,
                    url: URL.createObjectURL(file),
                    size: kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
                  });
                }
              }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Attach worksheet or doctor note"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Send message to ${selectedTeacher.name} (${selectedTeacher.subject})...`}
              className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && !attachment) || sending}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
