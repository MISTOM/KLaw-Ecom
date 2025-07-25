<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { getToastState } from '$lib/Toast.svelte';
	import { onMount } from 'svelte';

	const { data } = $props();
	const orderStats = $derived(
		data?.orderStats || {
			totalOrders: 0,
			completedOrders: 0,
			pendingOrders: 0,
			cancelledOrders: 0,
			totalRevenue: 0
		}
	);

	const publicationStats = $derived(
		data?.publicationStats || {
			totalPublications: 0,
			categories: [],
			topPublications: []
		}
	);

	const toast = getToastState();

	// Active tab state
	let activeTab = $state('orders');

	// Order report configuration
	let orderReportConfig = $state({
		dateRange: {
			startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
			endDate: new Date().toISOString().split('T')[0]
		},
		reportType: 'all',
		groupBy: 'none',
		includeUserDetails: true,
		includeProductDetails: false,
		sortBy: 'date',
		sortOrder: 'desc'
	});

	// Publication report configuration
	let publicationReportConfig = $state({
		dateRange: {
			startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
			endDate: new Date().toISOString().split('T')[0]
		},
		categoryId: null as number | null,
		sortBy: 'revenue',
		sortOrder: 'desc',
		includeDetails: true
	});

	let isGenerating = $state(false);
	let generatedPdfUrl = $state<string | null>(null);
	let isHtmlReport = $state(false);
	let reportMessage = $state<string | null>(null);
	let showAdvancedFilters = $state(false);

	// Generate order report function
	async function generateOrderReport() {
		isGenerating = true;
		generatedPdfUrl = null;
		isHtmlReport = false;
		reportMessage = null;

		try {
			const response = await fetch('/api/reports/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(orderReportConfig)
			});

			if (!response.ok) throw new Error('Failed to generate report');

			const result = await response.json();
			generatedPdfUrl = result.pdfUrl;
			isHtmlReport = result.isHtml || false;
			reportMessage = result.message;

			if (isHtmlReport && reportMessage) {
				toast.add('Warning', reportMessage, 'warning', 5000);
			} else {
				toast.add('Success', 'Order report generated successfully', 'success', 2000);
			}
		} catch (error) {
			console.error('Error generating order report:', error);
			toast.add('Error', 'Failed to generate order report', 'error');
		} finally {
			isGenerating = false;
		}
	}

	// Generate publication report function
	async function generatePublicationReport() {
		isGenerating = true;
		generatedPdfUrl = null;
		isHtmlReport = false;
		reportMessage = null;

		try {
			const response = await fetch('/api/reports/publications', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(publicationReportConfig)
			});

			if (!response.ok) throw new Error('Failed to generate report');

			const result = await response.json();
			generatedPdfUrl = result.pdfUrl;
			isHtmlReport = result.isHtml || false;
			reportMessage = result.message;

			if (isHtmlReport && reportMessage) {
				toast.add('Warning', reportMessage, 'warning', 5000);
			} else {
				toast.add('Success', 'Publication report generated successfully', 'success', 2000);
			}
		} catch (error) {
			console.error('Error generating publication report:', error);
			toast.add('Error', 'Failed to generate publication report', 'error');
		} finally {
			isGenerating = false;
		}
	}

	function downloadReport() {
		if (!generatedPdfUrl) return;

		if (isHtmlReport) {
			window.open(`${generatedPdfUrl}?report=true`, '_blank');
		} else {
			const link = document.createElement('a');
			link.href = generatedPdfUrl;
			const reportType = activeTab === 'orders' ? 'order' : 'publication';
			const startDate =
				activeTab === 'orders'
					? orderReportConfig.dateRange.startDate
					: publicationReportConfig.dateRange.startDate;
			const endDate =
				activeTab === 'orders' ? orderReportConfig.dateRange.endDate : publicationReportConfig.dateRange.endDate;
			link.download = `${reportType}-report-${startDate}-to-${endDate}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}

	function formatCurrency(amount: number): string {
		return `KES ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	}

	function resetReport() {
		generatedPdfUrl = null;
		isHtmlReport = false;
		reportMessage = null;
	}

	// Reset report when switching tabs
	$effect(() => {
		activeTab;
		resetReport();
	});
</script>

<svelte:head>
	<title>Reports Dashboard</title>
</svelte:head>

<main class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="border-b border-gray-200 bg-white">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between py-6">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">Reports Dashboard</h1>
					<p class="mt-1 text-sm text-gray-600">Generate comprehensive reports for orders and publications</p>
				</div>
			</div>
		</div>
	</div>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Overview Stats -->
		<div class="mb-8 bg-white p-4">
			<div class="mb-4">
				<h2 class="text-lg font-semibold text-gray-900">Overview Analytics</h2>
				<p class="text-sm text-gray-600">Key performance metrics at a glance</p>
			</div>

			<!-- Stats Grid -->
			<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
				<!-- Total Orders -->
				<div class="group rounded-lg p-4 text-center transition-colors duration-200 hover:bg-gray-50">
					<div class="mb-3 flex justify-center">
						<i class="bi bi-file-earmark-text text-lg text-red-600"></i>
					</div>
					<div class="space-y-1">
						<p class="text-2xl font-bold text-gray-900 transition-colors duration-200 group-hover:text-red-600">
							{orderStats.totalOrders}
						</p>
						<p class="text-sm font-medium text-gray-600">Total Orders</p>
						<p class="text-xs text-gray-500">All time</p>
					</div>
				</div>

				<!-- Completed Orders -->
				<div class="group rounded-lg p-4 text-center transition-colors duration-200 hover:bg-gray-50">
					<div class="mb-3 flex justify-center">
						<i class="bi bi-check-circle text-lg text-green-600"></i>
					</div>
					<div class="space-y-1">
						<p class="text-2xl font-bold text-gray-900 transition-colors duration-200 group-hover:text-green-600">
							{orderStats.completedOrders}
						</p>
						<p class="text-sm font-medium text-gray-600">Completed</p>
						<p class="text-xs text-gray-500">
							{orderStats.totalOrders > 0
								? Math.round((orderStats.completedOrders / orderStats.totalOrders) * 100)
								: 0}% completion rate
						</p>
					</div>
				</div>

				<!-- Pending Orders -->
				<div class="group rounded-lg p-4 text-center transition-colors duration-200 hover:bg-gray-50">
					<div class="mb-3 flex justify-center">
						<i class="bi bi-clock text-lg text-amber-600"></i>
					</div>
					<div class="space-y-1">
						<p class="text-2xl font-bold text-gray-900 transition-colors duration-200 group-hover:text-amber-600">
							{orderStats.pendingOrders}
						</p>
						<p class="text-sm font-medium text-gray-600">Pending</p>
						<p class="text-xs text-gray-500">Awaiting processing</p>
					</div>
				</div>

				<!-- Publications -->
				<div class="group rounded-lg p-4 text-center transition-colors duration-200 hover:bg-gray-50">
					<div class="mb-3 flex justify-center">
						<i class="bi bi-book text-lg text-purple-600"></i>
					</div>
					<div class="space-y-1">
						<p class="text-2xl font-bold text-gray-900 transition-colors duration-200 group-hover:text-purple-600">
							{publicationStats.totalPublications}
						</p>
						<p class="text-sm font-medium text-gray-600">Publications</p>
						<p class="text-xs text-gray-500">Available items</p>
					</div>
				</div>

				<!-- Total Revenue -->
				<div class="group rounded-lg p-4 text-center transition-colors duration-200 hover:bg-gray-50">
					<div class="mb-3 flex justify-center">
						<i class="bi bi-currency-exchange text-lg text-emerald-600"></i>
					</div>
					<div class="space-y-1">
						<p
							class="text-2xl font-bold text-gray-900 transition-colors duration-200 group-hover:text-emerald-600"
						>
							{formatCurrency(orderStats.totalRevenue)}
						</p>
						<p class="text-sm font-medium text-gray-600">Total Revenue</p>
						<p class="text-xs text-gray-500">Gross earnings</p>
					</div>
				</div>
			</div>
		</div>
		<!-- Report Generation Section -->
		<div class="rounded-lg bg-white shadow">
			<!-- Tab Navigation -->
			<div class="border-b border-gray-200">
				<nav class="-mb-px flex" aria-label="Tabs">
					<button
						onclick={() => (activeTab = 'orders')}
						class="cursor-pointer px-4 py-4 text-sm font-medium whitespace-nowrap text-gray-500 hover:bg-gray-100 hover:text-gray-700 {activeTab ===
						'orders'
							? 'border-primary text-primary'
							: ''}"
					>
						<i class="bi bi-file-earmark-text mr-2"></i>
						Order Reports
					</button>

					<button
						onclick={() => (activeTab = 'publications')}
						class="cursor-pointer px-4 py-4 text-sm font-medium whitespace-nowrap text-gray-500 hover:bg-gray-100 hover:text-gray-700 {activeTab ===
						'publications'
							? 'border-primary text-primary'
							: ''}"
					>
						<i class="bi bi-book mr-2"></i>
						Publication Reports
					</button>
				</nav>
			</div>

			<div class="p-6">
				<div class="grid gap-8 lg:grid-cols-2">
					<!-- Configuration Panel -->
					<div class="space-y-6">
						<div>
							<h3 class="mb-4 text-lg leading-6 font-medium text-gray-900">
								{activeTab === 'orders' ? 'Order Report Configuration' : 'Publication Report Configuration'}
							</h3>

							{#if activeTab === 'orders'}
								<!-- Order Report Config -->
								<div class="space-y-4">
									<!-- Date Range -->
									<div class="grid grid-cols-2 gap-4">
										<div>
											<label for="order-start-date" class="mb-1 block text-sm font-medium text-gray-700"
												>Start Date</label
											>
											<input
												type="date"
												id="order-start-date"
												bind:value={orderReportConfig.dateRange.startDate}
												class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
											/>
										</div>
										<div>
											<label for="order-end-date" class="mb-1 block text-sm font-medium text-gray-700"
												>End Date</label
											>
											<input
												type="date"
												id="order-end-date"
												bind:value={orderReportConfig.dateRange.endDate}
												class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
											/>
										</div>
									</div>

									<!-- Order Status -->
									<div>
										<label for="order-status" class="mb-1 block text-sm font-medium text-gray-700"
											>Order Status</label
										>
										<select
											id="order-status"
											bind:value={orderReportConfig.reportType}
											class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
										>
											<option value="all">All Orders</option>
											<option value="pending">Pending Orders</option>
											<option value="completed">Completed Orders</option>
											<option value="cancelled">Cancelled Orders</option>
										</select>
									</div>

									<!-- Quick Options -->
									<div class="flex items-center space-x-6">
										<div class="flex items-center">
											<input
												type="checkbox"
												id="order-include-user"
												bind:checked={orderReportConfig.includeUserDetails}
												class="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
											/>
											<label for="order-include-user" class="ml-2 block text-sm text-gray-900">
												Include Customer Details
											</label>
										</div>
									</div>

									<!-- Advanced Filters Toggle -->
									<div>
										<button
											type="button"
											onclick={() => (showAdvancedFilters = !showAdvancedFilters)}
											class="text-primary flex items-center text-sm hover:text-red-700"
										>
											<i class="bi bi-gear mr-1"></i>
											Advanced Options
											<i class="bi bi-chevron-{showAdvancedFilters ? 'up' : 'down'} ml-1"></i>
										</button>
									</div>

									{#if showAdvancedFilters}
										<div class="space-y-4 rounded-md bg-gray-50 p-4">
											<div class="grid grid-cols-2 gap-4">
												<div>
													<label for="order-sort-by" class="mb-1 block text-sm font-medium text-gray-700"
														>Sort By</label
													>
													<select
														id="order-sort-by"
														bind:value={orderReportConfig.sortBy}
														class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
													>
														<option value="date">Order Date</option>
														<option value="price">Total Price</option>
														<option value="customer">Customer Name</option>
													</select>
												</div>
												<div>
													<label for="order-sort-order" class="mb-1 block text-sm font-medium text-gray-700"
														>Sort Order</label
													>
													<select
														id="order-sort-order"
														bind:value={orderReportConfig.sortOrder}
														class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
													>
														<option value="desc">Newest First</option>
														<option value="asc">Oldest First</option>
													</select>
												</div>
											</div>
											<div class="flex items-center">
												<input
													type="checkbox"
													id="order-include-products"
													bind:checked={orderReportConfig.includeProductDetails}
													class="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
												/>
												<label for="order-include-products" class="ml-2 block text-sm text-gray-900">
													Include Product Details
												</label>
											</div>
										</div>
									{/if}

									<!-- Generate Button -->
									<div class="pt-4">
										<button
											onclick={generateOrderReport}
											disabled={isGenerating}
											class="bg-primary focus:ring-primary flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
										>
											{#if isGenerating}
												<i class="bi bi-hourglass-split mr-2"></i> Generating Report...
											{:else}
												<i class="bi bi-file-earmark-pdf mr-2"></i> Generate Order Report
											{/if}
										</button>
									</div>
								</div>
							{:else}
								<!-- Publication Report Config -->
								<div class="space-y-4">
									<!-- Date Range -->
									<div class="grid grid-cols-2 gap-4">
										<div>
											<label for="pub-start-date" class="mb-1 block text-sm font-medium text-gray-700"
												>Start Date</label
											>
											<input
												type="date"
												id="pub-start-date"
												bind:value={publicationReportConfig.dateRange.startDate}
												class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
											/>
										</div>
										<div>
											<label for="pub-end-date" class="mb-1 block text-sm font-medium text-gray-700"
												>End Date</label
											>
											<input
												type="date"
												id="pub-end-date"
												bind:value={publicationReportConfig.dateRange.endDate}
												class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
											/>
										</div>
									</div>

									<!-- Category Filter -->
									<div>
										<label for="pub-category" class="mb-1 block text-sm font-medium text-gray-700"
											>Category (Optional)</label
										>
										<select
											id="pub-category"
											bind:value={publicationReportConfig.categoryId}
											class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
										>
											<option value={null}>All Categories</option>
											{#each publicationStats.categories as category}
												<option value={category.id}>{category.name} ({category.count})</option>
											{/each}
										</select>
									</div>

									<!-- Sort Options -->
									<div class="grid grid-cols-2 gap-4">
										<div>
											<label for="pub-sort-by" class="mb-1 block text-sm font-medium text-gray-700">Sort By</label>
											<select
												id="pub-sort-by"
												bind:value={publicationReportConfig.sortBy}
												class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
											>
												<option value="revenue">Revenue</option>
												<option value="sales">Sales Count</option>
												<option value="name">Publication Name</option>
												<option value="date">Publication Date</option>
											</select>
										</div>
										<div>
											<label for="pub-sort-order" class="mb-1 block text-sm font-medium text-gray-700"
												>Sort Order</label
											>
											<select
												id="pub-sort-order"
												bind:value={publicationReportConfig.sortOrder}
												class="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
											>
												<option value="desc">Highest First</option>
												<option value="asc">Lowest First</option>
											</select>
										</div>
									</div>

									<!-- Include Details -->
									<div class="flex items-center">
										<input
											type="checkbox"
											id="pub-include-details"
											bind:checked={publicationReportConfig.includeDetails}
											class="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
										/>
										<label for="pub-include-details" class="ml-2 block text-sm text-gray-900">
											Include Purchase Details
										</label>
									</div>

									<!-- Generate Button -->
									<div class="pt-4">
										<button
											onclick={generatePublicationReport}
											disabled={isGenerating}
											class="bg-primary focus:ring-primary flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
										>
											{#if isGenerating}
												<i class="bi bi-hourglass-split mr-2"></i> Generating Report...
											{:else}
												<i class="bi bi-file-earmark-pdf mr-2"></i> Generate Publication Report
											{/if}
										</button>
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- Preview Panel -->
					<div class="space-y-6">
						<div>
							<h3 class="mb-4 text-lg leading-6 font-medium text-gray-900">
								Report Preview
								{#if reportMessage}
									<span class="ml-2 text-sm font-normal text-amber-600">
										<i class="bi bi-exclamation-triangle mr-1"></i>
										{reportMessage}
									</span>
								{/if}
							</h3>

							{#if generatedPdfUrl}
								<div class="space-y-4">
									<!-- Preview iframe -->
									<div class="overflow-hidden rounded-lg border border-gray-300" style="height: 400px;">
										<iframe src={generatedPdfUrl} title="Report Preview" class="h-full w-full"></iframe>
									</div>

									<!-- Download button -->
									<button
										onclick={downloadReport}
										class="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
									>
										<i class="bi bi-download mr-2"></i>
										{isHtmlReport ? 'View & Print Report' : 'Download PDF Report'}
									</button>
								</div>
							{:else}
								<div
									class="rounded-lg border border-dashed border-gray-300 p-12 text-center"
									style="height: 400px; display: flex; align-items: center; justify-content: center;"
								>
									<div class="text-gray-500">
										{#if isGenerating}
											<div class="animate-pulse">
												<i class="bi bi-hourglass-split mb-4 block text-4xl"></i>
												<p class="font-medium">Generating report...</p>
												<p class="text-sm">This may take a few moments</p>
											</div>
										{:else}
											<i class="bi bi-file-earmark-text mb-4 block text-4xl"></i>
											<p class="font-medium">No report generated</p>
											<p class="text-sm">Configure your report settings and click generate</p>
										{/if}
									</div>
								</div>
							{/if}
						</div>

						<!-- Quick Insights -->
						{#if activeTab === 'publications' && publicationStats.topPublications.length > 0}
							<div class="rounded-lg bg-gray-50 p-4">
								<h4 class="mb-3 text-sm font-medium text-gray-900">Top Selling Publications</h4>
								<div class="space-y-2">
									{#each publicationStats.topPublications.slice(0, 5) as publication}
										<div class="flex items-center justify-between text-sm">
											<span class="truncate pr-2 text-gray-600">{publication.name}</span>
											<span class="font-medium text-gray-900">{publication.orderCount} sales</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
