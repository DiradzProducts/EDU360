with open('frontend/src/components/crm-board.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

target = """            {onOpenIntakeModal && (
              <button
                type="button"
                onClick={onOpenIntakeModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>+ Register Enquiry</span>
              </button>
            )}"""

c_norm = c.replace('\r\n', '\n')
t_norm = target.replace('\r\n', '\n')

assert t_norm in c_norm, "target not found in crm-board.tsx"
c_norm = c_norm.replace('\n' + t_norm, '')

with open('frontend/src/components/crm-board.tsx', 'w', encoding='utf-8') as f:
    f.write(c_norm)

print("Removed redundant button from crm-board.tsx successfully!")
