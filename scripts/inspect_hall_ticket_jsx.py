# -*- coding: utf-8 -*-
with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find("rulesStage === 'hall_ticket_check'")
print(text[start:start+1200])
