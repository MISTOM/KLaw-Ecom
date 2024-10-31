<script lang="ts">
	let title = 'Sample Product';
	let description = 'This is a sample product description.';
	let price = 1000;
	let serviceCode = 'ABC123';
	let isEditMode = false;

	const toggleEditMode = () => {
		isEditMode = !isEditMode;
	};

	const saveProduct = () => {
		// Logic to save the product
		console.log('Product saved:', { title, description, price, serviceCode });
		isEditMode = false;
	};

	const deleteProduct = () => {
		// Logic to delete the product
		console.log('Product deleted');
	};
</script>

<main class="m-4 grid grid-cols-1 p-4 md:grid-cols-2 lg:grid-cols-2">
	<div class="m-2">
		<img src="/samplePhoto.png" alt="product" class="m-auto size-96 object-cover shadow-2xl" />
	</div>
	<div class="m-2">
		<h1 class="mb-2 text-2xl font-bold">Product Details</h1>
		<div class="mb-2">
			<label class="block font-semibold" for="title">Title</label>
			<input
				type="text"
				id="title"
				bind:value={title}
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
				bind:value={price}
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
				<button
					onclick={saveProduct}
					class="rounded bg-blue-500 px-4 py-2 text-white transition-colors">Save</button
				>
			{:else}
				<button
					onclick={toggleEditMode}
					class="rounded bg-green-500 px-4 py-2 text-white transition-colors">Edit</button
				>
				<button
					
					class="rounded bg-green-500 px-4 py-2 text-white transition-colors">Publish</button
				>

				<button
					onclick={deleteProduct}
					class="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
					>Delete</button
				>
			{/if}
		</div>
	</div>
</main>

<style>
</style>
