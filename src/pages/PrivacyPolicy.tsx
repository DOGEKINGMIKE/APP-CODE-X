import React from 'react';
import { Code2, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <Code2 className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold">Code Studio X-11</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to IDE
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: February 25, 2026</p>
          </div>
        </div>

        <div className="prose-custom space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Code Studio X-11 ("we", "our", or "the App") by MEMEXCORP is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our AI-powered cloud IDE application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">Automatically Collected</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When you use the App, we may automatically collect device type, browser type, operating system, and general usage analytics to improve our service. We do not collect personally identifiable information automatically.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">User-Provided Content</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Code files, projects, notes, and other content you create within the App are stored locally in your browser session. If cloud storage features are enabled, your content may be stored on secure third-party servers.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">AI Interactions</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Prompts sent to the AI assistant are processed to generate code responses. We do not permanently store your AI conversation history on our servers.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                To provide, operate, and maintain the App
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                To improve and personalize your experience
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                To process AI code generation requests
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                To communicate updates and feature announcements
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                To monitor and analyze usage trends
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Storage and Security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your information. Project files are stored in your browser session and optionally in encrypted cloud storage. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Third-Party Services</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The App may integrate with third-party services including AI providers, cloud hosting, and analytics tools. Each third-party service has its own privacy policy governing the use of your information. We encourage you to review those policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Cookies and Local Storage</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The App uses browser local storage and session storage to persist your editor settings, theme preferences, and project files. This data remains on your device and is not transmitted to external servers unless you explicitly use cloud sync features.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Your Rights</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You have the right to access, correct, or delete your personal data at any time. Since most data is stored locally on your device, you can clear your browser data to remove all App-related information. For cloud-stored data, you can request deletion by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Children's Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The App is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. Your continued use of the App after any changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Contact Us</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have questions or concerns about this Privacy Policy, please reach out to us through the App's support channels or visit our website at memexcorp.com.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">Code Studio X-11 by MEMEXCORP. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-xs text-primary hover:underline">Terms of Service</Link>
            <Link to="/" className="text-xs text-primary hover:underline">Back to IDE</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
