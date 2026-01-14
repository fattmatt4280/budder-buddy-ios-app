import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Mail, Database, Eye, Trash2, UserX, FileText } from 'lucide-react';
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
        {/* Dates */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Effective Date: January 14, 2026</p>
          <p className="text-sm text-muted-foreground">Last Updated: January 14, 2026</p>
        </div>

        {/* Introduction */}
        <section className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Budder Buddy ("Budder Buddy," "we," "us," or "our") is a tattoo aftercare and wellness application 
            provided by Blue Dream Budder. This Privacy Policy explains how we collect, use, store, and protect 
            information when you use the Budder Buddy mobile application and related services (the "Services").
          </p>
          <p className="text-sm text-muted-foreground mt-3 font-medium">
            By using Budder Buddy, you agree to this Privacy Policy.
          </p>
        </section>

        {/* Section 1: App Purpose and Scope */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">1. App Purpose and Scope</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Budder Buddy is a wellness and educational app designed to help users track tattoo aftercare routines and healing progress.
            </p>
            <p className="text-sm text-muted-foreground font-medium mb-2">Budder Buddy:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Is not a medical device</li>
              <li>• Is not a healthcare provider</li>
              <li>• Does not provide medical advice</li>
              <li>• Does not diagnose, treat, or prevent disease</li>
            </ul>
          </div>
        </section>

        {/* Section 2: Information We Collect */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">2. Information We Collect</h2>
          
          {/* 2A */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">A. Information You Provide</h3>
            
            <div className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-medium text-foreground mb-2">Account Information (Optional)</h4>
              <p className="text-sm text-muted-foreground mb-2">If you create an account, we collect:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Email address</li>
                <li>• Encrypted authentication credentials</li>
              </ul>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-medium text-foreground mb-2">Tattoo Aftercare Information</h4>
              <p className="text-sm text-muted-foreground mb-2">You may voluntarily provide:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Tattoo date and body location</li>
                <li>• Size or style notes</li>
                <li>• Aftercare logs (washing, moisturizing, reminders)</li>
              </ul>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-medium text-foreground mb-2">Photos</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Images of your tattoo uploaded or captured by you</li>
                <li>• Photos are private and visible only to you</li>
              </ul>
            </div>

            {/* 2B */}
            <h3 className="font-medium text-foreground mt-6">B. Information Collected Automatically</h3>
            
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground mb-3">We collect limited, non-identifying technical data:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Device type and operating system</li>
                <li>• App version and basic device information (for troubleshooting if you contact support)</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 mb-2 font-medium">We do not collect:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Precise location data</li>
                <li>• Contacts</li>
                <li>• Biometric identifiers</li>
                <li>• Advertising identifiers</li>
              </ul>
            </div>

            {/* 2C */}
            <h3 className="font-medium text-foreground mt-6">C. Local-Only Use Option</h3>
            
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground mb-3">You may use Budder Buddy without creating an account.</p>
              <p className="text-sm text-muted-foreground mb-2 font-medium">In local-only mode:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• All data is stored solely on your device</li>
                <li>• No data is transmitted to our servers</li>
                <li>• Data cannot be recovered if the app is deleted or device data is cleared</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: How We Use Information */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">3. How We Use Information</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-2 font-medium">We use information solely to:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 mb-4">
              <li>• Provide and operate app functionality</li>
              <li>• Display healing timelines and reminders</li>
              <li>• Improve app stability and user experience</li>
              <li>• Respond to user support requests</li>
            </ul>
            <p className="text-sm text-muted-foreground mb-2 font-medium">We do not use your data for:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Advertising</li>
              <li>• Marketing</li>
              <li>• Cross-app tracking</li>
              <li>• Data brokerage</li>
            </ul>
          </div>
        </section>

        {/* Section 4: Data Protection and Security */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">4. Data Protection and Security</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Encryption in Transit</h3>
                <p className="text-sm text-muted-foreground">TLS 1.3</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
              <Database className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Encryption at Rest</h3>
                <p className="text-sm text-muted-foreground">AES-256</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Secure Cloud Infrastructure</h3>
                <p className="text-sm text-muted-foreground">With access controls and user-level data isolation</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 italic">
            We do not view or access your tattoo photos or aftercare logs.
          </p>
        </section>

        {/* Section 5: Data Sharing */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">5. Data Sharing</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">Budder Buddy does not sell, rent, or share personal or health-related data.</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-2">Data is disclosed only if legally required, such as:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Compliance with lawful court orders</li>
              <li>• Government requests where legally mandated</li>
              <li>• Protection of user safety or legal rights</li>
            </ul>
          </div>
        </section>

        {/* Section 6: Data Retention and Deletion */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">6. Data Retention and Deletion</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Data is retained only while your account is active</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>You may delete photos, logs, or your account at any time</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Account deletion permanently removes all associated data</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 7: Your Rights */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">7. Your Rights</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
              <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Access Your Data</h3>
                <p className="text-sm text-muted-foreground">View all information we have about you</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
              <Trash2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Request Deletion</h3>
                <p className="text-sm text-muted-foreground">Have your data permanently removed</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
              <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Request a Copy</h3>
                <p className="text-sm text-muted-foreground">Receive a copy of your data</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Requests can be submitted using the contact information below.
          </p>
        </section>

        {/* Section 8: Children's Privacy */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">8. Children's Privacy</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <UserX className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Budder Buddy is not intended for children under 13. We do not knowingly collect personal information from children.
              </p>
            </div>
          </div>
        </section>

        {/* Section 9: Changes to This Policy */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">9. Changes to This Policy</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Privacy Policy periodically. Material changes will be communicated through the app or by email when required.
            </p>
          </div>
        </section>

        {/* Section 10: Contact Us */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">10. Contact Us</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-3">For privacy questions or requests:</p>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary font-medium">privacy@budderbuddy.app</span>
            </div>
          </div>
        </section>

        {/* Section 11: Medical Disclaimer */}
        <section className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">11. Medical Disclaimer</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Budder Buddy provides general aftercare tracking and educational information only. 
            Always consult a tattoo professional or licensed healthcare provider for medical concerns.
          </p>
        </section>
      </div>
    </div>
  );
}
