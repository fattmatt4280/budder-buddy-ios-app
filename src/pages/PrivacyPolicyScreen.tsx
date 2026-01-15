import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Mail, Database, Eye, Trash2, UserX, FileText, Bot, MapPin, Server, Pencil, Globe } from 'lucide-react';
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
              <li>• Is not a medical device.</li>
              <li>• Is not a healthcare provider.</li>
              <li>• Does not provide medical advice.</li>
              <li>• Does not diagnose, treat, or prevent disease.</li>
            </ul>
          </div>
        </section>

        {/* Section 2: Information We Collect */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">2. Information We Collect</h2>
          
          <div className="space-y-4">
            {/* 2A */}
            <h3 className="font-medium text-foreground">A. Information You Provide</h3>
            
            <div className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-medium text-foreground mb-2">Account Information</h4>
              <p className="text-sm text-muted-foreground">
                Email address and encrypted authentication credentials (via Supabase Auth).
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-medium text-foreground mb-2">Tattoo Metadata</h4>
              <p className="text-sm text-muted-foreground">
                Tattoo date, body location, size, ink type, and artist/shop names.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-medium text-foreground mb-2">Photos</h4>
              <p className="text-sm text-muted-foreground">
                Images captured via our "Ghost Camera" or uploaded to your log. Photos are stored in secure cloud storage and are private to your account.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-medium text-foreground mb-2">AI Chat Queries</h4>
              <p className="text-sm text-muted-foreground">
                Text input provided to the "Healing Guide" AI assistant.
              </p>
            </div>

            {/* 2B */}
            <h3 className="font-medium text-foreground mt-6">B. Information Collected Automatically</h3>
            
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-start gap-3 mb-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">Location Data</h4>
                  <p className="text-sm text-muted-foreground">
                    With your permission, we collect approximate location data to provide Sun Guard UV Index alerts. This data is used momentarily to fetch local weather and is not stored on our servers.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <h4 className="font-medium text-foreground mb-2">Usage Data</h4>
              <p className="text-sm text-muted-foreground">
                Basic device information (OS version, device model) for troubleshooting.
              </p>
            </div>

            {/* 2C */}
            <h3 className="font-medium text-foreground mt-6">C. Third-Party Service Providers</h3>
            <p className="text-sm text-muted-foreground mb-3">
              To provide app functionality, we use the following secure sub-processors:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
                <Server className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">Supabase</h4>
                  <p className="text-sm text-muted-foreground">
                    For secure database hosting, authentication, and photo storage.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
                <Bot className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">Google Gemini (AI)</h4>
                  <p className="text-sm text-muted-foreground">
                    To power the "Healing Guide" chat. Queries are sent to Google's API for processing but are not used to train global AI models.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">Open-Meteo</h4>
                  <p className="text-sm text-muted-foreground">
                    To provide UV index data based on your coordinates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: How We Use Information */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">3. How We Use Information</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-2 font-medium">We use your information solely to:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 mb-4">
              <li>• Calculate and display your 30-day healing timeline.</li>
              <li>• Provide "Ghost Overlay" alignment for consistent photo logging.</li>
              <li>• Generate Sun Guard alerts based on your local UV index.</li>
              <li>• Provide AI-generated educational responses to aftercare questions.</li>
            </ul>
            <p className="text-sm text-foreground font-medium">
              We do not sell, rent, or trade your data with third-party advertisers.
            </p>
          </div>
        </section>

        {/* Section 4: Artificial Intelligence (AI) Disclosure */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">4. Artificial Intelligence (AI) Disclosure</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3 mb-4">
              <Bot className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                The "Healing Guide" feature uses generative AI.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-1">Non-Medical</h4>
                <p className="text-sm text-muted-foreground">
                  AI responses are for educational purposes only.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-1">Data Processing</h4>
                <p className="text-sm text-muted-foreground">
                  When you chat with the Healing Guide, your tattoo age and question are sent to the AI provider. No personally identifiable information (like your email or name) is attached to these queries.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Data Protection and Security */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">5. Data Protection and Security</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Encryption in Transit</h3>
                <p className="text-sm text-muted-foreground">All data is transmitted via TLS 1.3.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
              <Database className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Encryption at Rest</h3>
                <p className="text-sm text-muted-foreground">All photos and database entries are encrypted using AES-256.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Isolation</h3>
                <p className="text-sm text-muted-foreground">We use Row-Level Security (RLS) to ensure that only you can access your specific tattoo data and photos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Data Retention and Deletion */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">6. Data Retention and Deletion</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <ul className="text-sm text-muted-foreground space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-foreground">User Control:</strong> You can delete individual photos, tattoo logs, or your entire account directly within the app settings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-foreground">Permanent Deletion:</strong> Account deletion triggers a secure process that removes all associated data from our database and cloud storage buckets within 30 days.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 7: Your Rights */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">7. Your Rights</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Depending on your location (e.g., GDPR in Europe, CCPA in California), you have the right to:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
              <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Access</h3>
                <p className="text-sm text-muted-foreground">Request a copy of the data we hold.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
              <Pencil className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Correction</h3>
                <p className="text-sm text-muted-foreground">Update inaccurate information.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
              <Trash2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Deletion</h3>
                <p className="text-sm text-muted-foreground">Request the total removal of your data.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Inquiries</h3>
                <p className="text-sm text-muted-foreground">Submit requests to privacy@budderbuddy.app.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Children's Privacy */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">8. Children's Privacy</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <UserX className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Budder Buddy is not intended for children under 13. We do not knowingly collect information from children. Because tattoos are legally restricted to adults in most jurisdictions, we assume all users are of legal age.
              </p>
            </div>
          </div>
        </section>

        {/* Section 9: Medical Disclaimer */}
        <section className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">9. Medical Disclaimer</h2>
          <p className="text-sm text-foreground font-medium mb-2">ALWAYS CONSULT A PROFESSIONAL.</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Budder Buddy provides general tracking and educational information. If you experience excessive swelling, fever, or signs of infection, contact a licensed healthcare provider or your tattoo artist immediately.
          </p>
        </section>

        {/* Section 10: Contact Us */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">10. Contact Us</h2>
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <p className="text-sm text-muted-foreground font-medium">Blue Dream Budder</p>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary font-medium">privacy@budderbuddy.app</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary font-medium">www.budderbuddy.app</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
