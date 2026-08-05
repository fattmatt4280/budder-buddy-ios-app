import { useNavigate } from 'react-router-dom';
import { Sparkles, MessageCircle, Unlock } from 'lucide-react';
import mascotImage from '@/assets/mascot.png';

const PERKS = [
  {
    icon: Unlock,
    title: 'Everything unlocked, free',
    description: 'Ghost Camera, AI Healing Guide, timelapse exports, unlimited tattoos — all Pro features, no charge during beta.',
  },
  {
    icon: Sparkles,
    title: "We're still polishing it",
    description: "You'll be one of the first hands on it. Some rough edges are expected — that's exactly what we're testing for.",
  },
  {
    icon: MessageCircle,
    title: 'A minute of your feedback',
    description: "We'll check in with a quick question here and there while you use the app — did it help, did it feel smooth?",
  },
];

export default function BetaLandingScreen() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/auth', { replace: true });
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center overflow-y-auto safe-area-top safe-area-bottom"
      style={{
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 24,
        background: 'radial-gradient(ellipse at 50% 30%, #0D2B6B 0%, #0A1E3F 50%, #050A1F 100%)',
      }}
    >
      <div className="flex-1 flex flex-col items-center w-full" style={{ gap: 20, maxWidth: 420, paddingTop: 32 }}>
        {/* Beta badge */}
        <div
          className="animate-fade-in"
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1.5,
            color: '#FFD166',
            background: 'rgba(255,209,102,0.12)',
            border: '1px solid rgba(255,209,102,0.35)',
            borderRadius: 999,
            padding: '6px 14px',
          }}
        >
          NOW IN BETA
        </div>

        {/* Hero: mascot + title */}
        <div className="flex flex-col items-center animate-fade-in" style={{ gap: 10 }}>
          <div className="relative">
            <div
              className="absolute rounded-[32px]"
              style={{ inset: -10, background: 'rgba(58,160,255,0.4)', filter: 'blur(20px)' }}
            />
            <img
              src={mascotImage}
              alt="Budder Buddy mascot"
              className="relative object-cover"
              style={{ width: 140, height: 140, borderRadius: 28 }}
            />
          </div>

          <h1
            style={{
              fontFamily: "'Lilita One', sans-serif",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: -0.5,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #A8D8FF 0%, #4FB3FF 50%, #1A6BFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 10px rgba(0,0,0,0.25)',
            }}
          >
            Help Us Build The Best Tattoo Healing App
          </h1>

          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 15,
              lineHeight: 1.5,
              color: '#D6E4FF',
              textAlign: 'center',
              maxWidth: 340,
            }}
          >
            We're testing Budder Buddy with real users for the next few months —
            watching how it holds up day to day, and finding out whether it
            actually helps people heal better. That's where you come in.
          </p>
        </div>

        {/* Perks list */}
        <div className="w-full flex flex-col animate-slide-up" style={{ gap: 10, marginTop: 4 }}>
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="flex items-start"
              style={{
                gap: 12,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 14,
              }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: 'rgba(58,160,255,0.15)',
                }}
              >
                <perk.icon style={{ width: 18, height: 18, color: '#6DB4FF' }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginBottom: 2 }}>
                  {perk.title}
                </p>
                <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, lineHeight: 1.45, color: '#B7CBEF' }}>
                  {perk.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: disclaimer + CTA, anchored */}
      <div className="w-full flex flex-col animate-slide-up" style={{ gap: 12, maxWidth: 420, flexShrink: 0, paddingTop: 20 }}>
        <div
          className="text-center"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 16,
            padding: 12,
          }}
        >
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, lineHeight: 1.4, color: '#AFC6FF' }}>
            <span style={{ fontWeight: 700 }}>Beta software:</span>{' '}
            Free access and features may change before public launch. Budder Buddy
            provides general aftercare guidance and does not offer medical advice —
            for concerns about your healing tattoo, contact your tattoo artist or a
            medical professional.
          </p>
        </div>

        <button
          onClick={handleStart}
          className="w-full"
          style={{
            height: 58,
            borderRadius: 18,
            background: 'linear-gradient(180deg, #2E6BFF 0%, #0A4DFF 100%)',
            boxShadow: '0 0 20px rgba(58,160,255,0.5)',
            fontFamily: "'Lilita One', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: 1,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          JOIN THE BETA — FREE
        </button>
      </div>
    </div>
  );
}
