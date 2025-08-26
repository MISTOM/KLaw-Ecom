<script lang="ts">
	import { goto } from '$app/navigation';

	const { data } = $props();
	const legislation = $derived(data.legislation);

	const formatDate = (dateString: string | Date | null) => {
		if (!dateString) return 'Not specified';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
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
	<title>{legislation.title || `${legislation.type} ${legislation.number}`} - Legislation Details</title>
</svelte:head>

<div class="container mx-auto p-6">
	<!-- Header -->
	<div class="mb-8">
		<div class="mb-4 flex items-center gap-4">
			<button
				onclick={() => goto('/admin/legislation')}
				class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
				title="Back to legislation list"
			>
				<i class="bi-arrow-left text-xl"></i>
			</button>
			<div class="flex items-center gap-3">
				<i class="{getTypeIcon(legislation.type)} text-primary text-2xl"></i>
				<div>
					<h1 class="text-fadeblack text-3xl font-bold">
						{legislation.title || `${legislation.type} ${legislation.number}`}
					</h1>
					<div class="mt-2 flex items-center gap-4">
						<span class="text-gray-600">Year: {legislation.year}</span>
						{#if legislation.number}
							<span class="text-gray-600">Number: {legislation.number}</span>
						{/if}
						{#if legislation.statusOnDatabase}
							<span
								class="inline-flex rounded-full px-2 py-1 text-xs font-medium {getStatusBadge(
									legislation.statusOnDatabase
								)}"
							>
								{legislation.statusOnDatabase}
							</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Main Content -->
		<div class="space-y-8 lg:col-span-2">
			<!-- Basic Information -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
					<i class="bi-info-circle text-primary"></i>
					Basic Information
				</h2>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Year</label>
						<p class="text-gray-900">{legislation.year}</p>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Type</label>
						<div class="flex items-center gap-2">
							<i class="{getTypeIcon(legislation.type)} text-primary"></i>
							<span class="text-gray-900">{legislation.type}</span>
						</div>
					</div>
					{#if legislation.number}
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Number</label>
							<p class="text-gray-900">{legislation.number}</p>
						</div>
					{/if}
					{#if legislation.statusOnDatabase}
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Status on Database</label>
							<span
								class="inline-flex rounded-full px-3 py-1 text-sm font-medium {getStatusBadge(
									legislation.statusOnDatabase
								)}"
							>
								{legislation.statusOnDatabase}
							</span>
						</div>
					{/if}
				</div>
				{#if legislation.title}
					<div class="mt-6">
						<label class="mb-1 block text-sm font-medium text-gray-700">Title</label>
						<p class="leading-relaxed text-gray-900">{legislation.title}</p>
					</div>
				{/if}
			</div>

			<!-- Publication Details -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
					<i class="bi-newspaper text-primary"></i>
					Publication Details
				</h2>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					{#if legislation.gazetteDetails}
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Gazette Details</label>
							<p class="text-gray-900">{legislation.gazetteDetails}</p>
						</div>
					{/if}
					{#if legislation.kenyaGazetteSuppNo}
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Kenya Gazette Supplement No.</label>
							<p class="text-gray-900">{legislation.kenyaGazetteSuppNo}</p>
						</div>
					{/if}
					{#if legislation.pagination}
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Pagination</label>
							<p class="text-gray-900">{legislation.pagination}</p>
						</div>
					{/if}
					{#if legislation.availability}
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">Availability</label>
							<p class="text-gray-900">{legislation.availability}</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Additional Information -->
			{#if legislation.revocationsAmendments || legislation.legislativeUpdates || legislation.comments}
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
						<i class="bi-text-paragraph text-primary"></i>
						Additional Information
					</h2>
					<div class="space-y-6">
						{#if legislation.revocationsAmendments}
							<div>
								<label class="mb-2 block text-sm font-medium text-gray-700">Revocations/Amendments</label>
								<p class="rounded-lg bg-gray-50 p-4 leading-relaxed text-gray-900">
									{legislation.revocationsAmendments}
								</p>
							</div>
						{/if}
						{#if legislation.legislativeUpdates}
							<div>
								<label class="mb-2 block text-sm font-medium text-gray-700">Legislative Updates</label>
								<p class="rounded-lg bg-gray-50 p-4 leading-relaxed text-gray-900">
									{legislation.legislativeUpdates}
								</p>
							</div>
						{/if}
						{#if legislation.comments}
							<div>
								<label class="mb-2 block text-sm font-medium text-gray-700">Comments</label>
								<p class="rounded-lg bg-gray-50 p-4 leading-relaxed text-gray-900">{legislation.comments}</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Important Dates -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<i class="bi-calendar-event text-primary"></i>
					Important Dates
				</h3>
				<div class="space-y-4">
					{#if legislation.dateGazetted}
						<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
							<i class="bi-calendar-check text-green-600"></i>
							<div>
								<p class="text-sm font-medium text-gray-700">Date Gazetted</p>
								<p class="text-gray-900">{formatDate(legislation.dateGazetted)}</p>
							</div>
						</div>
					{/if}
					{#if legislation.availabilityAt}
						<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
							<i class="bi-calendar-plus text-blue-600"></i>
							<div>
								<p class="text-sm font-medium text-gray-700">Availability Date</p>
								<p class="text-gray-900">{formatDate(legislation.availabilityAt)}</p>
							</div>
						</div>
					{/if}
					{#if legislation.uploadedAt}
						<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
							<i class="bi-cloud-upload text-purple-600"></i>
							<div>
								<p class="text-sm font-medium text-gray-700">Upload Date</p>
								<p class="text-gray-900">{formatDate(legislation.uploadedAt)}</p>
							</div>
						</div>
					{/if}
					{#if legislation.kgsPublicationAt}
						<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
							<i class="bi-newspaper text-orange-600"></i>
							<div>
								<p class="text-sm font-medium text-gray-700">KGS Publication Date</p>
								<p class="text-gray-900">{formatDate(legislation.kgsPublicationAt)}</p>
							</div>
						</div>
					{/if}
					{#if legislation.commencementAt}
						<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
							<i class="bi-play-circle text-green-600"></i>
							<div>
								<p class="text-sm font-medium text-gray-700">Commencement Date</p>
								<p class="text-gray-900">{formatDate(legislation.commencementAt)}</p>
							</div>
						</div>
					{/if}
					{#if legislation.assentAt}
						<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
							<i class="bi-check-circle text-indigo-600"></i>
							<div>
								<p class="text-sm font-medium text-gray-700">Assent Date</p>
								<p class="text-gray-900">{formatDate(legislation.assentAt)}</p>
							</div>
						</div>
					{/if}
					{#if legislation.dateAvailedAt}
						<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
							<i class="bi-check2-circle text-teal-600"></i>
							<div>
								<p class="text-sm font-medium text-gray-700">Date Availed</p>
								<p class="text-gray-900">{formatDate(legislation.dateAvailedAt)}</p>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<i class="bi-lightning text-primary"></i>
					Quick Actions
				</h3>
				<div class="space-y-3">
					<button
						onclick={() => goto(`/admin/legislation?edit=${legislation.id}`)}
						class="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
					>
						<i class="bi-pencil-square text-primary"></i>
						<span class="text-gray-900">Edit Legislation</span>
					</button>
					<button
						onclick={() => window.print()}
						class="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
					>
						<i class="bi-printer text-gray-600"></i>
						<span class="text-gray-900">Print Details</span>
					</button>
					<button
						onclick={() => goto('/admin/legislation')}
						class="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
					>
						<i class="bi-arrow-left text-gray-600"></i>
						<span class="text-gray-900">Back to List</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');

	@media print {
		.space-y-6 > div:last-child {
			display: none;
		}
	}
</style>
