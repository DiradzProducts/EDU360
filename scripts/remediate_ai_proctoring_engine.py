import re

with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove the fake random audioTimer in startVirtualWebcamFallback
fake_audio_timer = """        // Simulate normal audio background ambience (34-40 dB)
        const audioTimer = setInterval(() => {
          setAudioDecibels(34 + Math.floor(Math.random() * 8));
        }, 1200);

        return () => {
          clearInterval(intervalId);
          clearInterval(audioTimer);
        };"""

clean_virtual_cleanup = """        return () => {
          clearInterval(intervalId);
        };"""

if fake_audio_timer in text:
    text = text.replace(fake_audio_timer, clean_virtual_cleanup, 1)
    print("1. Removed fake random audioTimer override")

# 2. Fix initWebcamAndAudio Web Audio API: Use Time-Domain RMS for calibrated real decibel tracking
target_audio_block = """              const dataArray = new Uint8Array(analyser.frequencyBinCount);

              const checkAudio = () => {

                if (!streamRef.current) return;

                analyser.getByteFrequencyData(dataArray);

                let sum = 0;

                for (let i = 0; i < dataArray.length; i++) {

                  sum += dataArray[i];

                }

                const avg = sum / dataArray.length;

                const db = Math.round(30 + (avg / 255) * 60);

                setAudioDecibels(db);"""

# Let's locate the audio block with flexible regex/string matching
audio_anchor = "analyser.fftSize = 256;"
repl_audio_block = """analyser.fftSize = 512;
              analyser.smoothingTimeConstant = 0.2;
              source.connect(analyser);

              const timeDomainBuffer = new Uint8Array(analyser.fftSize);

              const checkAudio = () => {
                if (!streamRef.current) return;

                // Calibrated Time-Domain RMS Decibel Metering
                analyser.getByteTimeDomainData(timeDomainBuffer);
                let sumSquares = 0;
                for (let i = 0; i < timeDomainBuffer.length; i++) {
                  const normalized = (timeDomainBuffer[i] - 128) / 128;
                  sumSquares += normalized * normalized;
                }
                const rms = Math.sqrt(sumSquares / timeDomainBuffer.length);

                // Calibrated: silence ~ 35dB, whisper ~ 55dB, speech/phone audio ~ 65-90dB
                const realDb = Math.min(100, Math.max(34, Math.round(35 + rms * 115)));
                setAudioDecibels(realDb);"""

# Find analyser.fftSize = 256 and the subsequent setAudioDecibels(db)
fft_pos = text.find("analyser.fftSize = 256;")
if fft_pos != -1:
    set_db_pos = text.find("setAudioDecibels(db);", fft_pos)
    if set_db_pos != -1:
        end_set_pos = set_db_pos + len("setAudioDecibels(db);")
        text = text[:fft_pos] + repl_audio_block + text[end_set_pos:]
        print("2. Replaced FFT average with Calibrated Time-Domain RMS Decibel Engine")

# 3. Add frames accumulator refs for temporal smoothing (prevents single-frame noise from resetting counters)
target_refs = "  const cellPhoneTimer = useRef<number>(0);\n  const bookTimer = useRef<number>(0);"
repl_refs = """  const cellPhoneTimer = useRef<number>(0);
  const bookTimer = useRef<number>(0);
  const absentFramesCounter = useRef<number>(0);
  const gazeTurnFramesCounter = useRef<number>(0);
  const multiPersonFramesCounter = useRef<number>(0);
  const audioSpikeFramesCounter = useRef<number>(0);"""

if target_refs in text:
    text = text.replace(target_refs, repl_refs, 1)
    print("3. Added temporal smoothing accumulator refs")

# 4. Remove the manual "Instant Rule Verifiers (Zero-Wait Test)" buttons completely!
verifiers_start = text.find('<div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">')
if verifiers_start != -1:
    verifiers_end = text.find('</div>\n                  </div>\n\n                {/* Integrity Checklist */}', verifiers_start)
    if verifiers_end != -1:
        text = text[:verifiers_start] + "</div>" + text[verifiers_end + len('</div>\n                  </div>'):]
        print("4. Removed manual Instant Rule Verifiers buttons completely")
    else:
        # Alternative search
        verif_text = "Instant Rule Verifiers (Zero-Wait Test):"
        v_pos = text.find(verif_text)
        if v_pos != -1:
            div_start = text.rfind('<div className="pt-2', 0, v_pos)
            btn_close = text.find('</button>\n                      </div>', v_pos)
            if btn_close != -1:
                end_div = text.find('</div>', btn_close + 25) + len('</div>')
                text = text[:div_start] + text[end_div:]
                print("4. Removed manual verifiers using alternative boundary")

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved stage 1 audio & UI cleanup")
