import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Information - AÚRELYÑ',
  description: 'Contact information for AÚRELYÑ. Find our email address and physical address for any queries or support.',
};

export default function ContactInformationPage() {
  return (
    <div className="container mx-auto px-4 py-16 pt-32 max-w-4xl">
      <h1 className="font-serif text-4xl mb-8 text-center text-zinc-900">Contact Information</h1>

      <div className="prose prose-zinc max-w-none text-zinc-600 space-y-6">
        <p><strong>AÚRELYÑ</strong></p>

        <p>
          <strong>Email:</strong>{' '}
          <a href="mailto:support@aurelynbeauty.com" className="text-blue-600 hover:underline">
            support@aurelynbeauty.com
          </a>
        </p>

        <p>
          <strong>Physical address:</strong> Tijara Bus Depo, Near Old Water Tank, 301411 Tijara RJ, India
        </p>
      </div>
    </div>
  );
}
