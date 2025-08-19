import { defineConfig } from 'wxt';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    default_locale: 'en',
    name: '__MSG_extensionName__',
    description: '__MSG_extensionDescription__',
    version: '1.0.0',
    permissions: [
      'storage',
      'tabs',
      'scripting'
    ],
    host_permissions: [
      'http://localhost:3000/*',
      'https://my-heybe.vercel.app/*',
      'https://*/*',
      'http://*/*'
    ]
  },
  vite: () => ({
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  }),
});
