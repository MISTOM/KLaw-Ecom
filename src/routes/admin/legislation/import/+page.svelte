<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	const { form } = $props();

	let files = $state<FileList>();
	let dragOver = $state(false);
	let uploading = $state(false);

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		dragOver = false;
		files = e.dataTransfer?.files;
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		dragOver = true;
	};

	const handleDragLeave = () => {
		dragOver = false;
	};
</script>

<svelte:head>
	<title>Import Legislation - Admin</title>
</svelte:head>

<div class="container mx-auto p-6">
	<div class="mb-8">
		<div class="mb-4 flex items-center gap-4">
			<button
				onclick={() => goto('/admin/legislation')}
				class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
				title="Back to legislation list"
			>
				<i class="bi-arrow-left text-xl"></i>
			</button>
			<div>
				<h1 class="text-fadeblack flex items-center gap-3 text-3xl font-bold">
					<i class="bi-file-earmark-arrow-up text-primary"></i>
					Import Legislation Data
				</h1>
				<p class="mt-2 text-gray-600">Bulk import legislation items from CSV file</p>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Upload Form -->
		<div class="lg:col-span-2">
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
					<i class="bi-cloud-upload text-primary"></i>
					Upload CSV File
				</h2>

				<form
					method="POST"
					action="?/import"
					enctype="multipart/form-data"
					use:enhance={() => {
						uploading = true;
						return async ({ result }) => {
							uploading = false;
							if (result.type === 'success') {
								goto('/admin/legislation');
							}
						};
					}}
				>
					<div
						class="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors {dragOver
							? 'border-primary bg-primary/5'
							: ''}"
						ondrop={handleDrop}
						ondragover={handleDragOver}
						ondragleave={handleDragLeave}
					>
						<div class="space-y-4">
							<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
								<i class="bi-file-earmark-spreadsheet text-2xl text-gray-600"></i>
							</div>
							<div>
								<p class="text-lg font-medium text-gray-900">Drop your CSV file here</p>
								<p class="text-gray-500">or click to browse</p>
							</div>
							<input type="file" name="csvFile" accept=".csv" bind:files class="hidden" id="csvFile" required />
							<label
								for="csvFile"
								class="bg-primary hover:bg-primary/90 inline-flex cursor-pointer items-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-colors"
							>
								<i class="bi-upload"></i>
								Select CSV File
							</label>
						</div>
					</div>

					{#if files && files.length > 0}
						<div class="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
							<div class="flex items-center gap-2">
								<i class="bi-check-circle text-green-600"></i>
								<span class="font-medium text-green-800">File selected: {files[0].name}</span>
								<span class="text-sm text-green-600">({(files[0].size / 1024).toFixed(1)} KB)</span>
							</div>
						</div>
					{/if}

					{#if form?.error}
						<div class="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
							<div class="flex items-center gap-2">
								<i class="bi-exclamation-triangle text-red-600"></i>
								<span class="text-red-800">{form.error}</span>
							</div>
						</div>
					{/if}

					{#if form?.success}
						<div class="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
							<div class="mb-2 flex items-center gap-2">
								<i class="bi-check-circle text-green-600"></i>
								<span class="font-medium text-green-800">Import successful!</span>
							</div>
							<p class="text-green-700">Imported {form.imported} legislation items.</p>
							{#if form.errors}
								<details class="mt-2">
									<summary class="cursor-pointer text-orange-600">View import warnings</summary>
									<ul class="mt-2 text-sm text-orange-700">
										{#each form.errors as error}
											<li>• {error}</li>
										{/each}
									</ul>
								</details>
							{/if}
						</div>
					{/if}

					<div class="mt-6 flex justify-end gap-3">
						<button
							type="button"
							onclick={() => goto('/admin/legislation')}
							class="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={!files || files.length === 0 || uploading}
							class="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
						>
							{#if uploading}
								<i class="bi-arrow-clockwise animate-spin"></i>
								Importing...
							{:else}
								<i class="bi-upload"></i>
								Import Data
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Instructions -->
		<div class="space-y-6">
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<i class="bi-info-circle text-primary"></i>
					CSV Format Requirements
				</h3>
				<div class="space-y-3 text-sm text-gray-700">
					<p><strong>Column Order:</strong></p>
					<ol class="ml-2 list-inside list-decimal space-y-1">
						<li>L.N. NUMBER</li>
						<li>L.N. NAME</li>
						<li>DATE GAZETTED</li>
						<li>GAZETTE DETAILS</li>
						<li>Kenya Gazette Supp. No.</li>
						<li>AVAILABILITY</li>
						<li>Date (Availability)</li>
						<li>Date (Uploaded)</li>
						<li>KGS Publication Date</li>
						<li>Commencement Date</li>
						<li>REVOCATIONS/AMENDMENTS</li>
						<li>PAGINATION</li>
						<li>STATUS ON DATABASE</li>
						<li>LEGISLATIVE UPDATES</li>
						<li>Comments</li>
					</ol>
				</div>
			</div>

			<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
				<div class="flex items-start gap-2">
					<i class="bi-exclamation-triangle mt-1 text-yellow-600"></i>
					<div>
						<h4 class="font-medium text-yellow-800">Important Notes</h4>
						<ul class="mt-2 space-y-1 text-sm text-yellow-700">
							<li>• First row should contain headers</li>
							<li>• Dates should be in MM/DD/YYYY format</li>
							<li>• Empty cells are allowed</li>
							<li>• Duplicate entries will be skipped</li>
						</ul>
					</div>
				</div>
			</div>

			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<i class="bi-download text-primary"></i>
					Sample Template
				</h3>
				<p class="mb-4 text-sm text-gray-700">Download a sample CSV template to get started:</p>
				<a
					href="/sample-legislation-template.csv"
					download
					class="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
				>
					<i class="bi-download"></i>
					Download Template
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');

	.animate-spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
