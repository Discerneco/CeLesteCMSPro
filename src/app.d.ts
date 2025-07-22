// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: string;
				email: string;
				username: string;
				firstName?: string;
				lastName?: string;
				role: string;
				isAuthenticated: boolean;
			};
			session?: {
				id: string;
				userId: string;
				expiresAt: Date;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
