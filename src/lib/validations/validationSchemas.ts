import { z } from 'zod';

export type FormErrors<T> = {
	[K in keyof T]?: string[];
} & {
	_errors?: string[];
};

export const phoneRegex = /^(?:\+254|254|0|01)?[17][0-9]{8,9}$/;

export const userSchema = z.object({
	name: z
		.string({
			required_error: 'Full name is required',
			invalid_type_error: 'Name must be a string'
		})
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name is too long'),

	email: z
		.string({
			required_error: 'Email is required',
			invalid_type_error: 'Invalid email format'
		})
		.min(1, 'Email is Required')
		.email('Please enter a valid email address'),

	idNumber: z
		.string({
			required_error: 'ID number is required'
		})
		.min(6, 'ID number must be at least 6 digits')
		.max(10, 'ID number cannot exceed 10 digits')
		.regex(/^\d+$/, 'ID number must contain only digits'),

	phoneNumber: z
		.string({
			required_error: 'Phone number is required'
		})
		.min(1, 'Phone number is required')
		.regex(phoneRegex, 'Please enter a valid phone number')
		.transform((val) => {
			if (val.startsWith('+254')) return val.slice(1);
			if (val.startsWith('0')) return '254' + val.slice(1);
			if (val.startsWith('01')) return '245' + val.slice(2);
			if (val.startsWith('7')) return '254' + val;
			if (val.startsWith('1')) return '254' + val;
			return val;
		}),

	password: z
		.string({
			required_error: 'Password is required'
		})
		.min(8, 'Password must be at least 8 characters')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Password must contain at least one uppercase letter, one lowercase letter, and one number'
		),

	confirmPassword: z.string({
		required_error: 'Please confirm your password'
	}),

	address: z
		.string({
			required_error: 'Address is required'
		})
		.min(5, 'Address must be at least 5 characters')
		.max(200, 'Address is too long'),

	postalCode: z
		.string({
			required_error: 'Postal code is required'
		})
		.min(5, 'Postal code must be at least 5 characters')
		.max(10, 'Postal code is too long'),

	'g-recaptcha-response': z
		.string({
			required_error: 'reCAPTCHA is required'
		})
		.min(1, 'reCAPTCHA is required')
});

// .refine((data) => data.password === data.confirmPassword, {
// 	message: 'Passwords do not match',
// 	path: ['confirmPassword']
// });

export const loginSchema = z.object({
	email: z
		.string({
			required_error: 'Email is required',
			invalid_type_error: 'Invalid email format'
		})
		.email('Please enter a valid email address')
		.transform((val) => val.toLowerCase()),

	password: z
		.string({
			required_error: 'Password is required'
		})
		.min(1, 'Password is required')
});

export const productSchema = z.object({
	name: z
		.string({
			required_error: 'Product name is required'
		})
		.min(2, 'Product name must be at least 2 characters')
		.max(100, 'Product name is too long'),

	description: z
		.string({
			required_error: 'Description is required'
		})
		.min(10, 'Description must be at least 10 characters'),

	price: z
		.number({
			required_error: 'Price is required',
			invalid_type_error: 'Price must be a number'
		})
		.positive('Price must be positive'),

	quantity: z
		.number({
			required_error: 'Quantity is required',
			invalid_type_error: 'Quantity must be a number'
		})
		.int('Quantity must be an integer')
		.nonnegative('Quantity cannot be negative'),

	author: z
		.string({
			required_error: 'Author name is required'
		})
		.min(2, 'Author name must be at least 2 characters'),

	citation: z
		.string()
		.optional()
		.or(z.literal('').transform(() => undefined)),

	isbn: z
		.string()
		.optional()
		.or(z.literal('').transform(() => undefined)),

	pageCount: z
		.number({
			required_error: 'Page count is required',
			invalid_type_error: 'Page count must be a number'
		})
		.int('Page count must be an integer')
		.positive('Page count must be positive'),

	publicationDate: z
		.number({
			required_error: 'Publication year is required',
			invalid_type_error: 'Publication year must be a number'
		})
		.int('Publication year must be a whole number')
		.min(1900, 'Publication year must be 1900 or later')
		.max(new Date().getFullYear() + 5, 'Publication year cannot be in the far future'),

	categoryIds: z
		.array(
			z.number({
				required_error: 'Category ID is required',
				invalid_type_error: 'Category ID must be a number'
			})
		)
		.min(1, 'At least one category is required')
});

export const subscriptionPlanSchema = z.object({
	name: z
		.string({
			required_error: 'Plan name is required',
			invalid_type_error: 'Plan name must be a string'
		})
		.min(2, 'Plan name must be at least 2 characters')
		.max(100, 'Plan name is too long'),

	description: z
		.string()
		.max(500, 'Description is too long')
		.optional()
		.nullable(),

	price: z
		.number({
			required_error: 'Price is required',
			invalid_type_error: 'Price must be a number'
		})
		.min(0, 'Price cannot be negative')
		.max(1000000, 'Price is too high'),

	duration: z
		.number({
			required_error: 'Duration is required',
			invalid_type_error: 'Duration must be a number'
		})
		.int('Duration must be a whole number')
		.min(1, 'Duration must be at least 1 day')
		.max(3650, 'Duration cannot exceed 10 years'),

	isActive: z.boolean().default(true)
});

