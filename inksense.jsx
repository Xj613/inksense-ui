// InkSense — child-facing dyslexia writing tutor UI.
// Three theme variants share this core component; each artboard passes its own
// `theme` object (palette, mascot, font scale).

const { useState, useEffect, useRef, useCallback } = React;

// ---------- Tutor scripts (warm, encouraging, dyslexia-aware) ----------
const TUTOR_LINES = [
  {
    word: "elephant",
    feedback: "Beautiful try! I can see \"elephant\" — your letters are getting stronger every day. Notice how \"ph\" makes a /f/ sound, like in \"phone\". Want to write it once more together?",
  },
  {
    word: "rainbow",
    feedback: "Wonderful! \"Rainbow\" — what a sunny word to choose. Your \"r\" has a lovely curl. Did you know \"rainbow\" has two parts: rain + bow?",
  },
  {
    word: "friend",
    feedback: "I love that you chose \"friend\". Tricky one — the \"i\" hides before the \"e\". A little trick: Fri-end, end with a friend. You're doing great!",
  },
];

// ---------- Drawing canvas ----------
function DrawCanvas({ theme, onStrokeStart, onStrokeEnd, hasInk, setHasInk, resetKey }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastRef = useRef(null);

  // Setup + handle resets
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = theme.ink;
    ctx.lineWidth = 4.5;
    // Clear on reset
    ctx.clearRect(0, 0, c.width, c.height);
  }, [resetKey, theme.ink]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    lastRef.current = getPos(e);
    onStrokeStart && onStrokeStart();
  };

  const move = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const p = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = theme.ink;
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
    if (!hasInk) setHasInk(true);
  };

  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    onStrokeEnd && onStrokeEnd();
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        cursor: "crosshair",
        touchAction: "none",
      }}
      onMouseDown={start}
      onMouseMove={move}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={start}
      onTouchMove={move}
      onTouchEnd={end}
    />
  );
}

// ---------- Mascot ----------
function Mascot({ theme, mood }) {
  // mood: 'idle' | 'watching' | 'thinking' | 'cheer' | 'listen'
  const Char = theme.mascot.Render;
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", gap: 14,
    }}>
      <div style={{ position: "relative", width: 96, height: 96, flex: "0 0 auto" }}>
        <Char mood={mood} theme={theme} />
      </div>
      <div style={{
        position: "relative",
        background: theme.bubbleBg,
        color: theme.bubbleInk,
        padding: "12px 18px",
        borderRadius: 18,
        fontSize: 18,
        fontWeight: 500,
        lineHeight: 1.35,
        maxWidth: 260,
        boxShadow: `0 2px 0 ${theme.bubbleShadow}`,
      }}>
        <span style={{
          position: "absolute", left: -8, bottom: 16,
          width: 14, height: 14, background: theme.bubbleBg,
          transform: "rotate(45deg)", borderRadius: 3,
        }} />
        {mood === "idle" && `Hi! I'm ${theme.mascot.name}. Write anything you'd like.`}
        {mood === "watching" && "Lovely letters! Keep going…"}
        {mood === "thinking" && "Let me read what you wrote…"}
        {mood === "cheer" && "Wonderful work!"}
        {mood === "listen" && "I'm listening — tell me everything."}
      </div>
    </div>
  );
}

