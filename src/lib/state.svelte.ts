import type { User } from '@prisma/client';
import { setContext, getContext } from 'svelte';
class UserState {
	user: User | null = $state(null);
	name = $state();
	constructor(user: User | null) {
		this.user = user;
		this.name = user?.name;
	}
}

const STATE_KEY = Symbol('user-state-key');
export function setUserState(user: User | null) {
	const userState = new UserState(user);
	setContext(STATE_KEY, userState);
	return userState;
}

export function getUserState() {
	return getContext<UserState>(STATE_KEY);
}
