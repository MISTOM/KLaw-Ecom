<script lang="ts">
	interface Props {
		currentPage: number;
		totalPages: number;
		onPageChange: (page: number) => void;
	}

	const { currentPage, totalPages, onPageChange }: Props = $props();

	// Generate pagination items with ellipsis logic
	function generatePaginationItems() {
		const items: (number | 'ellipsis')[] = [];
		const maxVisiblePages = 7; // Show max 7 page numbers (current + 2 on each side + first + last)

		if (totalPages <= maxVisiblePages + 2) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				items.push(i);
			}
		} else {
			// Always show first page
			items.push(1);

			const startPage = Math.max(2, currentPage - 2);
			const endPage = Math.min(totalPages - 1, currentPage + 2);

			// Add ellipsis after first page if needed
			if (startPage > 2) {
				items.push('ellipsis');
			}

			// Add pages around current page
			for (let i = startPage; i <= endPage; i++) {
				items.push(i);
			}

			// Add ellipsis before last page if needed
			if (endPage < totalPages - 1) {
				items.push('ellipsis');
			}

			// Always show last page
			if (totalPages > 1) {
				items.push(totalPages);
			}
		}

		return items;
	}

	const paginationItems = $derived(generatePaginationItems());
	const canGoPrevious = $derived(currentPage > 1);
	const canGoNext = $derived(currentPage < totalPages);
</script>

{#if totalPages > 1}
	<nav class="flex items-center justify-center" aria-label="Pagination Navigation">
		<div class="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
			<!-- Previous Button -->
			<button
				class="rounded-md bg-gray-100 px-3 py-2 text-sm transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
				disabled={!canGoPrevious}
				onclick={() => onPageChange(currentPage - 1)}
				aria-label="Go to previous page"
			>
				<span class="hidden sm:inline">Previous</span>
				<span class="sm:hidden">Prev</span>
			</button>

			<!-- Page Numbers -->
			{#each paginationItems as item}
				{#if item === 'ellipsis'}
					<span class="flex items-center px-2 text-sm text-gray-500" aria-hidden="true">...</span>
				{:else}
					<button
						class="rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-200 sm:px-4 {currentPage === item
							? 'bg-primary hover:bg-primary/90 text-white'
							: 'bg-gray-100'}"
						onclick={() => onPageChange(item)}
						aria-label="Go to page {item}"
						aria-current={currentPage === item ? 'page' : undefined}
					>
						{item}
					</button>
				{/if}
			{/each}

			<!-- Next Button -->
			<button
				class="rounded-md bg-gray-100 px-3 py-2 text-sm transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
				disabled={!canGoNext}
				onclick={() => onPageChange(currentPage + 1)}
				aria-label="Go to next page"
			>
				<span class="hidden sm:inline">Next</span>
				<span class="sm:hidden">Next</span>
			</button>
		</div>
	</nav>
{/if}
