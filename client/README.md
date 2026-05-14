# React + Webpack

This client is bundled with Webpack 5 and Babel.

Available scripts:

- `npm run dev`: start the development server on port 5173 by default, or the value from `PORT`; on Render or other production runtimes it falls back to a built static server instead of `webpack serve`
- `npm start`: serve the built `dist` folder on `0.0.0.0:$PORT` for production-style hosts
- `npm run build`: generate the production bundle in `dist`
- `npm run preview`: serve the built `dist` folder locally
- `npm run lint`: run ESLint with the flat config in `eslint.config.js`

Environment variables:

- `REACT_APP_API_BASE_URL`: API base URL injected at build time for the React client
