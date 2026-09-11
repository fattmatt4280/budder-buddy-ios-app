import { useNavigate } from 'react-router-dom';
import AddTattooDialog from '@/components/vault/AddTattooDialog';

/**
 * First step of the guided onboarding flow (after Welcome): let a brand-new
 * user add their tattoo before ever being asked to create an account.
 * Reuses the same AddTattooDialog the rest of the app uses from Settings/Ink
 * Vault, just rendered full-screen and always open.
 */
export default function AddFirstTattooScreen() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-background">
      <AddTattooDialog
        open={true}
        onOpenChange={(open) => {
          // The dialog's own Cancel/close (X) button calls this with false.
          // Back out to Welcome rather than leaving them on a blank screen.
          if (!open) navigate('/', { replace: true });
        }}
        onTattooAdded={(tattooId) => {
          navigate('/ghost-camera', {
            replace: true,
            state: { tattooId, onboarding: true, onboardingPhotoStep: 'first' },
          });
        }}
      />
    </div>
  );
}