export const legislationSchema = z.object({
	year: z
		.number({
			required_error: 'Year is required',
			invalid_type_error: 'Year must be a number'
		})
		.int('Year must be a whole number')
		.min(1900, 'Year must be 1900 or later')
		.max(new Date().getFullYear() + 5, 'Year cannot be in the far future'),

	type: z.enum(['ACT', 'SUBLEG', 'CORRIGENDA'], {
		required_error: 'Legislation type is required'
	}),

	number: z
		.string()
		.max(50, 'Number is too long')
		.optional()
		.nullable(),

	title: z
		.string()
		.max(500, 'Title is too long')
		.optional()
		.nullable(),

	dateGazetted: z
		.date({
			invalid_type_error: 'Invalid date format'
		})
		.optional()
		.nullable(),

	gazetteDetails: z
		.string()
		.max(200, 'Gazette details are too long')
		.optional()
		.nullable(),

	availabilityAt: z
		.date({
			invalid_type_error: 'Invalid date format'
		})
		.optional()
		.nullable(),

	uploadedAt: z
		.date({
			invalid_type_error: 'Invalid date format'
		})
		.optional()
		.nullable(),

	kgsPublicationAt: z
		.date({
			invalid_type_error: 'Invalid date format'
		})
		.optional()
		.nullable(),

	commencementAt: z
		.date({
			invalid_type_error: 'Invalid date format'
		})
		.optional()
		.nullable(),

	pagination: z
		.string()
		.max(50, 'Pagination is too long')
		.optional()
		.nullable(),

	statusOnDatabase: z
		.string()
		.max(100, 'Status is too long')
		.optional()
		.nullable(),

	legislativeUpdates: z
		.string()
		.max(1000, 'Legislative updates are too long')
		.optional()
		.nullable(),

	comments: z
		.string()
		.max(1000, 'Comments are too long')
		.optional()
		.nullable(),

	kenyaGazetteSuppNo: z
		.string()
		.max(50, 'Kenya Gazette Supplement Number is too long')
		.optional()
		.nullable(),

	revocationsAmendments: z
		.string()
		.max(1000, 'Revocations/Amendments are too long')
		.optional()
		.nullable(),

	assentAt: z
		.date({
			invalid_type_error: 'Invalid date format'
		})
		.optional()
		.nullable(),

	dateAvailedAt: z
		.date({
			invalid_type_error: 'Invalid date format'
		})
		.optional()
		.nullable(),

	availability: z
		.string()
		.max(100, 'Availability is too long')
		.optional()
		.nullable()
});

export type LoginCredentials = z.infer<typeof loginSchema>;
export type UserRegistration = z.infer<typeof userSchema>;
export type ProductData = z.infer<typeof productSchema>;
export type SubscriptionPlanData = z.infer<typeof subscriptionPlanSchema>;
export type LegislationData = z.infer<typeof legislationSchema>;

// Promotion schema
// Reason: Keep a separate core object so UI can access .shape without losing type due to refine returning ZodEffects.
export const promotionCoreSchema = z.object({
	name: z
		.string({ required_error: 'Name is required' })
		.min(2, 'Name must be at least 2 characters')
		.max(120, 'Name too long'),
	description: z
		.string()
		.max(1000, 'Description too long')
		.optional()
		.or(z.literal('').transform(() => undefined)),
	discountType: z.enum(['PERCENT', 'AMOUNT'], { required_error: 'Discount type is required' }),
	discountValue: z
		.number({ required_error: 'Discount value is required', invalid_type_error: 'Discount value must be a number' })
		.positive('Discount must be positive')
		.max(1000000, 'Discount value too large'),
	code: z
		.string()
		.min(3, 'Code must be at least 3 chars')
		.max(30, 'Code too long')
		.regex(/^[A-Z0-9_-]+$/, 'Only A-Z, 0-9, underscore, dash allowed')
		.optional()
		.or(z.literal('').transform(() => undefined)),
	startsAt: z.date({ required_error: 'Start date is required' }),
	endsAt: z.date({ required_error: 'End date is required' }),
	isActive: z.boolean().default(true),
	priority: z
		.number({ required_error: 'Priority is required', invalid_type_error: 'Priority must be a number' })
		.int('Priority must be an integer')
		.min(0, 'Priority must be >= 0')
		.max(10000, 'Priority too large')
		.default(100),
	productIds: z.array(z.number().int().positive()).optional().default([]),
	categoryIds: z.array(z.number().int().positive()).optional().default([])
});

export const promotionSchema = promotionCoreSchema
	.refine((d) => d.productIds.length + d.categoryIds.length > 0, {
		message: 'Select at least one product or category',
		path: ['productIds']
	})
	.refine((d) => d.discountType === 'AMOUNT' || (d.discountType === 'PERCENT' && d.discountValue <= 100), {
		message: 'Percent discount cannot exceed 100',
		path: ['discountValue']
	})
	.refine((d) => d.endsAt > d.startsAt, {
		message: 'End date must be after start date',
		path: ['endsAt']
	});

export type PromotionData = z.infer<typeof promotionCoreSchema>;
