import React from 'react';
import { Code2, ArrowLeft, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
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
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: February 25, 2026</p>
          </div>
        </div>

        <div className="prose-custom space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing or using Code Studio X-11 ("the App") developed by MEMEXCORP, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Code Studio X-11 is an AI-powered cloud IDE (Integrated Development Environment) that enables users to write, preview, and build web applications directly in the browser. The App includes features such as code editing, live preview, AI-assisted code generation, file management, terminal emulation, and project export capabilities.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. User Responsibilities</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                You are responsible for all content you create, upload, or share using the App
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                You agree not to use the App for any unlawful or prohibited activities
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                You are responsible for maintaining the security of your projects and exported code
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                You must not attempt to reverse engineer, decompile, or tamper with the App
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                You must not use the App to create malware, phishing pages, or other harmful software
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Intellectual Property</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All code, designs, and content you create using the App belong to you. The App itself, including its interface, branding, source code, AI models, and underlying technology, is the intellectual property of MEMEXCORP and is protected by applicable copyright and trademark laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. AI-Generated Content</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The App provides AI-assisted code generation features. While we strive for accuracy, AI-generated code is provided "as is" without warranties of correctness, completeness, or fitness for any particular purpose. You are responsible for reviewing, testing, and validating all AI-generated code before using it in production.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Service Availability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We strive to maintain continuous availability of the App, but we do not guarantee uninterrupted access. The App may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We are not liable for any loss resulting from service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, MEMEXCORP shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the App, including but not limited to loss of data, revenue, or profits. Our total liability for any claim arising from the use of the App shall not exceed the amount you have paid for the App, if any.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Data and Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your use of the App is also governed by our Privacy Policy. By using the App, you consent to the collection and use of information as described in our Privacy Policy. We recommend reviewing our Privacy Policy to understand how your data is handled.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Prohibited Uses</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              You may not use the App to:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                Generate or distribute malicious code, viruses, or harmful software
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                Violate any applicable laws, regulations, or third-party rights
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                Attempt unauthorized access to our systems or other users' data
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                Abuse the AI features for generating harmful, deceptive, or illegal content
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Modifications to Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective upon posting the updated terms in the App. Your continued use of the App following any modifications constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Termination</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may suspend or terminate your access to the App at our discretion if you violate these Terms of Service or engage in activity that harms the App or other users. Upon termination, your right to use the App ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Governing Law</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising under these terms shall be resolved in a court of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">13. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have questions about these Terms of Service, please contact us through the App's support channels or visit our website at memexcorp.com.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">Code Studio X-11 by MEMEXCORP. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-primary hover:underline">Privacy Policy</Link>
            <Link to="/" className="text-xs text-primary hover:underline">Back to IDE</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
