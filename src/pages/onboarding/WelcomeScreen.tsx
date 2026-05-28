import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings, useTattoos } from '@/hooks/useStorage';
import mascotImage from '@/assets/mascot.png';

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { tattoos } = useTattoos();

  // If the user already has a tattoo/reminders configured, unlock the app and route them in.
  useEffect(() => {
    const shouldUnlock =
      settings.selectedTattooId !== null ||
      tattoos.length > 0;

    if (!settings.hasCompletedOnboarding && shouldUnlock) {
      updateSettings({ hasCompletedOnboarding: true });
      navigate('/', { replace: true });
    }
  }, [
    settings.hasCompletedOnboarding,
    settings.hasCompletedReminderSetup,
    settings.selectedTattooId,
    tattoos.length,
    updateSettings,
    navigate,
  ]);

  const handleStart = () => {
    updateSettings({ hasAcknowledgedDisclaimer: true });
    navigate('/auth', { replace: true });
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center safe-area-top safe-area-bottom"
      style={{
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 24,
        background: 'radial-gradient(ellipse at 50% 30%, #0D2B6B 0%, #0A1E3F 50%, #050A1F 100%)',
      }}
    >
      {/* ── Centered content area ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center"
        style={{ gap: 12, overflow: 'hidden' }}
      >
        {/* ── Brand group ── */}
        <div className="flex flex-col items-center text-center animate-fade-in" style={{ gap: 4 }}>
          <h2
            style={{
              fontFamily: "'Lilita One', sans-serif",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 2,
              background: 'linear-gradient(180deg, #A8D8FF 0%, #3AA0FF 50%, #0A5BFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 8px rgba(58,160,255,0.35))',
            }}
          >
            BLUE DREAM BUDDER
          </h2>
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 15,
              color: '#CFE6FF',
              opacity: 0.7,
            }}
          >
            presents...
          </p>
        </div>

        {/* ── Hero group (logo + title) ── */}
        <div
          className="flex flex-col items-center animate-fade-in"
          style={{ gap: 10 }}
        >
          {/* Logo with glow */}
          <div className="relative">
            <div
              className="absolute rounded-[32px]"
              style={{
                inset: -10,
                background: 'rgba(58,160,255,0.4)',
                filter: 'blur(20px)',
              }}
            />
            <img
              src={mascotImage}
              alt="Budder Buddy mascot"
              className="relative object-cover"
              style={{
                width: 200,
                height: 200,
                borderRadius: 32,
              }}
            />
          </div>

          {/* App title */}
          <h1
            aria-label="Budder Buddy — Your Tattoo Healing Companion"
            style={{
              fontFamily: "'Lilita One', sans-serif",
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: -1,
              background: 'linear-gradient(135deg, #A8D8FF 0%, #4FB3FF 50%, #1A6BFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 10px rgba(0,0,0,0.25)',
            }}
          >
            <span aria-hidden="true">BUDDER BUDDY</span>
            <span className="sr-only">Budder Buddy — Your Tattoo Healing Companion</span>
          </h1>
        </div>

        {/* ── Body group ── */}
        <div
          className="flex flex-col items-center text-center animate-slide-up"
          style={{ gap: 8, maxWidth: 300 }}
        >
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 15,
              lineHeight: 1.5,
              color: '#D6E4FF',
            }}
          >
            Your tattoo healing companion—designed to guide you through every stage, from fresh ink to fully healed.
          </p>
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 15,
              lineHeight: 1.5,
              color: '#D6E4FF',
            }}
          >
            Get daily care reminders, expert tips, and real-time guidance to keep your tattoo looking its best every step of the way.
          </p>
        </div>
      </div>

      {/* ── Bottom group (disclaimer + CTA) — anchored to bottom ── */}
      <div
        className="w-full flex flex-col animate-slide-up"
        style={{ gap: 12, flexShrink: 0 }}
      >
        {/* Disclaimer box */}
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
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 11,
              lineHeight: 1.4,
              color: '#AFC6FF',
            }}
          >
            <span style={{ fontWeight: 700 }}>Educational Purposes Only:</span>{' '}
            Budder Buddy provides general aftercare guidance and does not offer medical advice.
            If you have concerns about your healing tattoo, please contact your tattoo artist
            or a medical professional.
          </p>
        </div>

        {/* CTA button */}
        <button
          onClick={handleStart}
          className="w-full relative overflow-hidden"
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
          SIGN UP
        </button>
      </div>
    </div>
  );
}