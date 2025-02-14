import type { z } from 'zod';
import { userSchema, loginSchema, productSchema } from './validationSchemas';
import type { UserRegistration, LoginCredentials, ProductData } from './validationSchemas';

export interface ValidationResponse<T> {
	success: boolean;
	data?: T;
	errors?: Record<string, string[]>;
}

const validate = <T>(formData: unknown, schema: any): ValidationResponse<T> => {
	try {
		const result = schema.safeParse(formData);

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

export type FormErrors<T> = {
	[K in keyof T]?: string[];
} & {
	_errors?: string[];
};

// export function useFormValidation<T extends Record<string, any>>(schema: any) {
//   let formErrors = $state<FormErrors<T>>({});

//   const getFieldError = (field: keyof T) => {
//     return formErrors[field]?.[0] || '';
//   };

//   const validateField = <K extends keyof T>(field: K, value: T[K]) => {
//     const fieldSchema = schema.shape[field];
//     const result = fieldSchema.safeParse(value);
//     formErrors[field] = result.success ? [] : result.error?.flatten().formErrors || [];
//   };

//   const validateAll = (formData: FormData) => {
//     const result = schema.safeParse(Object.fromEntries(formData.entries()));
//     if (!result.success) {
//       const errors = result.error.flatten().fieldErrors;
//       formErrors = errors;
//       return false;
//     }
//     return true;
//   };

//   return {
//     formErrors,
//     getFieldError,
//     validateField,
//     validateAll
//   };
// }

export const validateRegistration = (formData: unknown): ValidationResponse<UserRegistration> =>
	validate<UserRegistration>(formData, userSchema);

export const validateLogin = (formData: unknown): ValidationResponse<LoginCredentials> =>
	validate<LoginCredentials>(formData, loginSchema);

export const validateProduct = (formData: unknown): ValidationResponse<ProductData> =>
	validate<ProductData>(formData, productSchema);
