<script lang="ts">
	let purchases = [
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
	];
</script>

<main class="m-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
	<div>
		<h1 class="text-4xl">All Purchases</h1>
		<hr />
		{#each purchases as purchase, i}
			<a href={`/admin/order/${purchase.id}`}>
				<div class="my-3 flex items-center rounded-md border p-1 hover:shadow-sm">
					<img src="/samplePhoto.png" alt="sample" class="mr-4 size-14" />
					<div class="flex-grow">
						<h2 class="text-lg font-semibold">{purchase.title}</h2>
						<p>Price: KES {purchase.price}</p>
						<p>Quantity: {purchase.quantity}</p>
					</div>

					<div class="flex space-x-2">
						<button class="rounded-md border px-2 py-1 hover:border-primary">Issue</button>
					</div>
				</div>
			</a>
		{/each}
	</div>
	<div>
		<!-- Search box -->
		<div class="flex items-center">
			<input
				type="text"
				placeholder="Search for a purchase"
				class="w-full rounded-md border border-gray-300 p-2"
			/>
			<button class="rounded-md border px-2 py-1 hover:border-primary">Search</button>
		</div>
	</div>
</main>
