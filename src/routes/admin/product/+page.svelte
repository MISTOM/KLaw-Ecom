<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import { getToastState } from '$lib/Toast.svelte';

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

	// Format publication date to bind to date input
	let publicationDate = $state(publicationDateISO ? new Date(publicationDateISO).toISOString().split('T')[0] : '');

	// When the user selects a category from the dropdown
	function addCategory(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		const selectedId = parseInt(select.value);

		if (!selectedId) return;
		// Prevent duplicate selections
		if (selectedCategories.find((c) => c.id === selectedId)) return;
		const cat = categories.find((c) => c.id === selectedId);
		if (cat) {
			selectedCategories = [...selectedCategories, cat];
		}
		// Reset select to default prompt
		select.value = '';
	}

	// When user clicks remove button
	function removeCategory(categoryId: number) {
		selectedCategories = selectedCategories.filter((c) => c.id !== categoryId);
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
										class="bg-primary h-full w-full object-cover"
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
				use:enhance={({ formData }) => {
					formData.delete('categoryIds');
					selectedCategories.forEach((c) => {
						formData.append('categoryIds', c.id.toString());
					});

					return async ({ update, result }) => {
						if (result.type === 'success') {
							toast.add('Success', 'Book added successfully', 'success', 2000);
							await update({ reset: true });
							selectedCategories = [];
						}
						await update({ reset: false });
					};
				}}
			>
				{#if form?.errors}
					<div class="rounded-md bg-red-50 p-3 text-sm text-red-500">
						{form.errors}
					</div>
				{/if}

				<div class="space-y-2">
					<label for="name" class="text-sm font-medium text-gray-700">Book Title</label>
					<input
						type="text"
						id="name"
						name="name"
						bind:value={name}
						required
						class="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
					/>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<label for="price" class="text-sm font-medium text-gray-700">Price (KES)</label>
						<input
							type="number"
							id="price"
							name="price"
							bind:value={price}
							required
							min="0"
							class="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
						/>
					</div>

					<div class="space-y-2">
						<label for="quantity" class="text-sm font-medium text-gray-700">Quantity</label>
						<input
							type="number"
							id="quantity"
							name="quantity"
							bind:value={quantity}
							required
							min="0"
							class="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
						/>
					</div>
				</div>

				<div class="space-y-2">
					<label for="description" class="text-sm font-medium text-gray-700">Description</label>
					<textarea
						id="description"
						name="description"
						bind:value={description}
						required
						rows="3"
						class="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
					>
					</textarea>
				</div>
				<!-- <div class="space-y-2">
					<label for="serviceCode" class="text-sm font-medium text-gray-700">Service Code</label>
					<input
						type="text"
						id="serviceCode"
						name="serviceCode"
						bind:value={serviceCode}
						required
						class="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
					/>
				</div> -->
				<div class="space-y-2">
					<label for="author" class="text-sm font-medium text-gray-700">Author</label>
					<input
						type="text"
						id="author"
						name="author"
						bind:value={author}
						required
						class="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
					/>
				</div>
				<div class="space-y-2">
					<label for="pageCount" class="text-sm font-medium text-gray-700">Page Count</label>
					<input
						type="number"
						id="pageCount"
						name="pageCount"
						bind:value={pageCount}
						min="0"
						required
						class="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
					/>
				</div>

				<div class="space-y-2">
					<label for="publicationDate" class="text-sm font-medium text-gray-700">Publication Date</label>
					<input
						type="date"
						id="publicationDate"
						name="publicationDate"
						bind:value={publicationDate}
						required
						class="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
					/>
				</div>

				<div class="mb-4 space-y-2">
					<label for="categories" class="text-sm font-medium text-gray-700">Select Categories</label>

					<!-- Dropdown: Only show categories that are not already selected -->
					<select
						name="categoryIds"
						class="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-none"
						onchange={addCategory}
					>
						<option value="">--</option>
						{#each categories as category (category.id)}
							{#if !selectedCategories.find((c) => c.id === category.id)}
								<option value={category.id}>{category.name}</option>
							{/if}
						{/each}
					</select>

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
