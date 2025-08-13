import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

// Define the publication report request type
type PublicationReportRequest = {
	dateRange: {
		startDate: string;
		endDate: string;
	};
	categoryId?: number;
	sortBy: 'name' | 'sales' | 'revenue' | 'date';
	sortOrder: 'asc' | 'desc';
	includeDetails: boolean;
};

export const POST: RequestHandler = async ({ request, url: { origin } }) => {
	try {
		const reportConfig: PublicationReportRequest = await request.json();

		// Convert string dates to Date objects
		const startDate = new Date(reportConfig.dateRange.startDate);
		const endDate = new Date(reportConfig.dateRange.endDate);
		endDate.setHours(23, 59, 59, 999);

		// Build the query for products with their sales data
		const whereClause: any = {
			isPublished: true,
			ProductOnOrder: {
				some: {
					order: {
						createdAt: {
							gte: startDate,
							lte: endDate
						},
						status: 'COMPLETED'
					}
				}
			}
		};

		if (reportConfig.categoryId) {
			whereClause.categories = {
				some: {
					id: reportConfig.categoryId
				}
			};
		}

		// Build orderBy clause
		let orderBy: any = {};
		switch (reportConfig.sortBy) {
			case 'name':
				orderBy = { name: reportConfig.sortOrder };
				break;
			case 'sales':
				orderBy = { ProductOnOrder: { _count: reportConfig.sortOrder } };
				break;
			case 'date':
				orderBy = { publicationDate: reportConfig.sortOrder };
				break;
			case 'revenue':
				// We'll sort this in JavaScript after calculating revenue
				orderBy = { name: 'asc' };
				break;
			default:
				orderBy = { name: 'asc' };
		}

		// Query the database
		const products = await prisma.product.findMany({
			where: whereClause,
			include: {
				categories: true,
				ProductOnOrder: {
					include: {
						order: {
							select: {
								id: true,
								createdAt: true,
								status: true,
								user: reportConfig.includeDetails
									? {
											select: {
												name: true,
												email: true
											}
										}
									: false
							}
						}
					},
					where: {
						order: {
							createdAt: {
								gte: startDate,
								lte: endDate
							},
							status: 'COMPLETED'
						}
					}
				}
			},
			orderBy: reportConfig.sortBy !== 'revenue' ? orderBy : undefined
		});

		// Calculate additional metrics and sort by revenue if needed
		const enrichedProducts = products.map((product) => {
			const totalSales = product.ProductOnOrder.reduce((sum, po) => sum + po.quantity, 0);
			const totalRevenue = product.ProductOnOrder.reduce((sum, po) => sum + po.quantity * product.price, 0);

			return {
				...product,
				totalSales,
				totalRevenue,
				avgOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0
			};
		});

		// Sort by revenue if needed
		if (reportConfig.sortBy === 'revenue') {
			enrichedProducts.sort((a, b) => {
				const aVal = a.totalRevenue;
				const bVal = b.totalRevenue;
				return reportConfig.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
			});
		}

		// Generate PDF
		const pdfFileName = `publication-report-${uuid()}.pdf`;
		const pdfPath = path.join(process.cwd(), 'static', 'reports', pdfFileName);

		const dir = path.dirname(pdfPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		const htmlContent = generatePublicationReportHtml(enrichedProducts, reportConfig, origin);

		try {
			const browser = await puppeteer.launch({
				headless: true,
				args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
			});

			const page = await browser.newPage();
			await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

			await page.pdf({
				path: pdfPath,
				format: 'A4',
				printBackground: true,
				margin: {
					top: '1cm',
					right: '1cm',
					bottom: '1cm',
					left: '1cm'
				}
			});

			await browser.close();

			return json({
				success: true,
				pdfUrl: `/reports/${pdfFileName}`
			});
		} catch (puppeteerError) {
			console.error('Puppeteer error:', puppeteerError);

			const htmlFileName = `publication-report-${uuid()}.html`;
			const htmlFilePath = path.join(process.cwd(), 'static', 'reports', htmlFileName);

			fs.writeFileSync(htmlFilePath, htmlContent);

			return json({
				success: true,
				pdfUrl: `/reports/${htmlFileName}`,
				isHtml: true,
				message: 'PDF generation failed. Showing HTML version instead.'
			});
		}
	} catch (error) {
		console.error('Error generating publication report:', error);
		return json(
			{
				success: false,
				error: 'Failed to generate publication report'
			},
			{ status: 500 }
		);
	}
};

function generatePublicationReportHtml(
	products: any[],
	reportConfig: PublicationReportRequest,
	origin: string
): string {
	const startDate = new Date(reportConfig.dateRange.startDate).toLocaleDateString('en-UK');
	const endDate = new Date(reportConfig.dateRange.endDate).toLocaleDateString('en-UK');

	const totalProducts = products.length;
	const totalSales = products.reduce((sum, product) => sum + product.totalSales, 0);
	const totalRevenue = products.reduce((sum, product) => sum + product.totalRevenue, 0);
	const avgRevenue = totalProducts > 0 ? totalRevenue / totalProducts : 0;

	const formatCurrency = (amount: number) => {
		return `KES ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
	};

	const today = new Date();
	const generatedDate = today.toLocaleDateString('en-UK', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Publication Sales Report | Kenya Law</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            :root {
                --primary-color: #1F4D90;
                --primary-light: #E6EDF7;
                --secondary-color: #EF9A27;
                --text-color: #333333;
                --text-light: #666666;
                --background-light: #F5F7FA;
                --gray-light: #EAEDF2;
                --success: #2A9D8F;
                --border-color: #E2E8F0;
            }
            
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.4;
                color: var(--text-color);
                background-color: white;
                font-size: 10pt;
            }

            .report-container {
                max-width: 21cm;
                margin: 0 auto;
                padding: 0;
                background-color: white;
            }

            .report-header {
                text-align: center;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border-color);
                margin-bottom: 1.5rem;
            }
            
            .header-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 1rem;
            }
            
            .logo-container {
                display: flex;
                align-items: center;
            }
            
            .logo {
                height: 40px;
                margin-right: 0.75rem;
            }
            
            .company-info {
                text-align: left;
            }
            
            .company-name {
                font-size: 1.2rem;
                font-weight: 600;
                color: var(--primary-color);
                margin: 0;
            }
            
            .company-tagline {
                font-size: 0.8rem;
                color: var(--text-light);
                margin: 0;
            }
            
            .report-date {
                text-align: right;
                font-size: 0.85rem;
                color: var(--text-light);
            }
            
            .report-title {
                margin: 0.75rem 0;
                color: var(--primary-color);
                font-weight: 600;
                font-size: 1.4rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .report-subtitle {
                font-weight: 400;
                color: var(--text-light);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 0.25rem;
            }
            
            .dot-separator {
                display: inline-block;
                width: 3px;
                height: 3px;
                border-radius: 50%;
                background-color: var(--text-light);
                margin: 0 0.25rem;
            }

            .summary-cards {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
                justify-content: space-between;
                margin-bottom: 1.5rem;
            }
            
            .summary-card {
                flex: 1;
                min-width: 130px;
                padding: 0.75rem;
                background-color: var(--background-light);
                border-radius: 6px;
                border-left: 3px solid var(--primary-color);
            }
            
            .card-label {
                font-size: 0.75rem;
                color: var(--text-light);
                margin-bottom: 0.25rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .card-value {
                font-size: 1.3rem;
                font-weight: 600;
                color: var(--text-color);
                margin: 0;
            }
            
            .section-title {
                margin-bottom: 0.75rem;
                padding-bottom: 0.35rem;
                border-bottom: 2px solid var(--primary-color);
                font-weight: 600;
                font-size: 1rem;
                color: var(--primary-color);
                display: flex;
                align-items: center;
            }
            
            .data-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 0.35rem;
                font-size: 0.85rem;
            }
            
            .data-table th, .data-table td {
                padding: 0.5rem 0.75rem;
                text-align: left;
                border-bottom: 1px solid var(--border-color);
                vertical-align: top;
            }
            
            .data-table th {
                background-color: var(--background-light);
                font-weight: 600;
                color: var(--primary-color);
                white-space: nowrap;
            }
            
            .data-table tbody tr:nth-child(even) td {
                background-color: var(--gray-light);
            }
            
            .category-tag {
                display: inline-block;
                padding: 0.2rem 0.4rem;
                background-color: var(--primary-light);
                color: var(--primary-color);
                border-radius: 10px;
                font-size: 0.75rem;
                margin: 0.05rem;
            }
            
            .report-footer {
                margin-top: 2rem;
                border-top: 1px solid var(--border-color);
                padding-top: 0.75rem;
                text-align: center;
                font-size: 0.75rem;
                color: var(--text-light);
            }
            
            .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 6rem;
                color: rgba(200, 200, 200, 0.1);
                white-space: nowrap;
                pointer-events: none;
                z-index: -1;
            }
            
            .print-button {
                display: block;
                margin: 15px auto;
                padding: 0.6rem 1.25rem;
                background-color: var(--primary-color);
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-family: inherit;
                font-size: 0.9rem;
                font-weight: 500;
            }

            @media print {
                body { font-size: 9pt; }
                .print-button, .watermark { display: none; }
                .data-table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                .report-container { width: 100%; max-width: 100%; }
            }
        </style>
    </head>
    <body>
        <div class="watermark">KENYA LAW</div>
        <div class="report-container">
            <div class="report-header">
                <div class="header-top">
                    <div class="logo-container">
                        <img src="${origin}/kenyaLawLogo.png" alt="Kenya Law Logo" class="logo" />
                        <div class="company-info">
                            <h1 class="company-name">Kenya Law</h1>
                            <p class="company-tagline">Where Legal Information is Public Knowledge</p>
                        </div>
                    </div>
                    <div class="report-date">
                        <div>Generated: ${generatedDate}</div>
                        <div>Ref: KL-PUB-${Math.floor(Math.random() * 900000 + 100000)}</div>
                    </div>
                </div>
                
                <h2 class="report-title">Publication Sales Report</h2>
                <div class="report-subtitle">
                    <span>Period: ${startDate} to ${endDate}</span>
                </div>
            </div>
            
            <div class="summary-cards">
                <div class="summary-card">
                    <div class="card-label">Total Publications</div>
                    <div class="card-value">${totalProducts}</div>
                </div>
                <div class="summary-card">
                    <div class="card-label">Total Sales</div>
                    <div class="card-value">${totalSales}</div>
                </div>
                <div class="summary-card">
                    <div class="card-label">Total Revenue</div>
                    <div class="card-value">${formatCurrency(totalRevenue)}</div>
                </div>
                <div class="summary-card">
                    <div class="card-label">Avg Revenue</div>
                    <div class="card-value">${formatCurrency(avgRevenue)}</div>
                </div>
            </div>
            
            <div class="report-section">
                <h3 class="section-title">
                    <i class="bi bi-book"></i>
                    Publication Performance
                </h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Publication</th>
                            <th>Author</th>
                            <th>Categories</th>
                            <th>Price</th>
                            <th>Sales</th>
                            <th>Revenue</th>
                            <th>Avg Order</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products
													.map(
														(product) => `
                            <tr>
                                <td>
                                    <div style="font-weight: 600;">${product.name}</div>
                                    <div style="font-size: 0.85rem; color: var(--text-light);">
                                        ${product.serviceCode}
                                    </div>
                                </td>
                                <td>${product.author}</td>
                                <td>
                                    ${product.categories
																			.map((cat: any) => `<span class="category-tag">${cat.name}</span>`)
																			.join('')}
                                </td>
                                <td>${formatCurrency(product.price)}</td>
                                <td>${product.totalSales}</td>
                                <td>${formatCurrency(product.totalRevenue)}</td>
                                <td>${formatCurrency(product.avgOrderValue)}</td>
                            </tr>
                        `
													)
													.join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="report-footer">
                <p>&copy; ${new Date().getFullYear()} Kenya Law. All rights reserved.</p>
                <p>This report is system-generated and does not require a signature.</p>
            </div>
        </div>
        
        <button class="print-button" onclick="window.print();">
            <i class="bi bi-printer"></i> Print Report
        </button>
    </body>
    </html>
    `;
}
