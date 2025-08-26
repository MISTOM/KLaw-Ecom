<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, slide } from 'svelte/transition';
	import { getToastState } from '$lib/Toast.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import {
		promotionSchema,
		promotionCoreSchema,
		type FormErrors,
		type PromotionData
	} from '$lib/validations/validationSchemas';

	const toast = getToastState();
	const { data, form } = $props();
	const promotions = $derived(data.promotions || []);
	const products = $derived(data.products || []);
	const categories = $derived(data.categories || []);
	const currentPage = $derived(data.page || 1);
	const totalPages = $derived(data.totalPages || 1);

	let showModal = $state(false);
	let formErrors = $state<FormErrors<PromotionData>>({});

	// Form state
	let name = $state('');
	let description = $state('');
	let discountType = $state<PromotionData['discountType']>('PERCENT');
	let discountValue = $state<number | string>('');
	let code = $state('');
	let startsAt = $state('');
	let endsAt = $state('');
	let isActive = $state(true);
	let priority = $state(100);
	let selectedProducts = $state<number[]>([]);
	let selectedCategories = $state<number[]>([]);

	function resetForm() {
		name = '';
		description = '';
		discountType = 'PERCENT';
		discountValue = '';
		code = '';
		startsAt = '';
		endsAt = '';
		isActive = true;
		priority = 100;
		selectedProducts = [];
		selectedCategories = [];
		formErrors = {};
	}

	function validateField<K extends keyof PromotionData>(field: K, value: PromotionData[K]) {
		const fieldSchema = (promotionCoreSchema.shape as any)[field];
		if (!fieldSchema) return;
		const result = fieldSchema.safeParse(value);
		formErrors[field] = result.success ? [] : result.error?.flatten().formErrors || [];
	}

	function validateAll(fd: FormData) {
		const data = {
			name: fd.get('name')?.toString() || '',
			description: fd.get('description')?.toString() || '',
			discountType: fd.get('discountType')?.toString() || 'PERCENT',
			discountValue: parseFloat(fd.get('discountValue')?.toString() || '0'),
			code: fd.get('code')?.toString() || undefined,
			startsAt: new Date(fd.get('startsAt')?.toString() || ''),
			endsAt: new Date(fd.get('endsAt')?.toString() || ''),
			isActive: fd.get('isActive') === 'on',
			priority: parseInt(fd.get('priority')?.toString() || '100'),
			productIds: selectedProducts,
			categoryIds: selectedCategories
		} as any;

		const parsed = promotionSchema.safeParse(data);
		if (!parsed.success) {
			formErrors = parsed.error.flatten().fieldErrors as any;
			return false;
		}
		return true;
	}

	function toggleSelection(list: number[], id: number): number[] {
		return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
	}
</script>

