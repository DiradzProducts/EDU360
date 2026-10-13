'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Video, 
  FileEdit, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Users, 
  MessageSquare, 
  Check, 
  X,
  FileText,
  Clock,
  Layers,
  PhoneCall
} from 'lucide-react';
import { api } from '@/lib/api';
import { AttendanceRecord, HomeworkSubmission, FocusTable, LeaveRequest } from '@/lib/types';
import { AttendanceSimulator } from '@/components/attendance-simulator';
import { HomeworkCanvas } from '@/components/homework-canvas';
import { FocusTableView } from '@/components/focus-table-view';
import { RoleGuard } from '@/components/role-guard';

export default function TeacherPage() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'grading' | 'focus' | 'parents'>('grading');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [focusTable, setFocusTable] = useState<FocusTable | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Parent chat drawer state
  const [selectedParentChat, setSelectedParentChat] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [attRes, subRes, ftRes, lrRes] = await Promise.all([
          api.getAttendanceRoster(1),
          api.getSubmission(1),
          api.getFocusTable(1),
          api.getLeaveRequests()
        ]);
        setAttendance(attRes);
        setSubmission(subRes);
        setFocusTable(ftRes);
        setLeaveRequests(lrRes);
      } catch (err) {
        console.error("Error loading teacher portal", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSimulateJoin = async (studentId: number, minutesElapsed: number) => {
    await api.simulateJoin(1, studentId, minutesElapsed);
    const updated = await api.getAttendanceRoster(1);
    setAttendance(updated);
  };

  const handleOverrideAttendance = async (recordId: number, status: string) => {
    await api.overrideAttendance(1, recordId, status);
    const updated = await api.getAttendanceRoster(1);
    setAttendance(updated);
  };

  const handleSaveGrading = async (marks: number, remarks: string, annotationsJson: string) => {
    const updated = await api.saveGradedCanvas(1, marks, remarks, annotationsJson);
    setSubmission(updated);
  };

  const handleReviewLeave = async (id: number, status: 'Approved' | 'Rejected') => {
    await api.reviewLeaveRequest(id, status, `Reviewed and ${status.toLowerCase()} by Class Teacher`);
    const updated = await api.getLeaveRequests();
    setLeaveRequests(updated);
  };

  return (
    <RoleGuard allowedRole="teacher">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold border border-emerald-200">
              <GraduationCap className="h-3.5 w-3.5" />
              Teacher Academic Hub
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Mrs. Ananya Verma • Class 8B Teacher
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Zero-Burden Academic Workflows
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated live class attendance, in-browser digital homework annotation, and shared Focus Tables
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveTab('grading')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'grading'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ✍️ Inline Homework Grader
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'attendance'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ⏱️ 10-Min Auto-Attendance
          </button>
          <button
            onClick={() => setActiveTab('focus')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'focus'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🎯 Student Focus Table
          </button>
          <button
            onClick={() => setActiveTab('parents')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'parents'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            💬 Parent Hub & Leaves
          </button>
        </div>
      </div>

      {/* Tab 1: Inline Homework Grading Canvas */}
      {activeTab === 'grading' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                In-Browser Digital Canvas (No Download / Re-upload Required)
              </h2>
              <p className="text-xs text-slate-500">
                Correct student math homework directly inside the browser using red pen, green ticks, and typed remarks. Saves and versions automatically for the student and parent.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-bold border border-blue-200">
                Math Worksheet #4 • Aarav Sharma
              </span>
            </div>
          </div>

          {submission ? (
            <HomeworkCanvas
              submission={submission}
              onSave={handleSaveGrading}
            />
          ) : (
            <div className="p-8 text-center text-slate-500">Loading homework submission...</div>
          )}
        </div>
      )}

      {/* Tab 2: 10-Minute Auto-Attendance Rule Simulator */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Live Class Host & 10-Minute Auto-Attendance Engine
            </h2>
            <p className="text-xs text-slate-500">
              Automatically calculates join timestamps: T ≤ 10m is auto-marked Present. T &gt; 10m is flagged Late with 1-click teacher decision.
            </p>
          </div>

          <AttendanceSimulator
            records={attendance}
            onSimulateJoin={handleSimulateJoin}
            onOverride={handleOverrideAttendance}
          />
        </div>
      )}

      {/* Tab 3: Per-Student Focus Table */}
      {activeTab === 'focus' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Shared Student Focus Table (Aarav Sharma - Class 8B)
            </h2>
            <p className="text-xs text-slate-500">
              When assessment marks dip below target, EDU360 generates a 4-day revision timetable co-tracked by the teacher and parent
            </p>
          </div>

          {focusTable ? (
            <FocusTableView
              table={focusTable}
              isParentView={false}
            />
          ) : (
            <div className="p-8 text-center text-slate-500">Loading focus table...</div>
          )}
        </div>
      )}

      {/* Tab 4: Parent Connection & Leave Approvals */}
      {activeTab === 'parents' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Parental Connection Hub & Student Leave Approvals
            </h2>
            <p className="text-xs text-slate-500">
              Review leave requests and open parent conversation threads with full academic context (marks, fee status, attendance)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leave Approvals Queue */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Pending Student Leave Requests</h3>
                <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                  {leaveRequests.filter(lr => lr.status === 'Pending').length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {leaveRequests.map((lr) => (
                  <div key={lr.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{lr.student_name}</h4>
                        <span className="text-[11px] text-slate-500">Submitted by {lr.parent_name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lr.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : lr.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {lr.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 italic">
                      "{lr.reason}" (Dates: {lr.from_date} to {lr.to_date})
                    </p>

                    {lr.status === 'Pending' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => handleReviewLeave(lr.id, 'Approved')}
                          className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-sm"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve Leave</span>
                        </button>
                        <button
                          onClick={() => handleReviewLeave(lr.id, 'Rejected')}
                          className="flex items-center gap-1 rounded-xl bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-bold shadow-sm"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Parent Chat Drawer with Academic Context */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Direct Parent Connection</h3>
                </div>
                <span className="text-xs text-slate-500">Live Context Enabled</span>
              </div>

              {/* Aarav Sharma Context Summary Card */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950">Mr. Rajesh Sharma (Aarav's Father)</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Class 8B
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-blue-200/60">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Attendance</span>
                    <span className="text-xs font-bold text-emerald-700">91.4%</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Math Score</span>
                    <span className="text-xs font-bold text-red-600">52% (Focus)</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Fee Milestone 2</span>
                    <span className="text-xs font-bold text-amber-700">Due 25 Oct</span>
                  </div>
                </div>
              </div>

              {/* Sample Messages */}
              <div className="space-y-3 py-2">
                <div className="flex flex-col items-start">
                  <div className="rounded-2xl rounded-bl-xs bg-slate-100 p-3 text-xs text-slate-800 max-w-[85%]">
                    Hello Mrs. Verma, I noticed the Quadratic Equations note in Aarav's Focus Table. We completed Day 2 factoring problems in his rough notebook yesterday.
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">Yesterday, 07:45 PM</span>
                </div>

                <div className="flex flex-col items-end">
                  <div className="rounded-2xl rounded-br-xs bg-blue-600 p-3 text-xs text-white max-w-[85%]">
                    Thank you Mr. Sharma! I reviewed his Worksheet #4 today and he has improved greatly in standard factoring. I will take 5 minutes on Thursday to clear up the negative sign rule in Q4.
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">Today, 09:15 AM</span>
                </div>
              </div>

              {/* Chat Input */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type message to Mr. Rajesh Sharma..."
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-sm"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </RoleGuard>
  );
}
