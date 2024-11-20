// $lib/server/mailService.ts

import nodemailer from 'nodemailer';
import { render } from 'svelte/server';
import WelcomeEmail from '$lib/templates/welcomeEmail.svelte';
import PasswordResetEmail from '$lib/templates/passwordResetEmail.svelte';
import { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } from '$env/static/private';

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
	secure: true,
	port: Number(MAIL_PORT), // 587 for TLS, 465 for SSL
	auth: {
		user: MAIL_USER,
		pass: MAIL_PASS
	}
};

export async function sendEmail(
	to: string,
	subject: string,
	templateName: string,
	props: Record<string, any>,
	config?: Partial<MailConfig>
): Promise<boolean> {
	console.log('Sending email to...:', to);
	const finalConfig = { ...defaultConfig, ...config };

	const transporter = nodemailer.createTransport(finalConfig);

	const emailHtml = await renderEmail(templateName, props);

	console.log('Email HTML:', emailHtml);

	const mailOptions = {
		from: 'kigardetom2001@gmail.com',
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

async function renderEmail(templateName: string, props: any): Promise<string> {
	switch (templateName) {
		case 'welcome':
			return render(WelcomeEmail, { props }).body;

		case 'password-reset':
			return render(PasswordResetEmail, { props }).body;
		// Add more template types as needed
		default:
			throw new Error(`Unknown email template: ${templateName}`);
	}
}
