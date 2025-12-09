import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			// Rule: "If a request starts with /api, forward it to the backend"
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false,
			},
		},
	},
})
