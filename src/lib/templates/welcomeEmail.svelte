<script>
	const { username } = $props();
</script>

<svelte:head>
	<meta charset="utf-8" />
	<title>Welcome Email</title>
</svelte:head>
<div class="bg-white font-sans text-black">
	<div class="container mx-auto px-4 py-8">
		<h1 class="mb-4 text-3xl font-bold">Welcome, {username}!</h1>
		<p class="mb-6">Thanks for joining us! We hope you enjoy your time here.</p>
		<a href="/#" class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">Get Started</a>
	</div>
	<pre>{username}</pre>
</div>
