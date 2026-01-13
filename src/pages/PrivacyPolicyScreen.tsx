import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Cloud, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Privacy Policy</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8 pb-24">
        {/* Last Updated */}
        <p className="text-sm text-muted-foreground">Last updated: January 2025</p>

        {/* Health Data Notice - HIPAA-style */}
        <section className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-foreground mb-2">Health Information Privacy Notice</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Budder Buddy collects and stores health-related information about your tattoo healing process. 
                We treat this information with the same care and security standards used for protected health information (PHI) 
                under HIPAA guidelines, even though tattoo aftercare tracking may not be classified as PHI under federal law.
              </p>
            </div>
          </div>
        </section>

        {/* What We Collect */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Information We Collect</h2>
          <div className="space-y-4">
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-medium text-foreground mb-2">Account Information</h3>
              <p className="text-sm text-muted-foreground">
                Email address and password (encrypted) when you create an account.
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-medium text-foreground mb-2">Tattoo Details</h3>
              <p className="text-sm text-muted-foreground">
                Information about your tattoos including date, body location, size, and ink type. 
                This helps us provide personalized aftercare guidance.
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-medium text-foreground mb-2">Photos</h3>
              <p className="text-sm text-muted-foreground">
                Photos you take of your healing tattoo. These are stored securely and are only accessible by you.
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-medium text-foreground mb-2">Daily Check-ins</h3>
              <p className="text-sm text-muted-foreground">
                Your aftercare tracking data including washing, moisturizing, and any notes about your healing progress.
              </p>
            </div>
          </div>
        </section>

        {/* How We Protect Your Data */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">How We Protect Your Data</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Encryption</h3>
                <p className="text-sm text-muted-foreground">
                  All data is encrypted in transit (TLS 1.3) and at rest (AES-256).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Cloud className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Secure Cloud Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Photos and data are stored in SOC 2 Type II compliant cloud infrastructure.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Access Controls</h3>
                <p className="text-sm text-muted-foreground">
                  Row-level security ensures only you can access your own data. We cannot view your photos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Data Sharing</h2>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">We do not sell, share, or disclose your health information to third parties.</strong>
              {' '}Your tattoo photos, healing progress, and personal information are never shared with advertisers, 
              data brokers, or any external parties. We do not use your data for marketing purposes.
            </p>
          </div>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Rights</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Right to Delete</h3>
                <p className="text-sm text-muted-foreground">
                  You can delete your photos and data at any time. Deleted data is permanently removed from our servers.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Cloud className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Data Portability</h3>
                <p className="text-sm text-muted-foreground">
                  You can request a copy of all your data in a standard format.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Account Deletion</h3>
                <p className="text-sm text-muted-foreground">
                  You can delete your account at any time, which will permanently remove all associated data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Local Storage */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Local Storage Option</h2>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can use Budder Buddy without creating an account. In this case, your data is stored 
              only on your device and never transmitted to our servers. However, local-only data cannot 
              be recovered if you clear your browser data or switch devices.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Contact Us</h2>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                For privacy inquiries: <span className="text-primary">privacy@budderbuddy.app</span>
              </p>
            </div>
          </div>
        </section>

        {/* HIPAA-style Disclaimer */}
        <section className="bg-muted/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Important:</strong> While we implement security practices 
            aligned with HIPAA standards, Budder Buddy is a wellness and educational app, not a healthcare provider. 
            The app is not intended to diagnose, treat, or prevent any medical condition. Always consult with 
            your tattoo artist or a healthcare professional for medical concerns about your tattoo.
          </p>
        </section>
      </div>
    </div>
  );
}
