import typescript from "@rollup/plugin-typescript"
import terser from "@rollup/plugin-terser"

/** @type {import('rollup').RollupOptions} */
const options = {
    input: "src/index.ts",
    output: {
        file: "dist/bundle.js",
        format: "esm",
        sourcemap: true,
    },
    plugins: [typescript(), terser()]
}

export default options