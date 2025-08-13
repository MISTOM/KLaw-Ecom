import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

// Define the report request type
type ReportRequest = {
	dateRange: {
		startDate: string;
		endDate: string;
	};
	reportType: 'all' | 'pending' | 'completed' | 'cancelled';
	groupBy: 'none' | 'day' | 'week' | 'month';
	includeUserDetails: boolean;
	includeProductDetails: boolean;
	sortBy: 'date' | 'price' | 'customer';
	sortOrder: 'asc' | 'desc';
};

// Map string enum values to Prisma enum values
const statusMap = {
	all: undefined,
	pending: 'PENDING',
	completed: 'COMPLETED',
	cancelled: 'CANCELLED'
} as const;

const sortFieldMap = {
	date: 'createdAt',
	price: 'totalPrice',
	customer: 'user.name'
} as const;

export const POST: RequestHandler = async ({ request, url: { origin } }) => {
	try {
		// Parse the request body
		const reportConfig: ReportRequest = await request.json();

		// Convert string dates to Date objects
		const startDate = new Date(reportConfig.dateRange.startDate);
		const endDate = new Date(reportConfig.dateRange.endDate);
		endDate.setHours(23, 59, 59, 999); // Set to end of day

		// Determine the order status filter based on reportType
		const statusFilter = statusMap[reportConfig.reportType];

		// Build the query
		const whereClause: any = {
			createdAt: {
				gte: startDate,
				lte: endDate
			}
		};

		if (statusFilter) {
			whereClause.status = statusFilter;
		}

		// Determine ordering
		const sortField = sortFieldMap[reportConfig.sortBy];
		let orderBy: any = {};

		// Handle special case for user.name sorting
		if (sortField === 'user.name') {
			orderBy = {
				user: {
					name: reportConfig.sortOrder.toLowerCase()
				}
			};
		} else {
			orderBy[sortField] = reportConfig.sortOrder.toLowerCase();
		}

		// Query the database
		const orders = await prisma.order.findMany({
			where: whereClause,
			include: {
				ProductOnOrder: reportConfig.includeProductDetails
					? {
							include: {
								product: true
							}
						}
					: true,
				user: reportConfig.includeUserDetails
			},
			orderBy
		});

		// Process data for grouping if needed
		let groupedOrders = orders;
		if (reportConfig.groupBy !== 'none') {
			// Implement grouping logic based on reportConfig.groupBy
			// This would organize orders by day, week, or month
			// For simplicity, we'll skip the implementation here
		}

		// Generate PDF using Puppeteer
		const pdfFileName = `order-report-${uuid()}.pdf`;
		const pdfPath = path.join(process.cwd(), 'static', 'reports', pdfFileName);

		// Make sure the directory exists
		const dir = path.dirname(pdfPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		// Generate HTML content for the PDF
		const htmlContent = generateReportHtml(orders, reportConfig, origin);

		try {
			// Launch Puppeteer with more robust error handling
			const browser = await puppeteer.launch({
				headless: true, // Use boolean value instead of "new"
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

			// Return the URL to the generated PDF
			return json({
				success: true,
				pdfUrl: `/reports/${pdfFileName}`
			});
		} catch (puppeteerError) {
			console.error('Puppeteer error:', puppeteerError);

			// Fallback to direct HTML rendering if Puppeteer fails
			// Write the HTML directly as fallback
			const htmlFileName = `order-report-${uuid()}.html`;
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
		console.error('Error generating report:', error);
		return json(
			{
				success: false,
				error: 'Failed to generate report'
			},
			{ status: 500 }
		);
	}
};

function generateReportHtml(orders: any[], reportConfig: ReportRequest, origin: string): string {
	const startDate = new Date(reportConfig.dateRange.startDate).toLocaleDateString('en-UK');
	const endDate = new Date(reportConfig.dateRange.endDate).toLocaleDateString('en-UK');

	// Calculate some summary statistics
	const totalOrders = orders.length;
	const totalAmount = orders.reduce((sum, order) => sum + order.totalPrice, 0);
	const pendingOrders = orders.filter((order) => order.status === 'PENDING').length;
	const completedOrders = orders.filter((order) => order.status === 'COMPLETED').length;
	const cancelledOrders = orders.filter((order) => order.status === 'CANCELLED').length;

	// Helper function to format currency
	const formatCurrency = (amount: number) => {
		return `KES ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
	};

	// Format the current date in a readable format
	const today = new Date();
	const generatedDate = today.toLocaleDateString('en-UK', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	// Build status filter description
	const reportTypeLabel = {
		all: 'All Orders',
		pending: 'Pending Orders',
		completed: 'Completed Orders',
		cancelled: 'Cancelled Orders'
	}[reportConfig.reportType];

	// Generate HTML for the PDF with improved design and typography
	return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Report | Kenya Law</title>
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
                --warning: #E9C46A;
                --danger: #E76F51;
                --border-color: #E2E8F0;
                --page-margin: 2.5cm;
            }
            
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.4;
                color: var(--text-color);
                background-color: white;
                font-size: 10pt;
                margin: 0;
                padding: 0;
            }

            .report-container {
                max-width: 21cm;
                margin: 0 auto;
                padding: 0;
                background-color: white;
                position: relative;
            }

            /* Header Styles */
            .report-header {
                text-align: center;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border-color);
                margin-bottom: 1.5rem;
                position: relative;
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
                line-height: 1.1;
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
            
            .report-subtitle span {
                margin: 0 0.25rem;
            }
            
            .dot-separator {
                display: inline-block;
                width: 3px;
                height: 3px;
                border-radius: 50%;
                background-color: var(--text-light);
                margin: 0 0.25rem;
                vertical-align: middle;
            }

            /* Summary Cards */
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
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                transition: all 0.2s ease;
            }
            
            .summary-card.primary {
                background-color: var(--primary-light);
                border-left: 3px solid var(--primary-color);
            }
            
            .summary-card.success {
                background-color: #E6F5F3;
                border-left: 3px solid var(--success);
            }
            
            .summary-card.warning {
                background-color: #FEFAE0;
                border-left: 3px solid var(--warning);
            }
            
            .summary-card.danger {
                background-color: #F9EAE6;
                border-left: 3px solid var(--danger);
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
                line-height: 1.1;
            }
            
            /* Section Styles */
            .report-section {
                margin-bottom: 1.5rem;
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
            
            .section-title i {
                margin-right: 0.35rem;
            }
            
            /* Table Styles */
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
                letter-spacing: 0.02em;
            }
            
            .data-table tbody tr:nth-child(even) td {
                background-color: var(--gray-light);
            }
            
            .data-table tbody tr:hover td {
                background-color: var(--primary-light);
            }

            /* Status Indicators */
            .status-badge {
                display: inline-block;
                padding: 0.2rem 0.6rem;
                border-radius: 15px;
                font-size: 0.75rem;
                font-weight: 500;
                text-align: center;
                white-space: nowrap;
            }
            
            .status-pending {
                color: var(--warning);
                background-color: #FEFAE0;
                border: 1px solid var(--warning);
            }
            
            .status-completed {
                color: var(--success);
                background-color: #E6F5F3;
                border: 1px solid var(--success);
            }
            
            .status-cancelled {
                color: var(--danger);
                background-color: #F9EAE6;
                border: 1px solid var(--danger);
            }

            .product-details {
                margin-top: 0.5rem;
                margin-left: 1rem;
                padding: 0.5rem;
                border-left: 2px solid var(--border-color);
                background-color: var(--background-light);
                border-radius: 0 3px 3px 0;
            }
            
            .product-item {
                margin-bottom: 0.5rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px dashed var(--border-color);
            }
            
            .product-item:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
            }
            
            .product-name {
                font-weight: 600;
                margin-bottom: 0.1rem;
            }
            
            .product-meta {
                display: flex;
                justify-content: space-between;
                font-size: 0.8rem;
                color: var(--text-light);
            }
            
            .product-price {
                color: var(--primary-color);
                font-weight: 500;
            }
            
            .product-status {
                font-size: 0.75rem;
            }
            
            .status-issued {
                color: var (--success);
            }
            
            .status-not-issued {
                color: var(--text-light);
            }

            /* Footer Styles */
            .report-footer {
                margin-top: 2rem;
                border-top: 1px solid var(--border-color);
                padding-top: 0.75rem;
                text-align: center;
                font-size: 0.75rem;
                color: var(--text-light);
            }
            
            .page-number {
                position: absolute;
                bottom: 0.75cm;
                right: 0.75cm;
                font-size: 0.75rem;
                color: var(--text-light);
            }
            
            /* Watermark */
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
            
            /* Print button */
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
                text-transform: uppercase;
                letter-spacing: 0.05em;
                transition: all 0.2s ease;
            }
            
            .print-button:hover {
                background-color: #173b70;
            }

            /* Print-specific styles */
            @media print {
                body {
                    font-size: 9pt;
                }
                
                .print-button, .watermark {
                    display: none;
                }
                
                .data-table {
                    page-break-inside: auto;
                }
                
                tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
                
                .report-container {
                    width: 100%;
                    max-width: 100%;
                }
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
                       
                    </div>
                    <div class="report-date">
                        <div>Generated: ${generatedDate}</div>
                        <div>Ref: KL-${Math.floor(Math.random() * 900000 + 100000)}</div>
                    </div>
                </div>
                
                <h2 class="report-title">Order Report</h2>
                <div class="report-subtitle">
                    <span>${reportTypeLabel}</span>
                    <span class="dot-separator"></span>
                    <span>Period: ${startDate} to ${endDate}</span>
                </div>
            </div>
            
            <div class="summary-cards">
                <div class="summary-card primary">
                    <div class="card-label">Total Orders</div>
                    <div class="card-value">${totalOrders}</div>
                </div>
                <div class="summary-card success">
                    <div class="card-label">Completed</div>
                    <div class="card-value">${completedOrders}</div>
                </div>
                <div class="summary-card warning">
                    <div class="card-label">Pending</div>
                    <div class="card-value">${pendingOrders}</div>
                </div>
                <div class="summary-card danger">
                    <div class="card-label">Cancelled</div>
                    <div class="card-value">${cancelledOrders}</div>
                </div>
                <div class="summary-card primary">
                    <div class="card-label">Total Amount</div>
                    <div class="card-value">${formatCurrency(totalAmount)}</div>
                </div>
            </div>
            
            <div class="report-section">
                <h3 class="section-title">
                    <i class="bi bi-list-ul"></i>
                    Order Details
                </h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            ${reportConfig.includeUserDetails ? '<th>Customer</th>' : ''}
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Bill Ref</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders
													.map(
														(order) => `
                            <tr>
                                <td>#${order.id}</td>
                                <td>${new Date(order.createdAt).toLocaleDateString('en-UK', {
																	day: '2-digit',
																	month: 'short',
																	year: 'numeric'
																})}</td>
                                ${
																	reportConfig.includeUserDetails
																		? `
                                <td>
                                    <div>${order.user.name}</div>
                                    ${order.user.email ? `<div style="font-size: 0.85rem; color: var(--text-light);">${order.user.email}</div>` : ''}
                                </td>`
																		: ''
																}
                                <td>${formatCurrency(order.totalPrice)}</td>
                                <td>
                                    <span class="status-badge status-${order.status.toLowerCase()}">
                                        ${order.status}
                                    </span>
                                </td>
                                <td>${order.billRefNumber}</td>
                            </tr>
                            ${
															reportConfig.includeProductDetails && order.ProductOnOrder.length > 0
																? `
                                <tr>
                                    <td colspan="${reportConfig.includeUserDetails ? '6' : '5'}">
                                        <div class="product-details">
                                            ${order.ProductOnOrder.map(
																							(item: any) => `
                                                <div class="product-item">
                                                    <div class="product-name">${item.product.name}</div>
                                                    <div class="product-meta">
                                                        <span>Quantity: ${item.quantity}</span>
                                                        <span class="product-price">${formatCurrency(item.product.price * item.quantity)}</span>
                                                    </div>
                                                    <div class="product-status ${item.isIssued ? 'status-issued' : 'status-not-issued'}">
                                                        <i class="bi ${item.isIssued ? 'bi-check-circle-fill' : 'bi-clock-history'}"></i>
                                                        ${item.isIssued ? 'Issued' : 'Pending issuance'}
                                                    </div>
                                                </div>
                                            `
																						).join('')}
                                        </div>
                                    </td>
                                </tr>
                            `
																: ''
														}
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
            
            <div class="page-number">Page 1</div>
        </div>
        
        <button class="print-button" onclick="window.print();">
            <i class="bi bi-printer"></i> Print Report
        </button>
        
        <script>
            // Add a download function for direct HTML reports
            document.addEventListener('DOMContentLoaded', function() {
                const urlParams = new URLSearchParams(window.location.search);
                const isReport = urlParams.get('report');
                
                if (isReport === 'true') {
                    // Add a download button
                    const downloadBtn = document.createElement('button');
                    downloadBtn.className = 'print-button';
                    downloadBtn.style.marginTop = '10px';
                    downloadBtn.innerHTML = '<i class="bi bi-file-earmark-pdf"></i> Download PDF';
                    downloadBtn.onclick = function() {
                        window.print();
                    };
                    
                    document.querySelector('.report-container').appendChild(downloadBtn);
                }
            });
        </script>
    </body>
    </html>
    `;
}
