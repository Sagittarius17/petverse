'use client';
import { FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TermsOfServicePage() {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
      setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-12">
            <div className="inline-block bg-primary/10 p-4 rounded-full">
                <FileText className="h-10 w-10 text-primary" />
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold font-headline tracking-tight">Terms of Service</h1>
            <p className="mt-2 text-md text-muted-foreground">
                Last updated: {lastUpdated}
            </p>
        </div>
      <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold font-headline mb-3">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">By using our website, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
        </div>

        <div>
            <h2 className="text-2xl font-bold font-headline mb-3">2. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">You may be required to create an account to access some of our features. You are responsible for safeguarding your account and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
        </div>

        <div>
            <h2 className="text-2xl font-bold font-headline mb-3">3. User Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You agree not to use the service for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the Service in any way that could damage the Service, the services of any third party, or the general business of PetVerse.</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                <li>You further agree not to use the Service to harass, abuse, or threaten others or otherwise violate any person's legal rights.</li>
                <li>You further agree not to violate any intellectual property rights of the Company or any third party.</li>
            </ul>
        </div>

        <div>
            <h2 className="text-2xl font-bold font-headline mb-3">4. Pet Listings and Adoption</h2>
            <p className="text-muted-foreground leading-relaxed">PetVerse provides a platform for users to list pets for adoption. We are not a party to any adoption agreements. We do not guarantee the health, temperament, or any other aspect of the pets listed. It is the responsibility of the potential adopter and the current owner to conduct due diligence.</p>
        </div>

        <div>
            <h2 className="text-2xl font-bold font-headline mb-3">5. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>
        </div>
        
        <div>
            <h2 className="text-2xl font-bold font-headline mb-3">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">In no event shall PetVerse, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
        </div>

        <div>
            <h2 className="text-2xl font-bold font-headline mb-3">7. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">If you have any questions about these Terms, please contact us at <a href="mailto:support@petverse.com" className="text-primary hover:underline">support@petverse.com</a>.</p>
        </div>
      </div>
    </div>
  );
}
