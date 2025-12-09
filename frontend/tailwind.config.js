/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				text: '#eef1f6',
				background: '#0b1019',
				primary: '#99b0d9',
				secondary: '#294882',
				accent: '#356acb',
			},
		},
	},
	plugins: [],
}
