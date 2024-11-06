<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidate } from '$app/navigation';

	const { data, form } = $props();

	let name = $state(data.product?.name);
	let description = $state(data.product?.description);

	let price = $state(data.product?.price);
	let quantity = $state(data.product?.quantity);
	let serviceCode = $state(data.product?.serviceCode);
	let imageUrl = $state(data.product?.Image[0]?.url);

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
				await goto('/admin/product');
			} else if (res.status === 401) {
				console.error('Unauthorized');
				await goto(`/login?redirect=${window.location.pathname}`);
			} else if (res.status === 400) {
				console.error('Product is on order');
				const data = await res.json();
				console.log(data);
			} else {
				console.error('Failed to delete product');
			}
		}
	};
</script>

<main class="m-4 grid grid-cols-1 p-4 md:grid-cols-2 lg:grid-cols-2">
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
					<span class="text-sm text-red-500">{form.error}</span>
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
</main>

<style>
</style>
