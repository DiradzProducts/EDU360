with open('frontend/src/app/parent/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add useAuth import
if "import { useAuth } from '@/lib/auth-context';" not in c:
    c = c.replace(
        "import { useTheme } from '@/lib/theme-context';",
        "import { useTheme } from '@/lib/theme-context';\nimport { useAuth } from '@/lib/auth-context';"
    )

# 2. Add useMemo if not present
if "useMemo" not in c:
    c = c.replace(
        "import React, { useState, useEffect, useRef } from 'react';",
        "import React, { useState, useEffect, useRef, useMemo } from 'react';"
    )

# 3. Clean SHARMA_CHILDREN and define FERNANDES_CHILDREN
old_sharma = """const SHARMA_CHILDREN: ParentChildProfile[] = [
  {
    id: 1,
    name: 'Aarav Sharma',
    className: 'Class 8-B',
    rollNo: 14,
    initials: 'AS',
    tier: 'secondary',
    attendanceStatus: 'Present Today ✓ • Period 3 Mathematics (Room 204)',
    currentClass: 'Live Virtual Class: Period 3 Active',
    homeroomFaculty: 'Mrs. Ananya Verma',
    remedialSubject: 'Mathematics',
    remedialDay: 'Day 2 of 7',
    pendingHomeworkCount: 1
  },
  {
    id: 7,
    name: 'Ananya Sharma',
    className: 'Class 3-A',
    rollNo: 8,
    initials: 'ANS',
    tier: 'k5',
    attendanceStatus: 'Present Today ✓ • Phonics & Story Magic',
    currentClass: 'Live Virtual Class: Junior Rocket Active',
    homeroomFaculty: 'Ms. Priya Nair',
    remedialSubject: 'Reading & Phonics',
    remedialDay: 'Day 1 of 5',
    pendingHomeworkCount: 1
  },
  {
    id: 12,
    name: 'John Fernandes',
    className: 'Class 10-A',
    rollNo: 25,
    initials: 'JF',
    tier: 'secondary',
    attendanceStatus: 'Present Today ✓ • Period 4 Computer Science (Lab 2)',
    currentClass: 'Live Virtual Class: Period 4 Active',
    homeroomFaculty: 'Fr. George Varghese',
    remedialSubject: 'Computer Science',
    remedialDay: 'Day 3 of 7',
    pendingHomeworkCount: 0
  }
];"""

new_sharma = """const SHARMA_CHILDREN: ParentChildProfile[] = [
  {
    id: 1,
    name: 'Aarav Sharma',
    className: 'Class 8-B',
    rollNo: 14,
    initials: 'AS',
    tier: 'secondary',
    attendanceStatus: 'Present Today ✓ • Period 3 Mathematics (Room 204)',
    currentClass: 'Live Virtual Class: Period 3 Active',
    homeroomFaculty: 'Mrs. Ananya Verma',
    remedialSubject: 'Mathematics',
    remedialDay: 'Day 2 of 7',
    pendingHomeworkCount: 1
  },
  {
    id: 7,
    name: 'Ananya Sharma',
    className: 'Class 3-A',
    rollNo: 8,
    initials: 'ANS',
    tier: 'k5',
    attendanceStatus: 'Present Today ✓ • Phonics & Story Magic',
    currentClass: 'Live Virtual Class: Junior Rocket Active',
    homeroomFaculty: 'Ms. Priya Nair',
    remedialSubject: 'Reading & Phonics',
    remedialDay: 'Day 1 of 5',
    pendingHomeworkCount: 1
  }
];

const FERNANDES_CHILDREN: ParentChildProfile[] = [
  {
    id: 12,
    name: 'John Fernandes',
    className: 'Class 10-A',
    rollNo: 25,
    initials: 'JF',
    tier: 'secondary',
    attendanceStatus: 'Present Today ✓ • Period 4 Computer Science (Lab 2)',
    currentClass: 'Live Virtual Class: Period 4 Active',
    homeroomFaculty: 'Fr. George Varghese',
    remedialSubject: 'Computer Science',
    remedialDay: 'Day 3 of 7',
    pendingHomeworkCount: 0
  }
];"""

c_norm = c.replace('\r\n', '\n')
old_sh_norm = old_sharma.replace('\r\n', '\n')
new_sh_norm = new_sharma.replace('\r\n', '\n')

assert old_sh_norm in c_norm, "old_sharma not found"
c_norm = c_norm.replace(old_sh_norm, new_sh_norm, 1)

# 4. Add 'exit' to ParentNavSection
old_nav_section = """export type ParentNavSection = 
  | 'dashboard'
  | 'marks'
  | 'focus_table'
  | 'child_sis'
  | 'ptm_connect'
  | 'chat'
  | 'fees'
  | 'leave';"""

new_nav_section = """export type ParentNavSection = 
  | 'dashboard'
  | 'marks'
  | 'focus_table'
  | 'child_sis'
  | 'ptm_connect'
  | 'chat'
  | 'fees'
  | 'leave'
  | 'exit';"""

old_ns_norm = old_nav_section.replace('\r\n', '\n')
new_ns_norm = new_nav_section.replace('\r\n', '\n')

assert old_ns_norm in c_norm, "old_nav_section not found"
c_norm = c_norm.replace(old_ns_norm, new_ns_norm, 1)

# 5. Inside ParentPage, resolve children by authenticated parent user
old_parent_hook = """  // Application Theme Hook
  const { theme, toggleTheme } = useTheme();
  const sidebarTheme = theme;

  // Multi-Child Profile Switcher State
  const [activeKidId, setActiveKidId] = useState<number>(1);
  const activeKid = SHARMA_CHILDREN.find((k) => k.id === activeKidId) || SHARMA_CHILDREN[0];"""

new_parent_hook = """  // Application Theme & Auth Hooks
  const { theme, toggleTheme } = useTheme();
  const sidebarTheme = theme;
  const { user } = useAuth();

  // Resolve strictly the children belonging to the currently logged in parent account
  const isFernandesParent = user?.username === 'parent_john' || user?.name?.toLowerCase().includes('fernandes');
  const currentParentChildren = useMemo(() => {
    return isFernandesParent ? FERNANDES_CHILDREN : SHARMA_CHILDREN;
  }, [isFernandesParent]);

  // Multi-Child Profile Switcher State
  const [activeKidId, setActiveKidId] = useState<number>(() => isFernandesParent ? 12 : 1);

  useEffect(() => {
    if (isFernandesParent && activeKidId !== 12) {
      setActiveKidId(12);
    } else if (!isFernandesParent && activeKidId === 12) {
      setActiveKidId(1);
    }
  }, [isFernandesParent]);

  const activeKid = currentParentChildren.find((k) => k.id === activeKidId) || currentParentChildren[0];"""

old_ph_norm = old_parent_hook.replace('\r\n', '\n')
new_ph_norm = new_parent_hook.replace('\r\n', '\n')

assert old_ph_norm in c_norm, "old_parent_hook not found"
c_norm = c_norm.replace(old_ph_norm, new_ph_norm, 1)

# 6. Update top bar child switcher
old_top_switcher = """                {SHARMA_CHILDREN.map((kid) => {
                  const isSelected = kid.id === activeKidId;
                  return (
                    <button
                      key={kid.id}
                      onClick={() => {
                        playButtonClick();
                        setActiveKidId(kid.id);
                        triggerToast(`Switched active profile to ${kid.name} (${kid.className})`);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? kid.tier === 'k5'
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                            : 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/80'
                      }`}
                      title={`Switch active context to ${kid.name} (${kid.className})`}
                    >
                      <span className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center text-[10px] font-black">
                        {kid.initials}
                      </span>
                      <div className="flex flex-col text-left leading-tight">
                        <span className="font-bold">{kid.name.split(' ')[0]}</span>
                        <span className="text-[9px] opacity-80 font-normal">
                          {kid.className}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse ml-0.5" />
                      )}
                    </button>
                  );
                })}"""

new_top_switcher = """                {currentParentChildren.length === 1 ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs">
                    <span className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center text-[10px] font-black">
                      {currentParentChildren[0].initials}
                    </span>
                    <div className="flex flex-col text-left leading-tight">
                      <span className="font-bold">{currentParentChildren[0].name}</span>
                      <span className="text-[9px] opacity-80 font-normal">{currentParentChildren[0].className} • Roll #{currentParentChildren[0].rollNo}</span>
                    </div>
                  </div>
                ) : (
                  currentParentChildren.map((kid) => {
                    const isSelected = kid.id === activeKidId;
                    return (
                      <button
                        key={kid.id}
                        onClick={() => {
                          playButtonClick();
                          setActiveKidId(kid.id);
                          triggerToast(`Switched active profile to ${kid.name} (${kid.className})`);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? kid.tier === 'k5'
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                              : 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/80'
                        }`}
                        title={`Switch active context to ${kid.name} (${kid.className})`}
                      >
                        <span className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center text-[10px] font-black">
                          {kid.initials}
                        </span>
                        <div className="flex flex-col text-left leading-tight">
                          <span className="font-bold">{kid.name.split(' ')[0]}</span>
                          <span className="text-[9px] opacity-80 font-normal">
                            {kid.className}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse ml-0.5" />
                        )}
                      </button>
                    );
                  })
                )}"""

old_ts_norm = old_top_switcher.replace('\r\n', '\n')
new_ts_norm = new_top_switcher.replace('\r\n', '\n')

assert old_ts_norm in c_norm, "old_top_switcher not found"
c_norm = c_norm.replace(old_ts_norm, new_ts_norm, 1)

# 7. Add dynamic exit tab in sidebar navigation items
old_sidebar_finance = """    {
      title: 'FINANCE & BILLING',
      items: [
        {
          id: 'fees' as ParentNavSection,
          label: 'Fee Milestones & Receipts',
          icon: CreditCard,
          badge: 'Due Oct 25',
          badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
        }
      ]
    }"""

new_sidebar_finance = """    {
      title: 'FINANCE & BILLING',
      items: [
        {
          id: 'fees' as ParentNavSection,
          label: 'Fee Milestones & Receipts',
          icon: CreditCard,
          badge: activeKidId === 12 ? 'Cleared' : 'Due Oct 25',
          badgeColor: activeKidId === 12
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60'
            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
        },
        ...(exitClearance ? [{
          id: 'exit' as ParentNavSection,
          label: 'School Exit & TC Vault',
          icon: GraduationCap,
          badge: exitClearance.digital_parent_approved ? 'Signed' : 'Action Req',
          badgeColor: exitClearance.digital_parent_approved
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60'
            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 animate-pulse'
        }] : [])
      ]
    }"""

old_sf_norm = old_sidebar_finance.replace('\r\n', '\n')
new_sf_norm = new_sidebar_finance.replace('\r\n', '\n')

assert old_sf_norm in c_norm, "old_sidebar_finance not found"
c_norm = c_norm.replace(old_sf_norm, new_sf_norm, 1)

# 8. Add getHeaderMeta case 'exit'
old_meta_case = """      case 'dashboard':
        return { title: 'Parent Intelligence Dashboard', subtitle: `Real-time overview of ${activeKid.name}’s online classes, academic progress, and faculty communications` };"""

new_meta_case = """      case 'exit':
        return { title: 'Transfer Certificate (TC) & School Exit Protocol', subtitle: `CBSE statutory student leaving sign-off for ${activeKid.name} (${activeKid.className})` };
      case 'dashboard':
        return { title: 'Parent Intelligence Dashboard', subtitle: `Real-time overview of ${activeKid.name}’s online classes, academic progress, and faculty communications` };"""

old_mc_norm = old_meta_case.replace('\r\n', '\n')
new_mc_norm = new_meta_case.replace('\r\n', '\n')

assert old_mc_norm in c_norm, "old_meta_case not found"
c_norm = c_norm.replace(old_mc_norm, new_mc_norm, 1)

# 9. Add dynamic activeNav === 'exit' full screen section before VIEW 8
old_view_8 = """            {/* ===================================================== */}
            {/* VIEW 8: STUDENT LEAVE REQUESTS                        */}
            {/* ===================================================== */}
            {activeNav === 'leave' && ("""

new_view_8 = """            {/* ===================================================== */}
            {/* VIEW: SCHOOL EXIT & TRANSFER CERTIFICATE PROTOCOL      */}
            {/* ===================================================== */}
            {activeNav === 'exit' && (
              <div className="space-y-6">
                {exitClearance ? (
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">
                          Transfer Certificate (TC) &amp; School Exit Clearance
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Official statutory exit verification and digital sign-off for {activeKid.name} ({activeKid.className} &bull; Roll #{activeKid.rollNo})
                        </p>
                      </div>
                    </div>

                    <ExitClearanceView
                      clearance={exitClearance}
                      role="parent"
                      onDigitalSign={handleDigitalSignExit}
                    />
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
                    <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Active Enrollment in Good Standing
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      There are no active school exit or transfer certificate requests for {activeKid.name}. Student remains actively enrolled with regular academic standing.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ===================================================== */}
            {/* VIEW 8: STUDENT LEAVE REQUESTS                        */}
            {/* ===================================================== */}
            {activeNav === 'leave' && ("""

old_v8_norm = old_view_8.replace('\r\n', '\n')
new_v8_norm = new_view_8.replace('\r\n', '\n')

assert old_v8_norm in c_norm, "old_view_8 not found"
c_norm = c_norm.replace(old_v8_norm, new_v8_norm, 1)

with open('frontend/src/app/parent/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c_norm)

print("frontend/src/app/parent/page.tsx updated successfully!")
