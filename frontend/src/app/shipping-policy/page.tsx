import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy - AÚRELYÑ',
  description: 'Shipping Policy for AÚRELYÑ. Learn about our order processing times, delivery timelines, shipping charges, and tracking information.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 pt-32 max-w-4xl">
      <h1 className="font-serif text-4xl mb-8 text-center text-zinc-900">Shipping Policy</h1>

      <div className="prose prose-zinc max-w-none text-zinc-600 space-y-6">
        <p>
          Thank you for shopping with <strong>AURELYÑ Beauty</strong>. We aim to deliver your products safely and on time.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">Order Processing Time</h2>
        <p>
          All orders are processed within <strong>24–48 hours</strong> (business days) after confirmation. Orders placed on Sundays or public holidays will be processed on the next working day.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">Delivery Timeline</h2>
        <p>Once shipped, orders are usually delivered within:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Metros &amp; major cities:</strong> 3–5 business days</li>
          <li><strong>Other locations / remote areas:</strong> 5–7 business days</li>
        </ul>
        <p>
          Delivery time may vary due to courier delays, weather conditions, or operational constraints.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">Shipping Charges</h2>
        <p>
          Shipping charges (if applicable) will be displayed at checkout before completing the order.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">Order Tracking</h2>
        <p>
          Once your order is dispatched, you will receive a <strong>tracking link via email / SMS</strong> to monitor the delivery status.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">Incorrect Address or Failed Delivery</h2>
        <p>
          Please ensure your delivery address and phone number are correct while placing the order.<br />
          Orders not delivered due to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Incorrect address</li>
          <li>Unreachable contact number</li>
          <li>Customer unavailability</li>
        </ul>
        <p>
          may be cancelled or reshipped with additional shipping charges.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">Damaged / Leaked / Wrong Product Received</h2>
        <p>
          If your order is delivered <strong>damaged, leaked, or incorrect</strong>, please contact us within <strong>24–48 hours of delivery</strong> with pictures/video proof. Our team will review the case and assist with a suitable resolution.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">International Shipping</h2>
        <p>
          Currently, we <strong>do not offer international shipping</strong>.
        </p>

        <h2 className="text-2xl font-semibold text-zinc-800 mt-8 mb-4">Support &amp; Queries</h2>
        <p>
          For any shipping or delivery-related questions, please contact us at:<br />
          👉 <strong><a href="mailto:support@aurelynbeauty.com" className="text-blue-600 hover:underline">support@aurelynbeauty.com</a></strong>
        </p>

        <p>
          We appreciate your trust in <strong>AURELYÑ Beauty</strong> and thank you for choosing us 🤍
        </p>
      </div>
    </div>
  );
}