// ---------- Big chunky button ----------
function BigButton({ icon, label, shortcut, onClick, tone = "default", theme, active }) {
  const palette = {
    default: { bg: theme.btnBg, ink: theme.btnInk, shadow: theme.btnShadow },
    primary: { bg: theme.accent, ink: theme.accentInk, shadow: theme.accentShadow },
    danger: { bg: theme.danger, ink: "#fff", shadow: theme.dangerShadow },
    talk: { bg: theme.talk, ink: theme.talkInk, shadow: theme.talkShadow },
  }[tone];
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        background: palette.bg, color: palette.ink,
        border: "none",
        padding: "14px 20px",
        borderRadius: 18,
        fontFamily: "inherit",
        fontSize: 18,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: `0 4px 0 ${palette.shadow}`,
        transition: "transform .08s ease, box-shadow .08s ease",
        transform: active ? "translateY(2px)" : "translateY(0)",
        position: "relative",
      }}
      onMouseDown={e => e.currentTarget.style.transform = "translateY(2px)"}
      onMouseUp={e => e.currentTarget.style.transform = "translateY(0)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <span>{label}</span>
      <span style={{
        marginLeft: 6,
        fontSize: 11, fontWeight: 700,
        background: "rgba(0,0,0,0.10)",
        color: "currentColor",
        padding: "3px 6px",
        borderRadius: 6,
        opacity: 0.75,
        letterSpacing: 0.5,
      }}>{shortcut}</span>
    </button>
  );
}

// ---------- Listening indicator (waveform) ----------
function Waveform({ theme }) {
  const bars = Array.from({ length: 24 });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, height: 60 }}>
      {bars.map((_, i) => (
        <span key={i} style={{
          width: 5,
          height: 12,
          background: theme.accent,
          borderRadius: 3,
          animation: `inkwave 0.9s ease-in-out ${i * 0.06}s infinite`,
          transformOrigin: "center",
        }} />
      ))}
    </div>
  );
}

