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

	pageCount: z
		.number({
			required_error: 'Page count is required',
			invalid_type_error: 'Page count must be a number'
		})
		.int('Page count must be an integer')
		.positive('Page count must be positive'),

	publicationDate: z
		.string({
			required_error: 'Publication date is required'
		})
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),

	categoryIds: z
		.array(
			z.number({
				required_error: 'Category ID is required',
				invalid_type_error: 'Category ID must be a number'
			})
		)
		.min(1, 'At least one category is required')

	// serviceCode: z
	// 	.string({
	// 		required_error: 'Service code is required'
	// 	})
	// 	.min(1, 'Service code is required'),

	// isPublished: z
	// 	.boolean()
	// 	.default(false)
});

export type LoginCredentials = z.infer<typeof loginSchema>;
export type UserRegistration = z.infer<typeof userSchema>;
export type ProductData = z.infer<typeof productSchema>;
