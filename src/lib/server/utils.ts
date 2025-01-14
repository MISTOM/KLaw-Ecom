export const maxAge = 60 * 30; // 30 minutes
export const refreshTokenMaxAge = 60 * 60 * 24 * 7; // 7 days
export const secure = false;

/**
 * Formats and validates a phone number.
 * @returns Formatted phone number
 */
export function validateAndFormatPhoneNumber(phoneNumber: string) {
	// Remove any non-digit characters eg +, -, (, )
	const digits = phoneNumber.replace(/\D/g, '');

	// Check if the phone number is valid
	if (
		!/^(?:\+254|254)((1|7)(?:(?:[0-9][0-9])|(?:[0-9][0-9][0-9]))[0-9]{5})$|^0((1|7)(?:(?:[0-9][0-9])|(?:[0-9][0-9][0-9]))[0-9]{5})$/.test(
			digits
		)
	) {
		return false;
	}

	// If the phone number starts with 07 or 01, replace it with 2547 or 2541 respectively
	return digits.replace(/^0([17])/, '254$1');
}
