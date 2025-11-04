import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
    base: '/ton-apy-cal/',
    plugins: [
        nodePolyfills({
            // Whether to polyfill `node:` protocol imports.
            protocolImports: true,
            // Whether to polyfill specific globals.
            globals: {
                Buffer: true, // Enables the Buffer polyfill
                global: true, // Enables the global polyfill
                process: true, // Enables the process polyfill
            },
        }),
        vue()
    ],
    // Explicitly define node compatibility settings
    resolve: {
        alias: {
            // Add alias for buffer
            buffer: 'buffer/'
        }
    },
    // Define required Node.js built-ins
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis'
            }
        }
    },
    // Add buffer as a dependency in the build process
    build: {
        rollupOptions: {
            plugins: [],
            output: {
                manualChunks: {},
            }
        },
        commonjsOptions: {
            transformMixedEsModules: true
        }
    }
}) 