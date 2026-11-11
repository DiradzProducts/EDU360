with open('frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Remove handleResetExitClearance
old_handler = """  const handleResetExitClearance = async (id: number = 2) => {
    await api.resetExitClearance(id);
    const updated = await api.getExitClearances();
    setExitClearances(updated);
    triggerToast('Exit clearance reset to initial Pending state for testing');
  };"""

# 2. Remove Reset Test Student button
old_button = """                  <button
                    onClick={() => handleResetExitClearance(2)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-xs transition-all"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Reset Test Student (Aarav Sharma)</span>
                  </button>

"""

# 3. Remove onReset prop from ExitClearanceView
old_view_prop = """                    onVerifyPhysical={(scanUrl) => handleVerifyPhysicalExit(clearance.id, scanUrl)}
                    onReset={() => handleResetExitClearance(clearance.id)}"""
new_view_prop = """                    onVerifyPhysical={(scanUrl) => handleVerifyPhysicalExit(clearance.id, scanUrl)}"""

c_norm = c.replace('\r\n', '\n')
old_h_norm = old_handler.replace('\r\n', '\n')
old_b_norm = old_button.replace('\r\n', '\n')
old_vp_norm = old_view_prop.replace('\r\n', '\n')
new_vp_norm = new_view_prop.replace('\r\n', '\n')

assert old_h_norm in c_norm, "old_handler not found"
assert old_b_norm in c_norm, "old_button not found"
assert old_vp_norm in c_norm, "old_view_prop not found"

c_norm = c_norm.replace(old_h_norm + '\n\n', '')
c_norm = c_norm.replace(old_b_norm, '')
c_norm = c_norm.replace(old_vp_norm, new_vp_norm, 1)

with open('frontend/src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c_norm)

print("admin/page.tsx updated successfully!")
