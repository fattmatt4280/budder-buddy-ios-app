import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, BookOpen, Shield, User, Copyright, Lock, XCircle, FileText, Scale, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsOfServiceScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Terms of Service</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8 pb-24">
        {/* Last Updated */}
        <p className="text-sm text-muted-foreground">Last Updated: January 14, 2026</p>

        {/* Introduction */}
        <section className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            These Terms of Service ("Terms") govern your access to and use of the Budder Buddy mobile application 
            and related services (collectively, the "App" or "Services"), operated by Budder Buddy in connection 
            with Blue Dream Budder ("we," "us," or "our").
          </p>
          <p className="text-sm text-muted-foreground mt-3 font-medium">
            By downloading, accessing, or using Budder Buddy, you agree to be bound by these Terms. If you do not agree, do not use the App.
          </p>
        </section>

        {/* Section 1: Not Medical Advice */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">1. Not Medical Advice</h2>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Budder Buddy is a wellness and educational application intended solely to assist users in tracking tattoo aftercare routines.
                </p>
                <p className="text-sm text-muted-foreground font-medium mb-2">Budder Buddy:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 mb-3">
                  <li>• Does not provide medical advice</li>
                  <li>• Does not provide diagnosis or treatment</li>
                  <li>• Is not a healthcare provider or medical device</li>
                </ul>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All information provided through the App is for general informational and educational purposes only. 
                  Always consult your tattoo artist or a licensed healthcare professional for medical concerns, 
                  including signs of infection, allergic reactions, or delayed healing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Acceptance of Terms */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">2. Acceptance of Terms</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">By using Budder Buddy, you confirm that:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• You are at least 13 years of age</li>
                  <li>• You have read, understood, and agree to these Terms</li>
                  <li>• You will comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Description of Services */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">3. Description of Services</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Budder Buddy provides features that may include:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 mb-3">
                  <li>• Tattoo aftercare tracking and reminders</li>
                  <li>• Photo logging to document healing progress</li>
                  <li>• Educational content related to tattoo healing</li>
                  <li>• Personalized aftercare guidance based on user-provided information</li>
                </ul>
                <p className="text-sm text-muted-foreground italic">
                  We reserve the right to modify, suspend, or discontinue any part of the Services at any time without liability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Health Information Acknowledgment and Consent */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">4. Health Information Acknowledgment and Consent</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  By using the App, you acknowledge and consent to the collection and use of tattoo-related information you voluntarily provide, which may include:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 mb-3">
                  <li>• Photos of your tattoo</li>
                  <li>• Healing notes and aftercare logs</li>
                  <li>• Tattoo details such as location and date</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  This information is used only to provide App functionality and is handled in accordance with our Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: User Responsibilities */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">5. User Responsibilities</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">You agree to:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 mb-3">
                  <li>• Provide accurate and lawful information</li>
                  <li>• Maintain the confidentiality of your account credentials</li>
                  <li>• Use the App only for lawful purposes</li>
                  <li>• Not attempt to access, interfere with, or compromise other users' data or the App's security</li>
                  <li>• Seek professional advice for medical or health-related concerns</li>
                </ul>
                <p className="text-sm text-muted-foreground font-medium">
                  You are solely responsible for your use of the App and any outcomes related to tattoo aftercare decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Intellectual Property */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">6. Intellectual Property</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <Copyright className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  All App content, design, software, trademarks, and features are owned by or licensed to Budder Buddy and are protected by intellectual property laws.
                </p>
                <p className="text-sm text-muted-foreground mb-2 font-medium">You retain ownership of:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 mb-3">
                  <li>• Photos and content you upload or create within the App</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  You grant Budder Buddy a limited, non-exclusive license to store and display your content solely for the purpose of providing the Services.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Data Privacy */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">7. Data Privacy</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your use of Budder Buddy is governed by our Privacy Policy, which explains how we collect, use, and protect your information. By using the App, you agree to the practices described in that policy.
              </p>
            </div>
          </div>
        </section>

        {/* Section 8: Limitation of Liability */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">To the maximum extent permitted by law:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 mb-3">
              <li>• The App is provided "as is" and "as available"</li>
              <li>• We disclaim all warranties, express or implied</li>
              <li>• We are not liable for any health complications, infections, allergic reactions, delayed healing, or adverse outcomes related to tattoo aftercare</li>
            </ul>
            <p className="text-sm text-muted-foreground font-medium">
              Budder Buddy is a tracking and educational tool only and is not a substitute for professional tattoo aftercare guidance or medical treatment.
            </p>
          </div>
        </section>

        {/* Section 9: Termination */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">9. Termination</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-3">You may stop using the App at any time.</p>
                <p className="text-sm text-muted-foreground mb-2">We reserve the right to suspend or terminate access to the App if:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 mb-3">
                  <li>• You violate these Terms</li>
                  <li>• Your use poses a security or legal risk</li>
                  <li>• Required by law or regulation</li>
                </ul>
                <p className="text-sm text-muted-foreground font-medium">
                  Upon termination, your right to use the App ends immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 10: Changes to These Terms */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">10. Changes to These Terms</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may update these Terms from time to time. Material changes will be posted within the App. 
                Continued use of Budder Buddy after changes take effect constitutes acceptance of the updated Terms.
              </p>
            </div>
          </div>
        </section>

        {/* Section 11: Governing Law */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">11. Governing Law</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                These Terms are governed by and construed in accordance with the laws of the United States and the state 
                in which Budder Buddy operates, without regard to conflict-of-law principles.
              </p>
            </div>
          </div>
        </section>

        {/* Section 12: Contact Information */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">12. Contact Information</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-3">For questions regarding these Terms:</p>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary font-medium">legal@budderbuddy.app</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
