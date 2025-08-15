<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Modal from '$lib/components/Modal.svelte';

	const { data, form } = $props();

	let showModal = $state(false);
	let selectedPlan: PageData['plans'][0] | null = $state(null);

	function openModal(plan: PageData['plans'][0] | null = null) {
		selectedPlan = plan
			? { ...plan }
			: {
					id: 0,
					name: '',
					description: '',
					price: 0,
					duration: 0,
					isActive: true,
					createdAt: new Date(),
					updatedAt: new Date()
				};
		showModal = true;
	}
</script>

<div class="p-4">
	<h1 class="mb-4 text-2xl font-bold">Manage Subscription Plans</h1>

	<div class="mb-4 flex justify-end">
		<button
			class="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
			onclick={() => openModal()}>Add New Plan</button
		>
	</div>

	<div class="overflow-x-auto">
		<table class="table w-full">
			<thead>
				<tr>
					<th>Name</th>
					<th>Price</th>
					<th>Duration (Days)</th>
					<th>Active</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.plans as plan}
					<tr>
						<td>{plan.name}</td>
						<td>{plan.price}</td>
						<td>{plan.duration}</td>
						<td>{plan.isActive ? 'Yes' : 'No'}</td>
						<td>
							<button
								class="rounded bg-gray-600 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-700"
								onclick={() => openModal(plan)}>Edit</button
							>
							<form action="?/deletePlan" method="POST" class="ml-2 inline-block">
								<input type="hidden" name="id" value={plan.id} />
								<button
									type="submit"
									class="rounded bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-700"
									>Delete</button
								>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<Modal bind:show={showModal} title={selectedPlan?.id ? 'Edit Plan' : 'Add Plan'}>
	<form action="?/savePlan" method="POST" onsubmit={() => (showModal = false)}>
		{#if selectedPlan?.id}
			<input type="hidden" name="id" value={selectedPlan.id} />
		{/if}
		<div class="form-control">
			<label class="label" for="name">Name</label>
			<input
				type="text"
				id="name"
				name="name"
				class="input input-bordered"
				bind:value={selectedPlan.name}
				required
			/>
		</div>
		<div class="form-control">
			<label class="label" for="description">Description</label>
			<textarea
				id="description"
				name="description"
				class="textarea textarea-bordered"
				bind:value={selectedPlan.description}
			></textarea>
		</div>
		<div class="form-control">
			<label class="label" for="price">Price</label>
			<input
				type="number"
				id="price"
				name="price"
				class="input input-bordered"
				bind:value={selectedPlan.price}
				required
			/>
		</div>
		<div class="form-control">
			<label class="label" for="duration">Duration (Days)</label>
			<input
				type="number"
				id="duration"
				name="duration"
				class="input input-bordered"
				bind:value={selectedPlan.duration}
				required
			/>
		</div>
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text">Is Active</span>
				<input
					type="checkbox"
					name="isActive"
					class="toggle toggle-primary"
					bind:checked={selectedPlan.isActive}
					value="true"
				/>
			</label>
		</div>
		<div class="modal-action">
			<button
				type="button"
				class="rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
				onclick={() => (showModal = false)}>Cancel</button
			>
			<button type="submit" class="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
				>Save</button
			>
		</div>
	</form>
</Modal>
