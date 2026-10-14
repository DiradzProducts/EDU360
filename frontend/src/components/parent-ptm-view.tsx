'use client';

import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Video, 
  Calendar, 
  Clock, 
  Send, 
  CheckCircle2, 
  ChevronRight, 
  ExternalLink, 
  User, 
  Sparkles, 
  Phone, 
  Mail, 
  X,
  AlertCircle
} from 'lucide-react';

interface TeacherProfile {
  id: string;
  name: string;
  role: string;
  subject: string;
  email: string;
  phone: string;
  officeHours: string;
  avatarBg: string;
  status: 'Online' | 'In Class' | 'Available for PTM';
}

interface MessageItem {
  id: string;
  sender: 'parent' | 'teacher';
  senderName: string;
  timestamp: string;
  content: string;
  category?: string;
  teacherId: string;
}

interface PtmBooking {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string;
  timeSlot: string;
  agenda: string;
  meetUrl: string;
  status: 'Confirmed' | 'Completed' | 'Rescheduled';
}

export function ParentPtmView() {
  const teachers: TeacherProfile[] = [
    {
      id: 'ananya',
      name: 'Mrs. Ananya Verma',
      role: 'Class Teacher 8B & Mathematics Department Head',
      subject: 'Mathematics & Mental Agility',
      email: 'ananya.verma@edu360.school',
      phone: '+91 98450 78912',
      officeHours: 'Mon - Fri • 03:30 PM - 04:30 PM',
      avatarBg: 'bg-purple-600',
      status: 'Available for PTM'
    },
    {
      id: 'raman',
      name: 'Dr. K. Raman',
      role: 'Senior Science Faculty & Physics Lab In-Charge',
      subject: 'Physics & Experimental Optics',
      email: 'k.raman@edu360.school',
      phone: '+91 98450 78914',
      officeHours: 'Tue, Thu • 04:00 PM - 05:00 PM',
      avatarBg: 'bg-blue-600',
      status: 'Online'
    },
    {
      id: 'deepa',
      name: 'Ms. Deepa Menon',
      role: 'English Department Head & Literary Coordinator',
      subject: 'English Language & World Literature',
      email: 'deepa.menon@edu360.school',
      phone: '+91 98450 78916',
      officeHours: 'Wed, Fri • 03:00 PM - 04:00 PM',
      avatarBg: 'bg-emerald-600',
      status: 'In Class'
    }
  ];

  // Direct Note State
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedTeacherForNote, setSelectedTeacherForNote] = useState<TeacherProfile>(teachers[0]);
  const [noteCategory, setNoteCategory] = useState<'Academic Concern' | 'Homework Clarification' | 'Health/Absence Notice' | 'Appreciation'>('Academic Concern');
  const [noteContent, setNoteContent] = useState('');
  const [noteSending, setNoteSending] = useState(false);
  const [noteToast, setNoteToast] = useState<string | null>(null);

  // Messages History State
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg-1',
      sender: 'parent',
      senderName: 'Mr. Rajesh Sharma',
      timestamp: '12 Oct 2026, 04:15 PM',
      content: 'Hello Mrs. Verma, noticed Aarav lost marks on negative sign expansion in LCM fractions during Unit Test 2. Is there extra practice we should supervise at home?',
      category: 'Academic Concern',
      teacherId: 'ananya'
    },
    {
      id: 'msg-2',
      sender: 'teacher',
      senderName: 'Mrs. Ananya Verma',
      timestamp: '12 Oct 2026, 05:30 PM',
      content: 'Hello Mr. Sharma, thank you for reaching out! I have mapped Practice Set 2 into Aarav\'s Focus Table and will conduct a quick 1-on-1 check during Thursday zero period. He is very close to mastering it!',
      category: 'Academic Concern',
      teacherId: 'ananya'
    }
  ]);

  // Schedule PTM State
  const [ptmModalOpen, setPtmModalOpen] = useState(false);
  const [selectedTeacherForPtm, setSelectedTeacherForPtm] = useState<TeacherProfile>(teachers[0]);
  const [ptmDate, setPtmDate] = useState('Saturday, 18 Oct 2026');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 10:15 AM');
  const [ptmAgenda, setPtmAgenda] = useState('Review Unit Test 2 marks & discuss quadratic equation intervention timetable');
  const [ptmBookingSuccess, setPtmBookingSuccess] = useState(false);

  // Active bookings list
  const [bookings, setBookings] = useState<PtmBooking[]>([
    {
      id: 'ptm-101',
      teacherId: 'ananya',
      teacherName: 'Mrs. Ananya Verma',
      date: 'Saturday, 18 Oct 2026',
      timeSlot: '10:00 AM - 10:15 AM',
      agenda: 'Review Unit Test 2 marks & discuss quadratic intervention roadmap',
      meetUrl: 'https://meet.google.com/edu-sharma-verma',
      status: 'Confirmed'
    }
  ]);

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setNoteSending(true);
    setTimeout(() => {
      const newMsg: MessageItem = {
        id: `msg-${Date.now()}`,
        sender: 'parent',
        senderName: 'Mr. Rajesh Sharma',
        timestamp: 'Just now',
        content: noteContent,
        category: noteCategory,
        teacherId: selectedTeacherForNote.id
      };
      setMessages(prev => [...prev, newMsg]);
      setNoteSending(false);
      setNoteContent('');
      setNoteModalOpen(false);
      setNoteToast(`Note dispatched to ${selectedTeacherForNote.name}!`);
      setTimeout(() => setNoteToast(null), 3500);
    }, 800);
  };

  const handleBookPtm = (e: React.FormEvent) => {
    e.preventDefault();
    setPtmBookingSuccess(true);
    const newBooking: PtmBooking = {
      id: `ptm-${Date.now()}`,
      teacherId: selectedTeacherForPtm.id,
      teacherName: selectedTeacherForPtm.name,
      date: ptmDate,
      timeSlot: selectedSlot,
      agenda: ptmAgenda,
      meetUrl: `https://meet.google.com/edu-ptm-${selectedTeacherForPtm.id}-sharma`,
      status: 'Confirmed'
    };
    setBookings(prev => [newBooking, ...prev]);

    setTimeout(() => {
      setPtmBookingSuccess(false);
      setPtmModalOpen(false);
      setNoteToast(`1-on-1 PTM slot booked with ${selectedTeacherForPtm.name}!`);
      setTimeout(() => setNoteToast(null), 4000);
    }, 1500);
  };

  const starterChips = [
    'Aarav is struggling with Math chapter 3 quadratic formulas',
    'Clarification on upcoming physics lab assessment ray diagram submission',
    'Informing about upcoming medical leave on 16th October',
    'Great appreciation for zero-period doubt clearing assistance'
  ];

  const availableSlots = [
    { time: '10:00 AM - 10:15 AM', available: true },
    { time: '10:20 AM - 10:35 AM', available: true },
    { time: '10:40 AM - 10:55 AM', available: false }, // booked
    { time: '11:00 AM - 11:15 AM', available: true },
    { time: '11:20 AM - 11:35 AM', available: true }
  ];

  return (
    <div className="space-y-6">

      {/* Toast Alert */}
      {noteToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3.5 shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{noteToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-bold border border-blue-200 dark:border-blue-800">
              <Users className="h-3.5 w-3.5" />
              Direct Parent-Teacher Bridge
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Class 8B Academic Council
            </span>
          </div>
          <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            Teacher Connection &amp; 1-on-1 Online PTM Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Connect directly with Aarav&apos;s teachers, send academic notes, and schedule video conferences
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedTeacherForNote(teachers[0]);
              setNoteModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Send Note to Teacher</span>
          </button>

          <button
            onClick={() => {
              setSelectedTeacherForPtm(teachers[0]);
              setPtmModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Video className="h-4 w-4" />
            <span>Schedule 1-on-1 PTM</span>
          </button>
        </div>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {teachers.map((teacher) => (
          <div 
            key={teacher.id}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-2xl ${teacher.avatarBg} text-white flex items-center justify-center font-black text-base shadow-sm`}>
                    {teacher.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {teacher.name}
                    </h3>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block">
                      {teacher.subject}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {teacher.role}
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px] font-medium">{teacher.officeHours}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px] truncate">{teacher.email}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setSelectedTeacherForNote(teacher);
                  setNoteModalOpen(true);
                }}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 text-xs font-bold transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                <span>Message</span>
              </button>

              <button
                onClick={() => {
                  setSelectedTeacherForPtm(teacher);
                  setPtmModalOpen(true);
                }}
                className="flex items-center justify-center gap-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 text-xs font-bold shadow-xs transition-colors"
              >
                <Video className="h-3.5 w-3.5" />
                <span>Book PTM</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Upcoming PTM Video Conferences */}
      <div className="rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Confirmed 1-on-1 Online PTM Sessions
            </h3>
          </div>
          <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded-full">
            {bookings.length} Session Scheduled
          </span>
        </div>

        <div className="space-y-3">
          {bookings.map((booking) => (
            <div 
              key={booking.id}
              className="p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                    ✓ {booking.status}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {booking.teacherName}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-purple-600" />
                    {booking.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-purple-600" />
                    {booking.timeSlot}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Agenda: &quot;{booking.agenda}&quot;
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={booking.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  <Video className="h-4 w-4" />
                  <span>Join Video Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notes & Conversation Thread Log */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Parent-Teacher Message Thread Archive
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Direct notes exchanged between guardian and Class 8B teachers
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedTeacherForNote(teachers[0]);
              setNoteModalOpen(true);
            }}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            + New Message
          </button>
        </div>

        <div className="space-y-4">
          {messages.map((msg) => {
            const isParent = msg.sender === 'parent';
            return (
              <div 
                key={msg.id}
                className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  isParent 
                    ? 'border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 mr-4' 
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 ml-4'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {msg.senderName}
                    </span>
                    {msg.category && (
                      <span className="rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[9px] font-bold">
                        {msg.category}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {msg.timestamp}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {msg.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1. Modal: Send Note to Teacher */}
      {noteModalOpen && (
        <div 
          onClick={() => setNoteModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-[10px] font-bold">
                  Direct Note Dispatch
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  Send Note to {selectedTeacherForNote.name}
                </h3>
              </div>
              <button
                onClick={() => setNoteModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Recipient Teacher
                </label>
                <select
                  value={selectedTeacherForNote.id}
                  onChange={(e) => {
                    const found = teachers.find(t => t.id === e.target.value);
                    if (found) setSelectedTeacherForNote(found);
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category of Note
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(['Academic Concern', 'Homework Clarification', 'Health/Absence Notice', 'Appreciation'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNoteCategory(cat)}
                      className={`p-2 rounded-xl text-left font-bold border transition-colors ${
                        noteCategory === cat
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Starter Chips */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 mb-1">
                  💡 Quick Starters (Click to fill):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {starterChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNoteContent(chip)}
                      className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 text-[10px] font-medium text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      &quot;{chip}&quot;
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your message to the teacher..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={noteSending}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{noteSending ? 'Sending Note...' : 'Dispatch Note to Teacher'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Schedule 1-on-1 Online PTM */}
      {ptmModalOpen && (
        <div 
          onClick={() => setPtmModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 text-[10px] font-bold">
                  1-on-1 Video Conference
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  Schedule PTM with {selectedTeacherForPtm.name}
                </h3>
              </div>
              <button
                onClick={() => setPtmModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {ptmBookingSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                  PTM Session Confirmed!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Your appointment with <span className="font-bold">{selectedTeacherForPtm.name}</span> on <span className="font-bold">{ptmDate}</span> at <span className="font-bold">{selectedSlot}</span> has been saved and calendar invitations dispatched.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookPtm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Teacher
                  </label>
                  <select
                    value={selectedTeacherForPtm.id}
                    onChange={(e) => {
                      const found = teachers.find(t => t.id === e.target.value);
                      if (found) setSelectedTeacherForPtm(found);
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} — {t.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Conference Date
                  </label>
                  <select
                    value={ptmDate}
                    onChange={(e) => setPtmDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Saturday, 18 Oct 2026">Saturday, 18 Oct 2026 (Upcoming PTM Day)</option>
                    <option value="Wednesday, 22 Oct 2026">Wednesday, 22 Oct 2026 (Evening Slot)</option>
                    <option value="Saturday, 25 Oct 2026">Saturday, 25 Oct 2026 (Mid-Term Review)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Available 15-Minute Slot
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {availableSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`p-2.5 rounded-xl text-center font-bold border transition-colors ${
                          !slot.available
                            ? 'opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed line-through'
                            : selectedSlot === slot.time
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300'
                        }`}
                      >
                        {slot.time} {slot.available ? '✓' : '(Booked)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Discussion Agenda
                  </label>
                  <input
                    type="text"
                    required
                    value={ptmAgenda}
                    onChange={(e) => setPtmAgenda(e.target.value)}
                    placeholder="e.g. Review Unit Test 2 marks & quadratic intervention"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Meeting Platform:</span>
                  <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-semibold">
                    <Video className="h-3.5 w-3.5" />
                    <span>Google Meet Encrypted Classroom Link will be generated</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPtmModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm &amp; Book PTM Slot</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
