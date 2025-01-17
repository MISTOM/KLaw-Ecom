import { z } from 'zod';

export const phoneRegex = /^(?:\+254|254|0|01)?[17][0-9]{8,9}$/;

export const userSchema = z
	.object({
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
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export const loginSchema = z.object({
	email: z
		.string({
			required_error: 'Email is required',
			invalid_type_error: 'Invalid email format'
		})
		.email('Please enter a valid email address'),

	password: z
		.string({
			required_error: 'Password is required'
		})
		.min(1, 'Password is required')
});

export type LoginCredentials = z.infer<typeof loginSchema>;
export type UserRegistration = z.infer<typeof userSchema>;
