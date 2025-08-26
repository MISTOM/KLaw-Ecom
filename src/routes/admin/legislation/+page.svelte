<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import Modal from '$lib/components/Modal.svelte';
	import { legislationSchema, type FormErrors, type LegislationData } from '$lib/validations/validationSchemas.js';

	const { form, data } = $props();
	const legislations = $derived(data.legislations || []);
	const currentPage = $derived(data.page || 1);
	const totalPages = $derived(data.totalPages || 1);
	const searchQuery = $derived(data.search || '');

	let showAddModal = $state(false);
	let showEditModal = $state(false);
	let showDeleteModal = $state(false);
	let selectedLegislation = $state<any>(null);

	// Form state
	let year = $state(form?.data?.year || new Date().getFullYear());
	let type = $state<LegislationData['type']>((form?.data?.type as LegislationData['type']) ?? 'ACT');
	let number = $state(form?.data?.number || '');
	let title = $state(form?.data?.title || '');
	let dateGazetted = $state(
		form?.data?.dateGazetted ? new Date(form.data.dateGazetted).toISOString().split('T')[0] : ''
	);
	let gazetteDetails = $state(form?.data?.gazetteDetails || '');
	let availabilityAt = $state(
		form?.data?.availabilityAt ? new Date(form.data.availabilityAt).toISOString().split('T')[0] : ''
	);
	let uploadedAt = $state(
		form?.data?.uploadedAt ? new Date(form.data.uploadedAt).toISOString().split('T')[0] : ''
	);
	let kgsPublicationAt = $state(
		form?.data?.kgsPublicationAt ? new Date(form.data.kgsPublicationAt).toISOString().split('T')[0] : ''
	);
	let commencementAt = $state(
		form?.data?.commencementAt ? new Date(form.data.commencementAt).toISOString().split('T')[0] : ''
	);
	let pagination = $state(form?.data?.pagination || '');
	let statusOnDatabase = $state(form?.data?.statusOnDatabase || '');
	let legislativeUpdates = $state(form?.data?.legislativeUpdates || '');
	let comments = $state(form?.data?.comments || '');
	let kenyaGazetteSuppNo = $state(form?.data?.kenyaGazetteSuppNo || '');
	let revocationsAmendments = $state(form?.data?.revocationsAmendments || '');
	let assentAt = $state(form?.data?.assentAt ? new Date(form.data.assentAt).toISOString().split('T')[0] : '');
	let dateAvailedAt = $state(
		form?.data?.dateAvailedAt ? new Date(form.data.dateAvailedAt).toISOString().split('T')[0] : ''
	);
	let availability = $state(form?.data?.availability || '');

	let formErrors = $state<FormErrors<LegislationData>>(form?.errors || {});

	const getFieldError = (field: keyof FormErrors<LegislationData>) => formErrors[field]?.[0] || '';

	// Validate a single field
	const validateField = <K extends keyof LegislationData>(field: K, value: LegislationData[K]) => {
		const fieldSchema = legislationSchema.shape[field];
		const result = fieldSchema.safeParse(value);
		formErrors[field] = result.success ? [] : result.error?.flatten().formErrors || [];
	};

	const resetForm = () => {
		year = new Date().getFullYear();
		type = 'ACT';
		number = '';
		title = '';
		dateGazetted = '';
		gazetteDetails = '';
		availabilityAt = '';
		uploadedAt = '';
		kgsPublicationAt = '';
		commencementAt = '';
		pagination = '';
		statusOnDatabase = '';
		legislativeUpdates = '';
		comments = '';
		kenyaGazetteSuppNo = '';
		revocationsAmendments = '';
		assentAt = '';
		dateAvailedAt = '';
		availability = '';
		formErrors = {};
	};

	const openAddModal = () => {
		resetForm();
		showAddModal = true;
	};

	const openEditModal = (legislation: any) => {
		selectedLegislation = legislation;
		year = legislation.year;
		type = legislation.type;
		number = legislation.number || '';
		title = legislation.title || '';
		dateGazetted = legislation.dateGazetted ? new Date(legislation.dateGazetted).toISOString().split('T')[0] : '';
		gazetteDetails = legislation.gazetteDetails || '';
		availabilityAt = legislation.availabilityAt
			? new Date(legislation.availabilityAt).toISOString().split('T')[0]
			: '';
		uploadedAt = legislation.uploadedAt ? new Date(legislation.uploadedAt).toISOString().split('T')[0] : '';
		kgsPublicationAt = legislation.kgsPublicationAt
			? new Date(legislation.kgsPublicationAt).toISOString().split('T')[0]
			: '';
		commencementAt = legislation.commencementAt
			? new Date(legislation.commencementAt).toISOString().split('T')[0]
			: '';
		pagination = legislation.pagination || '';
		statusOnDatabase = legislation.statusOnDatabase || '';
		legislativeUpdates = legislation.legislativeUpdates || '';
		comments = legislation.comments || '';
		kenyaGazetteSuppNo = legislation.kenyaGazetteSuppNo || '';
		revocationsAmendments = legislation.revocationsAmendments || '';
		assentAt = legislation.assentAt ? new Date(legislation.assentAt).toISOString().split('T')[0] : '';
		dateAvailedAt = legislation.dateAvailedAt
			? new Date(legislation.dateAvailedAt).toISOString().split('T')[0]
			: '';
		availability = legislation.availability || '';
		formErrors = {};
		showEditModal = true;
	};

	const openDeleteModal = (legislation: any) => {
		selectedLegislation = legislation;
		showDeleteModal = true;
	};

	const formatDate = (date: string | Date | null) => {
		if (!date) return 'N/A';
		const d = typeof date === 'string' ? new Date(date) : date;
		const time = d.getTime();
		return Number.isNaN(time) ? 'N/A' : d.toLocaleDateString();
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'ACT':
				return 'bi-journal-text';
			case 'SUBLEG':
				return 'bi-file-earmark-text';
			case 'CORRIGENDA':
				return 'bi-pencil-square';
			default:
				return 'bi-file-text';
		}
	};

	const getStatusBadge = (status: string | null) => {
		if (!status) return 'bg-gray-100 text-gray-800';
		switch (status.toUpperCase()) {
			case 'ONLINE':
				return 'bg-green-100 text-green-800';
			case 'PENDING':
				return 'bg-yellow-100 text-yellow-800';
			case 'OFFLINE':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};
</script>

<svelte:head>
	<title>Legislation Management - Admin</title>
</svelte:head>

<div class="container mx-auto p-6">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-fadeblack flex items-center gap-3 text-3xl font-bold">
					<i class="bi-journal-bookmark text-primary"></i>
					Legislation Management
				</h1>
				<p class="mt-2 text-gray-600">Manage legislation items and their status</p>
			</div>
			<div class="flex gap-3">
				<button
					class="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-colors"
					onclick={openAddModal}
				>
					<i class="bi-plus-lg"></i>
					Add Legislation
				</button>
			</div>
		</div>
	</div>

	<!-- Search and Filter Bar -->
	<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<form method="GET" class="flex flex-col gap-4 sm:flex-row">
			<div class="flex-1">
				<div class="relative">
					<i class="bi-search absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"></i>
					<input
						type="text"
						name="search"
						value={searchQuery}
						placeholder="Search by title, number..."
						class="focus:ring-primary w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2"
					/>
				</div>
			</div>
			<button
				type="submit"
				class="bg-fadeblack hover:bg-fadeblack/90 flex items-center gap-2 rounded-lg px-6 py-2 font-medium text-white transition-colors"
			>
				<i class="bi-funnel"></i>
				Filter
			</button>
		</form>
	</div>

	<!-- Legislation Table -->
	<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="border-b border-gray-200 bg-gray-50">
					<tr>
						<th class="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Type</th>
						<th class="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Year</th>
						<th class="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Number</th>
						<th class="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Title</th>
						<th class="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Date Gazetted</th
						>
						<th class="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
						<th class="px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each legislations as legislation (legislation.id)}
						<tr class="transition-colors hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="flex items-center gap-2">
									<i class="{getTypeIcon(legislation.type)} text-primary"></i>
									<span class="text-sm font-medium text-gray-900">{legislation.type}</span>
								</div>
							</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{legislation.year}</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{legislation.number || 'N/A'}</td>
							<td class="max-w-xs truncate px-6 py-4 text-sm text-gray-900" title={legislation.title}>
								{legislation.title || 'N/A'}
							</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
								>{formatDate(legislation.dateGazetted)}</td
							>
							<td class="px-6 py-4 whitespace-nowrap">
								<span
									class="inline-flex rounded-full px-2 py-1 text-xs font-medium {getStatusBadge(
										legislation.statusOnDatabase
									)}"
								>
									{legislation.statusOnDatabase || 'Unknown'}
								</span>
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
								<div class="flex items-center justify-end gap-2">
									<button
										class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
										onclick={() => goto(`/admin/legislation/${legislation.id}`)}
										title="View legislation details"
										aria-label="View legislation details"
									>
										<i class="bi-eye"></i>
									</button>
									<button
										class="text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg p-2 transition-colors"
										onclick={() => openEditModal(legislation)}
										title="Edit legislation"
										aria-label="Edit legislation"
									>
										<i class="bi-pencil-square"></i>
									</button>
									<button
										class="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-800"
										onclick={() => openDeleteModal(legislation)}
										title="Delete legislation"
										aria-label="Delete legislation"
									>
										<i class="bi-trash"></i>
									</button>
								</div>
							</td>
						</tr>
					{/each}
					{#if legislations.length === 0}
						<tr>
							<td colspan="7" class="px-6 py-12 text-center text-gray-500">
								<div class="flex flex-col items-center gap-4">
									<i class="bi-inbox text-6xl text-gray-300"></i>
									<div>
										<h3 class="text-lg font-medium text-gray-900">No legislation found</h3>
										<p class="text-gray-500">Get started by adding your first legislation item.</p>
									</div>
								</div>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="mt-6 flex items-center justify-between">
			<div class="text-sm text-gray-500">
				Page {currentPage} of {totalPages}
			</div>
			<div class="flex gap-2">
				{#if currentPage > 1}
					<a
						href="?page={currentPage - 1}{searchQuery ? `&search=${searchQuery}` : ''}"
						class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					>
						<i class="bi-chevron-left"></i>
						Previous
					</a>
				{/if}
				{#if currentPage < totalPages}
					<a
						href="?page={currentPage + 1}{searchQuery ? `&search=${searchQuery}` : ''}"
						class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					>
						Next
						<i class="bi-chevron-right"></i>
					</a>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Add Modal -->
<Modal bind:show={showAddModal} title="Add New Legislation" modalClass="max-w-4xl">
	<form
		method="POST"
		action="?/create"
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					showAddModal = false;
					goto('', { invalidateAll: true });
				}
			};
		}}
		class="flex h-full flex-col"
	>
		<!-- Scrollable form content -->
		<div class="flex-1 space-y-6">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Basic Information -->
				<div class="md:col-span-2">
					<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<i class="bi-info-circle text-primary"></i>
						Basic Information
					</h3>
				</div>

				<div>
					<label for="year" class="mb-2 block text-sm font-medium text-gray-700">Year *</label>
					<input
						type="number"
						id="year"
						name="year"
						bind:value={year}
						onblur={() => validateField('year', year)}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
						min="1900"
						max={new Date().getFullYear() + 5}
						required
					/>
					{#if getFieldError('year')}
						<p class="mt-1 text-sm text-red-600">{getFieldError('year')}</p>
					{/if}
				</div>

				<div>
					<label for="type" class="mb-2 block text-sm font-medium text-gray-700">Type *</label>
					<select
						id="type"
						name="type"
						bind:value={type}
						onchange={() => validateField('type', type)}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
						required
					>
						<option value="ACT">ACT</option>
						<option value="SUBLEG">SUBLEG</option>
						<option value="CORRIGENDA">CORRIGENDA</option>
					</select>
					{#if getFieldError('type')}
						<p class="mt-1 text-sm text-red-600">{getFieldError('type')}</p>
					{/if}
				</div>

				<div>
					<label for="number" class="mb-2 block text-sm font-medium text-gray-700">Number</label>
					<input
						type="text"
						id="number"
						name="number"
						bind:value={number}
						onblur={() => validateField('number', number)}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
						placeholder="e.g., L.N. 1 of 2023"
					/>
					{#if getFieldError('number')}
						<p class="mt-1 text-sm text-red-600">{getFieldError('number')}</p>
					{/if}
				</div>

				<div>
					<label for="statusOnDatabase" class="mb-2 block text-sm font-medium text-gray-700"
						>Status on Database</label
					>
					<select
						id="statusOnDatabase"
						name="statusOnDatabase"
						bind:value={statusOnDatabase}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					>
						<option value="">Select status...</option>
						<option value="ONLINE">ONLINE</option>
						<option value="PENDING">PENDING</option>
						<option value="OFFLINE">OFFLINE</option>
					</select>
				</div>

				<div class="md:col-span-2">
					<label for="title" class="mb-2 block text-sm font-medium text-gray-700">Title</label>
					<input
						type="text"
						id="title"
						name="title"
						bind:value={title}
						onblur={() => validateField('title', title)}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
						placeholder="Enter legislation title"
					/>
					{#if getFieldError('title')}
						<p class="mt-1 text-sm text-red-600">{getFieldError('title')}</p>
					{/if}
				</div>

				<!-- Dates Section -->
				<div class="md:col-span-2">
					<h3 class="mt-6 mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<i class="bi-calendar-event text-primary"></i>
						Important Dates
					</h3>
				</div>

				<div>
					<label for="dateGazetted" class="mb-2 block text-sm font-medium text-gray-700">Date Gazetted</label>
					<input
						type="date"
						id="dateGazetted"
						name="dateGazetted"
						bind:value={dateGazetted}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					/>
				</div>

				<div>
					<label for="availabilityAt" class="mb-2 block text-sm font-medium text-gray-700">Availability Date</label
					>
					<input
						type="date"
						id="availabilityAt"
						name="availabilityAt"
						bind:value={availabilityAt}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					/>
				</div>

				<div>
					<label for="uploadedAt" class="mb-2 block text-sm font-medium text-gray-700">Upload Date</label>
					<input
						type="date"
						id="uploadedAt"
						name="uploadedAt"
						bind:value={uploadedAt}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					/>
				</div>

				<div>
					<label for="kgsPublicationAt" class="mb-2 block text-sm font-medium text-gray-700"
						>KGS Publication Date</label
					>
					<input
						type="date"
						id="kgsPublicationAt"
						name="kgsPublicationAt"
						bind:value={kgsPublicationAt}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					/>
				</div>

				<div>
					<label for="commencementAt" class="mb-2 block text-sm font-medium text-gray-700">Commencement Date</label
					>
					<input
						type="date"
						id="commencementAt"
						name="commencementAt"
						bind:value={commencementAt}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					/>
				</div>

				<div>
					<label for="assentAt" class="mb-2 block text-sm font-medium text-gray-700">Assent Date</label>
					<input
						type="date"
						id="assentAt"
						name="assentAt"
						bind:value={assentAt}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					/>
				</div>

				<div>
					<label for="dateAvailedAt" class="mb-2 block text-sm font-medium text-gray-700">Date Availed</label>
					<input
						type="date"
						id="dateAvailedAt"
						name="dateAvailedAt"
						bind:value={dateAvailedAt}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					/>
				</div>

				<!-- Publication Details -->
				<div class="md:col-span-2">
					<h3 class="mt-6 mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<i class="bi-newspaper text-primary"></i>
						Publication Details
					</h3>
				</div>

				<div>
					<label for="gazetteDetails" class="mb-2 block text-sm font-medium text-gray-700">Gazette Details</label>
					<input
						type="text"
						id="gazetteDetails"
						name="gazetteDetails"
						bind:value={gazetteDetails}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
						placeholder="e.g., Vol. CXXV- No. 26"
					/>
				</div>

				<div>
					<label for="kenyaGazetteSuppNo" class="mb-2 block text-sm font-medium text-gray-700"
						>Kenya Gazette Supp. No.</label
					>
					<input
						type="text"
						id="kenyaGazetteSuppNo"
						name="kenyaGazetteSuppNo"
						bind:value={kenyaGazetteSuppNo}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
						placeholder="e.g., 3"
					/>
				</div>

				<div>
					<label for="pagination" class="mb-2 block text-sm font-medium text-gray-700">Pagination</label>
					<input
						type="text"
						id="pagination"
						name="pagination"
						bind:value={pagination}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
						placeholder="e.g., 8"
					/>
				</div>

				<div>
					<label for="availability" class="mb-2 block text-sm font-medium text-gray-700">Availability</label>
					<input
						type="text"
						id="availability"
						name="availability"
						bind:value={availability}
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
						placeholder="e.g., Public Domain"
					/>
				</div>

				<!-- Additional Information -->
				<div class="md:col-span-2">
					<h3 class="mt-6 mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<i class="bi-text-paragraph text-primary"></i>
						Additional Information
					</h3>
				</div>

				<div class="md:col-span-2">
					<label for="revocationsAmendments" class="mb-2 block text-sm font-medium text-gray-700"
						>Revocations/Amendments</label
					>
					<textarea
						id="revocationsAmendments"
						name="revocationsAmendments"
						bind:value={revocationsAmendments}
						rows="3"
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
						placeholder="Enter revocations or amendments details"
					></textarea>
				</div>

				<div class="md:col-span-2">
					<label for="legislativeUpdates" class="mb-2 block text-sm font-medium text-gray-700"
						>Legislative Updates</label
					>
					<textarea
						id="legislativeUpdates"
						name="legislativeUpdates"
						bind:value={legislativeUpdates}
						rows="3"
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
						placeholder="Enter legislative updates"
					></textarea>
				</div>

				<div class="md:col-span-2">
					<label for="comments" class="mb-2 block text-sm font-medium text-gray-700">Comments</label>
					<textarea
						id="comments"
						name="comments"
						bind:value={comments}
						rows="3"
						class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
						placeholder="Enter additional comments"
					></textarea>
				</div>
			</div>
		</div>

		<!-- Fixed footer with action buttons -->
		<div class="mt-6 flex shrink-0 justify-end gap-3 border-t border-gray-200 pt-6">
			<button
				type="button"
				class="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
				onclick={() => {
					showAddModal = false;
				}}
			>
				Cancel
			</button>
			<button
				type="submit"
				class="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-2 font-medium text-white transition-colors"
			>
				<i class="bi-plus-lg"></i>
				Add Legislation
			</button>
		</div>
	</form>
</Modal>

<!-- Edit Modal -->
<Modal bind:show={showEditModal} title="Edit Legislation" modalClass="max-w-4xl">
	<form
		method="POST"
		action="?/update"
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					showEditModal = false;
					goto('', { invalidateAll: true });
				}
			};
		}}
	>
		<input type="hidden" name="id" value={selectedLegislation?.id} />

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Same form fields as Add Modal but with edit action -->
			<!-- Basic Information -->
			<div class="md:col-span-2">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<i class="bi-info-circle text-primary"></i>
					Basic Information
				</h3>
			</div>

			<div>
				<label for="edit-year" class="mb-2 block text-sm font-medium text-gray-700">Year *</label>
				<input
					type="number"
					id="edit-year"
					name="year"
					bind:value={year}
					onblur={() => validateField('year', year)}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					min="1900"
					max={new Date().getFullYear() + 5}
					required
				/>
				{#if getFieldError('year')}
					<p class="mt-1 text-sm text-red-600">{getFieldError('year')}</p>
				{/if}
			</div>

			<div>
				<label for="edit-type" class="mb-2 block text-sm font-medium text-gray-700">Type *</label>
				<select
					id="edit-type"
					name="type"
					bind:value={type}
					onchange={() => validateField('type', type)}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					required
				>
					<option value="ACT">ACT</option>
					<option value="SUBLEG">SUBLEG</option>
					<option value="CORRIGENDA">CORRIGENDA</option>
				</select>
				{#if getFieldError('type')}
					<p class="mt-1 text-sm text-red-600">{getFieldError('type')}</p>
				{/if}
			</div>

			<div>
				<label for="edit-number" class="mb-2 block text-sm font-medium text-gray-700">Number</label>
				<input
					type="text"
					id="edit-number"
					name="number"
					bind:value={number}
					onblur={() => validateField('number', number)}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					placeholder="e.g., L.N. 1 of 2023"
				/>
				{#if getFieldError('number')}
					<p class="mt-1 text-sm text-red-600">{getFieldError('number')}</p>
				{/if}
			</div>

			<div>
				<label for="edit-statusOnDatabase" class="mb-2 block text-sm font-medium text-gray-700"
					>Status on Database</label
				>
				<select
					id="edit-statusOnDatabase"
					name="statusOnDatabase"
					bind:value={statusOnDatabase}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
				>
					<option value="">Select status...</option>
					<option value="ONLINE">ONLINE</option>
					<option value="PENDING">PENDING</option>
					<option value="OFFLINE">OFFLINE</option>
				</select>
			</div>

			<div class="md:col-span-2">
				<label for="edit-title" class="mb-2 block text-sm font-medium text-gray-700">Title</label>
				<input
					type="text"
					id="edit-title"
					name="title"
					bind:value={title}
					onblur={() => validateField('title', title)}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					placeholder="Enter legislation title"
				/>
				{#if getFieldError('title')}
					<p class="mt-1 text-sm text-red-600">{getFieldError('title')}</p>
				{/if}
			</div>

			<!-- Dates Section -->
			<div class="md:col-span-2">
				<h3 class="mt-6 mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<i class="bi-calendar-event text-primary"></i>
					Important Dates
				</h3>
			</div>

			<div>
				<label for="edit-dateGazetted" class="mb-2 block text-sm font-medium text-gray-700">Date Gazetted</label>
				<input
					type="date"
					id="edit-dateGazetted"
					name="dateGazetted"
					bind:value={dateGazetted}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
				/>
			</div>

			<div>
				<label for="edit-availabilityAt" class="mb-2 block text-sm font-medium text-gray-700"
					>Availability Date</label
				>
				<input
					type="date"
					id="edit-availabilityAt"
					name="availabilityAt"
					bind:value={availabilityAt}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
				/>
			</div>

			<div>
				<label for="edit-uploadedAt" class="mb-2 block text-sm font-medium text-gray-700">Upload Date</label>
				<input
					type="date"
					id="edit-uploadedAt"
					name="uploadedAt"
					bind:value={uploadedAt}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
				/>
			</div>

			<div>
				<label for="edit-kgsPublicationAt" class="mb-2 block text-sm font-medium text-gray-700"
					>KGS Publication Date</label
				>
				<input
					type="date"
					id="edit-kgsPublicationAt"
					name="kgsPublicationAt"
					bind:value={kgsPublicationAt}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
				/>
			</div>

			<div>
				<label for="edit-commencementAt" class="mb-2 block text-sm font-medium text-gray-700"
					>Commencement Date</label
				>
				<input
					type="date"
					id="edit-commencementAt"
					name="commencementAt"
					bind:value={commencementAt}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
				/>
			</div>

			<div>
				<label for="edit-assentAt" class="mb-2 block text-sm font-medium text-gray-700">Assent Date</label>
				<input
					type="date"
					id="edit-assentAt"
					name="assentAt"
					bind:value={assentAt}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
				/>
			</div>

			<div>
				<label for="edit-dateAvailedAt" class="mb-2 block text-sm font-medium text-gray-700">Date Availed</label>
				<input
					type="date"
					id="edit-dateAvailedAt"
					name="dateAvailedAt"
					bind:value={dateAvailedAt}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
				/>
			</div>

			<!-- Publication Details -->
			<div class="md:col-span-2">
				<h3 class="mt-6 mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<i class="bi-newspaper text-primary"></i>
					Publication Details
				</h3>
			</div>

			<div>
				<label for="edit-gazetteDetails" class="mb-2 block text-sm font-medium text-gray-700"
					>Gazette Details</label
				>
				<input
					type="text"
					id="edit-gazetteDetails"
					name="gazetteDetails"
					bind:value={gazetteDetails}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					placeholder="e.g., Vol. CXXV- No. 26"
				/>
			</div>

			<div>
				<label for="edit-kenyaGazetteSuppNo" class="mb-2 block text-sm font-medium text-gray-700"
					>Kenya Gazette Supp. No.</label
				>
				<input
					type="text"
					id="edit-kenyaGazetteSuppNo"
					name="kenyaGazetteSuppNo"
					bind:value={kenyaGazetteSuppNo}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					placeholder="e.g., 3"
				/>
			</div>

			<div>
				<label for="edit-pagination" class="mb-2 block text-sm font-medium text-gray-700">Pagination</label>
				<input
					type="text"
					id="edit-pagination"
					name="pagination"
					bind:value={pagination}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					placeholder="e.g., 8"
				/>
			</div>

			<div>
				<label for="edit-availability" class="mb-2 block text-sm font-medium text-gray-700">Availability</label>
				<input
					type="text"
					id="edit-availability"
					name="availability"
					bind:value={availability}
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					placeholder="e.g., Public Domain"
				/>
			</div>

			<!-- Additional Information -->
			<div class="md:col-span-2">
				<h3 class="mt-6 mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<i class="bi-text-paragraph text-primary"></i>
					Additional Information
				</h3>
			</div>

			<div class="md:col-span-2">
				<label for="edit-revocationsAmendments" class="mb-2 block text-sm font-medium text-gray-700"
					>Revocations/Amendments</label
				>
				<textarea
					id="edit-revocationsAmendments"
					name="revocationsAmendments"
					bind:value={revocationsAmendments}
					rows="3"
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					placeholder="Enter revocations or amendments details"
				></textarea>
			</div>

			<div class="md:col-span-2">
				<label for="edit-legislativeUpdates" class="mb-2 block text-sm font-medium text-gray-700"
					>Legislative Updates</label
				>
				<textarea
					id="edit-legislativeUpdates"
					name="legislativeUpdates"
					bind:value={legislativeUpdates}
					rows="3"
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					placeholder="Enter legislative updates"
				></textarea>
			</div>

			<div class="md:col-span-2">
				<label for="edit-comments" class="mb-2 block text-sm font-medium text-gray-700">Comments</label>
				<textarea
					id="edit-comments"
					name="comments"
					bind:value={comments}
					rows="3"
					class="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
					placeholder="Enter additional comments"
				></textarea>
			</div>
		</div>

		<div class="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6">
			<button
				type="button"
				class="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
				onclick={() => {
					showEditModal = false;
				}}
			>
				Cancel
			</button>
			<button
				type="submit"
				class="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-2 font-medium text-white transition-colors"
			>
				<i class="bi-check-lg"></i>
				Update Legislation
			</button>
		</div>
	</form>
</Modal>

<!-- Delete Confirmation Modal -->
<Modal bind:show={showDeleteModal} title="Delete Legislation" modalClass="max-w-md">
	<div class="text-center">
		<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
			<i class="bi-exclamation-triangle text-xl text-red-600"></i>
		</div>
		<h3 class="mb-2 text-lg font-medium text-gray-900">Delete Legislation</h3>
		<p class="mb-6 text-sm text-gray-500">
			Are you sure you want to delete <strong
				>{selectedLegislation?.title || `${selectedLegislation?.type} ${selectedLegislation?.number}`}</strong
			>? This action cannot be undone.
		</p>
		<div class="flex justify-center gap-3">
			<button
				class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
				onclick={() => {
					showDeleteModal = false;
				}}
			>
				Cancel
			</button>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							showDeleteModal = false;
							goto('', { invalidateAll: true });
						}
					};
				}}
			>
				<input type="hidden" name="id" value={selectedLegislation?.id} />
				<button
					type="submit"
					class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
				>
					<i class="bi-trash"></i>
					Delete
				</button>
			</form>
		</div>
	</div>
</Modal>

<style>
	@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
</style>
