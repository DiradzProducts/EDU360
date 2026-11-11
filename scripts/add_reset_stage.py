with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = """  // Start webcam proctoring & Web Audio Decibel Monitor

  useEffect(() => {

    if (!isOpen) return;"""

replacement = """  // Start webcam proctoring & Web Audio Decibel Monitor

  useEffect(() => {

    if (!isOpen) return;
    setRulesStage('rules');
    setHasAgreedRules(false);
    setIsConfirmedSubmitted(false);
    setIsExamDisqualified(false);"""

if target in text:
    text = text.replace(target, replacement, 1)
    with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Added reset stage logic!")
else:
    print("Target not found for reset stage logic")
