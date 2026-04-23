import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: '/PC-Builder-MasterD/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                galeria: resolve(__dirname, 'views/galeria.html'),
                presupuesto: resolve(__dirname, 'views/presupuesto.html'),
                contacto: resolve(__dirname, 'views/contacto.html'),
            },
        },
    },
});