// ---------- Loading dots ----------
function ThinkingDots({ theme }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 14, height: 14, borderRadius: "50%",
          background: theme.accent,
          animation: `inkbounce 1s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
      <span style={{
        marginLeft: 12, fontSize: 18, fontWeight: 500,
        color: theme.subtleInk,
      }}>Reading your writing…</span>
    </div>
  );
}

// ---------- "You wrote" with letter-by-letter highlight ----------
function YouWrote({ word, theme }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    if (!word) return;
    const id = setInterval(() => {
      setShown(s => {
        if (s >= word.length) { clearInterval(id); return s; }
        return s + 1;
      });
    }, 110);
    return () => clearInterval(id);
  }, [word]);

  return (
    <div style={{
      fontSize: 28, fontWeight: 600,
      color: theme.subtleInk,
      letterSpacing: 1,
      display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 4,
    }}>
      <span style={{ fontSize: 18, fontWeight: 500, marginRight: 6, opacity: 0.7 }}>You wrote</span>
      <span style={{
        display: "inline-flex", gap: 2,
        padding: "2px 12px",
        background: theme.chipBg,
        borderRadius: 12,
        color: theme.ink,
      }}>
        {word.split("").map((ch, i) => (
          <span key={i} style={{
            opacity: i < shown ? 1 : 0.15,
            transform: i < shown ? "translateY(0)" : "translateY(2px)",
            transition: "opacity .25s ease, transform .25s ease, color .25s ease",
            color: i < shown ? theme.accent : theme.ink,
            fontWeight: 700,
          }}>{ch}</span>
        ))}
      </span>
    </div>
  );
}

// ---------- The full app ----------
function InkSense({ theme }) {
  // states: 'idle' | 'writing' | 'thinking' | 'feedback' | 'listening'
  const [phase, setPhase] = useState("idle");
  const [resetKey, setResetKey] = useState(0);
  const [hasInk, setHasInk] = useState(false);
  const [tutorIdx, setTutorIdx] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [activeBtn, setActiveBtn] = useState(null);
  const [mood, setMood] = useState("idle");

  const onStrokeStart = useCallback(() => {
    if (phase === "idle" || phase === "feedback") setPhase("writing");
    setMood("watching");
  }, [phase]);

  const onStrokeEnd = useCallback(() => {
    // small idle nudge
  }, []);

  const handleSave = () => {
    if (!hasInk && phase !== "writing") return;
    setActiveBtn("save");
    setPhase("thinking");
    setMood("thinking");
    setFeedback(null);
    setTimeout(() => {
      const item = TUTOR_LINES[tutorIdx % TUTOR_LINES.length];
      setFeedback(item);
      setPhase("feedback");
      setMood("cheer");
      setActiveBtn(null);
    }, 2200);
  };

  const handleReset = () => {
    setActiveBtn("reset");
    setResetKey(k => k + 1);
    setHasInk(false);
    setFeedback(null);
    setPhase("idle");
    setMood("idle");
    setTutorIdx(i => (i + 1) % TUTOR_LINES.length);
    setTimeout(() => setActiveBtn(null), 200);
  };

  const handleTalk = () => {
    setActiveBtn("talk");
    if (phase === "listening") {
      setPhase(feedback ? "feedback" : "idle");
      setMood(feedback ? "cheer" : "idle");
    } else {
      setPhase("listening");
      setMood("listen");
    }
    setTimeout(() => setActiveBtn(null), 200);
  };

  const handleQuit = () => {
    setActiveBtn("quit");
    setTimeout(() => setActiveBtn(null), 350);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      if (k === "s") handleSave();
      else if (k === "r") handleReset();
      else if (k === "t") handleTalk();
      else if (k === "q") handleQuit();
      else if (k === " " && phase === "listening") handleTalk();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, hasInk, feedback, tutorIdx]);

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      background: theme.bg,
      color: theme.ink,
      fontFamily: theme.font,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* TOP BAR */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 28px",
        background: theme.headerBg,
        borderBottom: `2px dashed ${theme.divider}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo theme={theme} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: theme.brandInk }}>
              InkSense
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: theme.subtleInk, marginTop: -2 }}>
              with {theme.mascot.name} · your writing buddy
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <BigButton icon="💾" label="Save" shortcut="S" tone="primary" onClick={handleSave} theme={theme} active={activeBtn === "save"} />
          <BigButton icon="↺" label="Reset" shortcut="R" onClick={handleReset} theme={theme} active={activeBtn === "reset"} />
          <BigButton icon="🎤" label="Talk" shortcut="T" tone="talk" onClick={handleTalk} theme={theme} active={activeBtn === "talk" || phase === "listening"} />
          <BigButton icon="✕" label="Quit" shortcut="Q" tone="danger" onClick={handleQuit} theme={theme} active={activeBtn === "quit"} />
        </div>
      </header>

      {/* MAIN — drawing canvas */}
      <main style={{
        flex: 1, position: "relative",
        padding: 28,
        display: "flex",
      }}>
        <div style={{
          flex: 1,
          position: "relative",
          background: theme.canvasBg,
          borderRadius: 28,
          border: `3px solid ${theme.canvasBorder}`,
          boxShadow: `inset 0 2px 0 ${theme.canvasInner}, 0 6px 0 ${theme.canvasShadow}`,
          overflow: "hidden",
        }}>
          {/* Ruled guide lines */}
          <RuledLines theme={theme} />

          {/* Watermark */}
          {!hasInk && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              pointerEvents: "none",
              gap: 8,
            }}>
              <div style={{
                fontSize: 56, fontWeight: 700,
                color: theme.watermark,
                letterSpacing: -1,
              }}>Write here ✏️</div>
              <div style={{
                fontSize: 18, fontWeight: 500,
                color: theme.watermark,
                opacity: 0.7,
              }}>Use your stylus to write a word or sentence</div>
            </div>
          )}

          <DrawCanvas
            theme={theme}
            onStrokeStart={onStrokeStart}
            onStrokeEnd={onStrokeEnd}
            hasInk={hasInk}
            setHasInk={setHasInk}
            resetKey={resetKey}
          />

          {/* Mascot — bottom-left over canvas */}
          <div style={{
            position: "absolute", left: 20, bottom: 20,
            pointerEvents: "none",
            zIndex: 2,
          }}>
            <Mascot theme={theme} mood={mood} />
          </div>

          {/* Listening overlay */}
          {phase === "listening" && (
            <div style={{
              position: "absolute", inset: 0,
              background: theme.listenOverlay,
              backdropFilter: "blur(4px)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 24,
              zIndex: 3,
            }}>
              <div style={{
                width: 120, height: 120, borderRadius: "50%",
                background: theme.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 56,
                boxShadow: `0 0 0 0 ${theme.accent}80`,
                animation: "inkpulse 1.4s ease-out infinite",
              }}>🎤</div>
              <Waveform theme={theme} />
              <div style={{ fontSize: 26, fontWeight: 700, color: theme.ink }}>
                I'm listening…
              </div>
              <div style={{ fontSize: 16, color: theme.subtleInk }}>
                Tap <strong>Talk</strong> again or press <kbd style={kbdStyle(theme)}>SPACE</kbd> when you're done
              </div>
            </div>
          )}

          {/* Thinking overlay */}
          {phase === "thinking" && (
            <div style={{
              position: "absolute", inset: 0,
              background: theme.thinkOverlay,
              backdropFilter: "blur(2px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 3,
            }}>
              <div style={{
                background: theme.bubbleBg,
                padding: "24px 32px",
                borderRadius: 24,
                boxShadow: `0 4px 0 ${theme.bubbleShadow}`,
              }}>
                <ThinkingDots theme={theme} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FEEDBACK PANEL */}
      <footer style={{
        padding: "20px 28px 24px",
        background: theme.footerBg,
        borderTop: `2px dashed ${theme.divider}`,
        minHeight: 140,
      }}>
        {phase === "feedback" && feedback ? (
          <div style={{
            display: "flex", gap: 20,
            animation: "inkfadein .4s ease",
          }}>
            <div style={{
              width: 56, height: 56, flex: "0 0 auto",
              borderRadius: 14,
              background: theme.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28,
              boxShadow: `0 3px 0 ${theme.accentShadow}`,
            }}>⭐</div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <YouWrote word={feedback.word} theme={theme} />
              <div style={{
                fontSize: 19,
                lineHeight: 1.55,
                fontWeight: 500,
                color: theme.ink,
                maxWidth: 900,
                textWrap: "pretty",
              }}>
                {feedback.feedback}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
              <button style={miniBtn(theme)}>🔊 Hear again</button>
              <button style={miniBtn(theme)} onClick={handleTalk}>💬 Ask {theme.mascot.name}</button>
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "100%", minHeight: 100,
            color: theme.subtleInk,
            fontSize: 17,
            fontWeight: 500,
            gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>{phase === "listening" ? "🎙️" : phase === "thinking" ? "✨" : "📝"}</span>
            {phase === "idle" && "Write a word or sentence above, then press Save when you're ready."}
            {phase === "writing" && "You're writing! Take your time. Press Save when you're done."}
            {phase === "thinking" && "I'm reading your writing…"}
            {phase === "listening" && "Listening to you — speak whenever you're ready."}
          </div>
        )}
      </footer>

      {/* Keyframes + global helpers */}
      <style>{`
        @keyframes inkbounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-10px); opacity: 1; }
        }
        @keyframes inkwave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(2.4); }
        }
        @keyframes inkpulse {
          0% { box-shadow: 0 0 0 0 ${theme.accent}80; }
          100% { box-shadow: 0 0 0 40px ${theme.accent}00; }
        }
        @keyframes inkfadein {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes inkblink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes inksway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
      `}</style>
    </div>
  );
}

