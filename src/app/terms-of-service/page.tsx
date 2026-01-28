
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | PetVerse',
  description: 'Read the terms of service for using the PetVerse website and services.',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="prose dark:prose-invert max-w-none">
        <h1>Terms of Service</h1>
        <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>

        <h2>1. Agreement to Terms</h2>
        <p>By using our website, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

        <h2>2. User Accounts</h2>
        <p>You may be required to create an account to access some of our features. You are responsible for safeguarding your account and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>

        <h2>3. User Conduct</h2>
        <p>You agree not to use the service for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the Service in any way that could damage the Service, the services of any third party, or the general business of PetVerse.</p>
        <ul>
            <li>You further agree not to use the Service to harass, abuse, or threaten others or otherwise violate any person's legal rights.</li>
            <li>You further agree not to violate any intellectual property rights of the Company or any third party.</li>
        </ul>

        <h2>4. Pet Listings and Adoption</h2>
        <p>PetVerse provides a platform for users to list pets for adoption. We are not a party to any adoption agreements. We do not guarantee the health, temperament, or any other aspect of the pets listed. It is the responsibility of the potential adopter and the current owner to conduct due diligence.</p>

        <h2>5. Termination</h2>
        <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>
        
        <h2>6. Limitation of Liability</h2>
        <p>In no event shall PetVerse, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

        <h2>7. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@petverse.com">support@petverse.com</a>.</p>
      </div>
    </div>
  );
}
