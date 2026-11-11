with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove flaggedCandidates from inside useEffect
misplaced = """    // Priority Malpractice Candidates for Left-Corner Dock
  const flaggedCandidates = candidates.filter(c => 
    (c.strikes && c.strikes > 0) || 
    c.status === 'critical' || 
    c.status === 'warning' || 
    c.isPaused || 
    c.status === 'paused' ||
    (c.suspicionScore > 40)
  );

  return () => {
      if (channel) channel.close();
    };"""

fixed_use_effect = """  return () => {
      if (channel) channel.close();
    };"""

if misplaced in text:
    text = text.replace(misplaced, fixed_use_effect, 1)
    print("Removed misplaced flaggedCandidates from inside useEffect")

# 2. Place flaggedCandidates in component scope, right above filteredCandidates
target_filtered = "  const filteredCandidates = candidates.filter("
repl_flagged = """  // Priority Malpractice Candidates for Left-Corner Dock
  const flaggedCandidates = candidates.filter(c => 
    (c.strikes && c.strikes > 0) || 
    c.status === 'critical' || 
    c.status === 'warning' || 
    c.isPaused || 
    c.status === 'paused' ||
    (c.suspicionScore > 40)
  );

  const filteredCandidates = candidates.filter("""

if "const flaggedCandidates = candidates.filter" not in text:
    if target_filtered in text:
        text = text.replace(target_filtered, repl_flagged, 1)
        print("Placed flaggedCandidates in component scope")

# 3. Fix type annotations and handleOpenDossier in dock
text = text.replace("flaggedCandidates.map((c) =>", "flaggedCandidates.map((c: ProctorCandidate) =>")
text = text.replace("handleOpenDossier(c)", "setDossierCandidateId(c.id)")
print("Fixed type annotation and setDossierCandidateId")

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved live-invigilator-cockpit.tsx")
