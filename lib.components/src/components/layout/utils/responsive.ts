// Define responsive breakpoints
export const breakpoints = {
	xs: '375px', // Small mobile
	sm: '576px', // Mobile
	md: '768px', // Tablet
	lg: '992px', // Small desktop
	xl: '1200px', // Desktop
	xxl: '1600px', // Large desktop
};

// Media query helpers for better readability
export const media = {
	mobile: `(max-width: ${breakpoints.sm})`,
	tablet: `(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`,
	desktop: `(min-width: ${breakpoints.lg})`,
	smallMobile: `(max-width: ${breakpoints.xs})`,
	smallDesktop: `(min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.xl})`,
	largeDesktop: `(min-width: ${breakpoints.xl})`,
};
