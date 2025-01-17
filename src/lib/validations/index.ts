import { userSchema, loginSchema, type UserRegistration, type LoginCredentials } from './validationSchemas';

export interface ValidationResponse<T> {
	success: boolean;
	data?: T;
	errors?: Record<string, string[]>;
}

export const validateRegistration = (formData: unknown): ValidationResponse<UserRegistration> => {
	try {
		const result = userSchema.safeParse(formData);

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return { success: false, errors };
		}
		return { success: true, data: result.data };
	} catch (error) {
		return {
			success: false,
			errors: { _errors: ['An unexpected error occurred during validation'] }
		};
	}
};

export const validateLogin = (formData: unknown): ValidationResponse<LoginCredentials> => {
	try {
		const result = loginSchema.safeParse(formData);

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return {
				success: false,
				errors
			};
		}

		return {
			success: true,
			data: result.data
		};
	} catch (error) {
		return {
			success: false,
			errors: {
				_errors: ['An unexpected error occurred during validation']
			}
		};
	}
};
