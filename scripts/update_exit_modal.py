with open('frontend/src/components/exit-clearance-modal.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Remove onReset from interface
c = c.replace('  onReset?: () => Promise<void>;\n', '')

# 2. Remove onReset from destructured props
c = c.replace('  onReset,\n', '')

# 3. Remove handleReset function
old_handle_reset = """  const handleReset = async () => {
    if (!onReset) return;
    setLoading(true);
    try {
      await onReset();
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };"""

c_norm = c.replace('\r\n', '\n')
old_hr_norm = old_handle_reset.replace('\r\n', '\n')

assert old_hr_norm in c_norm, "handleReset not found"
c_norm = c_norm.replace(old_hr_norm + '\n\n', '')

# 4. Remove reset button JSX
old_btn_jsx = """          {onReset && (
            <button
              onClick={handleReset}
              disabled={loading}
              title="Reset this clearance to pending test state"
              className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset State</span>
            </button>
          )}"""

old_btn_norm = old_btn_jsx.replace('\r\n', '\n')
assert old_btn_norm in c_norm, "reset button JSX not found"
c_norm = c_norm.replace('\n' + old_btn_norm, '')

with open('frontend/src/components/exit-clearance-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(c_norm)

print("exit-clearance-modal.tsx updated successfully!")
