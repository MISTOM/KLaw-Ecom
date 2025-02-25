import { z } from 'zod';
import { error } from '@sveltejs/kit';
import crypto from 'crypto';
import { KEY } from '$env/static/private';

const paymentCallbackSchema = z.object({
	status: z.enum(['settled', 'failed', 'pending']),
	secure_hash: z.string(),
	phone_number: z.string().optional(),
	payment_reference: z
		.array(
			z.object({
				payment_reference: z.string(),
				payment_date: z.string(),
				inserted_at: z.string(),
				currency: z.enum(['KES']),
				amount: z.string().transform(Number)
			})
		)
		.optional(),
	payment_date: z.string(), // or z.string().datetime() if strictly ISO
	payment_channel: z.string(),
	last_payment_amount: z.string().transform(Number).optional(),
	invoice_number: z.string(),
	invoice_amount: z.string().transform(Number).optional(),
	currency: z.enum(['KES']),
	client_invoice_ref: z.string(),
	amount_paid: z.string().transform(Number)
});

export class PaymentValidator {
	static validateCallback(payload: any) {
		// const result = paymentCallbackSchema.safeParse(payload);
		// if (!result.success) {
		//     console.log(result.error.flatten())
		//     throw error(400, 'Invalid payment callback payload');
		// }
		return payload;
	}

	static verifySignature(payload: unknown, signature: string): boolean {
		const computedSignature = crypto.createHmac('sha256', KEY).update(JSON.stringify(payload)).digest('base64');

		return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
	}
}
