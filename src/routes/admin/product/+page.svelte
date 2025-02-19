<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import { getToastState } from '$lib/Toast.svelte';
	import { productSchema, type FormErrors, type ProductData } from '$lib/validations/validationSchemas.js';

	const { data, form } = $props();

	const products = $derived(data.products || []);
	const categories = $derived(data.categories || []);
	// const products = $state($state.snapshot(data.products) || []);
	// $inspect(products);

	const toast = getToastState();

	let name = $state(form?.data?.name);
	let description = $state(form?.data?.description || '');
	let price = $state(form?.data?.price);
	let quantity = $state(form?.data?.quantity);
	let serviceCode = $state(form?.data?.serviceCode);
	let author = $state(form?.data?.author);
	let pageCount = $state(form?.data?.pageCount);
	let publicationDateISO = $state(form?.data?.publicationDate);
	let searchQuery = $state('');
	let selectedCategories = $state<{ id: number; name: string }[]>([]);
	const categoryIds = $derived(selectedCategories.map((c) => c.id));
	let publicationDate = $state(
		publicationDateISO ? new Date(publicationDateISO.toString()).toISOString().split('T')[0] : ''
	);

	let formErrors = $state<FormErrors<ProductData>>(form?.errors || {});

	const getFieldError = (field: keyof FormErrors<ProductData>) => formErrors[field]?.[0] || '';

	// Validate a single field
	const validateField = <K extends keyof ProductData>(field: K, value: ProductData[K]) => {
		// pick the field from the schema
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
			categoryIds: selectedCategories.map((c) => c.id)
		};
		console.log(parsedData);
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

	let filteredBooks = $derived.by(() => {
		return products?.filter(
			(book) =>
				book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				book.serviceCode.toLowerCase().includes(searchQuery.toLowerCase())
		);
	});
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<!-- <main class="m-2 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
	<div class="col-span-2">
		<h1 class="text-4xl">All Products for {data.user?.name}</h1>
		<hr />
		{#each products as product, i}
			<a href={`/admin/product/${product.id}`}>
				<div class="my-3 flex items-center rounded-md border p-1 hover:shadow-xs">
					<span class="m-5">{i}</span>
					<img src={product.Image[0]?.url} alt="product" class="mr-4 size-14" />
					<div class="grow">
						<h2 class="text-lg font-semibold">{product.name}</h2>
						<p>Price: KES {product.price}</p>
						<p>Quantity: {product.quantity}</p>
					</div>

					<div class="flex space-x-2"></div>
				</div>
			</a>
		{/each}
	</div>
	<div>
		<h1 class="mb-2 text-2xl">Add Product</h1>
		<hr />
		<form method="POST" action="?/addproduct" enctype="multipart/form-data" use:enhance>
			{#if form?.errors}
				<span class="text-sm text-red-500">{form.errors}</span>
			{/if}
			{#if form?.status === 200}
				<span class="text-sm text-green-300">Product added successfully</span>
			{/if}
			<div class=" space-y-2">
				<label for="title" class="block">Product Name</label>
				<input type="text" id="Name" name="name" class="w-full rounded-md border p-2" bind:value={name} required />

				<label for="price" class="block">Price</label>
				<input
					type="number"
					id="price"
					name="price"
					class="w-full rounded-md border p-2"
					bind:value={price}
					required
				/>

				<label for="quantity" class="block">Quantity</label>
				<input
					type="number"
					id="quantity"
					name="quantity"
					class="w-full rounded-md border p-2"
					bind:value={quantity}
					required
				/>

				<label for="description" class="block">Description</label>
				<input
					type="test"
					id="description"
					name="description"
					class="w-full rounded-md border p-2"
					bind:value={description}
					required
				/>

				<label for="serviceCode" class="block">Service Code</label>
				<input
					type="text"
					id="serviceCode"
					name="serviceCode"
					class="w-full rounded-md border p-2"
					bind:value={serviceCode}
					required
				/>

				<label for="image" class="blocks">Product Image</label>
				<input
					type="file"
					id="image"
					name="image"
					class="w-full border p-2"
					accept={allowedExtensions.join(',')}
				/>

				<button type="submit" class="rounded-md border p-2 hover:border-primary">Add Product</button>
			</div>
		</form>
	</div>
</main> -->

<div class="container mx-auto p-6">
	<div class="mb-8 grid gap-6 md:grid-cols-3">
		<!-- Books List Section -->
		<div class="md:col-span-2">
			<div class="mb-6 flex items-center justify-between">
				<h1 class="text-3xl font-bold">Books Catalog</h1>
				<div class="relative">
					<!-- <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /> -->
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search books..."
						class="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-10 focus:ring-1 focus:outline-hidden"
					/>
				</div>
			</div>

			<div class="space-y-4">
				{#if filteredBooks.length === 0}
					<p class="text-center text-gray-500">No books found</p>
				{:else}
					{#each filteredBooks as book (book.id)}
						<div
							class="group relative rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
						>
							<div class="flex gap-4">
								<div class="h-28 w-28 shrink-0 overflow-hidden">
									<img
										src={book.Image[0]?.url || '/kLawPillers.png'}
										alt={book.name}
										class="h-full w-full bg-gray-600 object-cover"
									/>
								</div>

								<div class="grow">
									<div class="flex items-start justify-between">
										<div>
											<h3 class="font-semibold capitalize">{book.name}</h3>
											<p class="text-sm text-gray-600">Code: {book.serviceCode}</p>
										</div>
										<div class="flex items-center gap-2">
											{#if book.isPublished}
												<span
													class="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
												>
													Published
												</span>
											{:else}
												<span
													class="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
												>
													Draft
												</span>
											{/if}
										</div>
									</div>

									<div class="mt-2 grid grid-cols-2 gap-4 text-sm">
										<div>
											<span class="text-gray-500">Price:</span>
											<span class="ml-1 font-medium">KES {book.price.toLocaleString()}</span>
										</div>
										<div>
											<span class="text-gray-500">In Stock:</span>
											<span class="ml-1 font-medium">{book.quantity}</span>
										</div>
									</div>
								</div>
							</div>

							<!-- Action Buttons -->
							<div class="absolute right-4 bottom-4 hidden gap-2 group-hover:flex">
								<a
									href={`/admin/product/${book.id}`}
									class="rounded-md bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
								>
									Edit
								</a>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Add Book Form -->
		<div class="rounded-lg border border-gray-200 bg-white p-6">
			<h2 class="mb-6 text-2xl font-semibold">Add New Book</h2>

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
							toast.add('Success', 'Book added successfully', 'success', 2000);
							await update({ reset: true });
							selectedCategories = [];
						} else if (result.type === 'failure') {
							console.log('form result ->  ', result);
							formErrors = result.data?.errors || { _errors: ['Error adding book'] };
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
					/>
					{#if getFieldError('name')}
						<p id="name-error" class="mt-1 text-xs text-red-600" transition:fade>
							{getFieldError('name')}
						</p>
					{/if}
				</div>

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
						required
					/>
					{#if getFieldError('price')}
						<p id="price-error" class="mt-1 text-xs text-red-600" transition:fade>
							{getFieldError('price')}
						</p>
					{/if}
				</div>

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
						required
					/>
					{#if getFieldError('quantity')}
						<p id="quantity-error" class="mt-1 text-xs text-red-600" transition:fade>
							{getFieldError('quantity')}
						</p>
					{/if}
				</div>

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
						required
					/>
					{#if getFieldError('author')}
						<p id="author-error" class="mt-1 text-xs text-red-600" transition:fade>
							{getFieldError('author')}
						</p>
					{/if}
				</div>

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
						required
					/>
					{#if getFieldError('pageCount')}
						<p id="pageCount-error" class="mt-1 text-xs text-red-600" transition:fade>
							{getFieldError('pageCount')}
						</p>
					{/if}
				</div>

				<div class="space-y-2">
					<label for="publicationDate" class="text-sm font-medium text-gray-700">Publication Date</label>
					<input
						type="date"
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
						onchange={(e) => validateField('publicationDate', e.currentTarget.value)}
						required
					/>
					{#if getFieldError('publicationDate')}
						<p id="publicationDate-error" class="mt-1 text-xs text-red-600" transition:fade>
							{getFieldError('publicationDate')}
						</p>
					{/if}
				</div>
				<div class="space-y-2">
					<label for="categories" class="text-sm font-medium text-gray-700">Select Categories</label>

					<!-- Dropdown: Only show categories that are not already selected -->
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

					<!-- Display selected categories -->
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

				<button
					type="submit"
					class="bg-primary hover:bg-primary/90 mt-4 w-full rounded-md px-4 py-2 text-white transition-colors"
				>
					Add Book
				</button>
			</form>
		</div>
	</div>
</div>
