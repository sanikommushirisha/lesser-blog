import { useEffect } from "react";
import SharedNavbar from "@/components/shared-navbar";

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SharedNavbar variant="individual" sourcePage="/privacy" />

      <div className="min-h-screen bg-white pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-10">Last updated: March 16, 2026</p>

          <div className="prose prose-gray max-w-none space-y-6 text-foreground/80 leading-relaxed">
            <p>
              Lesser Inc. ("Lesser.tax," "we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Lesser.tax. This Policy applies to our website (www.lesser.tax) (the "Site") and our online services (collectively, the "Service").
            </p>
            <p>
              By accessing or using our Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy and our Terms of Service.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">1. What Information Do We Collect and For What Purpose?</h2>
            <p>We collect the following categories of information for the purposes described below:</p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Information you provide to us directly</h3>
            <p>
              We may collect personal information about you, your spouse, your dependents, or your business when you use our services. Personal information includes data that can identify a person individually. The types of information we may collect include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact Information (e.g., name, phone number, address, and email address)</li>
              <li>Social Security Number and other government identification numbers (e.g., EIN, Driver's License Number, ITIN)</li>
              <li>Date of Birth</li>
              <li>Financial Information (e.g., income, revenue, assets, credits, deductions, expenses, and bank account information)</li>
              <li>Payment Data (e.g., checking, debit and credit card account numbers, balances, and payment history)</li>
              <li>Health Information (e.g., health insurance status and financial information related to payment for healthcare services)</li>
              <li>Geo-location Information (approximate)</li>
              <li>Website and Email Usage Data (e.g., interactions with our website or emails)</li>
              <li>Device Information (e.g., IP address, device type, unique identifier, browser version, operating system, and network data)</li>
              <li>Login Information</li>
              <li>Demographic Information</li>
              <li>Professional or employment-related information</li>
              <li>Education information</li>
            </ul>
            <p>We may also collect any communications between you and Lesser.tax and any other information you provide to us.</p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Information we receive from third-party services</h3>
            <p>
              We may receive information about you from third parties and combine it with the information we collect directly. For example, when you connect or log in through a third-party service (such as Google), that service may share certain information like your name and email address. Similarly, if you interact with Lesser.tax through social media (e.g., LinkedIn, Twitter, or Instagram), we may receive limited profile information, depending on your privacy settings.
            </p>
            <p>You should always review and adjust your privacy settings on any third-party site before linking it to our Service.</p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Location information</h3>
            <p>
              We may approximate your location based on your IP address to help provide relevant content or optimize our Service. We do not use GPS or other location-tracking tools.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Information we receive from partners</h3>
            <p>
              From time to time, we may receive information from partners and public sources (e.g., Plaid or other financial data aggregators). This helps us verify and improve our services.
            </p>
            <p>
              We use this information to operate, maintain, and improve our Service, to communicate with you, and to provide updates, notifications, and relevant tax-related information.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">2. How We Use Cookies and Other Tracking Technology</h2>
            <p>
              Like most websites, we and our service providers automatically collect certain information about your interactions with the Service through cookies, web beacons, and similar technologies ("tracking technologies"). We use tracking technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Remember your preferences and improve your experience</li>
              <li>Measure traffic and usage trends</li>
              <li>Personalize content and communications</li>
              <li>Improve the security and performance of the Service</li>
            </ul>
            <p>
              You can modify your browser settings to refuse cookies or alert you when cookies are sent. Note that disabling cookies may affect your ability to use certain parts of the Service.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">3. Sharing of Your Information</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Communications with the IRS and State Taxing Authorities:</strong> Certain information (e.g., your name, Social Security number, IP address, and bank account details) may be shared as required to prepare or electronically file your tax return.</li>
              <li><strong>At your request:</strong> We may share information with third parties when you ask us to do so.</li>
              <li><strong>Third-party service providers:</strong> We may share data with trusted vendors who perform services on our behalf (e.g., web hosting, payment processing, analytics, and professional tax support).</li>
              <li><strong>Legal requirements:</strong> We may share information to comply with law, legal processes, subpoenas, or government requests, or to protect the rights, property, and safety of Lesser.tax, our users, or others.</li>
              <li><strong>Business transfers:</strong> If Lesser Inc. is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
            </ul>
            <p>We may also share aggregated or de-identified data that cannot reasonably be used to identify you.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">4. Control Over Your Information</h2>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Profile and communication settings</h3>
            <p>You can update your profile information or adjust data-sharing preferences by contacting us at <a href="mailto:use@lesser.tax" className="text-primary hover:underline">use@lesser.tax</a>.</p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Access to device information</h3>
            <p>You may control access to certain device permissions (such as location or notifications) through your browser or device settings.</p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Communication preferences</h3>
            <p>You may unsubscribe from promotional emails by clicking "unsubscribe" in our emails. You cannot opt out of essential communications related to your account (e.g., tax filings or system alerts).</p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Modifying or deleting information</h3>
            <p>If you wish to review, modify, or delete your personal information, contact us at <a href="mailto:use@lesser.tax" className="text-primary hover:underline">use@lesser.tax</a>. Please note that certain data may need to be retained to comply with legal or regulatory obligations.</p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">5. Third-Party Tracking and Online Advertising</h2>
            <p>
              We may use third-party analytics and advertising tools (e.g., Google Analytics) to understand usage patterns and improve our Service. These providers may use cookies or identifiers to show you relevant ads or measure campaign effectiveness.
            </p>
            <p>You can learn more about how to control personalized ads by visiting industry opt-out pages such as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><a href="https://www.networkadvertising.org/choices" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Network Advertising Initiative</a></li>
              <li><a href="https://www.aboutads.info/choices" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance</a></li>
            </ul>
            <p>You may also adjust ad settings on your mobile device by enabling "Limit Ad Tracking" (iOS) or "Opt out of interest-based ads" (Android).</p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">6. How We Store and Protect Your Information</h2>
            <p>
              Your data may be stored and processed in the United States. We maintain administrative, technical, and physical safeguards to protect your information from unauthorized access, loss, misuse, or alteration.
            </p>
            <p>
              However, no system is completely secure. If we discover a data breach, we will take reasonable steps to investigate and notify affected users as required by law.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">7. Links to Other Websites</h2>
            <p>
              Our Service may include links to third-party websites or services. We are not responsible for the privacy practices or content of those websites. We encourage you to read their privacy policies before providing any personal information.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">8. How to Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or how we handle your information, please contact us at:</p>
            <p>Email: <a href="mailto:use@lesser.tax" className="text-primary hover:underline">use@lesser.tax</a></p>
            <p>Mailing Address: Lesser Inc., 353 King St, San Francisco, CA 94158, USA</p>

            <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any material changes will be noted with a revised "last modified" date below. Continued use of our Services after changes means you accept the revised policy.
            </p>
            <p className="text-muted-foreground">Last modified on March 16, 2026.</p>
          </div>
        </div>
      </div>
    </>
  );
}
