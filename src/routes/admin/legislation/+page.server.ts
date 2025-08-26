import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { legislationSchema, type FormErrors, type LegislationData } from '$lib/validations/validationSchemas';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = url.searchParams.get('search') || '';

    const where = search
        ? {
            OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { number: { contains: search, mode: 'insensitive' as const } }
            ]
        }
        : {};

    const [legislations, totalCount] = await Promise.all([
        prisma.legislationItem.findMany({
            where,
            orderBy: [
                { year: 'desc' },
                { type: 'asc' },
                { number: 'asc' }
            ],
            skip: offset,
            take: limit
        }),
        prisma.legislationItem.count({ where })
    ]);

    return {
        legislations,
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        search
    };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const formData = await request.formData();

        const data = {
            year: parseInt(formData.get('year') as string),
            type: formData.get('type') as string,
            number: formData.get('number') as string || null,
            title: formData.get('title') as string || null,
            dateGazetted: formData.get('dateGazetted') ? new Date(formData.get('dateGazetted') as string) : null,
            gazetteDetails: formData.get('gazetteDetails') as string || null,
            availabilityAt: formData.get('availabilityAt') ? new Date(formData.get('availabilityAt') as string) : null,
            uploadedAt: formData.get('uploadedAt') ? new Date(formData.get('uploadedAt') as string) : null,
            kgsPublicationAt: formData.get('kgsPublicationAt') ? new Date(formData.get('kgsPublicationAt') as string) : null,
            commencementAt: formData.get('commencementAt') ? new Date(formData.get('commencementAt') as string) : null,
            pagination: formData.get('pagination') as string || null,
            statusOnDatabase: formData.get('statusOnDatabase') as string || null,
            legislativeUpdates: formData.get('legislativeUpdates') as string || null,
            comments: formData.get('comments') as string || null,
            kenyaGazetteSuppNo: formData.get('kenyaGazetteSuppNo') as string || null,
            revocationsAmendments: formData.get('revocationsAmendments') as string || null,
            assentAt: formData.get('assentAt') ? new Date(formData.get('assentAt') as string) : null,
            dateAvailedAt: formData.get('dateAvailedAt') ? new Date(formData.get('dateAvailedAt') as string) : null,
            availability: formData.get('availability') as string || null
        };

        const result = legislationSchema.safeParse(data);

        if (!result.success) {
            const errors: FormErrors<LegislationData> = {};

            for (const [key, value] of Object.entries(result.error.flatten().fieldErrors)) {
                errors[key as keyof LegislationData] = value;
            }

            return fail(400, {
                data,
                errors
            });
        }

        try {
            await prisma.legislationItem.create({
                data: result.data
            });

            return { success: true };
        } catch (error) {
            console.error('Error creating legislation:', error);
            return fail(500, {
                data,
                errors: { _errors: ['Failed to create legislation item'] }
            });
        }
    },

    update: async ({ request }) => {
        const formData = await request.formData();
        const id = parseInt(formData.get('id') as string);

        const data = {
            year: parseInt(formData.get('year') as string),
            type: formData.get('type') as string,
            number: formData.get('number') as string || null,
            title: formData.get('title') as string || null,
            dateGazetted: formData.get('dateGazetted') ? new Date(formData.get('dateGazetted') as string) : null,
            gazetteDetails: formData.get('gazetteDetails') as string || null,
            availabilityAt: formData.get('availabilityAt') ? new Date(formData.get('availabilityAt') as string) : null,
            uploadedAt: formData.get('uploadedAt') ? new Date(formData.get('uploadedAt') as string) : null,
            kgsPublicationAt: formData.get('kgsPublicationAt') ? new Date(formData.get('kgsPublicationAt') as string) : null,
            commencementAt: formData.get('commencementAt') ? new Date(formData.get('commencementAt') as string) : null,
            pagination: formData.get('pagination') as string || null,
            statusOnDatabase: formData.get('statusOnDatabase') as string || null,
            legislativeUpdates: formData.get('legislativeUpdates') as string || null,
            comments: formData.get('comments') as string || null,
            kenyaGazetteSuppNo: formData.get('kenyaGazetteSuppNo') as string || null,
            revocationsAmendments: formData.get('revocationsAmendments') as string || null,
            assentAt: formData.get('assentAt') ? new Date(formData.get('assentAt') as string) : null,
            dateAvailedAt: formData.get('dateAvailedAt') ? new Date(formData.get('dateAvailedAt') as string) : null,
            availability: formData.get('availability') as string || null
        };

        const result = legislationSchema.safeParse(data);

        if (!result.success) {
            const errors: FormErrors<LegislationData> = {};

            for (const [key, value] of Object.entries(result.error.flatten().fieldErrors)) {
                errors[key as keyof LegislationData] = value;
            }

            return fail(400, {
                data,
                errors,
                id
            });
        }

        try {
            await prisma.legislationItem.update({
                where: { id },
                data: result.data
            });

            return { success: true };
        } catch (error) {
            console.error('Error updating legislation:', error);
            return fail(500, {
                data,
                errors: { _errors: ['Failed to update legislation item'] },
                id
            });
        }
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = parseInt(formData.get('id') as string);

        try {
            await prisma.legislationItem.delete({
                where: { id }
            });

            return { success: true };
        } catch (error) {
            console.error('Error deleting legislation:', error);
            return fail(500, {
                errors: { _errors: ['Failed to delete legislation item'] }
            });
        }
    }
};
