'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Users, 
  FileText, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Plus, 
  Calendar, 
  PhoneCall, 
  Truck, 
  Package, 
  Search,
  Filter,
  CheckSquare,
  Lock,
  Upload,
  UserCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { 
  TriageAlert, 
  AdminTask, 
  AdmissionEnquiry, 
  OfficialDocument, 
  ExitClearance, 
  VendorEquipment, 
  EventItem 
} from '@/lib/types';
import { TriageCard } from '@/components/triage-card';
import { CRMBoard } from '@/components/crm-board';
import { ExitClearanceView } from '@/components/exit-clearance-modal';
import { RoleGuard } from '@/components/role-guard';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'triage' | 'crm' | 'sis' | 'exit' | 'events'>('triage');
  const [triageAlerts, setTriageAlerts] = useState<TriageAlert[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [exitClearances, setExitClearances] = useState<ExitClearance[]>([]);
  const [loading, setLoading] = useState(true);

  // New Document modal state
  const [showDocModal, setShowDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState('Bonafide');

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [alertsRes, tasksRes, enqRes, docsRes, exitsRes] = await Promise.all([
          api.getTriageAlerts(),
          api.getTasks(),
          api.getEnquiries(),
          api.getStudentDocuments(1),
          api.getExitClearances()
        ]);
        setTriageAlerts(alertsRes);
        setTasks(tasksRes);
        setEnquiries(enqRes);
        setDocuments(docsRes);
        setExitClearances(exitsRes);
      } catch (err) {
        console.error("Error loading admin dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTriageAction = async (alert: TriageAlert) => {
    await api.actOnTriageAlert(alert.id);
    const updated = await api.getTriageAlerts();
    setTriageAlerts(updated);
  };

  const handleToggleTask = async (id: number, currentStatus: string) => {
    await api.toggleTask(id, currentStatus);
    const updated = await api.getTasks();
    setTasks(updated);
  };

  const handleEnquiryStageChange = async (id: number, stage: string) => {
    await api.updateEnquiryStage(id, stage);
    const updated = await api.getEnquiries();
    setEnquiries(updated);
  };

  const handleConvertToStudent = async (id: number) => {
    await api.convertEnquiryToStudent(id);
    const updated = await api.getEnquiries();
    setEnquiries(updated);
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;
    await api.uploadOfficialDocument({
      student_id: 1,
      title: newDocTitle,
      doc_type: newDocType,
      file_url: `/documents/${newDocTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`
    });
    const updated = await api.getStudentDocuments(1);
    setDocuments(updated);
    setShowDocModal(false);
    setNewDocTitle('');
  };

  const handleVerifyPhysicalExit = async () => {
    await api.verifyPhysicalSign(1);
    const updated = await api.getExitClearances();
    setExitClearances(updated);
  };

  return (
    <RoleGuard allowedRole="admin">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-bold border border-blue-200">
              <Building2 className="h-3.5 w-3.5" />
              Super Administrator Command Center
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Academic Session 2026–27
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Institutional Triage & Operations Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Proactive decision engine tracking absenteeism, overdue fee milestones, and admissions pipelines
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveTab('triage')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'triage'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🔴 Priority Triage & Tasks
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'crm'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Admissions CRM
          </button>
          <button
            onClick={() => setActiveTab('sis')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'sis'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            SIS Document Vault
          </button>
          <button
            onClick={() => setActiveTab('exit')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'exit'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Exit & TC Handover
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Event Command Center
          </button>
        </div>
      </div>

      {/* Tab 1: Priority Triage & Tasks */}
      {activeTab === 'triage' && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  Daily Action Engine (🔴 / 🟠 / 🟢 Priority Triage)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proactively flags what needs immediate attention today, why it matters, and who to assign
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {triageAlerts.map((alert) => (
                <TriageCard 
                  key={alert.id} 
                  alert={alert} 
                  onAction={handleTriageAction} 
                />
              ))}
            </div>
          </div>

          {/* Urgent & Upcoming Tasks Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            {/* Urgent Tasks */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-700 font-bold text-xs">
                    !
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Urgent Tasks (Today & Tomorrow)</h3>
                    <span className="text-[11px] text-slate-500">Board exams & event deadlines</span>
                  </div>
                </div>
                <span className="rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-[10px] font-bold border border-red-200">
                  {tasks.filter(t => t.category === 'urgent' && t.status !== 'Completed').length} Pending
                </span>
              </div>

              <div className="space-y-2.5">
                {tasks.filter(t => t.category === 'urgent').map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id, task.status)}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 cursor-pointer transition-all"
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={task.status === 'Completed'}
                        onChange={() => {}}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className={`text-xs font-bold block ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </span>
                        <span className="text-[10px] text-slate-500">Assigned: {task.assigned_to} • Due: {task.due_date}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Scheduled Tasks */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Upcoming Operational Tasks</h3>
                    <span className="text-[11px] text-slate-500">Audits, PTM schedules & fee digests</span>
                  </div>
                </div>
                <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-bold border border-blue-200">
                  {tasks.filter(t => t.category === 'upcoming' && t.status !== 'Completed').length} In Queue
                </span>
              </div>

              <div className="space-y-2.5">
                {tasks.filter(t => t.category === 'upcoming').map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id, task.status)}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 cursor-pointer transition-all"
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={task.status === 'Completed'}
                        onChange={() => {}}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className={`text-xs font-bold block ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </span>
                        <span className="text-[10px] text-slate-500">Assigned: {task.assigned_to} • Due: {task.due_date}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Admissions CRM */}
      {activeTab === 'crm' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Admissions CRM Pipeline & AI Chatbot Leads
              </h2>
              <p className="text-xs text-slate-500">
                Monitor enquiries captured by AI Chatbot, review transcripts, and convert leads into SIS Student records in 1 click
              </p>
            </div>
          </div>

          <CRMBoard 
            enquiries={enquiries}
            onStageChange={handleEnquiryStageChange}
            onConvertToStudent={handleConvertToStudent}
          />
        </div>
      )}

      {/* Tab 3: SIS Document Vault (Strict Admin Edit Lock) */}
      {activeTab === 'sis' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-red-100 text-red-800 px-2.5 py-0.5 text-[11px] font-bold border border-red-200">
                  <Lock className="h-3 w-3" />
                  Strict Document Security Rule Active
                </span>
                <span className="text-xs text-slate-500">Admin-Only Edit Rights</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-slate-900">
                Official Student Document Vault (SIS Single Source of Truth)
              </h2>
              <p className="text-xs text-slate-500">
                Official certificates (Bonafide, Transfer Certificate, Marks Cards) can ONLY be uploaded and edited by Administration. Teachers, Parents, and Students have strictly View/Download-only access.
              </p>
            </div>

            <button
              onClick={() => setShowDocModal(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Official Certificate</span>
            </button>
          </div>

          {/* Student Profile Quick Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-base">
                AS
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Aarav Sharma • Class 8B (Roll #14)</h3>
                <span className="text-xs text-slate-500">Admission No: EDU-2024-082 • Guardian: Mr. Rajesh Sharma (+91 98111 00003)</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance</span>
                <span className="text-sm font-bold text-emerald-600">91.4% (Good)</span>
              </div>
              <div className="text-right pl-3 border-l border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Academic Avg</span>
                <span className="text-sm font-bold text-blue-600">76.8% (Focus in Math)</span>
              </div>
            </div>
          </div>

          {/* Documents Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Verified Legal Certificates ({documents.length})</span>
              <span className="text-[11px] text-slate-500">All certificates sealed with SHA-256 verification hashes</span>
            </div>

            <div className="divide-y divide-slate-200">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{doc.title}</h4>
                        <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[9px] font-bold">
                          {doc.doc_type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Seal: {doc.verified_stamp} • Uploaded by Administrator
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[10px] font-bold border border-emerald-200">
                      <ShieldCheck className="h-3 w-3" />
                      Official School Stamp Verified
                    </span>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-slate-300 hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors"
                    >
                      View Certificate
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload Official Document */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Upload Official SIS Document (Admin Clearance)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Document will be locked into the student's vault with official school seal.
            </p>

            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Certificate Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Migration Certificate 2026"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Type
                </label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Bonafide">Bonafide Certificate</option>
                  <option value="Transfer Certificate">Transfer Certificate (TC)</option>
                  <option value="Marks Card">Marks Card / Report Card</option>
                  <option value="Birth Certificate">Birth Certificate</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-sm"
                >
                  Seal & Upload to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Student Exit & TC Handover */}
      {activeTab === 'exit' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Student Exit & Dual-Signature TC Clearance
            </h2>
            <p className="text-xs text-slate-500">
              Zero-dispute legal exit protocol combining in-app parent digital authorization with scanned physical register signatures
            </p>
          </div>

          {exitClearances.map((clearance) => (
            <ExitClearanceView
              key={clearance.id}
              clearance={clearance}
              onVerifyPhysical={handleVerifyPhysicalExit}
              role="admin"
            />
          ))}
        </div>
      )}

      {/* Tab 5: Event Command Center (Annual Day 2026) */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white border border-white/20 mb-3 inline-block">
                Flagship Institutional Event
              </span>
              <h2 className="text-2xl font-black text-white">
                Annual Day 2026: Navarasa (Rhythms of Tomorrow)
              </h2>
              <p className="text-xs text-slate-200 mt-1 max-w-xl">
                24 Oct 2026 • 5:30 PM • Main Auditorium & Open Air Amphitheatre. 400+ student performers, orchestra, and robotics exhibition.
              </p>
            </div>
          </div>

          {/* Committee Hierarchy: Staff -> Student Volunteers Tree */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Staff & Student Task Hierarchy (Committee Mapping)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900">Mrs. Ananya Verma</span>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Lead Faculty</span>
                </div>
                <span className="text-[11px] font-medium text-slate-600 block">Stage Coordination & Choir</span>
                <div className="pt-2 border-t border-purple-200">
                  <span className="text-[10px] font-bold text-purple-900 block mb-1">Student Volunteers Assigned:</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-purple-200">Aarav Sharma</span>
                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-purple-200">Diya Patel</span>
                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-purple-200">Rohan Iyer</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">Mr. Vikram Joshi</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Lead Faculty</span>
                </div>
                <span className="text-[11px] font-medium text-slate-600 block">Discipline & VIP Logistics</span>
                <div className="pt-2 border-t border-blue-200">
                  <span className="text-[10px] font-bold text-blue-900 block mb-1">Student Volunteers Assigned:</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-blue-200">Kabir Mehta</span>
                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-blue-200">Vivaan Sen</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Ms. Priya Sen</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Lead Faculty</span>
                </div>
                <span className="text-[11px] font-medium text-slate-600 block">Costume Design & Green Room</span>
                <div className="pt-2 border-t border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-900 block mb-1">Student Volunteers Assigned:</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-emerald-200">Ananya Gupta</span>
                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-emerald-200">Pooja Hegde</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Equipment & Handover Tracker */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Vendor Equipment & Timestamped Handover Tracker
            </h3>

            <div className="divide-y divide-slate-200">
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Digital P3.9 LED Backdrop Wall (40 x 20 ft)</h4>
                  <span className="text-[11px] text-slate-500">Vendor: Horizon AV Tech Solutions (+91 98765 43210)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Delivered: 22 Oct, 09:30 AM
                  </span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                    Delivered
                  </span>
                </div>
              </div>

              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Concert Sound System + 8 Wireless Shure Mics</h4>
                  <span className="text-[11px] text-slate-500">Vendor: AcousticPro Live Bangalore (+91 98765 43211)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Delivered: 22 Oct, 11:15 AM
                  </span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                    Delivered
                  </span>
                </div>
              </div>

              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">600 Velvet Banquet Chairs & Canopies</h4>
                  <span className="text-[11px] text-slate-500">Vendor: Royal Events & Tenting (+91 98765 43212)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    Scheduled Handover: 23 Oct, 2:00 PM
                  </span>
                  <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold">
                    Ordered
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </RoleGuard>
  );
}
