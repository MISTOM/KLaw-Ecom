import type { Config } from 'tailwindcss'
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: '#8F2A2B',
				secondary: '#FAA21B',
				fadeblack: '#282828'
			},
			fontFamily: {
				optima: ['Optima', 'sans-serif'],
			}
		}
	},
	plugins: [],

} as Config;
