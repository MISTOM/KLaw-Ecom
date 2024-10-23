<script>
    import '../app.css'
    import cart from '$lib/Cart.svelte'

    let {children} = $props()
</script>

<header class="flex justify-between p-4 bg-gray-800 text-white">
    <h1 class="text-2xl font-bold">KenyaLaw E-comm</h1>
    <nav class="flex items-center">
        <ul class="flex">
            <li class="mx-4 hover:text-yellow-400 transition-colors"><a href="/">Home</a></li>
            <li class="mx-4 hover:text-yellow-400 transition-colors"><a href="/products">Products</a></li>
            <li class="mx-4 hover:text-yellow-400 transition-colors"><a href="/about">About</a></li>
        </ul>
    </nav>
    <div>
        <button class="bg-yellow-500 rounded hover:bg-amber-500 transition-colors p-2" onclick={()=> cart.cartopen = !cart.cartopen}> Cart: {cart.cartStats.quantity}</button>
    </div>
</header>

<div>
    {@render children?.()}
</div>
<footer class=""></footer>