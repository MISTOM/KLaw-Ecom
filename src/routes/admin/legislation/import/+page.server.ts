import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { Actions } from './$types';

export const actions: Actions = {
    import: async ({ request }) => {
        const formData = await request.formData();
        const file = formData.get('csvFile') as File;

        if (!file || file.size === 0) {
            return fail(400, {
                error: 'Please select a CSV file'
            });
        }

        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());

            // Skip header line
            const dataLines = lines.slice(1);

            const legislations = [];
            let errorCount = 0;
            const errors: string[] = [];

            for (let i = 0; i < dataLines.length; i++) {
                const line = dataLines[i].trim();
                if (!line) continue;

                try {
                    // Split CSV line (simple implementation - may need more robust CSV parsing)
                    const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));

                    // Map CSV columns to database fields
                    // Adjust indices based on your CSV structure
                    const legislation = {
                        number: columns[0] || null,
                        title: columns[1] || null,
                        dateGazetted: columns[2] ? new Date(columns[2]) : null,
                        gazetteDetails: columns[3] || null,
                        kenyaGazetteSuppNo: columns[4] || null,
                        availability: columns[5] || null,
                        availabilityAt: columns[6] ? new Date(columns[6]) : null,
                        uploadedAt: columns[7] ? new Date(columns[7]) : null,
                        kgsPublicationAt: columns[8] ? new Date(columns[8]) : null,
                        commencementAt: columns[9] ? new Date(columns[9]) : null,
                        revocationsAmendments: columns[10] || null,
                        pagination: columns[11] || null,
                        statusOnDatabase: columns[12] || null,
                        legislativeUpdates: columns[13] || null,
                        comments: columns[14] || null,
                        year: new Date().getFullYear(), // Default to current year
                        type: 'SUBLEG' as const // Default type
                    };

                    // Extract year from number if available (e.g., "L.N. 1 of 2023")
                    if (legislation.number) {
                        const yearMatch = legislation.number.match(/(\d{4})/);
                        if (yearMatch) {
                            legislation.year = parseInt(yearMatch[1]);
                        }
                    }

                    legislations.push(legislation);
                } catch (lineError) {
                    errorCount++;
                    errors.push(`Line ${i + 2}: ${lineError}`);
                }
            }

            if (legislations.length === 0) {
                return fail(400, {
                    error: 'No valid data found in CSV file'
                });
            }

            // Bulk insert
            const result = await prisma.legislationItem.createMany({
                data: legislations,
                skipDuplicates: true
            });

            return {
                success: true,
                imported: result.count,
                errors: errors.length > 0 ? errors : null
            };

        } catch (error) {
            console.error('CSV import error:', error);
            return fail(500, {
                error: 'Failed to process CSV file'
            });
        }
    }
};
