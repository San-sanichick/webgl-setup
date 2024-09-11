import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import plainText from 'vite-plugin-plain-text'
import arraybuffer from "vite-plugin-arraybuffer";



// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        arraybuffer(),
        plainText(
            [/\.glsl$/],
            { namedExport: false, dtsAutoGen: true, distAutoClean: true },
        ),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
