<script lang="ts">
	import { enhance } from '$app/forms';
	import { getToastState } from '$lib/Toast.svelte.js';
	import Modal from '$lib/components/Modal.svelte';
	import type { PageData, ActionData } from './$types';
	import type { FormErrors, SubscriptionPlanData } from '$lib/validations/validationSchemas';

	const { data, form }: { data: PageData; form: ActionData } = $props();
	const toast = getToastState();

	let plans = $derived(data.plans || []);

	// State variables
	let showModal = $state(false);
	let editingPlan = $state<(typeof plans)[0] | null>(null);
	let formData = $state<Partial<SubscriptionPlanData>>({
		name: '',
		description: '',
		price: 0,
		duration: 30,
		isActive: true
	});
	let formErrors = $state<FormErrors<SubscriptionPlanData>>({});
	let deleteConfirm = $state<number | null>(null);

	// Functions
	function openModal(plan: (typeof plans)[0] | null = null) {
		editingPlan = plan;
		if (plan) {
			formData = {
				name: plan.name,
				description: plan.description || '',
				price: plan.price,
				duration: plan.duration,
				isActive: plan.isActive
			};
		} else {
			resetForm();
		}
		formErrors = {};
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingPlan = null;
		resetForm();
	}

	function resetForm() {
		formData = {
			name: '',
			description: '',
			price: 0,
			duration: 30,
			isActive: true
		};
		formErrors = {};
	}

	function clearFieldError(field: keyof SubscriptionPlanData) {
		if (formErrors[field]) {
			formErrors[field] = undefined;
		}
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-KE', {
			style: 'currency',
			currency: 'KES'
		}).format(amount);
	}

	function formatDuration(days: number): string {
		if (days === 1) return '1 day';
		if (days < 30) return `${days} days`;
		if (days === 30) return '1 month';
		if (days < 365) {
			const months = Math.floor(days / 30);
			const remainingDays = days % 30;
			if (remainingDays === 0) return `${months} ${months === 1 ? 'month' : 'months'}`;
			return `${months} ${months === 1 ? 'month' : 'months'} ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`;
		}
		const years = Math.floor(days / 365);
		const remainingDays = days % 365;
		if (remainingDays === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
		return `${years} ${years === 1 ? 'year' : 'years'} ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`;
	}
</script>

<svelte:head>
	<title>Subscription Plans Management - Kenya Law Admin</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-6">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Subscription Plans</h1>
				<p class="mt-2 text-gray-600">Manage subscription plans and pricing for your platform</p>
			</div>
			<button
				class="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-white transition-colors"
				onclick={() => openModal()}
			>
				<i class="bi bi-plus-lg"></i>
				Add New Plan
			</button>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<i class="bi bi-diagram-3 text-2xl text-blue-600"></i>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-500">Total Plans</p>
					<p class="text-2xl font-semibold text-gray-900">{plans.length}</p>
				</div>
			</div>
		</div>
		<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<i class="bi bi-check-circle text-2xl text-green-600"></i>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-500">Active Plans</p>
					<p class="text-2xl font-semibold text-gray-900">{plans.filter((p) => p.isActive).length}</p>
				</div>
			</div>
		</div>
		<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<i class="bi bi-x-circle text-2xl text-gray-600"></i>
				</div>
				<div class="ml-4">
					<p class="text-sm font-medium text-gray-500">Inactive Plans</p>
					<p class="text-2xl font-semibold text-gray-900">{plans.filter((p) => !p.isActive).length}</p>
				</div>
			</div>
		</div>
		<!-- <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<i class="bi bi-currency-dollar text-2xl text-yellow-600"></i>
				</div>
				<!-- <div class="ml-4">
					<p class="text-sm font-medium text-gray-500">Avg. Price</p>
					<p class="text-2xl font-semibold text-gray-900">
						{plans.length > 0
							? formatCurrency(plans.reduce((acc, p) => acc + p.price, 0) / plans.length)
							: 'KES 0'}
					</p>
				</div> --
			</div>
		</div> -->
	</div>

	<!-- Plans Table -->
	<div class="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
		<div class="border-b border-gray-200 px-6 py-4">
			<h2 class="text-lg font-semibold text-gray-900">All Plans</h2>
		</div>

		{#if plans.length === 0}
			<div class="p-12 text-center">
				<i class="bi bi-diagram-3 mx-auto text-4xl text-gray-400"></i>
				<h3 class="mt-4 text-lg font-medium text-gray-900">No subscription plans</h3>
				<p class="mt-2 text-gray-500">Get started by creating your first subscription plan.</p>
				<button
					onclick={() => openModal()}
					class="bg-primary hover:bg-primary/90 mt-4 rounded-lg px-4 py-2 text-white"
				>
					<i class="bi bi-plus-lg mr-2"></i>
					Add Your First Plan
				</button>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
								Plan
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
								Price
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
								Duration
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
								Status
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
								Created
							</th>
							<th class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 bg-white">
						{#each plans as plan (plan.id)}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4">
									<div>
										<div class="text-sm font-medium text-gray-900">{plan.name}</div>
										{#if plan.description}
											<div class="max-w-xs truncate text-sm text-gray-500">{plan.description}</div>
										{/if}
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm font-medium text-gray-900">{formatCurrency(plan.price)}</div>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm text-gray-900">{formatDuration(plan.duration)}</div>
								</td>
								<td class="px-6 py-4">
									{#if plan.isActive}
										<span
											class="inline-flex rounded-full bg-green-100 px-2 text-xs leading-5 font-semibold text-green-800"
										>
											Active
										</span>
									{:else}
										<span
											class="inline-flex rounded-full bg-gray-100 px-2 text-xs leading-5 font-semibold text-gray-800"
										>
											Inactive
										</span>
									{/if}
								</td>
								<td class="px-6 py-4">
									<div class="text-sm text-gray-500">
										{new Date(plan.createdAt).toLocaleDateString('en-KE')}
									</div>
								</td>
								<td class="px-6 py-4 text-right">
									<div class="flex justify-end gap-2">
										<button
											onclick={() => openModal(plan)}
											class="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
										>
											<i class="bi bi-pencil mr-1"></i>
											Edit
										</button>

										{#if deleteConfirm === plan.id}
											<div class="flex gap-1">
												<form
													action="?/deletePlan"
													method="POST"
													use:enhance={() => {
														return async ({ update, result }) => {
															deleteConfirm = null;
															if (result.type === 'success') {
																toast.add(
																	'Success',
																	(result.data as any)?.message || 'Plan deleted successfully',
																	'success'
																);
															} else if (result.type === 'failure') {
																toast.add(
																	'Error',
																	(result.data as any)?.message || 'Failed to delete plan',
																	'error'
																);
															}
															await update();
														};
													}}
												>
													<input type="hidden" name="id" value={plan.id} />
													<button
														type="submit"
														class="rounded-lg bg-red-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-red-700"
														aria-label="Confirm delete"
													>
														<i class="bi bi-check"></i>
													</button>
												</form>
												<button
													onclick={() => (deleteConfirm = null)}
													class="rounded-lg bg-gray-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
													aria-label="Cancel delete"
												>
													<i class="bi bi-x"></i>
												</button>
											</div>
										{:else}
											<button
												onclick={() => (deleteConfirm = plan.id)}
												class="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
											>
												<i class="bi bi-trash mr-1"></i>
												Delete
											</button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<!-- Add/Edit Plan Modal -->
<Modal bind:show={showModal} title={editingPlan ? 'Edit Subscription Plan' : 'Add New Subscription Plan'}>
	<form
		action="?/savePlan"
		method="POST"
		use:enhance={() => {
			return async ({ update, result }) => {
				if (result.type === 'success') {
					closeModal();
					toast.add('Success', (result.data as any)?.message || 'Plan saved successfully', 'success');
				} else if (result.type === 'failure') {
					formErrors = (result.data as any)?.errors || {};
					if ((result.data as any)?.message) {
						toast.add('Error', (result.data as any).message, 'error');
					}
				}
				await update();
			};
		}}
	>
		{#if editingPlan}
			<input type="hidden" name="id" value={editingPlan.id} />
		{/if}

		<div class="space-y-6">
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<!-- Plan Name -->
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700">Plan Name *</label>
					<input
						id="name"
						type="text"
						name="name"
						bind:value={formData.name}
						oninput={() => clearFieldError('name')}
						class="focus:ring-primary mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-1 focus:outline-none {formErrors.name
							? 'border-red-300 focus:ring-red-500'
							: ''}"
						placeholder="e.g., Basic Plan, Premium Plan"
						required
					/>
					{#if formErrors.name}
						<p class="mt-1 text-sm text-red-600">{formErrors.name[0]}</p>
					{/if}
				</div>

				<!-- Price -->
				<div>
					<label for="price" class="block text-sm font-medium text-gray-700">Price (KES) *</label>
					<input
						id="price"
						type="number"
						name="price"
						bind:value={formData.price}
						oninput={() => clearFieldError('price')}
						class="focus:ring-primary mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-1 focus:outline-none {formErrors.price
							? 'border-red-300 focus:ring-red-500'
							: ''}"
						min="0"
						step="0.01"
						placeholder="0.00"
						required
					/>
					{#if formErrors.price}
						<p class="mt-1 text-sm text-red-600">{formErrors.price[0]}</p>
					{/if}
				</div>
			</div>

			<!-- Duration -->
			<div>
				<label for="duration" class="block text-sm font-medium text-gray-700">Duration (Days) *</label>
				<input
					id="duration"
					type="number"
					name="duration"
					bind:value={formData.duration}
					oninput={() => clearFieldError('duration')}
					class="focus:ring-primary mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-1 focus:outline-none {formErrors.duration
						? 'border-red-300 focus:ring-red-500'
						: ''}"
					min="1"
					placeholder="30"
					required
				/>
				{#if formErrors.duration}
					<p class="mt-1 text-sm text-red-600">{formErrors.duration[0]}</p>
				{/if}
				{#if formData.duration && formData.duration > 0}
					<p class="mt-1 text-sm text-gray-500">Duration: {formatDuration(formData.duration)}</p>
				{/if}
			</div>

			<!-- Description -->
			<div>
				<label for="description" class="block text-sm font-medium text-gray-700">Description</label>
				<textarea
					id="description"
					name="description"
					bind:value={formData.description}
					oninput={() => clearFieldError('description')}
					rows="3"
					class="focus:ring-primary mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-1 focus:outline-none {formErrors.description
						? 'border-red-300 focus:ring-red-500'
						: ''}"
					placeholder="Describe what this plan includes..."
				></textarea>
				{#if formErrors.description}
					<p class="mt-1 text-sm text-red-600">{formErrors.description[0]}</p>
				{/if}
			</div>

			<!-- Status -->
			<div class="flex items-center justify-between rounded-lg bg-gray-50 p-4">
				<div>
					<label class="flex items-center">
						<input
							type="checkbox"
							name="isActive"
							bind:checked={formData.isActive}
							value="true"
							class="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300 focus:ring-2"
						/>
						<span class="ml-2 text-sm font-medium text-gray-700">Active Plan</span>
					</label>
					<p class="mt-1 text-sm text-gray-500">
						{formData.isActive ? 'Available for new subscriptions' : 'Hidden from customers'}
					</p>
				</div>
				{#if formData.isActive}
					<i class="bi bi-check-circle text-2xl text-green-500"></i>
				{:else}
					<i class="bi bi-x-circle text-2xl text-gray-400"></i>
				{/if}
			</div>
		</div>

		<!-- Modal Actions -->
		<div class="mt-8 flex justify-end gap-3">
			<button
				type="button"
				onclick={closeModal}
				class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="bg-primary hover:bg-primary/90 focus:ring-primary/50 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
			>
				<i class="bi bi-save"></i>
				{editingPlan ? 'Update Plan' : 'Create Plan'}
			</button>
		</div>
	</form>
</Modal>
