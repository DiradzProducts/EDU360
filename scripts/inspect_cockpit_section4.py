# -*- coding: utf-8 -*-
"""
Inspect and update live-invigilator-cockpit.tsx to include the MALPRACTICE PRIORITY EDGE dock on the left
and support custom chief invigilator name.
"""

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'r', encoding='utf-8') as f:
    cockpit_text = f.read()

# Let's inspect where Section 4 candidate grid is rendered
start_idx = cockpit_text.find('{/* 4. ONLINE CLASSROOM VIDEO GRID')
print("Found Section 4 at:", start_idx)
