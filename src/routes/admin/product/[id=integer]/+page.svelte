<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidate } from '$app/navigation';
	import { getToastState } from '$lib/Toast.svelte';

	const { data, form } = $props();
	const toast = getToastState();
	let name = $state(data.product?.name);
	let description = $state(data.product?.description);

	let price = $state(data.product?.price);
	let quantity = $state(data.product?.quantity);
	let serviceCode = $state(data.product?.serviceCode);
	let imageUrl = $state(data.product?.Image[0]?.url);
	let showDeleteModal = $state(false);

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
				await invalidate('update:product');
			} else if (res.status === 401) {
				console.error('Unauthorized');
				await goto(`/login?redirect=${window.location.pathname}`);
			} else {
				console.error('Failed to publish product');
			}
		}
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
				console.log(data);
			} else {
				console.error('Failed to delete product');
			}
		}
	};
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
						<button type="submit" class="rounded bg-blue-500 px-4 py-2 text-white transition-colors">Save</button>
					{:else}
						<button
							type="button"
							onclick={toggleEditMode}
							class="rounded bg-green-500 px-4 py-2 text-white transition-colors">Edit</button
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
							class="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600">Delete</button
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
						<div class="flex items-center gap-2">
							<button
								class="rounded-md bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200"
								onclick={() => (showDeleteModal = true)}
							>
								<!-- <Trash2 size={16} /> -->
								delete
							</button>
						</div>
					</div>
				</div>

				<div class="p-6">
					<form
						method="POST"
						use:enhance={() => {
							return async ({ update, result }) => {
								console.log('form result ->  ', result);
								if (result.status === 200) {
									isEditMode = false;
									await update({ reset: false });
									toast.add('Success', 'Product updated', 'success');
								} else await update();
							};
						}}
						class="space-y-6"
					>
						{#if form?.error}
							<div class="rounded-md bg-red-50 p-3 text-sm text-red-500">
								{form.error}
							</div>
						{/if}

						<div class="space-y-4">
							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label for="name" class="text-sm font-medium text-gray-700">Book Title</label>
									<input
										id="name"
										type="text"
										name="name"
										bind:value={name}
										class="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									/>
								</div>
								<div>
									<label for="servicecode" class="text-sm font-medium text-gray-700">Service Code</label>
									<input
										id="servicecode"
										type="text"
										name="serviceCode"
										bind:value={serviceCode}
										class="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									/>
								</div>
							</div>

							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label for="price" class="text-sm font-medium text-gray-700">Price (KES)</label>
									<input
										id="price"
										type="number"
										name="price"
										bind:value={price}
										min="0"
										class="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
										class="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									/>
								</div>
								<div>
									<label for="" class="text-sm font-medium text-gray-700">Description</label>
									<textarea
										id="description"
										name="description"
										rows="3"
										bind:value={description}
										class="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									></textarea>
								</div>
							</div>
							<label for="isPublished" class="text-sm font-black text-gray-700">
								{data.product?.isPublished ? 'Published' : 'Publish'}
							</label>
							<input
								id="isPublished"
								type="checkbox"
								name="isPublished"
								checked={data.product?.isPublished}
								onchange={togglePublish}
								class="block h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
							/>

							<div class="flex justify-end">
								<button
									type="submit"
									class="rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
								>
									Save
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
</style>
