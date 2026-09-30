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
    envDir: '../',
    server: {
        host: '127.0.0.1',
        watch: {
            ignored: ['**/backend/storage/framework/views/**'],
        },
    },
});
