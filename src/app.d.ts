// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: string;
				email: string;
				role: 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'VENDEUR';
			};
			// add session type for lucia validate
			session?: {
				id: string;
				expiresAt: string | Date;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