// ---------- Small helpers ----------
function RuledLines({ theme }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: `repeating-linear-gradient(to bottom,
        transparent 0,
        transparent 99px,
        ${theme.rule} 99px,
        ${theme.rule} 100px)`,
      pointerEvents: "none",
    }} />
  );
}

function Logo({ theme }) {
  return (
    <div style={{
      width: 48, height: 48,
      borderRadius: 14,
      background: theme.accent,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 3px 0 ${theme.accentShadow}`,
      fontSize: 24,
    }}>✒️</div>
  );
}

const miniBtn = (theme) => ({
  background: theme.btnBg,
  color: theme.btnInk,
  border: "none",
  padding: "8px 14px",
  borderRadius: 12,
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: `0 2px 0 ${theme.btnShadow}`,
  whiteSpace: "nowrap",
});

const kbdStyle = (theme) => ({
  background: theme.btnBg,
  padding: "2px 8px",
  borderRadius: 6,
  fontSize: 13,
  fontFamily: "inherit",
  fontWeight: 700,
  boxShadow: `0 2px 0 ${theme.btnShadow}`,
});

// ---------- Mascot drawings ----------
// Owl "Pip"
function Owl({ mood, theme }) {
  const eyesClosed = mood === "thinking";
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{
      animation: mood === "watching" ? "inksway 2s ease-in-out infinite" : "none",
    }}>
      {/* body */}
      <ellipse cx="50" cy="60" rx="34" ry="32" fill={theme.mascot.body} />
      <ellipse cx="50" cy="62" rx="22" ry="24" fill={theme.mascot.belly} />
      {/* wings */}
      <ellipse cx="22" cy="58" rx="8" ry="18" fill={theme.mascot.body} />
      <ellipse cx="78" cy="58" rx="8" ry="18" fill={theme.mascot.body} />
      {/* head tufts */}
      <path d="M28 32 L32 18 L40 30 Z" fill={theme.mascot.body} />
      <path d="M72 32 L68 18 L60 30 Z" fill={theme.mascot.body} />
      {/* eyes */}
      <circle cx="38" cy="44" r="10" fill="#fff" />
      <circle cx="62" cy="44" r="10" fill="#fff" />
      {!eyesClosed && <>
        <circle cx="38" cy="46" r="4" fill="#2a1f15" style={{ animation: "inkblink 4s infinite" }} />
        <circle cx="62" cy="46" r="4" fill="#2a1f15" style={{ animation: "inkblink 4s infinite" }} />
        <circle cx="39" cy="44" r="1.5" fill="#fff" />
        <circle cx="63" cy="44" r="1.5" fill="#fff" />
      </>}
      {eyesClosed && <>
        <path d="M32 46 Q38 42 44 46" stroke="#2a1f15" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M56 46 Q62 42 68 46" stroke="#2a1f15" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>}
      {/* beak */}
      <path d="M50 52 L46 58 L54 58 Z" fill={theme.mascot.beak} />
      {/* feet */}
      <path d="M42 90 L38 95 M42 90 L42 96 M42 90 L46 95" stroke={theme.mascot.beak} strokeWidth="2" strokeLinecap="round" />
      <path d="M58 90 L54 95 M58 90 L58 96 M58 90 L62 95" stroke={theme.mascot.beak} strokeWidth="2" strokeLinecap="round" />
      {mood === "cheer" && (
        <g>
          <text x="14" y="20" fontSize="14">✨</text>
          <text x="80" y="22" fontSize="14">✨</text>
        </g>
      )}
    </svg>
  );
}

// Tiger cub "Rimba"
function Tiger({ mood, theme }) {
  const eyesClosed = mood === "thinking";
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{
      animation: mood === "watching" ? "inksway 2s ease-in-out infinite" : "none",
    }}>
      {/* ears */}
      <circle cx="26" cy="28" r="9" fill={theme.mascot.body} />
      <circle cx="74" cy="28" r="9" fill={theme.mascot.body} />
      <circle cx="26" cy="29" r="5" fill={theme.mascot.belly} />
      <circle cx="74" cy="29" r="5" fill={theme.mascot.belly} />
      {/* head */}
      <circle cx="50" cy="52" r="34" fill={theme.mascot.body} />
      {/* stripes */}
      <path d="M22 40 Q26 44 22 50" stroke={theme.mascot.stripe} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M78 40 Q74 44 78 50" stroke={theme.mascot.stripe} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M40 22 Q42 28 38 30" stroke={theme.mascot.stripe} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60 22 Q58 28 62 30" stroke={theme.mascot.stripe} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* muzzle */}
      <ellipse cx="50" cy="62" rx="18" ry="14" fill={theme.mascot.belly} />
      {/* eyes */}
      {!eyesClosed && <>
        <circle cx="40" cy="48" r="4" fill="#2a1f15" style={{ animation: "inkblink 4s infinite" }} />
        <circle cx="60" cy="48" r="4" fill="#2a1f15" style={{ animation: "inkblink 4s infinite" }} />
        <circle cx="41" cy="47" r="1.3" fill="#fff" />
        <circle cx="61" cy="47" r="1.3" fill="#fff" />
      </>}
      {eyesClosed && <>
        <path d="M34 48 Q40 44 46 48" stroke="#2a1f15" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M54 48 Q60 44 66 48" stroke="#2a1f15" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>}
      {/* nose */}
      <path d="M46 56 Q50 60 54 56 Q52 62 50 62 Q48 62 46 56 Z" fill="#2a1f15" />
      {/* mouth */}
      <path d="M50 62 Q46 70 42 68" stroke="#2a1f15" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M50 62 Q54 70 58 68" stroke="#2a1f15" strokeWidth="2" fill="none" strokeLinecap="round" />
      {mood === "cheer" && (
        <g>
          <text x="10" y="20" fontSize="14">⭐</text>
          <text x="80" y="22" fontSize="14">⭐</text>
        </g>
      )}
    </svg>
  );
}

// Turtle "Luna"
function Turtle({ mood, theme }) {
  const eyesClosed = mood === "thinking";
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{
      animation: mood === "watching" ? "inksway 2s ease-in-out infinite" : "none",
    }}>
      {/* shell back */}
      <ellipse cx="50" cy="62" rx="38" ry="26" fill={theme.mascot.body} />
      <ellipse cx="50" cy="60" rx="32" ry="22" fill={theme.mascot.belly} />
      {/* shell pattern */}
      <path d="M50 38 L50 82 M22 60 L78 60" stroke={theme.mascot.stripe} strokeWidth="2" />
      <circle cx="50" cy="60" r="6" fill={theme.mascot.stripe} opacity="0.5" />
      {/* head */}
      <circle cx="50" cy="34" r="14" fill={theme.mascot.head} />
      {/* eyes */}
      {!eyesClosed && <>
        <circle cx="44" cy="32" r="3" fill="#2a1f15" style={{ animation: "inkblink 4s infinite" }} />
        <circle cx="56" cy="32" r="3" fill="#2a1f15" style={{ animation: "inkblink 4s infinite" }} />
        <circle cx="45" cy="31" r="1" fill="#fff" />
        <circle cx="57" cy="31" r="1" fill="#fff" />
      </>}
      {eyesClosed && <>
        <path d="M40 32 Q44 30 48 32" stroke="#2a1f15" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M52 32 Q56 30 60 32" stroke="#2a1f15" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>}
      {/* smile */}
      <path d="M44 38 Q50 42 56 38" stroke="#2a1f15" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* feet */}
      <ellipse cx="20" cy="68" rx="6" ry="4" fill={theme.mascot.head} />
      <ellipse cx="80" cy="68" rx="6" ry="4" fill={theme.mascot.head} />
      <ellipse cx="30" cy="86" rx="6" ry="4" fill={theme.mascot.head} />
      <ellipse cx="70" cy="86" rx="6" ry="4" fill={theme.mascot.head} />
      {mood === "cheer" && (
        <g>
          <text x="10" y="22" fontSize="12">💫</text>
          <text x="80" y="24" fontSize="12">💫</text>
        </g>
      )}
    </svg>
  );
}

// ---------- Themes ----------
const themeSunset = {
  name: "Sunset Garden",
  font: "'Lexend', system-ui, sans-serif",
  bg: "#fbf4e6",
  ink: "#3a2a1c",
  subtleInk: "#7a6450",
  brandInk: "#5a3a22",
  divider: "#e8d8b8",
  headerBg: "#fef8eb",
  footerBg: "#fef8eb",
  canvasBg: "#fffaf0",
  canvasBorder: "#f1c891",
  canvasInner: "#fff5dc",
  canvasShadow: "#e8c89a",
  rule: "#f5e0bc",
  watermark: "#e8c89a",
  ink: "#3a2a1c",
  chipBg: "#fef0d8",
  bubbleBg: "#fff",
  bubbleInk: "#3a2a1c",
  bubbleShadow: "#e8d4ad",
  btnBg: "#fff",
  btnInk: "#3a2a1c",
  btnShadow: "#dac3a3",
  accent: "#ee8c5a",     // peach/coral
  accentInk: "#fff",
  accentShadow: "#c46c3e",
  talk: "#a8c47e",       // sage
  talkInk: "#2c3a1c",
  talkShadow: "#7a9a52",
  danger: "#d36755",
  dangerShadow: "#a4493a",
  listenOverlay: "rgba(251, 244, 230, 0.85)",
  thinkOverlay: "rgba(255, 250, 240, 0.7)",
  mascot: {
    name: "Pip",
    body: "#c98b5a",
    belly: "#f5d8a8",
    beak: "#d97742",
    Render: Owl,
  },
};

const themeTropical = {
  name: "Tropical Sketch",
  font: "'Lexend', system-ui, sans-serif",
  bg: "#fdf2ee",
  ink: "#2c1f2d",
  subtleInk: "#6b4a5e",
  brandInk: "#7a2855",
  divider: "#f3d4cc",
  headerBg: "#fff8f4",
  footerBg: "#fff8f4",
  canvasBg: "#fffdf8",
  canvasBorder: "#f4b8c4",
  canvasInner: "#fef3f4",
  canvasShadow: "#e89aa8",
  rule: "#f9d8de",
  watermark: "#e8a8b4",
  chipBg: "#feeaea",
  bubbleBg: "#fff",
  bubbleInk: "#2c1f2d",
  bubbleShadow: "#e8c4cc",
  btnBg: "#fff",
  btnInk: "#2c1f2d",
  btnShadow: "#e0bcc4",
  accent: "#e44c7c",      // hibiscus
  accentInk: "#fff",
  accentShadow: "#a82c5c",
  talk: "#5cae6e",        // banana leaf
  talkInk: "#fff",
  talkShadow: "#3a8650",
  danger: "#cc4742",
  dangerShadow: "#9a2e2a",
  listenOverlay: "rgba(253, 242, 238, 0.88)",
  thinkOverlay: "rgba(255, 253, 248, 0.7)",
  mascot: {
    name: "Rimba",
    body: "#f0a040",
    belly: "#fde2bc",
    stripe: "#3a2818",
    Render: Tiger,
  },
};

const themeOcean = {
  name: "Calm Ocean",
  font: "'Atkinson Hyperlegible', 'Lexend', system-ui, sans-serif",
  bg: "#f4f0e6",
  ink: "#1f2e3a",
  subtleInk: "#5a6c78",
  brandInk: "#1f4858",
  divider: "#d4dad0",
  headerBg: "#faf7ee",
  footerBg: "#faf7ee",
  canvasBg: "#fdfaf2",
  canvasBorder: "#a8c8d4",
  canvasInner: "#f4faf8",
  canvasShadow: "#90b0bc",
  rule: "#dde8e6",
  watermark: "#a8c8d4",
  chipBg: "#e6f0ec",
  bubbleBg: "#fff",
  bubbleInk: "#1f2e3a",
  bubbleShadow: "#c4d0d4",
  btnBg: "#fff",
  btnInk: "#1f2e3a",
  btnShadow: "#bcc8cc",
  accent: "#3a8a96",      // teal
  accentInk: "#fff",
  accentShadow: "#1f5a64",
  talk: "#e89a64",        // sunset coral
  talkInk: "#3a2410",
  talkShadow: "#b87242",
  danger: "#c45a4a",
  dangerShadow: "#8a3828",
  listenOverlay: "rgba(244, 240, 230, 0.88)",
  thinkOverlay: "rgba(253, 250, 242, 0.7)",
  mascot: {
    name: "Luna",
    body: "#5a8a76",
    belly: "#a4c4ac",
    stripe: "#2c4a3a",
    head: "#7aa890",
    Render: Turtle,
  },
};

// expose for app entry
Object.assign(window, { InkSense, themeSunset, themeTropical, themeOcean });
