<script lang="ts">
	import { enhance } from '$app/forms';

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

	const publishProduct = async () => {
		console.log('Publishing product');
		if (data?.product?.id) {
			const res = await fetch(`/api/product/${data.product.id}/publish`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (res.ok) {
				const json = await res.json();
				console.log(json);
			} else {
				console.error('Failed to publish product');
			}
		}
	};

	const deleteProduct = () => {};
</script>

<main class="m-4 grid grid-cols-1 p-4 md:grid-cols-2 lg:grid-cols-2">
	{#if data.product}
		<div class="m-2">
			<img src={imageUrl} alt="product" class="m-auto size-96 object-cover shadow-2xl" />
		</div>
		<div class="m-2">
			<h1 class="mb-2 text-2xl font-bold">Product Details</h1>
			<form method="POST">
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
						class="w-full p-2"
						class:border={isEditMode}
						class:border-none={!isEditMode}
						class:bg-transparent={!isEditMode}
						disabled={!isEditMode}
					/>
				</div>
				<div class="mb-2">
					<label class="block font-semibold" for="description">Description</label>
					<textarea
						name="description"
						id="description"
						bind:value={description}
						class="w-full p-2"
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
						class="w-full p-2"
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
						class="w-full p-2"
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
						class="w-full p-2"
						class:border={isEditMode}
						class:border-none={!isEditMode}
						class:bg-transparent={!isEditMode}
						disabled={!isEditMode}
					/>
				</div>
				<div class="flex space-x-2">
					{#if isEditMode}
						<button type="submit" class="rounded bg-blue-500 px-4 py-2 text-white transition-colors"
							>Save</button
						>
					{:else}
						<button
							type="button"
							onclick={toggleEditMode}
							class="rounded bg-green-500 px-4 py-2 text-white transition-colors">Edit</button
						>
						<button
							type="button"
							class="rounded bg-green-500 px-4 py-2 text-white transition-colors"
							onclick={publishProduct}>Publish</button
						>

						<button
							type="button"
							onclick={deleteProduct}
							class="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
							>Delete</button
						>
					{/if}
				</div>
			</form>
		</div>
	{:else if data.status === 404}
		<p class="text-3xl font-thin">{data.error}</p>
	{:else}
		<p class="text-lg font-thin">Failed to load product</p>
	{/if}
</main>

<style>
</style>
