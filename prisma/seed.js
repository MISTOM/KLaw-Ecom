import { PrismaClient, Roles } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	// Create roles
	const roles = [Roles.ADMIN, Roles.USER];

	await prisma.$transaction(async (prisma) => {
		for (const role of roles) {
			const existingRole = await prisma.role.findUnique({
				where: { name: role }
			});

			if (!existingRole) {
				await prisma.role.create({
					data: { name: role }
				});
			}
		}
	});
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});