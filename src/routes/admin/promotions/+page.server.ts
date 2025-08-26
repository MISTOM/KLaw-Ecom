import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { promotionSchema, type PromotionData } from '$lib/validations/validationSchemas';

// Reason: Provide paginated list of promotions with eager-loaded relations for admin management.
export const load: PageServerLoad = async ({ url }) => {
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const take = 15;
    const skip = (page - 1) * take;
    const [promotions, total, products, categories] = await Promise.all([
        prisma.promotion.findMany({
            include: {
                products: { include: { product: { select: { id: true, name: true } } } },
                categories: { include: { category: { select: { id: true, name: true } } } }
            },
            orderBy: [{ priority: 'asc' }, { startsAt: 'desc' }],
            skip,
            take
        }),
        prisma.promotion.count(),
        prisma.product.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
        prisma.category.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: 'asc' } })
    ]);

    // Serialize promotions to ensure discountValue is a number
    const serializedPromotions = promotions.map(promo => ({
        ...promo,
        discountValue: Number(promo.discountValue)
    }));

    return {
        promotions: serializedPromotions,
        products,
        categories,
        page,
        totalPages: Math.ceil(total / take)
    };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const form = await request.formData();

        // Extract primitive values
        const discountType = form.get('discountType')?.toString() as PromotionData['discountType'];
        const rawDiscount = form.get('discountValue')?.toString();
        const discountValue = rawDiscount ? parseFloat(rawDiscount) : NaN;
        const startsAtStr = form.get('startsAt')?.toString();
        const endsAtStr = form.get('endsAt')?.toString();

        const data: Partial<PromotionData> = {
            name: form.get('name')?.toString() || '',
            description: form.get('description')?.toString() || undefined,
            discountType,
            discountValue: discountValue as any,
            code: form.get('code')?.toString() || undefined,
            startsAt: startsAtStr ? new Date(startsAtStr) : (undefined as any),
            endsAt: endsAtStr ? new Date(endsAtStr) : (undefined as any),
            isActive: form.get('isActive') === 'on',
            priority: parseInt(form.get('priority')?.toString() || '100'),
            productIds: form.getAll('productIds').map((v) => parseInt(v.toString())).filter((n) => !isNaN(n)),
            categoryIds: form.getAll('categoryIds').map((v) => parseInt(v.toString())).filter((n) => !isNaN(n))
        };

        const parsed = promotionSchema.safeParse(data);
        if (!parsed.success) {
            return fail(400, { errors: parsed.error.flatten().fieldErrors, data });
        }

        try {
            const { productIds, categoryIds, ...rest } = parsed.data;
            const created = await prisma.promotion.create({
                data: {
                    ...rest,
                    products: productIds.length ? { create: productIds.map((id) => ({ product: { connect: { id } } })) } : undefined,
                    categories: categoryIds.length ? { create: categoryIds.map((id) => ({ category: { connect: { id } } })) } : undefined
                },
                include: {
                    products: { include: { product: true } },
                    categories: { include: { category: true } }
                }
            });
            return { promotion: created };
        } catch (e: any) {
            console.error('Create promotion error', e);
            return fail(500, { errors: { _errors: ['Failed to create promotion'] }, data });
        }
    },
    toggle_active: async ({ request }) => {
        const fd = await request.formData();
        // @ts-ignore: FormData entries is available at runtime
        const form = Object.fromEntries(fd.entries());
        const id = parseInt(form.id as string);
        if (isNaN(id)) return fail(400, { errors: { _errors: ['Invalid id'] } });
        try {
            const promo = await prisma.promotion.findUnique({ where: { id } });
            if (!promo) return fail(404, { errors: { _errors: ['Promotion not found'] } });
            const updated = await prisma.promotion.update({ where: { id }, data: { isActive: !promo.isActive } });
            return { promotion: true };
        } catch (e) {
            console.error(e);
            return fail(500, { errors: { _errors: ['Failed to toggle'] } });
        }
    },
    delete: async ({ request }) => {
        const fd = await request.formData();
        // @ts-ignore: FormData entries is available at runtime
        const form = Object.fromEntries(fd.entries());
        const id = parseInt(form.id as string);
        if (isNaN(id)) return fail(400, { errors: { _errors: ['Invalid id'] } });
        try {
            await prisma.promotion.delete({ where: { id } });
            return { id };
        } catch (e) {
            console.error(e);
            return fail(500, { errors: { _errors: ['Failed to delete'] } });
        }
    }
};
