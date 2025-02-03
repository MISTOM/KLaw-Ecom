<script>
	import '../app.css';
	// import { setUserState } from '$lib/state.svelte';
	import { setToastState } from '$lib/Toast.svelte';
	import Toaster from '$lib/components/Toaster.svelte';

	let { children, data } = $props();
	setToastState();
</script>

<div class="font-optima flex min-h-screen flex-col">
	<noscript>Please Enable Javascript for this app to run</noscript>
	<Toaster />
	<div class="grow">
		{@render children?.()}
	</div>

	<footer class="font-optima mt-7 rounded-xs bg-gray-50 pb-4 lg:mx-12">
		<div class="container mx-auto px-4">
			<hr class="mb-4 border-gray-400" />
			<div class="mb-4 flex flex-wrap justify-between">
				<div class="mb-4 w-full md:mb-0 md:w-2/3">
					<p class="text-sm">
						Except for some material which is expressly stated to be under a specified
						<a href="http://www.creativecommons.org/" class="text-primary hover:underline">Creative Commons</a>
						license, the contents of this website are in the public domain and free from any copyright restrictions.
					</p>
				</div>
				<div class="flex w-full flex-col items-center justify-center md:w-1/3 md:flex-row md:justify-end">
					<a
						href="https://new.kenyalaw.org/about/#contact"
						target="_blank"
						class="bg-primary hover:bg-primary/90 mb-2 rounded-md px-4 py-2 text-white md:mr-4 md:mb-0"
					>
						Contact Us
					</a>
					<ul class="flex space-x-4">
						<li>
							<a href="https://web.facebook.com/mykenyalaw" target="_blank" rel="noreferrer">
								<svg class="h-6 w-6 text-blue-600 hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
									<!-- Facebook Icon SVG -->
									<path
										d="M22.675 0h-21.35C.595 0 0 .597 0 1.333v21.333C0 23.403.595 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.405 24 24 23.403 24 22.667V1.333C24 .597 23.405 0 22.675 0z"
									/>
								</svg>
							</a>
						</li>
						<li>
							<a href="https://x.com/mykenyalaw" target="_blank" rel="noreferrer">
								<svg class="h-6 w-6 text-blue-400 hover:text-blue-200" fill="currentColor" viewBox="0 0 24 24">
									<!-- Twitter Icon SVG -->
									<path
										d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724 9.865 9.865 0 0 1-3.127 1.195 4.916 4.916 0 0 0-8.384 4.482A13.947 13.947 0 0 1 1.671 3.149 4.916 4.916 0 0 0 3.195 9.723a4.902 4.902 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 0 1-2.224.084 4.918 4.918 0 0 0 4.588 3.417A9.867 9.867 0 0 1 0 19.54a13.94 13.94 0 0 0 7.548 2.213c9.057 0 14.01-7.496 14.01-13.986 0-.21 0-.423-.015-.634A10.012 10.012 0 0 0 24 4.557z"
									/>
								</svg>
							</a>
						</li>
						<li>
							<a href="https://www.youtube.com/mykenyalaw" target="_blank" rel="noreferrer">
								<svg class="h-6 w-6 text-red-600 hover:text-red-400" fill="currentColor" viewBox="0 0 24 24">
									<!-- YouTube Icon SVG -->
									<path
										d="M23.498 6.186a2.96 2.96 0 0 0-2.084-2.091C19.727 3.6 12 3.6 12 3.6s-7.727 0-9.414.495a2.96 2.96 0 0 0-2.084 2.091C.001 7.873 0 12 0 12s.001 4.127.502 5.814a2.96 2.96 0 0 0 2.084 2.091C4.273 20.4 12 20.4 12 20.4s7.727 0 9.414-.495a2.96 2.96 0 0 0 2.084-2.091C23.999 16.127 24 12 24 12s-.001-4.127-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
									/>
								</svg>
							</a>
						</li>
					</ul>
				</div>
			</div>

			<div class="flex flex-wrap justify-between">
				<div class="w-full md:w-2/3">
					<ul class="flex flex-wrap space-x-4">
						<li>
							<a href="/" class="hover:text-secondary">Home</a>
						</li>
						<li>
							<a href="https://kenyalaw.org/kl/index.php?id=115" class="hover:text-secondary">About Us</a>
						</li>
						<li>
							<a href="https://kenyalaw.org/kl/index.php?id=2287" class="hover:text-secondary">Our Partners</a>
						</li>
						<li>
							<a href="https://kenyalaw.org/kl/index.php?id=133" class="hover:text-secondary">Careers</a>
						</li>
						<li>
							<a href="https://kenyalaw.org/kl/index.php?id=3158" class="hover:text-secondary">Contact Us</a>
						</li>
						<li>
							<a href="https://kenyalaw.org/kl/index.php?id=3386" class="hover:text-secondary">Site Map</a>
						</li>
					</ul>
				</div>
			</div>

			<div class="mt-4">
				<p class="text-sm font-bold">
					&copy 2024 National Council for Law Reporting (Kenya Law). |
					<a href="https://kenyalaw.org/kl/index.php?id=2161" class="text-primary hover:underline"
						>Creative Commons</a
					>
					·
					<a href="https://kenyalaw.org/kl/index.php?id=390" class="text-primary hover:underline"
						>Privacy Policy and Disclaimer</a
					>
				</p>
			</div>
		</div>
	</footer>
</div>
