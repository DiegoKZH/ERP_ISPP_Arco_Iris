import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'src/app.jsx',
            ],
            refresh: true,
            publicDirectory: '../public',
            hotFile: '../public/hot',
            buildDirectory: 'build',
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, 'src'),
        },
    },
    server: {
        watch: {
            ignored: ['**/backend/storage/framework/views/**'],
        },
    },
});
