import { writable } from 'svelte/store';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export const user = writable<User | null>(null);
export const isAuthenticated = writable(false);

// Derived store for authentication status
user.subscribe(value => {
  isAuthenticated.set(!!value);
});
