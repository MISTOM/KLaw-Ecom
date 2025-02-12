<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidate } from '$app/navigation';
	import { getToastState } from '$lib/Toast.svelte';
	import { fade } from 'svelte/transition';

	const { data, form } = $props();
	const toast = getToastState();

	let product = $derived(data.product || null);
	let categories = $state(data?.categories || []);

	let name = $state(data.product?.name);
	let description = $state(data.product?.description);

	let price = $state(data.product?.price);
	let quantity = $state(data.product?.quantity);
	let serviceCode = $state(data.product?.serviceCode);
	let author = $state(data.product?.author);
	let publicationDateISO = $state(data.product?.publicationDate);
	let pageCount = $state(data.product?.pageCount);
	let imageUrl = $state(data.product?.Image[0]?.url);
	let showDeleteModal = $state(false);
	let showPublishModal = $state(false);

	let selectedCategories = $state(data.product?.categories || []);

	// Format publication date to bind to date input
	let publicationDate = $state(publicationDateISO ? new Date(publicationDateISO).toISOString().split('T')[0] : '');

	let isEditMode = $state(false);

	const toggleEditMode = () => {
		isEditMode = !isEditMode;
	};

	const togglePublish = async () => {
		console.log('Publishing product');
		if (data?.product?.id) {
			const res = await fetch(`/api/product/${data.product.id}/publish`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					isPublished: !data.product.isPublished
				})
			});

			if (res.ok) {
				const message = data.product.isPublished ? 'Product unpublished' : 'Product published';
				toast.add('Success', message, 'success');
			} else if (res.status === 401) {
				console.error('Unauthorized');
				await goto(`/login?redirect=${window.location.pathname}`);
			} else {
				console.error('Failed to publish product');
				toast.add('Error', 'Failed to publish product', 'error');
			}
		}
		await invalidate('update:product');
	};

	const deleteProduct = async () => {
		console.log('Deleting product');
		if (data?.product?.id) {
			const res = await fetch(`/api/product/${data.product.id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (res.ok) {
				console.log('Product deleted');
				toast.add('Product deleted', '');
				await goto('/admin/product');
			} else if (res.status === 401) {
				console.error('Unauthorized');
				await goto(`/login?redirect=${window.location.pathname}`);
			} else if (res.status === 400) {
				const data = await res.json();
				//tost here
				toast.add('Error', data.message, 'error');

				console.error('Product is on order');
			} else {
				console.error('Failed to delete product');
			}
		}
	};

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
</script>

<svelte:head>
	<title>{name} Details</title>
</svelte:head>

<!-- <main class="m-4 grid grid-cols-1 p-4 md:grid-cols-2 lg:grid-cols-2">
	{#if data.product}
		<div class="m-2">
			<img src={imageUrl} alt="product" class="m-auto size-96 object-cover shadow-2xl" />
		</div>
		<div class="m-2">
			<h1 class="mb-2 text-2xl font-bold">Product Details</h1>
			<form
				method="POST"
				use:enhance={() => {
					return async ({ update, result }) => {
						console.log('form result ->  ', result);
						if (result.status === 200) {
							isEditMode = false;
							await update({ reset: false });
						} else await update();
					};
				}}
			>
				{#if form?.error}
					<span class="text-sm text-red-500">{form?.error}</span>
				{/if}
				<div class="mb-2">
					<label class="block font-semibold" for="name">Product name</label>
					<input
						type="text"
						id="name"
						name="name"
						bind:value={name}
						class="w-full rounded-md p-2"
						class:border={isEditMode}
						class:border-none={!isEditMode}
						class:bg-transparent={!isEditMode}
						disabled={!isEditMode}
					/>
				</div>
				<div class="mb-2">
					<label class="block font-semibold" for="description">Description</label>
					<textarea
						id="description"
						name="description"
						rows="2"
						bind:value={description}
						class="w-full rounded-md p-2"
						class:border={isEditMode}
						class:border-none={!isEditMode}
						class:bg-transparent={!isEditMode}
						disabled={!isEditMode}
					></textarea>
				</div>
				<div class="mb-2">
					<label class="block font-semibold" for="price">Price</label>
					<input
						type="number"
						id="price"
						name="price"
						bind:value={price}
						class="w-full rounded-md p-2"
						class:border={isEditMode}
						class:border-none={!isEditMode}
						class:bg-transparent={!isEditMode}
						disabled={!isEditMode}
					/>
				</div>
				<div class="mb-2">
					<label class="block font-semibold" for="quantity">Quantity</label>
					<input
						type="number"
						id="quantity"
						name="quantity"
						bind:value={quantity}
						class="w-full rounded-md p-2"
						class:border={isEditMode}
						class:border-none={!isEditMode}
						class:bg-transparent={!isEditMode}
						disabled={!isEditMode}
					/>
				</div>
				<div class="mb-2">
					<label class="block font-semibold" for="serviceCode">Service Code</label>
					<input
						type="text"
						id="serviceCode"
						name="serviceCode"
						bind:value={serviceCode}
						class="w-full rounded-md p-2"
						class:border={isEditMode}
						class:border-none={!isEditMode}
						class:bg-transparent={!isEditMode}
						disabled={!isEditMode}
					/>
				</div>
				<div class="flex space-x-2">
					{#if isEditMode}
						<button type="submit" class="rounded-sm bg-blue-500 px-4 py-2 text-white transition-colors">Save</button>
					{:else}
						<button
							type="button"
							onclick={toggleEditMode}
							class="rounded-sm bg-green-500 px-4 py-2 text-white transition-colors">Edit</button
						>

						<div class="flex items-center space-x-2">
							<label for="publish" class="text-xs font-semibold">
								{data.product?.isPublished ? 'Published' : 'Publish'}</label
							>
							<input
								type="checkbox"
								id="publish"
								name="publish"
								checked={data.product?.isPublished}
								onchange={togglePublish}
								class="h-4 w-4"
							/>
						</div>

						<button
							type="button"
							onclick={deleteProduct}
							class="rounded-sm bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600">Delete</button
						>
					{/if}
				</div>
			</form>
		</div>
	{:else if data?.status === 404}
		<p class="text-3xl font-thin">{data.error}</p>
	{:else}
		<p class="text-lg font-thin">Failed to load product</p>
	{/if}
</main> -->

<div class="container mx-auto p-6">
	{#if !product}
		<p class="text-center text-sm font-black text-gray-500">Product not found</p>
	{:else}
		<div class="mb-6 flex items-center gap-4">
			<img
				src={imageUrl || '/kLawPillers.png'}
				alt="product"
				class="bg-primary h-32 w-32 rounded-sm object-cover shadow-xs"
			/>
			<div>
				<h1 class="text-2xl font-bold">{name}</h1>
				<p class="text-gray-600">{description}</p>
			</div>
		</div>
		<!-- Delete Confirmation Modal -->
		{#if showDeleteModal}
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
				<div class="w-full max-w-md rounded-lg bg-white p-6">
					<h3 class="mb-4 text-xl font-bold">Delete Book</h3>
					<p class="mb-6 text-gray-600">
						Are you sure you want to delete "{name}"? This action cannot be undone.
					</p>
					<div class="flex justify-end gap-4">
						<button
							class="rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
							onclick={() => (showDeleteModal = false)}
						>
							Cancel
						</button>
						<button
							type="submit"
							class="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
							onclick={async () => {
								showDeleteModal = false;
								await deleteProduct();
							}}
						>
							Delete
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Publish confirmation Modal -->
		{#if showPublishModal}
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
				<div class="w-full max-w-md rounded-lg bg-white p-6">
					<h3 class="mb-4 text-xl font-bold">
						{data.product?.isPublished ? 'Unpublish' : 'Publish'} Book
					</h3>
					<p class="mb-6 text-gray-600">
						Are you sure you want to {data.product?.isPublished ? 'unpublish' : 'publish'} "{name}"?
					</p>
					<div class="flex justify-end gap-4">
						<button
							class="rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
							onclick={() => (showPublishModal = false)}
						>
							Cancel
						</button>
						<button
							type="button"
							class="border-primary text-primary hover:bg-primary/10 rounded-sm border-2 px-4 py-2 transition-colors"
							onclick={async () => {
								showPublishModal = false;
								await togglePublish();
							}}
						>
							{data.product?.isPublished ? 'Unpublish' : 'Publish'}
						</button>
					</div>
				</div>
			</div>
		{/if}

		<div class="mb-6 flex items-center gap-4">
			<a
				href="/admin/product"
				class="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-200"
			>
				← Back to Products
			</a>
		</div>

		<div class="grid gap-6 lg:grid-cols-3">
			<!-- Main Content -->
			<div class="lg:col-span-2">
				<div class="rounded-lg border border-gray-200 bg-white">
					<div class="border-b p-6">
						<div class="flex items-center justify-between">
							<h1 class="text-2xl font-bold">{name}</h1>
						</div>
					</div>

					<div class="p-6">
						<form
							method="POST"
							use:enhance={({ formData }) => {
								formData.delete('categoryIds');
								selectedCategories.forEach((c) => {
									formData.append('categoryIds', c.id.toString());
								});
								return async ({ update, result }) => {
									console.log('form result ->  ', result);
									if (result.status === 200) {
										isEditMode = false;
										goto('/admin/product');
										toast.add('Success', 'Product updated', 'success');
									} else await update();
								};
							}}
							class="space-y-6"
						>
							{#if form?.errors}
								<div class="rounded-md bg-red-50 p-3 text-sm text-red-500">
									{form.errors}
								</div>
							{/if}

							<div class="space-y-4">
								<div>
									<label for="name" class="text-sm font-medium text-gray-700">Book Title</label>
									<input
										id="name"
										type="text"
										name="name"
										bind:value={name}
										class="focus:border-primary focus:ring-primary mt-1 w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
									/>
								</div>
								<!-- <div>
										<label for="servicecode" class="text-sm font-medium text-gray-700">Service Code</label>
										<input
											id="servicecode"
											type="text"
											name="serviceCode"
											bind:value={serviceCode}
											class="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
										/>
									</div> -->

								<div class="grid gap-4 sm:grid-cols-2">
									<div>
										<label for="price" class="text-sm font-medium text-gray-700">Price (KES)</label>
										<input
											id="price"
											type="number"
											name="price"
											bind:value={price}
											min="0"
											class="focus:border-primary focus:ring-primary mt-1 w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
										/>
									</div>
									<div>
										<label for="quantity" class="text-sm font-medium text-gray-700">Quantity in Stock</label>
										<input
											id="quantity"
											type="number"
											name="quantity"
											bind:value={quantity}
											min="0"
											class="focus:border-primary focus:ring-primary mt-1 w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
										/>
									</div>
									<div>
										<label for="author" class="text-sm font-medium text-gray-700">Author</label>
										<input
											id="author"
											type="text"
											name="author"
											bind:value={author}
											class="focus:border-primary focus:ring-primary mt-1 w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
										/>
									</div>

									<div>
										<label for="publicationDate" class="text-sm font-medium text-gray-700">Publication Date</label>
										<input
											id="publicationDate"
											type="date"
											name="publicationDate"
											bind:value={publicationDate}
											class="focus:border-primary focus:ring-primary mt-1 w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
										/>
									</div>

									<!-- Select categories section -->
									<!-- <div class="space-y-2">
										<label for="categories" class="text-sm font-medium text-gray-700">Select Categories</label>

										<div class="grid gap-2 sm:grid-cols-2">
											{#each categories as category}
												<div class="">
													<label for={`${category.id}`} class="text-sm font-medium text-gray-700"
														>{category.name}</label
													>
													<input
														id={`${category.id}`}
														type="checkbox"
														name="categoryIds"
														value={category.id}
														checked={!!product?.categories?.find((c) => c.id === category.id)}
														class="mt-1 w-full rounded-md border border-gray-300 p-2"
													/>
												</div>
											{/each}
										</div> -->

									<div class="mb-4 space-y-2">
										<label for="categories" class="text-sm font-medium text-gray-700">Select Categories</label>

										<!-- Dropdown: Only show categories that are not already selected -->
										<select
											name="categoryIds"
											class="focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-none"
											onchange={addCategory}
										>
											<option value="">Select a category</option>
											{#each categories as category (category.id)}
												{#if !selectedCategories.find((c) => c.id === category.id)}
													<option value={category.id}>{category.name}</option>
												{/if}
											{/each}
										</select>

										<!-- Display selected categories -->
										<div class="flex flex-wrap gap-2">
											<h6 class="w-full text-sm font-medium text-gray-600">Selected Categories:</h6>
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

									<div>
										<label for="pageCount" class="text-sm font-medium text-gray-700">Page Count</label>
										<input
											id="pageCount"
											type="number"
											name="pageCount"
											bind:value={pageCount}
											class="focus:border-primary focus:ring-primary mt-1 w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
										/>
									</div>

									<div>
										<label for="description" class="text-sm font-medium text-gray-700">Description</label>
										<textarea
											id="description"
											name="description"
											rows="3"
											bind:value={description}
											class="focus:border-primary focus:ring-primary mt-1 w-full rounded-md border border-gray-300 p-2 focus:ring-1 focus:outline-hidden"
										></textarea>
									</div>
								</div>
								<div class="flex justify-end gap-4">
									<div>
										<button
											type="button"
											onclick={() => (showPublishModal = true)}
											class="border-primary text-primary hover:bg-primary/10 rounded-sm border-2 px-4 py-2 transition-colors"
										>
											{data.product?.isPublished ? 'Unpublish' : 'Publish'}
										</button>
									</div>

									<button
										type="submit"
										class="bg-primary hover:bg-primary/90 cursor-pointer rounded-md px-4 py-2 text-white transition-colors"
									>
										Save
									</button>
									<button
										type="button"
										class="rounded-md bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200"
										onclick={() => (showDeleteModal = true)}
									>
										<!-- <Trash2 size={16} /> -->
										Delete
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
</style>
