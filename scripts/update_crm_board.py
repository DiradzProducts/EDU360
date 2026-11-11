with open('frontend/src/components/crm-board.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Destructure onOpenIntakeModal
old_fn = """export function CRMBoard({ 
  enquiries, 
  onStageChange, 
  onConvertToStudent,
}: CRMBoardProps) {"""

new_fn = """export function CRMBoard({ 
  enquiries, 
  onStageChange, 
  onConvertToStudent,
  onOpenIntakeModal
}: CRMBoardProps) {"""

c_norm = c.replace('\r\n', '\n')
old_fn_norm = old_fn.replace('\r\n', '\n')
new_fn_norm = new_fn.replace('\r\n', '\n')

assert old_fn_norm in c_norm, "old_fn not found"
c_norm = c_norm.replace(old_fn_norm, new_fn_norm, 1)

# 2. Add Register Enquiry button beside Class filter
old_grade_sel = """          {/* Target Grade Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-xs font-bold text-slate-400">Class:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>"""

new_grade_sel = """          {/* Target Grade Selector & Quick Register */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-xs font-bold text-slate-400">Class:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>

            {onOpenIntakeModal && (
              <button
                type="button"
                onClick={onOpenIntakeModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>+ Register Enquiry</span>
              </button>
            )}
          </div>"""

old_gs_norm = old_grade_sel.replace('\r\n', '\n')
new_gs_norm = new_grade_sel.replace('\r\n', '\n')

assert old_gs_norm in c_norm, "old_grade_sel not found"
c_norm = c_norm.replace(old_gs_norm, new_gs_norm, 1)

with open('frontend/src/components/crm-board.tsx', 'w', encoding='utf-8') as f:
    f.write(c_norm)

print("crm-board.tsx updated successfully!")
