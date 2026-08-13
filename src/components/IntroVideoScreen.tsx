import { useEffect, useRef, useState } from "react";
import introVideo from "@/assets/mascot-intro.mp4";

interface IntroVideoScreenProps {
  onFinish: () => void;
}

// Longest we'll ever hold the user here. Set just past the clip's own length (~8s)
// so this only ever fires as a stall/decode-failure fallback, never a routine cutoff.
const HARD_TIMEOUT_MS = 9000;
// Skip hint fades in shortly after start so the first beat of the animation reads clean.
const SKIP_HINT_DELAY_MS = 600;

/**
 * Full-screen mascot intro that plays on top of the native launch screen handoff.
 * Runs every launch, but is always tappable-through and hard-capped so it never
 * blocks anyone from reaching the app.
 */
export default function IntroVideoScreen({ onFinish }: IntroVideoScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showSkipHint, setShowSkipHint] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setLeaving(true);
    // Let the fade-out transition play before unmounting.
    window.setTimeout(onFinish, 220);
  };

  useEffect(() => {
    // Respect reduced-motion: skip straight through, no video.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    const hardTimeout = window.setTimeout(finish, HARD_TIMEOUT_MS);
    const hintTimer = window.setTimeout(() => setShowSkipHint(true), SKIP_HINT_DELAY_MS);

    return () => {
      window.clearTimeout(hardTimeout);
      window.clearTimeout(hintTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#1a1a2e] transition-opacity duration-200 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      onClick={finish}
      role="button"
      aria-label="Skip intro"
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src={introVideo}
        // No poster: the video is bundled locally and starts near-instantly, and the
        // mascot's resting-pose art looks almost identical to the clip's *last* frame —
        // using it as a poster made the intro look like it flashed the ending before
        // cutting back to the real (empty-stage) first frame. The container's bg color
        // covers the brief gap before the video paints instead.
        autoPlay
        muted
        playsInline
        // iOS Safari/WKWebView also wants this attribute name, not just the playsInline prop.
        webkit-playsinline="true"
        onEnded={finish}
        onError={finish}
      />

      <span
        className={`absolute bottom-10 left-0 right-0 text-center text-sm text-white/60 transition-opacity duration-300 safe-area-bottom ${
          showSkipHint ? "opacity-100" : "opacity-0"
        }`}
      >
        Tap to skip
      </span>
    </div>
  );
}
