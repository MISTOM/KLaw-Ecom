<!-- Purchase Details -->
<script lang="ts">
	// Sample data for purchase details
	let purchaseDetails = {
		productName: 'Sample Product',
		price: 50,
		quantity: 2,
		total: 100
	};
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">Purchase Details</h1>
	<div class="rounded-lg bg-white p-6 shadow-md">
		<div class="mb-4">
			<h2 class="text-xl font-semibold">Product Name</h2>
			<p>{purchaseDetails.productName}</p>
		</div>
		<div class="mb-4">
			<h2 class="text-xl font-semibold">Price</h2>
			<p>${purchaseDetails.price}</p>
		</div>
		<div class="mb-4">
			<h2 class="text-xl font-semibold">Quantity</h2>
			<p>{purchaseDetails.quantity}</p>
		</div>
		<div class="mb-4">
			<h2 class="text-xl font-semibold">Total</h2>
			<p>${purchaseDetails.total}</p>
		</div>
	</div>
</div>
