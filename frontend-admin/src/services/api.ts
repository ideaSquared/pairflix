// This file is a facade that re-exports everything from the modular api directory
// We maintain this file for backward compatibility with existing imports

import api from './api/index';

// Re-export everything
export * from './api/index';
export default api;
