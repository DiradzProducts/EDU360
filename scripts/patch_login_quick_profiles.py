# -*- coding: utf-8 -*-
with open('frontend/src/app/login/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """          <form onSubmit={handleManualLogin} className="space-y-4">"""

replacement = """          {/* Quick Dual Faculty Selectors (for Multi-Browser Testing) */}
          <div className="mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Quick Faculty Profiles (Dual Browser Testing)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setUsername('teacher_mat');
                  setPassword('Password123');
                }}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  username === 'teacher_mat' 
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 ring-2 ring-violet-500/30' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">Mrs. Ananya Verma</span>
                <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium block">Math &bull; Class 8-B</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsername('teacher_eng');
                  setPassword('Password123');
                }}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  username === 'teacher_eng' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/30' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">Mrs. Sunitha Rao</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium block">English &bull; Class 8-A</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleManualLogin} className="space-y-4">"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open('frontend/src/app/login/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("login/page.tsx updated with quick faculty profiles.")
else:
    print("target in login/page.tsx not found.")
