# -*- coding: utf-8 -*-
with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """          );
        })}
      </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}"""

replacement = """          );
        })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed closing divs in live-invigilator-cockpit.tsx.")
else:
    print("Target not found.")