<svelte:head>
	<title>Promotions | Admin</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-3xl font-bold">Promotions</h1>
		<button
			class="bg-primary hover:bg-primary/90 cursor-pointer rounded-lg px-4 py-2 text-white"
			onclick={() => {
				resetForm();
				showModal = true;
			}}>New Promotion</button
		>
	</div>

	<div class="overflow-x-auto rounded-md border bg-white">
		<table class="min-w-full divide-y divide-gray-200 text-sm">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-4 py-2 text-left font-medium text-gray-600">Name</th>
					<th class="px-4 py-2 text-left font-medium text-gray-600">Discount</th>
					<th class="px-4 py-2 text-left font-medium text-gray-600">Active Window</th>
					<th class="px-4 py-2 text-left font-medium text-gray-600">Scope</th>
					<th class="px-4 py-2 text-left font-medium text-gray-600">Status</th>
					<th class="px-4 py-2 text-left font-medium text-gray-600">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#if promotions.length === 0}
					<tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">No promotions found</td></tr>
				{:else}
					{#each promotions as promo (promo.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-2 font-medium">{promo.name}</td>
							<td class="px-4 py-2"
								>{promo.discountType === 'PERCENT' ? `${promo.discountValue}%` : `KES ${promo.discountValue}`}</td
							>
							<td class="px-4 py-2 whitespace-nowrap"
								>{new Date(promo.startsAt).toLocaleDateString('en-KE', {
									day: '2-digit',
									month: 'short',
									year: 'numeric'
								})} – {new Date(promo.endsAt).toLocaleDateString('en-KE', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}</td
							>
							<td class="max-w-xs px-4 py-2">
								<div class="flex flex-wrap gap-1">
									{#each promo.products as p (p.productId)}
										<span class="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">P:{p.product.name}</span>
									{/each}
									{#each promo.categories as c (c.categoryId)}
										<span class="rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700"
											>C:{c.category.name}</span
										>
									{/each}
								</div>
							</td>
							<td class="px-4 py-2">
								{#if promo.isActive}
									<span class="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Active</span>
								{:else}
									<span class="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">Inactive</span>
								{/if}
							</td>
							<td class="space-x-3 px-4 py-2">
								<form
									method="POST"
									action="?/toggle_active"
									class="inline"
									use:enhance={({ cancel }) => {
										return async ({ update, result }) => {
											if (result.type === 'failure') {
												toast.add('Error', 'Failed to toggle', 'error');
											} else {
												toast.add('Success', 'Updated', 'success');
											}
											await update();
										};
									}}
								>
									<input type="hidden" name="id" value={promo.id} />
									<button type="submit" class="text-primary text-xs hover:underline">Toggle</button>
								</form>
								<form
									method="POST"
									action="?/delete"
									class="inline"
									use:enhance={({ cancel }) => {
										if (!confirm('Delete this promotion?')) cancel();
										return async ({ update, result }) => {
											if (result.type === 'failure') {
												toast.add('Error', 'Delete failed', 'error');
											} else {
												toast.add('Success', 'Deleted', 'success');
											}
											await update();
										};
									}}
								>
									<input type="hidden" name="id" value={promo.id} />
									<button type="submit" class="text-xs text-red-600 hover:underline">Delete</button>
								</form>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	{#if totalPages > 1}
		<div class="flex justify-center gap-2">
			{#each Array(totalPages) as _, i}
				<a href={`?page=${i + 1}`}>
					<button
						class="cursor-pointer rounded px-3 py-1 text-sm {currentPage === i + 1
							? 'bg-primary text-white'
							: 'bg-gray-100'}">{i + 1}</button
					></a
				>
			{/each}
		</div>
	{/if}
</div>

<Modal bind:show={showModal} title="Create Promotion" modalClass="max-w-5xl">
	<form
		method="POST"
		action="?/create"
		use:enhance={({ formData, cancel }) => {
			formErrors = {};
			formData.delete('productIds');
			formData.delete('categoryIds');
			selectedProducts.forEach((id) => formData.append('productIds', id.toString()));
			selectedCategories.forEach((id) => formData.append('categoryIds', id.toString()));
			if (!validateAll(formData)) cancel();
			return async ({ update, result }) => {
				if (result.type === 'failure') {
					formErrors = result.data?.errors || { _errors: ['Failed to create promotion'] };
				} else if (result.type === 'success') {
					toast.add('Success', 'Promotion created', 'success');
					showModal = false;
					resetForm();
				}
				await update();
			};
		}}
		class="space-y-4"
	>
		{#if formErrors._errors}
			<div class="rounded bg-red-50 p-2 text-sm text-red-600">{formErrors._errors[0]}</div>
		{/if}

		<div class="grid gap-4 sm:grid-cols-2">
			<div class="space-y-1">
				<label for="promo_name" class="text-sm font-medium">Name</label>
				<input
					id="promo_name"
					name="name"
					bind:value={name}
					class="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-1"
					onkeyup={(e) => validateField('name', e.currentTarget.value)}
					required
				/>
				{#if formErrors.name}<p class="text-xs text-red-600" transition:fade>{formErrors.name[0]}</p>{/if}
			</div>
			<div class="space-y-1">
				<label for="promo_code" class="text-sm font-medium"
					>Code <span class="text-xs text-gray-500">(optional)</span></label
				>
				<input
					id="promo_code"
					name="code"
					bind:value={code}
					class="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-1"
					onkeyup={(e) => validateField('code', e.currentTarget.value)}
				/>
				{#if formErrors.code}<p class="text-xs text-red-600" transition:fade>{formErrors.code[0]}</p>{/if}
			</div>
			<div class="space-y-1">
				<label for="promo_discount_type" class="text-sm font-medium">Discount Type</label>
				<select
					id="promo_discount_type"
					name="discountType"
					bind:value={discountType}
					class="w-full rounded border px-2 py-1"
					onchange={(e) => validateField('discountType', e.currentTarget.value as any)}
				>
					<option value="PERCENT">Percent (%)</option>
					<option value="AMOUNT">Amount (KES)</option>
				</select>
			</div>
			<div class="space-y-1">
				<label for="promo_discount_value" class="text-sm font-medium">Discount Value</label>
				<input
					id="promo_discount_value"
					name="discountValue"
					type="number"
					min="0"
					step="0.01"
					bind:value={discountValue}
					class="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-1"
					onkeyup={(e) => validateField('discountValue', parseFloat(e.currentTarget.value))}
					required
				/>
				{#if formErrors.discountValue}<p class="text-xs text-red-600" transition:fade>
						{formErrors.discountValue[0]}
					</p>{/if}
			</div>
			<div class="space-y-1">
				<label for="promo_starts" class="text-sm font-medium">Starts At</label>
				<input
					id="promo_starts"
					name="startsAt"
					type="date"
					bind:value={startsAt}
					class="w-full rounded border px-2 py-1"
					required
				/>
			</div>
			<div class="space-y-1">
				<label for="promo_ends" class="text-sm font-medium">Ends At</label>
				<input
					id="promo_ends"
					name="endsAt"
					type="date"
					bind:value={endsAt}
					class="w-full rounded border px-2 py-1"
					required
				/>
				{#if formErrors.endsAt}<p class="text-xs text-red-600" transition:fade>{formErrors.endsAt[0]}</p>{/if}
			</div>
			<div class="space-y-1">
				<label for="promo_priority" class="text-sm font-medium">Priority</label>
				<input
					id="promo_priority"
					name="priority"
					type="number"
					min="0"
					bind:value={priority}
					class="w-full rounded border px-2 py-1"
				/>
			</div>
			<div class="flex items-center space-x-2 pt-6">
				<input id="isActive" name="isActive" type="checkbox" bind:checked={isActive} />
				<label for="isActive" class="text-sm">Active</label>
			</div>
		</div>

		<div class="space-y-2">
			<label for="promo_description" class="text-sm font-medium">Description</label>
			<textarea
				id="promo_description"
				name="description"
				rows="3"
				bind:value={description}
				class="focus:ring-primary w-full rounded border px-2 py-1 focus:ring-1"
				onkeyup={(e) => validateField('description', e.currentTarget.value)}
			></textarea>
			{#if formErrors.description}<p class="text-xs text-red-600" transition:fade>
					{formErrors.description[0]}
				</p>{/if}
		</div>

		<div class="grid gap-6 sm:grid-cols-2">
			<div>
				<h3 class="mb-1 text-sm font-semibold">Apply to Products</h3>
				<div class="h-48 space-y-1 overflow-y-auto rounded border p-2 text-xs">
					{#each products as p (p.id)}
						<label class="flex items-center gap-2">
							<input
								type="checkbox"
								checked={selectedProducts.includes(p.id)}
								onchange={() => (selectedProducts = toggleSelection(selectedProducts, p.id))}
							/>
							<span>{p.name}</span>
						</label>
					{/each}
				</div>
			</div>
			<div>
				<h3 class="mb-1 text-sm font-semibold">Apply to Categories</h3>
				<div class="h-48 space-y-1 overflow-y-auto rounded border p-2 text-xs">
					{#each categories as c (c.id)}
						<label class="flex items-center gap-2">
							<input
								type="checkbox"
								checked={selectedCategories.includes(c.id)}
								onchange={() => (selectedCategories = toggleSelection(selectedCategories, c.id))}
							/>
							<span>{c.name}</span>
						</label>
					{/each}
				</div>
			</div>
		</div>
		{#if formErrors.productIds}
			<p class="text-xs text-red-600" transition:fade>{formErrors.productIds[0]}</p>
		{/if}

		<button type="submit" class="bg-primary hover:bg-primary/90 w-full cursor-pointer rounded px-4 py-2 text-white"
			>Create Promotion</button
		>
	</form>
</Modal>
