/**
 * Custom Jest transformer for handling import.meta.env in Vite projects
 */
module.exports = {
	process(sourceText) {
		// Replace import.meta.env.X with process.env.X
		const transformedCode = sourceText.replace(
			/import\.meta\.env\.(\w+)/g,
			(_, key) => `process.env.${key}`
		);

		return {
			code: transformedCode,
		};
	},
};
