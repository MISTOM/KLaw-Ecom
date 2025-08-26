<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { getToastState } from '$lib/Toast.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { productSchema, type FormErrors, type ProductData } from '$lib/validations/validationSchemas.js';

	const { form, data } = $props();
	const products = $derived(data.products || []);
	const categories = $derived(data.categories || []);
	const currentPage = $derived(data.page || 1);
	const totalPages = $derived(data.totalPages || 1);

	let showAddModal = $state(false);
	let searchQuery = $state('');
	// const products = $state($state.snapshot(data.products) || []);
	// $inspect(products);

	const toast = getToastState();

	let name = $state(form?.data?.name);
	let description = $state(form?.data?.description || '');
	let price = $state(form?.data?.price);
	let quantity = $state(form?.data?.quantity);
	let serviceCode = $state(form?.data?.serviceCode);
	// Cast form?.data to any for flexible property access (server action returns dynamic shape)
	const formAny: any = form?.data || {};
	let author = $state(formAny.author);
	let citation = $state(formAny.citation || '');
	let isbn = $state(formAny.isbn || '');
	let pageCount = $state(formAny.pageCount);
	let publicationDateISO = $state(formAny.publicationDate);
	let selectedCategories = $state<{ id: number; name: string }[]>([]);
	const categoryIds = $derived(selectedCategories.map((c) => c.id));
	let publicationDate = $state(
		publicationDateISO ? new Date(publicationDateISO.toString()).getFullYear().toString() : ''
	);

	let formErrors = $state<FormErrors<ProductData>>(form?.errors || {});

	const getFieldError = (field: keyof FormErrors<ProductData>) => formErrors[field]?.[0] || '';

	// Validate a single field
	const validateField = <K extends keyof ProductData>(field: K, value: ProductData[K]) => {
		const fieldSchema = productSchema.shape[field];
		const result = fieldSchema.safeParse(value);
		formErrors[field] = result.success ? [] : result.error?.flatten().formErrors || [];
	};

	// Validate entire form on submit
	const validateAll = (formData: FormData) => {
		const data = Object.fromEntries(formData.entries());
		// Convert string values to numbers for numeric fields
		const parsedData = {
			...data,
			price: data.price ? parseFloat(data.price as string) : undefined,
			quantity: data.quantity ? parseInt(data.quantity as string) : undefined,
			pageCount: data.pageCount ? parseInt(data.pageCount as string) : undefined,
			citation: data.citation ? data.citation : undefined,
			isbn: data.isbn ? data.isbn : undefined,
			categoryIds: selectedCategories.map((c) => c.id),
			publicationDate: data.publicationDate ? parseInt(data.publicationDate as string) : undefined
		};
		const result = productSchema.safeParse(parsedData);
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			formErrors = errors;
			return false;
		}

		return true;
	};

	// When the user selects a category from the dropdown
	function addCategory(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		const selectedId = parseInt(select.value);

		if (!selectedId) return;
		// Prevent duplicate selections
		if (selectedCategories.find((c) => c.id === selectedId)) return;
		const cat = categories.find((c) => c.id === selectedId);
		if (cat) selectedCategories = [...selectedCategories, cat];

		// Reset select to default prompt
		select.value = '';

		validateField('categoryIds', categoryIds);
	}

	// When user clicks remove button
	function removeCategory(categoryId: number) {
		selectedCategories = selectedCategories.filter((c) => c.id !== categoryId);

		validateField('categoryIds', categoryIds);
	}

	const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

	let filteredProducts = $derived(
		products.filter(
			(product) =>
				product.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
				product.serviceCode.toLowerCase().includes(searchQuery.toLowerCase().trim())
		)
	);

	function handlePageChange(page: number) {
		goto(`?page=${page}`, { keepFocus: true });
	}
</script>

<svelte:head>
	<title>Manage Products | Admin</title>
</svelte:head>

