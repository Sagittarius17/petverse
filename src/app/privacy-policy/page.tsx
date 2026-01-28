
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | PetVerse',
  description: 'Learn about how PetVerse collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="prose dark:prose-invert max-w-none">
        <h1>Privacy Policy</h1>
        <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>

        <h2>1. Introduction</h2>
        <p>Welcome to PetVerse. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>

        <h2>2. Information We Collect</h2>
        <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
        <ul>
          <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards.</li>
          <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
        </ul>

        <h2>3. Use of Your Information</h2>
        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
        <ul>
            <li>Create and manage your account.</li>
            <li>Email you regarding your account or order.</li>
            <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
            <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
        </ul>

        <h2>4. Disclosure of Your Information</h2>
        <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
        <ul>
          <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
          <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
        </ul>
        
        <h2>5. Security of Your Information</h2>
        <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

        <h2>6. Contact Us</h2>
        <p>If you have questions or comments about this Privacy Policy, please contact us at <a href="mailto:privacy@petverse.com">privacy@petverse.com</a>.</p>
      </div>
    </div>
  );
}
