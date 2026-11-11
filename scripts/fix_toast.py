with open('frontend/src/app/student/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("toast.info(`Opening Descriptive Submission Drawer for ${active.title}`);", "triggerToast(`Opening Descriptive Submission Drawer for ${active.title}`);")

with open('frontend/src/app/student/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Replaced toast.info with triggerToast!")