<div class="container mx-auto p-6">
	<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold">Products Catalog</h1>
		</div>

		<div class="flex gap-4">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search products..."
				class="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-200 bg-white px-4 py-2 focus:ring-1 sm:w-64"
			/>
			<button
				onclick={() => (showAddModal = true)}
				class="bg-primary hover:bg-primary/90 cursor-pointer rounded-lg px-4 py-2 text-white"
			>
				Add Product
			</button>
		</div>
	</div>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#if filteredProducts.length === 0}
			<div class="col-span-full text-center text-gray-500">No products found</div>
		{:else}
			{#each filteredProducts as product (product.id)}
				<div class="group relative rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
					<div class="flex gap-4">
						<div class="h-32 w-32 shrink-0 overflow-hidden rounded-lg">
							<img
								src={product.Image[0]?.url || '/coat-of-arms.jpg'}
								alt={product.name}
								loading="lazy"
								class="h-full w-full object-cover"
							/>
						</div>

						<div class="grow">
							<div class="flex items-start justify-between">
								<div>
									<h3 class="font-semibold">{product.name}</h3>
									<p class="text-sm text-gray-600">Code: {product.serviceCode}</p>
									<p class="text-xs text-gray-500">Sort order: {product.sortOrder}</p>
								</div>
								<div class="flex gap-2">
									{#if product.isPublished}
										<span class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"> Published </span>
									{:else}
										<span class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"> Draft </span>
									{/if}
								</div>
							</div>

							<div class="mt-2 grid grid-cols-2 gap-2 text-sm">
								<div>
									<span class="text-gray-500">Price:</span>
									<span class="ml-1 font-medium">KES {product.price.toLocaleString()}</span>
								</div>
								<div>
									<span class="text-gray-500">Stock:</span>
									<span class="ml-1 font-medium">{product.quantity}</span>
								</div>
							</div>
						</div>
					</div>

					<a
						href={`/admin/product/${product.id}`}
						class="mt-4 inline-flex w-full items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
					>
						Edit Product
					</a>
				</div>
			{/each}
		{/if}
	</div>

	{#if totalPages > 1}
		<div class="mt-8 flex justify-center gap-2">
			<button
				class="cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
				disabled={currentPage === 1}
				onclick={() => handlePageChange(currentPage - 1)}
			>
				Previous
			</button>

			{#each Array(totalPages) as _, i}
				<a href="?page={i + 1}">
					<button
						class="cursor-pointer rounded-md px-4 py-2 text-sm {currentPage === i + 1
							? 'bg-primary  text-white'
							: 'bg-gray-100'}"
					>
						{i + 1}
					</button>
				</a>
			{/each}

			<button
				class="cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
				disabled={currentPage === totalPages}
				onclick={() => handlePageChange(currentPage + 1)}
			>
				Next
			</button>
		</div>
	{/if}
</div>

<Modal bind:show={showAddModal} title="Add New Product" modalClass="max-w-7xl max-h-4/5">
	<form
		method="POST"
		enctype="multipart/form-data"
		class="space-y-4"
		use:enhance={({ formData, cancel }) => {
			formErrors = {};
			formData.delete('categoryIds');
			selectedCategories.forEach((c) => {
				formData.append('categoryIds', c.id.toString());
			});

			if (!validateAll(formData)) cancel();

			return async ({ update, result }) => {
				if (result.type === 'success') {
					// After product core data saved, if PDFs selected perform sequential uploads
					const productId = (result.data as any)?.product?.id;
					const filesInput = document.getElementById('pdfDocuments') as HTMLInputElement | null;
					if (productId && filesInput?.files && filesInput.files.length > 0) {
						for (const file of Array.from(filesInput.files)) {
							if (file.type !== 'application/pdf') continue; // extra safety
							const fd = new FormData();
							fd.append('file', file, file.name);
							try {
								const res = await fetch(`/api/product/${productId}/documents`, { method: 'POST', body: fd });
								if (!res.ok) {
									console.warn('PDF upload failed', await res.text());
								}
							} catch (e) {
								console.warn('PDF upload error', e);
							}
						}
					}
					toast.add('Success', 'Product added successfully', 'success', 2000);
					showAddModal = false;
					await update({ reset: true });
					selectedCategories = [];
					citation = '';
					isbn = '';
				} else if (result.type === 'failure') {
					formErrors = result.data?.errors || { _errors: ['Error adding product'] };
				}
				await update({ reset: false });
			};
		}}
	>
		{#if formErrors._errors}
			<div class="rounded-md bg-red-50 p-3 text-sm text-red-500">
				{formErrors._errors[0]}
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<!-- Book Title -->
			<div class="space-y-2">
				<label for="name" class="text-sm font-medium text-gray-700">Book Title</label>
				<input
					type="text"
					id="name"
					name="name"
					class={{
						'w-full rounded-sm border-2 p-2': true,
						'border-red-500': !!getFieldError('name'),
						'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-hidden': true
					}}
					bind:value={name}
					aria-invalid={!!getFieldError('name')}
					aria-describedby={getFieldError('name') ? 'name-error' : undefined}
					onkeyup={(e) => validateField('name', e.currentTarget.value)}
					placeholder="e.g., The Constitution of Kenya"
				/>
				{#if getFieldError('name')}
					<p id="name-error" class="mt-1 text-xs text-red-600" transition:fade>
						{getFieldError('name')}
					</p>
				{/if}
			</div>

			<!-- Price -->
			<div class="space-y-2">
				<label for="price" class="text-sm font-medium text-gray-700">Price (KES)</label>
				<input
					type="number"
					id="price"
					name="price"
					class={{
						'w-full rounded-sm border-2 p-2': true,
						'border-red-500': !!getFieldError('price'),
						'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-hidden': true
					}}
					bind:value={price}
					aria-invalid={!!getFieldError('price')}
					aria-describedby={getFieldError('price') ? 'price-error' : undefined}
					onkeyup={(e) => validateField('price', parseFloat(e.currentTarget.value))}
					min="0"
					placeholder="1500"
					required
				/>
				{#if getFieldError('price')}
					<p id="price-error" class="mt-1 text-xs text-red-600" transition:fade>
						{getFieldError('price')}
					</p>
				{/if}
			</div>

			<!-- Quantity -->
			<div class="space-y-2">
				<label for="quantity" class="text-sm font-medium text-gray-700">Quantity</label>
				<input
					type="number"
					id="quantity"
					name="quantity"
					class={{
						'w-full rounded-sm border-2 p-2': true,
						'border-red-500': !!getFieldError('quantity'),
						'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-hidden': true
					}}
					bind:value={quantity}
					aria-invalid={!!getFieldError('quantity')}
					aria-describedby={getFieldError('quantity') ? 'quantity-error' : undefined}
					onkeyup={(e) => validateField('quantity', parseInt(e.currentTarget.value))}
					min="0"
					placeholder="e.g., 100"
					required
				/>
				{#if getFieldError('quantity')}
					<p id="quantity-error" class="mt-1 text-xs text-red-600" transition:fade>
						{getFieldError('quantity')}
					</p>
				{/if}
			</div>

			<!-- Author -->
			<div class="space-y-2">
				<label for="author" class="text-sm font-medium text-gray-700">Author</label>
				<input
					type="text"
					id="author"
					name="author"
					class={{
						'w-full rounded-sm border-2 p-2': true,
						'border-red-500': !!getFieldError('author'),
						'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-hidden': true
					}}
					bind:value={author}
					aria-invalid={!!getFieldError('author')}
					aria-describedby={getFieldError('author') ? 'author-error' : undefined}
					onkeyup={(e) => validateField('author', e.currentTarget.value)}
					placeholder="National Council for Law Reporting (Kenya Law)."
					required
				/>
				{#if getFieldError('author')}
					<p id="author-error" class="mt-1 text-xs text-red-600" transition:fade>
						{getFieldError('author')}
					</p>
				{/if}
			</div>

			<!-- Citation -->
			<div class="space-y-2">
				<label for="citation" class="text-sm font-medium text-gray-700"
					>Citation <span class="text-gray-500">(optional)</span></label
				>
				<input
					type="text"
					id="citation"
					name="citation"
					class={{
						'w-full rounded-sm border-2 p-2': true,
						'border-red-500': !!getFieldError('citation'),
						'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-hidden': true
					}}
					bind:value={citation}
					aria-invalid={!!getFieldError('citation')}
					aria-describedby={getFieldError('citation') ? 'citation-error' : undefined}
					onkeyup={(e) => validateField('citation', e.currentTarget.value)}
					placeholder=""
				/>
				{#if getFieldError('citation')}
					<p id="citation-error" class="mt-1 text-xs text-red-600" transition:fade>
						{getFieldError('citation')}
					</p>
				{/if}
			</div>

			<!-- ISBN -->
			<div class="space-y-2">
				<label for="isbn" class="text-sm font-medium text-gray-700"
					>ISBN <span class="text-gray-500">(optional)</span></label
				>
				<input
					type="text"
					id="isbn"
					name="isbn"
					class={{
						'w-full rounded-sm border-2 p-2': true,
						'border-red-500': !!getFieldError('isbn'),
						'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-hidden': true
					}}
					bind:value={isbn}
					aria-invalid={!!getFieldError('isbn')}
					aria-describedby={getFieldError('isbn') ? 'isbn-error' : undefined}
					onkeyup={(e) => validateField('isbn', e.currentTarget.value)}
					placeholder="978-0-123456-78-9"
				/>
				{#if getFieldError('isbn')}
					<p id="isbn-error" class="mt-1 text-xs text-red-600" transition:fade>
						{getFieldError('isbn')}
					</p>
				{/if}
			</div>

			<!-- Page Count -->
			<div class="space-y-2">
				<label for="pageCount" class="text-sm font-medium text-gray-700">Page Count</label>
				<input
					type="number"
					id="pageCount"
					name="pageCount"
					class={{
						'w-full rounded-sm border-2 p-2': true,
						'border-red-500': !!getFieldError('pageCount'),
						'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-hidden': true
					}}
					bind:value={pageCount}
					aria-invalid={!!getFieldError('pageCount')}
					aria-describedby={getFieldError('pageCount') ? 'pageCount-error' : undefined}
					onkeyup={(e) => validateField('pageCount', parseInt(e.currentTarget.value))}
					min="0"
					placeholder="e.g., 250"
					required
				/>
				{#if getFieldError('pageCount')}
					<p id="pageCount-error" class="mt-1 text-xs text-red-600" transition:fade>
						{getFieldError('pageCount')}
					</p>
				{/if}
			</div>

			<!-- Publication Date -->
			<div class="space-y-2">
				<label for="publicationDate" class="text-sm font-medium text-gray-700">Publication Year</label>
				<input
					type="number"
					id="publicationDate"
					name="publicationDate"
					class={{
						'w-full rounded-sm border-2 p-2': true,
						'border-red-500': !!getFieldError('publicationDate'),
						'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-hidden': true
					}}
					bind:value={publicationDate}
					aria-invalid={!!getFieldError('publicationDate')}
					aria-describedby={getFieldError('publicationDate') ? 'publicationDate-error' : undefined}
					onkeyup={({ currentTarget: { value } }) => validateField('publicationDate', parseInt(value))}
					placeholder="e.g., 2024"
					min="1900"
					max="2030"
					required
				/>
				{#if getFieldError('publicationDate')}
					<p id="publicationDate-error" class="mt-1 text-xs text-red-600" transition:fade>
						{getFieldError('publicationDate')}
					</p>
				{/if}
			</div>
		</div>

		<!-- Full width items -->
		<div class="space-y-2">
			<label for="description" class="text-sm font-medium text-gray-700">Description</label>
			<textarea
				id="description"
				name="description"
				class={{
					'w-full rounded-sm border-2 p-2': true,
					'border-red-500': !!getFieldError('description'),
					'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-hidden': true
				}}
				bind:value={description}
				aria-invalid={!!getFieldError('description')}
				aria-describedby={getFieldError('description') ? 'description-error' : undefined}
				onkeyup={(e) => validateField('description', e.currentTarget.value)}
				placeholder="Enter a detailed description of the book"
				required
				rows="3"
			></textarea>
			{#if getFieldError('description')}
				<p id="description-error" class="mt-1 text-xs text-red-600" transition:fade>
					{getFieldError('description')}
				</p>
			{/if}
		</div>

		<div class="space-y-2">
			<label for="categories" class="text-sm font-medium text-gray-700">Select Categories</label>
			<select
				name="categoryIds"
				class={{
					'w-full rounded-sm border-2 p-2': true,
					'border-red-500': !!getFieldError('categoryIds'),
					'focus:border-primary focus:ring-primary focus:ring-1 focus:outline-hidden': true
				}}
				onchange={addCategory}
				aria-invalid={!!getFieldError('categoryIds')}
				aria-describedby={getFieldError('categoryIds') ? 'categories-error' : undefined}
			>
				<option value="">--</option>
				{#each categories as category (category.id)}
					{#if !selectedCategories.find((c) => c.id === category.id)}
						<option value={category.id}>{category.name}</option>
					{/if}
				{/each}
			</select>

			{#if getFieldError('categoryIds')}
				<p id="categories-error" class="mt-1 text-xs text-red-600" transition:fade>
					{getFieldError('categoryIds')}
				</p>
			{/if}

			<div class="flex flex-wrap gap-2">
				{#if selectedCategories.length === 0}
					<p class="text-sm text-gray-500">No categories selected</p>
				{:else}
					{#each selectedCategories as category (category.id)}
						<div
							class="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1"
							in:fade={{ duration: 100 }}
							out:fade={{ duration: 50 }}
						>
							<span class="text-sm">{category.name}</span>
							<button
								type="button"
								class="text-gray-500 hover:text-gray-700"
								onclick={() => removeCategory(category.id)}
							>
								x
							</button>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<div class="space-y-2">
			<label for="image" class="text-sm font-medium text-gray-700">Book Cover</label>
			<input
				type="file"
				id="image"
				name="image"
				accept={allowedExtensions.join(',')}
				class="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
			/>
			<p class="text-xs text-gray-500">
				Accepted formats: {allowedExtensions.join(', ')}
			</p>
		</div>

		<!-- PDF Documents (optional) -->
		<div class="space-y-2">
			<label for="pdfDocuments" class="text-sm font-medium text-gray-700"
				>Attach PDF Documents <span class="text-gray-500">(optional)</span></label
			>
			<input
				id="pdfDocuments"
				type="file"
				multiple
				accept="application/pdf"
				class="focus:border-primary focus:ring-primary w-full rounded-md border border-dashed border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
				aria-describedby="pdf-help"
			/>
			<p id="pdf-help" class="text-xs text-gray-500">You may select multiple PDF files (max 25MB each).</p>
		</div>

		<button
			type="submit"
			class="bg-primary hover:bg-primary/90 mt-4 w-full cursor-pointer rounded-md px-4 py-2 text-white transition-colors"
		>
			Add Book
		</button>
	</form>
</Modal>
