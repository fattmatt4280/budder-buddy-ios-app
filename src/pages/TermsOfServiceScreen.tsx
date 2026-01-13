import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, AlertTriangle } from 'lucide-react';
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
        <p className="text-sm text-muted-foreground">Last updated: January 2025</p>

        {/* Important Notice */}
        <section className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-foreground mb-2">Not Medical Advice</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Budder Buddy is an educational wellness app designed to help you track your tattoo aftercare routine. 
                This app does not provide medical advice, diagnosis, or treatment. Always seek the advice of your 
                tattoo artist or qualified healthcare provider with any questions you may have regarding your healing tattoo.
              </p>
            </div>
          </div>
        </section>

        {/* Acceptance */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By accessing or using Budder Buddy, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the app.
          </p>
        </section>

        {/* Description of Service */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Budder Buddy provides:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>Tattoo aftercare tracking and reminders</li>
            <li>Photo logging to document healing progress</li>
            <li>Educational content about tattoo healing</li>
            <li>Personalized aftercare guidance based on your tattoo details</li>
          </ul>
        </section>

        {/* Health Data Consent */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">3. Health Information Consent</h2>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              By using Budder Buddy, you consent to the collection and storage of health-related information 
              including photos of your tattoo, healing progress notes, and aftercare tracking data. 
              This information is used solely to provide you with personalized aftercare guidance and 
              is protected according to our Privacy Policy.
            </p>
          </div>
        </section>

        {/* User Responsibilities */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">4. User Responsibilities</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            You agree to:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>Provide accurate information about your tattoos</li>
            <li>Keep your account credentials secure</li>
            <li>Not use the app for any unlawful purpose</li>
            <li>Not attempt to access other users' data</li>
            <li>Seek professional medical advice for health concerns</li>
          </ul>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">5. Limitation of Liability</h2>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Budder Buddy is provided "as is" without warranties of any kind. We are not liable for any 
              health complications, infections, or adverse outcomes related to your tattoo healing. 
              The app is a tracking and educational tool only—it is not a substitute for professional 
              tattoo aftercare advice or medical treatment.
            </p>
          </div>
        </section>

        {/* Data Privacy */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Privacy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your use of Budder Buddy is also governed by our Privacy Policy, which describes how we 
            collect, use, and protect your personal and health-related information. By using the app, 
            you consent to the practices described in our Privacy Policy.
          </p>
        </section>

        {/* Intellectual Property */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">7. Intellectual Property</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All content, features, and functionality of Budder Buddy are owned by us and are protected 
            by copyright, trademark, and other intellectual property laws. You retain ownership of 
            photos and content you create within the app.
          </p>
        </section>

        {/* Termination */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">8. Termination</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You may stop using Budder Buddy at any time. We reserve the right to suspend or terminate 
            your access if you violate these terms. Upon termination, your right to use the app 
            ceases immediately.
          </p>
        </section>

        {/* Changes to Terms */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">9. Changes to Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may update these Terms of Service from time to time. We will notify you of any 
            material changes by posting the new terms in the app. Your continued use of the app 
            after such changes constitutes acceptance of the new terms.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">10. Contact</h2>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">
              Questions about these terms? Contact us at: <span className="text-primary">legal@budderbuddy.app</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
