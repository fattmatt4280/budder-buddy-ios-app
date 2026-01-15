import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, BookOpen, Shield, User, Copyright, Lock, XCircle, Scale, Mail, Camera, Bot, Image } from 'lucide-react';
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

        {/* Section 1: No Medical Advice and "As-Is" Limitation */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">1. No Medical Advice and "As-Is" Limitation</h2>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Budder Buddy is a wellness and educational application intended solely to assist users in tracking tattoo aftercare routines.
                </p>
                <p className="text-sm text-muted-foreground font-medium mb-2">Critical Disclaimers:</p>
                <ul className="text-sm text-muted-foreground space-y-2 ml-4 mb-3">
                  <li>• <span className="font-medium">NOT A DOCTOR:</span> Budder Buddy does not provide medical advice, diagnosis, or treatment. We are not a healthcare provider or a medical device.</li>
                  <li>• <span className="font-medium">AI-GENERATED CONTENT:</span> The "Healing Guide" feature uses artificial intelligence (AI) to provide general information. AI can make mistakes, "hallucinate" incorrect info, or provide outdated advice. Do not rely on AI for health decisions.</li>
                  <li>• <span className="font-medium">PROFESSIONAL CONSULTATION:</span> All information provided through the App is for general informational purposes. Always consult your tattoo artist or a licensed healthcare professional for medical concerns, including signs of infection, allergic reactions, or delayed healing.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Acceptance and Eligibility */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">2. Acceptance and Eligibility</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">By using Budder Buddy, you confirm that:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• You are at least 18 years of age (or the legal age of majority in your jurisdiction to receive a tattoo). If you are between 13 and 18, you must have parental consent.</li>
                  <li>• You have read, understood, and agree to these Terms.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Description of Services & AI Usage */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">3. Description of Services & AI Usage</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Budder Buddy provides features including:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 mb-3">
                  <li>• <span className="font-medium">Healing Tracking:</span> Reminders and phase calculations.</li>
                  <li>• <span className="font-medium">Ghost Camera:</span> A specialized photography tool for alignment.</li>
                  <li>• <span className="font-medium">Sun Guard:</span> Localized UV alerts based on third-party weather data.</li>
                  <li>• <span className="font-medium">AI Healing Guide:</span> An interactive chat interface for aftercare education.</li>
                </ul>
                <div className="bg-muted/50 rounded-lg p-3 mt-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Note on Automated Alerts:</span> "Sun Guard" alerts are based on third-party weather APIs. We do not guarantee the accuracy of local UV data. You are solely responsible for physically protecting your skin from sun exposure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: User Content and Photos */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">4. User Content and Photos</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <Image className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <ul className="text-sm text-muted-foreground space-y-3">
                  <li>• <span className="font-medium">Ownership:</span> You retain ownership of all photos and logs you create.</li>
                  <li>• <span className="font-medium">License:</span> You grant Budder Buddy a limited, non-exclusive, worldwide license to store, process, and display your content solely to provide the Services (e.g., displaying your photos back to you in the Ghost Camera).</li>
                  <li>• <span className="font-medium">AI Processing:</span> By using the AI Healing Guide, you consent to your queries being processed by our AI sub-processors (e.g., Google Gemini) in accordance with our Privacy Policy.</li>
                </ul>
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
                  <li>• Provide accurate information regarding your tattoo date and location.</li>
                  <li>• Use the Ghost Camera and AI features only for lawful, personal purposes.</li>
                  <li>• Not use the App to diagnose a serious medical emergency. If you believe you have an infection or a life-threatening reaction, call emergency services (911) immediately.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Limitation of Liability */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">To the maximum extent permitted by law:</p>
            <ul className="text-sm text-muted-foreground space-y-2 ml-4 mb-3">
              <li>• <span className="font-medium">No Warranty:</span> The App is provided "as is" and "as available." We disclaim all warranties, including the accuracy of healing phase predictions or UV alerts.</li>
              <li>• <span className="font-medium">Total Liability Cap:</span> In no event shall Budder Buddy or Blue Dream Budder be liable for health complications, infections, allergic reactions, or faded ink resulting from your tattoo aftercare decisions.</li>
              <li>• <span className="font-medium">Third-Party Data:</span> We are not responsible for the accuracy of AI responses or third-party weather data.</li>
            </ul>
          </div>
        </section>

        {/* Section 7: Intellectual Property */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">7. Intellectual Property</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <Copyright className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The Budder Buddy name, logo, "Ghost Camera" alignment technology, and custom UI/UX are the exclusive property of Budder Buddy/Blue Dream Budder. You may not reverse-engineer, "scrape," or copy the App's code or content.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Data Privacy */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">8. Data Privacy</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your use of the App is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
            </div>
          </div>
        </section>

        {/* Section 9: Termination */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">9. Termination</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your access to the App without notice for any violation of these Terms or if your use of the AI features is deemed abusive or harmful.
              </p>
            </div>
          </div>
        </section>

        {/* Section 10: Governing Law */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">10. Governing Law</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                These Terms are governed by the laws of the United States and the State of [Your State], without regard to conflict-of-law principles.
              </p>
            </div>
          </div>
        </section>

        {/* Section 11: Contact Information */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">11. Contact Information</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-3">For legal inquiries:</p>
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
