import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), mkcert()],
	resolve: {
		alias: {
			"#game": path.resolve(__dirname, "./src/game"),
			"#components": path.resolve(__dirname, "./src/components"),
			"#assets": path.resolve(__dirname, "./src/assets"),
		},
	},
	server: {
		host: true,
	},
});
