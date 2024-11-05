<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidate, invalidateAll } from '$app/navigation';
	import { getUserState } from '$lib/state.svelte.js';

	const { data, form } = $props();

	const user = getUserState();

	const products = $derived(data.products || []);

	// $inspect(products);

	let name = $state(form?.data?.name);
	let description = $state(form?.data?.description);
	let price = $state(form?.data?.price);
	let quantity = $state(form?.data?.quantity);
	let serviceCode = $state(form?.data?.serviceCode);

	const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
</script>

<main class="m-2 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
	<div class="col-span-2">
		<h1 class="text-4xl">All Products for {data.user?.name}</h1>
		<hr />	
		{#each products as product, i}
		{i}
			<a href={`/admin/product/${product.id}`}>
				<div class="my-3 flex items-center rounded-md border p-1 hover:shadow-sm">
					<img src={product.Image[0]?.url} alt="product" class="mr-4 size-14" />
					<div class="flex-grow">
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
				<input
					type="text"
					id="Name"
					name="name"
					class="w-full rounded-md border p-2"
					bind:value={name}
					required
				/>

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

				<button type="submit" class="rounded-md border p-2 hover:border-primary">Add Product</button
				>
			</div>
		</form>
	</div>
</main>
