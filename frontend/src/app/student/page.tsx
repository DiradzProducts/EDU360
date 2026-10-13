'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Video, 
  Play, 
  Award, 
  Trophy, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Search,
  Eye
} from 'lucide-react';
import { api } from '@/lib/api';
import { 
  ClassRecording, 
  StudentPortfolio, 
  HomeworkSubmission, 
  OfficialDocument 
} from '@/lib/types';
import { HomeworkCanvas } from '@/components/homework-canvas';
import { RoleGuard } from '@/components/role-guard';

export default function StudentPage() {
  const [activeTab, setActiveTab] = useState<'lms' | 'portfolio' | 'homework' | 'vault'>('lms');
  const [recordings, setRecordings] = useState<ClassRecording[]>([]);
  const [portfolio, setPortfolio] = useState<StudentPortfolio[]>([]);
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  
  // Live class simulation state
  const [inLiveClass, setInLiveClass] = useState(false);
  const [joinSimulated, setJoinSimulated] = useState(false);

  // Upload Achievement Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [achievementTitle, setAchievementTitle] = useState('');
  const [eventName, setEventName] = useState('');
  const [achievementDesc, setAchievementDesc] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [recRes, portRes, subRes, docsRes] = await Promise.all([
          api.getStudentRecordings(),
          api.getPortfolio(1),
          api.getSubmission(1),
          api.getStudentDocuments(1)
        ]);
        setRecordings(recRes);
        setPortfolio(portRes);
        setSubmission(subRes);
        setDocuments(docsRes);
      } catch (err) {
        console.error("Error loading student portal", err);
      }
    }
    loadData();
  }, []);

  const filteredRecordings = selectedSubject === 'All'
    ? recordings
    : recordings.filter(r => r.subject === selectedSubject);

  const participations = portfolio.filter(p => p.category === 'participation');
  const achievements = portfolio.filter(p => p.category === 'achievement');

  const handleJoinClass = () => {
    setInLiveClass(true);
    setJoinSimulated(true);
  };

  const handleUploadAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementTitle) return;
    const newEntry: StudentPortfolio = {
      id: portfolio.length + 1,
      student_id: 1,
      category: 'achievement',
      title: achievementTitle,
      event_name: eventName,
      date: 'Oct 2026',
      proof_url: '/samples/certificate_preview.png',
      verified_by_school: false,
      description: achievementDesc
    };
    setPortfolio([newEntry, ...portfolio]);
    setShowUploadModal(false);
    setAchievementTitle('');
    setEventName('');
    setAchievementDesc('');
    alert("Achievement uploaded! Sent to School Coordinator for digital verification stamp.");
  };

  return (
    <RoleGuard allowedRole="student">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 text-purple-800 px-3 py-1 text-xs font-bold border border-purple-200">
              <BookOpen className="h-3.5 w-3.5" />
              Student Learning & Intelligence Hub
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Aarav Sharma • Class 8B (Roll #14)
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Classroom, Homework & Achievements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access 1-click live online classes, video recordings library, annotated homework, and official student portfolio
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveTab('lms')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'lms'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🎥 Live & Recordings LMS
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'portfolio'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🏆 Side-by-Side Portfolio
          </button>
          <button
            onClick={() => setActiveTab('homework')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'homework'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ✍️ Homework & Annotations
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'vault'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🔒 Official Vault (View Only)
          </button>
        </div>
      </div>

      {/* Tab 1: Live Classroom & Recordings Library */}
      {activeTab === 'lms' && (
        <div className="space-y-8">
          {/* Today's Live Class Hero Card */}
          <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 mb-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Live Class in Session Now
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Class 8B Mathematics: Quadratic Equations & Roots
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                  Host: Mrs. Ananya Verma • 10-Minute Auto-Attendance rule active. Join now to automatically record Present in SIS.
                </p>
              </div>

              <div>
                {inLiveClass ? (
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/20 text-center">
                    <span className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Connected to Classroom Video Stream
                    </span>
                    <span className="text-[10px] text-white/70 block mt-1">
                      Attendance Auto-Captured (Present at +3.2 mins)
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleJoinClass}
                    className="flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 active:scale-95"
                  >
                    <Video className="h-4 w-4" />
                    <span>1-Click Join Live Class</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recordings Library Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Recorded Classes Library
                </h3>
                <p className="text-xs text-slate-500">
                  Rewatch high-definition recorded lessons organized by Subject and Chapter
                </p>
              </div>

              {/* Subject Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['All', 'Mathematics', 'Physics', 'English'].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                      selectedSubject === sub
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRecordings.map((rec) => (
                <div 
                  key={rec.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img 
                      src={rec.thumbnail || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400"} 
                      alt={rec.title} 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <button 
                      onClick={() => alert(`Launching video player for: ${rec.title}`)}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="h-12 w-12 rounded-full bg-white/90 text-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="h-5 w-5 ml-0.5 fill-current" />
                      </div>
                    </button>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 font-semibold">
                      <span>{rec.chapter}</span>
                      <span className="bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">{rec.duration}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-bold border border-blue-200">
                        {rec.subject}
                      </span>
                      <span className="text-[10px] text-slate-400">{rec.date}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {rec.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Instructor: {rec.teacher_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Side-by-Side Participations & Achievements Portfolio */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Side-by-Side Student Outcomes Portfolio
              </h2>
              <p className="text-xs text-slate-500">
                Official school participations on the left; external verified awards and certificates on the right
              </p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
            >
              <Upload className="h-4 w-4" />
              <span>Upload External Certificate</span>
            </button>
          </div>

          {/* Side-by-Side Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: School Participations */}
            <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Official School Participations</h3>
                    <span className="text-[11px] text-slate-500">Curricular & Inter-House Events</span>
                  </div>
                </div>
                <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-bold">
                  {participations.length} Events
                </span>
              </div>

              <div className="space-y-3">
                {participations.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{p.title}</h4>
                      <span className="text-[10px] font-bold text-slate-500">{p.date}</span>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 block">{p.event_name}</span>
                    <p className="text-xs text-slate-600">{p.description}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Official School Record
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: External Achievements */}
            <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">External Awards & Achievements</h3>
                    <span className="text-[11px] text-slate-500">Olympiads, Tournaments & Distinctions</span>
                  </div>
                </div>
                <span className="rounded-full bg-purple-50 text-purple-700 px-2.5 py-0.5 text-xs font-bold">
                  {achievements.length} Verified
                </span>
              </div>

              <div className="space-y-3">
                {achievements.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{a.title}</h4>
                      <span className="text-[10px] font-bold text-slate-500">{a.date}</span>
                    </div>
                    <span className="text-xs font-semibold text-purple-700 block">{a.event_name}</span>
                    <p className="text-xs text-slate-600">{a.description}</p>

                    <div className="flex items-center justify-between pt-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        a.verified_by_school ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        <ShieldCheck className="h-3 w-3" />
                        {a.verified_by_school ? 'Verified by School Stamp' : 'Pending Verification'}
                      </span>
                      {a.proof_url && (
                        <button 
                          onClick={() => alert(`Opening certificate proof for ${a.title}`)}
                          className="text-[11px] font-semibold text-blue-600 hover:underline"
                        >
                          View Certificate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload External Achievement */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Upload New Achievement / Award
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add external certificates or medals to your permanent SIS portfolio.
            </p>

            <form onSubmit={handleUploadAchievement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Award / Competition Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Robotics Championship"
                  value={achievementTitle}
                  onChange={(e) => setAchievementTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medal / Position Won
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold Medal (Autonomous Rover)"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Details of the event or certification authority..."
                  value={achievementDesc}
                  onChange={(e) => setAchievementDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-bold shadow-sm"
                >
                  Submit for School Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Homework & Annotations */}
      {activeTab === 'homework' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Assigned Homework & Teacher Digital Corrections
            </h2>
            <p className="text-xs text-slate-500">
              View your math submissions with Mrs. Verma's in-browser red pen marks, ticks, and pedagogical notes
            </p>
          </div>

          {submission && (
            <HomeworkCanvas
              submission={submission}
              onSave={async () => {}}
              readOnly={true}
            />
          )}
        </div>
      )}

      {/* Tab 4: Official SIS Vault (View Only) */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[11px] font-bold border border-slate-200">
                <ShieldCheck className="h-3 w-3 text-blue-600" />
                Verified School Repository
              </span>
              <span className="text-xs text-slate-500">Read-Only Access for Students & Parents</span>
            </div>
            <h2 className="mt-1 text-base font-bold text-slate-900">
              Official Certificates Vault
            </h2>
            <p className="text-xs text-slate-500">
              All official student credentials are encrypted and locked. Download verified PDFs anytime.
            </p>
          </div>

          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
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
                      Issued by Administration • {doc.verified_stamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                    🔒 Edit Locked
                  </span>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View / Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </RoleGuard>
  );
}
