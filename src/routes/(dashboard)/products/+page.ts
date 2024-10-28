import type { PageLoad } from "./$types";


export const load = (async ({ fetch }) => {
	const products = await fetch('https://dummyjson.com/products')
		.then((res) => res.json())
		.catch((e) => {
			console.log('Request Failed');
		});

	return { products: products.products };
}) satisfies PageLoad;
