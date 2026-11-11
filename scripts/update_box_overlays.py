# -*- coding: utf-8 -*-
with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace cell phone condition
old_phone = "{activeDetectedObject && activeDetectedObject.includes('Cell Phone') && ("
new_phone = "{(livePhoneTimer > 0 || (activeDetectedObject && activeDetectedObject.includes('Cell Phone'))) && ("

if old_phone in content:
    content = content.replace(old_phone, new_phone, 1)
    print("Phone overlay condition updated.")
else:
    print("old_phone not found.")

# Replace book condition
old_book = "{activeDetectedObject && activeDetectedObject.includes('Book') && ("
new_book = "{(liveBookTimer > 0 || (activeDetectedObject && activeDetectedObject.includes('Book'))) && ("

if old_book in content:
    content = content.replace(old_book, new_book, 1)
    print("Book overlay condition updated.")
else:
    print("old_book not found.")

# Update timer labels
content = content.replace("Verifying: ${livePhoneTimer}s / 2.5s", "Verifying: ${livePhoneTimer}s / 1.25s")
content = content.replace("Verifying: ${liveBookTimer}s / 3.0s", "Verifying: ${liveBookTimer}s / 1.5s")
content = content.replace("${livePhoneTimer}s / 2.5s", "${livePhoneTimer}s / 1.25s")
content = content.replace("${liveBookTimer}s / 3.0s", "${liveBookTimer}s / 1.5s")

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Bounding box updates completed.")
