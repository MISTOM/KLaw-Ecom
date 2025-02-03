<script lang="ts">
	import { enhance } from '$app/forms';
	import { getToastState } from '$lib/Toast.svelte.js';
	import { slide } from 'svelte/transition';

	let { data } = $props();
	let convenienceFee = $derived(data.convenienceFee || null);

	// State variables
	let showAddOrEditForm = $state(false);
	let newFeeAmount = $state('');
	let formErrors = $state();

	const toast = getToastState();

	// Open/close form
	function toggleForm() {
		showAddOrEditForm = !showAddOrEditForm;
		formErrors = '';
		// If editing, set the amount to convenienceFee.amount
		if (convenienceFee && showAddOrEditForm) {
			newFeeAmount = convenienceFee.amount.toString();
		} else {
			newFeeAmount = '';
		}
	}
</script>

<svelte:head>
	<title>Convenience Fee</title>
</svelte:head>

<div class="container mx-auto p-6">
	<div class="mb-6">
		<div class="mb-4 flex items-center justify-between">
			<h1 class="text-3xl font-bold">Convenience Fee Management</h1>

			{#if convenienceFee}
				<!-- If a fee exists, show 'Edit Fee' button -->
				<button class="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white" onclick={toggleForm}>
					{showAddOrEditForm ? 'Cancel' : 'Edit Fee'}
				</button>
			{:else}
				<!-- If no fee exists, show 'Add Fee' button -->
				<button class="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white" onclick={toggleForm}>
					{showAddOrEditForm ? 'Cancel' : 'Add Fee'}
				</button>
			{/if}
		</div>

		{#if showAddOrEditForm}
			<!-- Add/Edit Fee Form -->
			<form
				action={convenienceFee ? '?/update_fee' : '?/add_fee'}
				method="POST"
				class="mb-6 rounded-lg bg-white p-6 shadow-sm"
				in:slide
				out:slide={{ duration: 150 }}
				use:enhance={() => {
					return async ({ update, result }) => {
						if (result.type === 'success') {
							// Close form if successful
							toggleForm();
							toast.add('Success', 'Convenience fee saved successfully', 'success');
						} else if (result.type === 'failure') {
							formErrors = result?.data?.errors ?? 'Error saving convenience fee.';
							toast.add('Error', `${result?.data?.errors ?? 'Error saving convenience fee.'}`, 'error');
						}
						await update();
					};
				}}
			>
				<h2 class="mb-4 text-xl font-semibold">
					{convenienceFee ? 'Update Convenience Fee' : 'Add New Convenience Fee'}
				</h2>

				{#if formErrors}
					<span class="text-sm text-red-600">{formErrors}</span>
				{/if}

				<div class="mb-4">
					<label for="feeAmount" class="mb-1 block text-sm font-medium text-gray-700"> Fee Amount </label>
					<input
						id="feeAmount"
						type="number"
						step="0.01"
						name="amount"
						bind:value={newFeeAmount}
						class="focus:ring-primary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-hidden"
						oninput={() => formErrors && (formErrors = '')}
					/>
				</div>

				<!-- If editing, pass the existing fee ID -->
				{#if convenienceFee}
					<input type="hidden" name="id" value={convenienceFee.id} />
				{/if}

				<button type="submit" class="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white">
					{convenienceFee ? 'Update Fee' : 'Save Fee'}
				</button>
			</form>
		{/if}

		<!-- Convenience Fee Table -->
		<div class="overflow-x-auto rounded-md border border-gray-200 bg-white">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"> Amount </th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"> Actions </th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#if !convenienceFee}
						<tr>
							<td class="px-6 py-4 text-center text-sm text-gray-500" colspan="2"> No convenience fee set </td>
						</tr>
					{:else}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4">
								<div class=" font-bold text-gray-900">
									KES {convenienceFee.amount.toFixed(2)}
								</div>
							</td>
							<td class="px-6 py-4">
								<div class="flex space-x-5">
									<button
										class="text-primary hover:text-primary/80"
										onclick={() => {
											toggleForm();
										}}
									>
										Edit
									</button>
									<!-- Delete Fee Form -->
									<form
										method="POST"
										action="?/delete_fee"
										use:enhance={({ cancel }) => {
											if (!confirm('Are you sure you want to delete this convenience fee?')) {
												cancel();
											}
										}}
									>
										<input type="hidden" name="id" value={convenienceFee.id} />
										<button type="submit" class="text-red-600 hover:text-red-800"> Delete </button>
									</form>
								</div>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
