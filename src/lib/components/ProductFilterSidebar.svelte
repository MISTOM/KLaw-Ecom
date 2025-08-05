<script lang="ts">
	interface Category {
		id: number;
		name: string;
		count: number;
	}

	interface Props {
		categories: Category[];
		selectedCategories: number[];
		selectedYear: string;
		years: number[];
		isMobileFiltersOpen: boolean;
		onCategoryToggle: (categoryId: number) => void;
		onYearChange: (year: string) => void;
		onClearFilters: () => void;
		onToggleMobileFilters: () => void;
	}

	const {
		categories,
		selectedCategories,
		selectedYear,
		years,
		isMobileFiltersOpen,
		onCategoryToggle,
		onYearChange, 
		onClearFilters,
		onToggleMobileFilters
	}: Props = $props();
</script>

<!-- Mobile Filter Overlay -->
{#if isMobileFiltersOpen}
	<div
		class="fixed inset-0 z-40 bg-black/10 md:hidden"
		onclick={onToggleMobileFilters}
		onkeydown={(e) => e.key === 'Escape' && onToggleMobileFilters()}
		role="button"
		tabindex="0"
		aria-label="Close filters"
	></div>
{/if}

<!-- Sidebar -->
<aside
	class="fixed top-0 left-0 z-50 h-full w-80 bg-white shadow-xl transition-transform duration-150 ease-in-out md:sticky md:top-4 md:z-0 md:h-fit md:max-h-[calc(100vh-2rem)] md:w-64 md:translate-x-0 md:shadow-none {isMobileFiltersOpen
		? 'translate-x-0'
		: '-translate-x-full'}"
>
	<div class="h-full overflow-y-auto p-6">
		<!-- Mobile Close Button -->
		<div class="mb-4 flex items-center justify-between md:hidden">
			<h2 class="text-lg font-semibold">Filters</h2>
			<button onclick={onToggleMobileFilters} class="p-1" aria-label="Close filters">
				<i class="bi bi-x-lg"></i>
			</button>
		</div>

		<!-- Categories Section -->
		<div class="mb-6">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold">Categories</h3>
				<button aria-label="Collapse categories">
					<i class="bi bi-chevron-up text-sm"></i>
				</button>
			</div>

			<div class="space-y-3">
				{#each categories as category}
					<label class="flex cursor-pointer items-center justify-between">
						<div class="flex items-center">
							<input
								type="checkbox"
								class="mr-3 h-4 w-4 rounded "	
								checked={selectedCategories.includes(category.id)}
								onchange={() => onCategoryToggle(category.id)}
							/>
							<span class="text-sm text-gray-700">{category.name}</span>
						</div>
						{#if selectedCategories.length === 0 || selectedCategories.includes(category.id)}
							<span class="text-xs text-gray-500">({category.count})</span>
						{/if}
					</label>
				{/each}
			</div>
		</div>

		<!-- Year Filter -->
		<div class="mb-6">
			<h3 class="mb-4 text-lg font-semibold">Publication Year</h3>
            {selectedYear}
			<select
				value={selectedYear}
                onchange={(e) => onYearChange(e.currentTarget.value)}
				class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-5 focus:ring-primary/30 focus:outline-hidden"
			>
				<option value="all">All Years</option>
				{#each years as year}
					<option value={year}>{year}</option>
				{/each}
			</select>
		</div>

		<!-- Clear Filters -->
		{#if selectedCategories.length > 0 || selectedYear !== 'all'}
			<button
				class="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
				onclick={onClearFilters}
			>
				Clear All Filters
			</button>
		{/if}
	</div>
</aside>
