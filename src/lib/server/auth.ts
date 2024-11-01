import { error } from '@sveltejs/kit';
import { REFRESH_KEY, SECRET_KEY, RESET_KEY } from '$env/static/private';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '$lib/server/prisma';
import type { User, Role } from '@prisma/client';

let roleCache: Role[];

export default {
	/**
	 * Sign payload
	 * @param payload
	 * @returns  token
	 */
	sign(payload: User): string {
		//maxAge
		//TODO - Extend maxAge
		const maxAge = 1 * 60; // 1 minute
		const id = payload.id;
		const role = payload.roleId;

		return jwt.sign({ id, role }, SECRET_KEY, {
			expiresIn: maxAge
		});
	},

	/**
	 * Generate refresh token and save it to the database
	 * @param {import('@prisma/client').User} user
	 * @returns refreshToken
	 */
	async generateRefreshToken(user: User): Promise<string> {
		const maxAge = 60 * 60 * 24; // 24 hours
		const id = user.id;

		try {
			const refreshToken = jwt.sign({ id }, REFRESH_KEY, {
				expiresIn: maxAge
			});
			// TODO - Encrypt refresh token
			await prisma.user.update({
				where: { id },
				data: {
					refreshToken: refreshToken
				}
			});

			return refreshToken;
		} catch (e) {
			console.log('Error generating refresh token', e);
			throw error(500, 'Error generating refresh token');
		}
	},

	/**
	 * Generate reset Password token
	 * @param {Number} id User Id
	 */
	generateResetToken(id: User['id']) {
		const maxAge = 60 * 60; // 1 hour
		return jwt.sign({ id }, RESET_KEY, { expiresIn: maxAge });
	},

	/**
	 * Compare Passwords to it's hash
	 * @param {String | Buffer} password
	 * @param {String} hash
	 */
	async compare(password: string | Buffer, hash: string) {
		return await bcrypt.compare(password, hash);
	},

	/**
	 * Hash Password
	 * @param {String | Buffer} password The password to encrypt
	 * @returns Encrypted Password
	 */
	async hash(password: string | Buffer) {
		const salt = await bcrypt.genSalt();
		return await bcrypt.hash(password, salt);
	},

	async getRoles() {
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
	}

	// /**
	//  * Check if user is an admin
	//  * @param {*} user
	//  * @returns
	//  */
	// async isAdmin(user: any) {
	// 	if (!user) return error(401, 'Unauthorized');
	// 	const roles = await this.getRoles();
	// 	const adminRole = roles.find((role) => role.name === 'ADMIN');
	// 	if (!adminRole || user.role !== adminRole.id) {
	// 		throw error(401, 'Unauthorized, you must be an admin');
	// 	}
	// 	return true;
	// },
};
