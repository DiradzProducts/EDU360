with open('frontend/src/components/attendance-simulator.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Make sure CalendarCheck is imported from lucide-react
if 'CalendarCheck,' not in code:
    code = code.replace(
        "  RefreshCw\n} from 'lucide-react';",
        "  RefreshCw,\n  CalendarCheck\n} from 'lucide-react';"
    )

old_counts = '''  const presentCount = records.filter(r => r.status === 'Present').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;'''

new_counts = '''  const presentCount = records.filter(r => r.status === 'Present').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const leaveCount = records.filter(r => r.status === 'Leave' || r.status === 'Excused Leave').length;
  const absentCount = records.filter(r => r.status === 'Absent' && r.status !== 'Leave' && r.status !== 'Excused Leave').length;'''

if old_counts in code:
    code = code.replace(old_counts, new_counts, 1)
    print("SUCCESS: Updated counts in attendance-simulator.tsx")
else:
    print("WARNING: old_counts not found")

old_stats_div = '''        {/* Attendance stats */}
        <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <div className="px-2.5 py-1 text-center border-r border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Present</span>
            <span className="text-sm font-bold text-emerald-600">{presentCount}</span>
          </div>
          <div className="px-2.5 py-1 text-center border-r border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Late Flag</span>
            <span className="text-sm font-bold text-amber-600">{lateCount}</span>
          </div>
          <div className="px-2.5 py-1 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Absent</span>
            <span className="text-sm font-bold text-red-600">{absentCount}</span>
          </div>
        </div>'''

new_stats_div = '''        {/* Attendance stats */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 flex-wrap">
          <div className="px-2.5 py-1 text-center border-r border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Present</span>
            <span className="text-sm font-bold text-emerald-600">{presentCount}</span>
          </div>
          <div className="px-2.5 py-1 text-center border-r border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Late Flag</span>
            <span className="text-sm font-bold text-amber-600">{lateCount}</span>
          </div>
          <div className="px-2.5 py-1 text-center border-r border-slate-200">
            <span className="text-[10px] font-bold text-purple-600 uppercase block">Excused Leave</span>
            <span className="text-sm font-bold text-purple-700">{leaveCount}</span>
          </div>
          <div className="px-2.5 py-1 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Absent</span>
            <span className="text-sm font-bold text-red-600">{absentCount}</span>
          </div>
        </div>'''

if old_stats_div in code:
    code = code.replace(old_stats_div, new_stats_div, 1)
    print("SUCCESS: Updated stats div in attendance-simulator.tsx")
else:
    print("WARNING: old_stats_div not found")

old_row_render = '''            {records.map((rec) => {
              const isPresent = rec.status === 'Present';
              const isLate = rec.status === 'Late';
              const isAbsent = rec.status === 'Absent';

              return (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[11px] text-slate-700">
                        {rec.student_name[0]}
                      </div>
                      <span>{rec.student_name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-slate-600 font-mono">
                    {rec.join_timestamp || <span className="text-slate-400 italic">Not joined yet</span>}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isPresent 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isLate 
                        ? 'bg-amber-100 text-amber-800 animate-pulse' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isPresent && <CheckCircle2 className="h-3 w-3" />}
                      {isLate && <AlertTriangle className="h-3 w-3" />}
                      {isAbsent && <XCircle className="h-3 w-3" />}
                      {rec.status} {rec.teacher_override ? '(Overridden)' : ''}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    {isLate ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOverride(rec.id, 'Present')}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-sm"
                          title="Approve student as Present"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => onOverride(rec.id, 'Absent')}
                          className="flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-sm"
                          title="Mark student as Absent"
                        >
                          <X className="h-3 w-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Auto-captured in SIS</span>
                    )}
                  </td>
                </tr>
              );
            })}'''

new_row_render = '''            {records.map((rec) => {
              const isPresent = rec.status === 'Present';
              const isLate = rec.status === 'Late';
              const isLeave = rec.status === 'Leave' || rec.status === 'Excused Leave';
              const isAbsent = rec.status === 'Absent' && !isLeave;

              return (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[11px] text-slate-700">
                        {rec.student_name[0]}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>{rec.student_name}</span>
                        {isLeave && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200">
                            Approved Leave
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-slate-600 font-mono text-xs">
                    {isLeave ? (
                      <span className="inline-flex items-center gap-1 text-purple-700 font-semibold text-[11px]">
                        <CalendarCheck className="h-3 w-3" />
                        {rec.join_timestamp || 'Excused Medical Absence'}
                      </span>
                    ) : (
                      rec.join_timestamp || <span className="text-slate-400 italic">Not joined yet</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isPresent 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isLate 
                        ? 'bg-amber-100 text-amber-800 animate-pulse' 
                        : isLeave
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isPresent && <CheckCircle2 className="h-3 w-3" />}
                      {isLate && <AlertTriangle className="h-3 w-3" />}
                      {isLeave && <CalendarCheck className="h-3 w-3 text-purple-700" />}
                      {isAbsent && <XCircle className="h-3 w-3" />}
                      {isLeave ? 'Excused Leave' : rec.status} {rec.teacher_override ? '(Teacher Verified)' : ''}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    {isLeave ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Doctor Note Regularized</span>
                      </span>
                    ) : isLate ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOverride(rec.id, 'Present')}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-sm"
                          title="Approve student as Present"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => onOverride(rec.id, 'Absent')}
                          className="flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-sm"
                          title="Mark student as Absent"
                        >
                          <X className="h-3 w-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Auto-captured in SIS</span>
                    )}
                  </td>
                </tr>
              );
            })}'''

if old_row_render in code:
    code = code.replace(old_row_render, new_row_render, 1)
    print("SUCCESS: Updated row render in attendance-simulator.tsx")
else:
    print("WARNING: old_row_render not found")

with open('frontend/src/components/attendance-simulator.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
