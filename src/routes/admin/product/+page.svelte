<script lang="ts">
	let products = [
		{
			id: 1,
			title: 'Book - 2011 Edition',
			price: 300,
			quantity: 10,
			published: false
		},
		{
			id: 2,
			title: 'Book - 2012 Edition',
			price: 350,
			quantity: 5,
			published: false
		}
		// Add more products as needed
	];

	const publishProduct = (id: any) => {
		products = products.map((product) =>
			product.id === id ? { ...product, published: true } : product
		);
	};

	const deleteProduct = (id: any) => {
		products = products.filter((product) => product.id !== id);
	};

	const editProduct = (id: any) => {
		// Logic to edit the product
		console.log('Edit product:', id);
	};
</script>

<main class="m-2 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
	<div class="col-span-2">
		<h1 class="text-4xl">All Products</h1>
		<hr />
		{#each products as product, i}
			<a href={`/admin/product/${product.id}`}>
				<div class="my-3 flex items-center rounded-md border p-1 hover:shadow-sm">
					<img src="/samplePhoto.png" alt="sample" class="mr-4 size-14" />
					<div class="flex-grow">
						<h2 class="text-lg font-semibold">{product.title}</h2>
						<p>Price: KES {product.price}</p>
						<p>Quantity: {product.quantity}</p>
					</div>

					<div class="flex space-x-2">
						{#if !product.published}
							<button
								onclick={() => publishProduct(product.id)}
								class="rounded-md border px-2 py-1 hover:border-green-400">Publish</button
							>
							<!-- TODO: when one clicks, the <a> tag is triggered -->
						{/if}
						<button
							onclick={() => editProduct(product.id)}
							class="rounded-md border px-2 py-1 hover:border-primary">Edit</button
						>
						<button
							onclick={() => deleteProduct(product.id)}
							class="rounded-md border px-2 py-1 hover:border-red-400">Delete</button
						>
					</div>
				</div>
			</a>
		{/each}
	</div>
	<div>
		<h1 class="text-2xl mb-2">Add Product</h1>
		<hr />
		<form>
			<div class=" space-y-2">
				<label for="title" class="block">Title</label>
				<input type="text" id="title" name="title" class="w-full border p-2" />
				<label for="price" class="block">Price</label>
				<input type="number" id="price" name="price" class="w-full border p-2" />
				<label for="quantity" class="block">Quantity</label>
				<input type="number" id="quantity" name="quantity" class="w-full border p-2" />
				<label for="description" class="block">Description</label>
				<input type="test" id="description" name="description" class="w-full border p-2" />
				<label for="serviceCode" class="block">Service Code</label>
				<input type="text" id="serviceCode" name="serviceCode" class="w-full border p-2" />
				<button type="submit" class="rounded-md border p-2 hover:border-primary"
					>Add Product</button
				>
			</div>
		</form>
	</div>
</main>
