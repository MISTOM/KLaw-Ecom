// See https://kit.svelte.dev/docs/types#app
import type { JwtPayload } from 'jsonwebtoken';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {
		// 	status?: number;
		// 	message?: string;
		// }
		interface Locals {
			user: { id; roleId } | JwtPayload | null;
			isSubscribed: boolean;
			subscription: import('@prisma/client').UserSubscription | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
