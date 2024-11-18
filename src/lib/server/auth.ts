import { error } from '@sveltejs/kit';
import { REFRESH_KEY, SECRET_KEY, RESET_KEY } from '$env/static/private';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { type User, type Role, Roles } from '@prisma/client';
import prisma from '$lib/server/prisma';
import { maxAge } from '$lib/server/utils';

let roleCache: Role[];

export default {
	/**
	 * Sign payload
	 * @param payload
	 * @returns  token
	 */
	sign(payload: User): string {
		const id = payload.id;
		const roleId = payload.roleId;

		return jwt.sign({ id, roleId }, SECRET_KEY, {
			expiresIn: maxAge
		});
	},

	/**
	 * Generate refresh token, hash it and save it to the database
	 * @returns hashed refreshToken
	 */
	async generateRefreshToken(user: User): Promise<string> {
		const maxAge = 60 * 60 * 24 * 7; // 1 week
		const id = user.id;

		try {
			const refreshToken = jwt.sign({ id }, REFRESH_KEY, {
				expiresIn: maxAge
			});
			const hashedToken = await this.hash(refreshToken);
			await prisma.user.update({
				where: { id },
				data: { refreshToken: hashedToken }
			});

			return refreshToken;
		} catch (e) {
			console.log('Error generating refresh token', e);
			return '';
		}
	},
	/**
	 * Verify refresh token
	 */
	async verifyRefreshToken(token: string, userId: number): Promise<boolean> {
		try {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { refreshToken: true }
			});

			if (!user || !user.refreshToken) {
				return false;
			}

			const isMatch = await bcrypt.compare(token, user.refreshToken);
			return isMatch;
		} catch (e) {
			console.log('Error verifying refresh token', e);
			return false;
		}
	},

	/**
	 * Generate reset Password token
	 */
	generateResetToken(id: User['id']) {
		const maxAge = 60 * 60; // 1 hour
		return jwt.sign({ id }, RESET_KEY, { expiresIn: maxAge });
	},

	/**
	 * Compare Passwords to it's hash
	 */
	async compare(password: string | Buffer, hash: string) {
		return await bcrypt.compare(password, hash);
	},

	/**
	 * Hash Password
	 * @param  password The password to encrypt
	 * @returns Encrypted Password
	 */
	async hash(password: string | Buffer): Promise<string> {
		const salt = await bcrypt.genSalt();
		return await bcrypt.hash(password, salt);
	},

	/**
	 * Get roles from the database
	 * @returns roles
	 **/
	async getRoles(): Promise<Role[]> {
		if (!roleCache) {
			console.log('Querying db for roles');
			await prisma.role
				.findMany()
				.then((roles) => {
					roleCache = roles;
				})
				.catch((err) => {
					console.log('Error getting roles', err);
					throw error(500, 'Error getting roles');
				});
		}
		return roleCache;
	},

	/**
	 * Check if user is an admin
	 * @param user
	 */
	async isAdmin(user: any | null): Promise<boolean> {
		const roles = await this.getRoles();
		const adminRole = roles.find((role) => role.name === Roles.ADMIN);

		if (adminRole && user?.roleId === adminRole.id) return true;
		return false;
	}
};
