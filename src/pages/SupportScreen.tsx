import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Clock, HelpCircle, Bell, Camera, Trash2, Settings, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SupportScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Support</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8 pb-24">
        {/* Introduction */}
        <section className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Need help with Budder Buddy? We're here to assist you. Browse our frequently asked questions 
            below or reach out to our support team directly.
          </p>
        </section>

        {/* Contact Methods */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Contact Us</h2>
          <div className="space-y-3">
            <a 
              href="mailto:support@budderbuddy.app" 
              className="flex items-start gap-3 bg-card rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
            >
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Email Support</h3>
                <p className="text-sm text-primary font-medium">support@budderbuddy.app</p>
              </div>
            </a>
            
            <div className="flex items-start gap-3 bg-card rounded-lg border border-border p-4">
              <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Response Time</h3>
                <p className="text-sm text-muted-foreground">We typically respond within 48 hours.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground mb-1">How do I reset my reminders?</h3>
                  <p className="text-sm text-muted-foreground">
                    Go to Settings and navigate to the Notifications section. From there, you can adjust 
                    reminder times or disable notifications entirely.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <Camera className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground mb-1">My photos aren't syncing. What should I do?</h3>
                  <p className="text-sm text-muted-foreground">
                    Ensure you're signed in and have a stable internet connection. Try signing out and 
                    back in from Settings. If the issue persists, contact us at support@budderbuddy.app.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground mb-1">How do I delete my account?</h3>
                  <p className="text-sm text-muted-foreground">
                    Navigate to Settings and scroll to the bottom to find the "Delete Account" option. 
                    This will permanently remove all your data within 30 days.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground mb-1">How do I add a new tattoo?</h3>
                  <p className="text-sm text-muted-foreground">
                    From the main screen, tap on "Ink Vault" or navigate to the vault section. 
                    Use the "Add Tattoo" button to enter details about your new tattoo.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground mb-1">Is Budder Buddy a medical app?</h3>
                  <p className="text-sm text-muted-foreground">
                    No. Budder Buddy is for educational purposes only and does not provide medical advice. 
                    If you have concerns about your tattoo's healing, consult your tattoo artist or a medical professional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Links */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Legal</h2>
          <div className="space-y-3">
            <Link 
              to="/privacy" 
              className="flex items-start gap-3 bg-card rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
            >
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Privacy Policy</h3>
                <p className="text-sm text-muted-foreground">Learn how we protect your data.</p>
              </div>
            </Link>
            
            <Link 
              to="/terms" 
              className="flex items-start gap-3 bg-card rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
            >
              <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Terms of Service</h3>
                <p className="text-sm text-muted-foreground">Review our terms and conditions.</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Disclaimer:</strong> Budder Buddy is for educational purposes only 
            and is not a substitute for professional medical advice. If you experience excessive swelling, fever, 
            or signs of infection, contact a licensed healthcare provider or your tattoo artist immediately.
          </p>
        </section>
      </div>
    </div>
  );
}
