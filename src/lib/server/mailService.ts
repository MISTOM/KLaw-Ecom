import { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } from '$env/static/private';
import { render } from 'svelte/server';
import nodemailer from 'nodemailer';
import WelcomeEmail from '$lib/templates/welcomeEmail.svelte';
import PasswordResetEmail from '$lib/templates/passwordResetEmail.svelte';
import VerifyEmail from '$lib/templates/verifyEmail.svelte';
import PasswordChangeNotification from '$lib/templates/passwordChangeNotification.svelte';

interface MailConfig {
	host: string;
	secure: boolean;
	port: number;
	auth: {
		user: string;
		pass: string;
	};
}

const defaultConfig: MailConfig = {
	host: MAIL_HOST,
	secure: false,
	port: Number(MAIL_PORT), // 587 for TLS, 465 for SSL
	auth: {
		user: MAIL_USER,
		pass: MAIL_PASS
	}
};

/**
 * Map of transporters, keyed by the JSON stringified configuration
 */
const transporters: Map<string, nodemailer.Transporter> = new Map();

/**
 * Get a transporter for the given configuration, allowing multiple transporters
 * @param config new configuration for the transporter
 */
function getTransport(config?: Partial<MailConfig>) {
	const finalConfig = { ...defaultConfig, ...config };
	const configKey = JSON.stringify(finalConfig);

	if (!transporters.has(configKey)) {
		const transporter = nodemailer.createTransport(finalConfig);
		transporters.set(configKey, transporter);
	}

	return transporters.get(configKey)!; // ! is safe because we set it above
}

/**
 * Sends an email using the specified template and properties.
 * @param to - The recipient's email address.
 * @param subject - The subject of the email.
 * @param templateName - The name of the email template to use [ welcome | password-reset ].
 * @param props - The properties to pass to the email template.
 * @param config - Optional configuration for the mail service.
 * @returns A promise that resolves to a boolean indicating whether the email was sent successfully.
 */
export async function sendEmail(
	to: string,
	subject: string,
	templateName: string,
	props: Record<string, any>,
	config?: Partial<MailConfig>
): Promise<boolean> {
	const transporter = getTransport(config);

	const emailHtml = await renderEmail(templateName, props);

	// console.log('Email HTML:', emailHtml);

	const mailOptions = {
		from: 'Kenya Law E-commerce <alert@briskbusiness.co.ke>',
		to,
		subject,
		html: emailHtml
	};

	try {
		await transporter.sendMail(mailOptions);
		return true;
	} catch (error) {
		console.error('Error sending email:', error);
		return false;
	}
}

/**
 * Renders an email template(.svelte) with the specified properties.
 *
 * @param templateName - The name of the email template to render.
 * @param props - The properties to pass to the email template.
 * @returns A promise that resolves to the rendered email HTML.
 */
async function renderEmail(templateName: string, props: any): Promise<string> {
	switch (templateName) {
		case 'welcome':
			return render(WelcomeEmail, { props }).body;

		case 'password-reset':
			return render(PasswordResetEmail, { props }).body;

		case 'verify-email':
			return render(VerifyEmail, { props }).body;
		
		case 'notify-password-change':
			return render(PasswordChangeNotification, { props }).body;

		// Add more template types as needed
		default:
			throw new Error(`Unknown email template: ${templateName}`);
	}
}
