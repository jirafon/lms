# React + Webpack

This client is bundled with Webpack 5 and Babel.

Available scripts:

- `npm run dev`: start the development server on port 3000 by default
- `npm run build`: generate the production bundle in `dist`
- `npm run preview`: serve the built `dist` folder locally
- `npm run lint`: run ESLint with the flat config in `eslint.config.js`

Environment variables:

- `VITE_API_BASE_URL`: API base URL injected at build time for backward compatibility with the existing client code
