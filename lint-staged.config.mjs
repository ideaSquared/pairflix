export default {
  // Lint and fix JavaScript/TypeScript files
  '*.{js,ts,jsx,tsx}': ['eslint --fix', 'prettier --write'],
  // Format JSON, Markdown, and CSS/SCSS files
  '*.{json,md,css,scss}': ['prettier --write'],
};
