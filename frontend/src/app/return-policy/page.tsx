import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return & Refund Policy - AÚRELYÑ',
  description: 'Return and Refund Policy for AÚRELYÑ. Learn about our return, refund, and exchange policies for skincare and personal care products.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 pt-32 max-w-4xl">
      <h1 className="font-serif text-4xl mb-8 text-center text-zinc-900">Return &amp; Refund Policy</h1>
      
      <div className="prose prose-zinc max-w-none text-zinc-600 space-y-6">
        <p>
          Thank you for shopping with <strong>AÙRELYÑ Bêaùty</strong>. We truly value your trust in our skincare products.
        </p>

        <p>
          Please note that due to the <strong>hygiene and safety nature of skincare and personal care products</strong>, all items are <strong>non-returnable and non-refundable</strong> once they are delivered. This policy helps us ensure product safety, quality standards, and customer protection.
        </p>

        <p>
          We recommend checking product descriptions and ingredient details carefully before placing an order. If you have any doubts or questions prior to purchase, our team will be happy to assist you.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">Damages, Wrong Product or Quality Concerns</h2>
        <p>
          If your order is <strong>damaged, leaked, defective, or incorrect</strong>, please contact us within 24–48 hours of delivery. Our team will review the issue and assist you with a suitable resolution.
        </p>

        <p>
          For any support or product-related queries, please reach us at:<br />
          👉 <strong><a href="mailto:support@aurelynbeauty.com" className="text-blue-600 hover:underline">support@aurelynbeauty.com</a></strong>
        </p>

        <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">Important Note</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Returns, exchanges, or refunds are <strong>not applicable</strong> on skincare and personal care items.
          </li>
          <li>
            Opened, used, or tampered products cannot be accepted under any circumstances.
          </li>
          <li>
            Sale items, combos, and promotional products are also non-returnable.
          </li>
        </ul>

        <p>
          We appreciate your understanding and support in maintaining product hygiene and safety standards.
        </p>
      </div>
    </div>
  );
}
