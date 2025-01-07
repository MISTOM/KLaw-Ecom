import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request }) => {
	// Update the order status if the payment is successful
	// TODO: verify the secure hash

	const data = await request.json();
	console.log('Notification data', data);

	// Update the order status
	if (data.status === 'settled' && data.client_invoice_ref) {
		const order = await prisma.order.update({
			where: { billRefNumber: data.client_invoice_ref },
			data: { status: 'COMPLETED', invoiceNumber: data.invoice_number }
		});

		return json({ message: 'Order status updated', order });
	} else {
		console.error(`Order status not updated:: billRefNumber: ${data.client_invoice_ref}`);
		return json({ message: 'Order status not updated' });
	}
};

/**
	 * Sample data from the notification url
	 *  {
  status: 'settled',
  secure_hash: 'Mjc2NzZlMGVmA==',
  phone_number: '0718566741',
  payment_reference: [
	{
	  payment_reference: 'TA677AKMYJ',
	  payment_date: '2025-01-06T13:35:15Z',
	  inserted_at: '2025-01-06T13:35:15',
	  currency: 'KES',
	  amount: '1.00'
	}
  ],
  payment_date: '2025-01-06 16:35:15+03:00 EAT Africa/Nairobi',
  payment_channel: 'MPesa',
  last_payment_amount: '1.00',
  invoice_number: 'GKVLDP',
  invoice_amount: '1.00',
  currency: 'KES',
  client_invoice_ref: 'ORDER-1736170468163',
  amount_paid: '1'
}
	 */
