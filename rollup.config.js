import ts from "typescript";
import typescript from "rollup-plugin-typescript";

export default {
	entry: "src/content/index.ts",
	format: "cjs", // CommonJS
	dest: "dist/content.js",
	plugins: [
		typescript({
			typescript: ts
		})
	]
}
