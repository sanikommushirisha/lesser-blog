import { useEffect } from "react";
import SharedNavbar from "@/components/shared-navbar";

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SharedNavbar variant="individual" sourcePage="/terms" />

      <div className="min-h-screen bg-white pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-foreground mb-2">Terms of Use</h1>
          <p className="text-muted-foreground mb-10">Effective Date: March 16, 2026</p>

          <div className="prose prose-gray max-w-none space-y-6 text-foreground/80 leading-relaxed">
            <p>
              These Terms of Use ("Terms") govern your access to and use of our website, tools, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use the Services.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">1. About Us</h2>
            <p>
              Lesser.tax is operated by Lesser Inc. ("Lesser.tax," "we," "our," or "us"). We provide tax planning, tax filing, and related financial advisory services for individuals and businesses.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">2. Eligibility</h2>
            <p>You must be at least 18 years old and legally able to enter into contracts to use our Services.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">3. Services We Provide</h2>
            <p>
              We offer tax planning, tax preparation, and related advisory services as defined in the scope of work agreed upon in separate engagement letters. Nothing in these Terms guarantees the provision of services without a signed engagement agreement.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">4. User Responsibilities</h2>
            <p>When using our Services, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, complete, and up-to-date information.</li>
              <li>Keep your account credentials secure and confidential.</li>
              <li>Use the Services only for lawful purposes.</li>
              <li>Not upload, submit, or transmit any false, misleading, or illegal information.</li>
            </ul>
            <p>We reserve the right to suspend or terminate access if these obligations are violated.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">5. Confidentiality and Privacy</h2>
            <p>We respect your privacy. Please review our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> to understand how we collect, use, and protect your personal information.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">6. Intellectual Property</h2>
            <p>
              All content on the Services — including the Lesser.tax name, logo, website design, software, and materials — is owned by or licensed to Lesser Inc. and protected under applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from our content without prior written consent.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">7. No Professional Relationship Without Engagement</h2>
            <p>
              Using our website or interacting with our Services does not create a client relationship unless and until you sign a formal engagement letter with Lesser.tax. Information provided on our site is for educational and informational purposes only and should not be considered tax, legal, or financial advice.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">8. Service Modifications</h2>
            <p>
              We may modify, suspend, or discontinue any aspect of the Services at any time, with or without notice. We are not liable for any such modification, suspension, or discontinuation.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Lesser Inc., its officers, employees, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising out of your use or inability to use the Services — even if we have been advised of the possibility of such damages. Your sole remedy for dissatisfaction with the Services is to stop using them.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Lesser Inc. and its affiliates from any claims, liabilities, damages, losses, or expenses (including reasonable attorneys' fees) arising from your use of the Services or violation of these Terms.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">11. Termination</h2>
            <p>
              We may suspend or terminate your access to the Services at any time, for any reason, with or without notice. Upon termination, all provisions of these Terms that should reasonably survive (such as ownership, indemnification, and limitations of liability) will remain in effect.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">12. Governing Law</h2>
            <p>These Terms are governed by the laws of the State of California, without regard to its conflict of law principles.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">13. Dispute Resolution</h2>
            <p>
              Any dispute arising out of or relating to these Terms shall be resolved by binding arbitration in San Francisco, California, except where prohibited by law. You and Lesser.tax waive the right to a jury trial or class action.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">14. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. If material changes occur, we will update the "Effective Date" above or notify you through other reasonable means. Your continued use of the Services after any update constitutes acceptance of the revised Terms.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">15. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p>Lesser Inc.</p>
            <p>353 King St, San Francisco, CA 94158, USA</p>
            <p>Email: <a href="mailto:use@lesser.tax" className="text-primary hover:underline">use@lesser.tax</a></p>
          </div>
        </div>
      </div>
    </>
  );
}
