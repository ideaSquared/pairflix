import axios, { AxiosError } from 'axios';

/**
 * Handle API errors in a consistent way
 */
export const handleApiError = (
	error: unknown,
	defaultMessage: string
): Error => {
	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError<{
			message?: string;
			error?: string;
		}>;

		// Get the error message from the response data if available
		const serverErrorMessage =
			axiosError.response?.data?.message || axiosError.response?.data?.error;

		if (serverErrorMessage) {
			return new Error(serverErrorMessage);
		}

		// If server didn't provide a message, use the status text
		if (axiosError.response) {
			return new Error(
				`${defaultMessage}: ${axiosError.response.status} ${axiosError.response.statusText}`
			);
		}
	}

	// For non-axios errors or network errors
	if (error instanceof Error) {
		return new Error(`${defaultMessage}: ${error.message}`);
	}

	// Fallback for unknown error types
	return new Error(defaultMessage);
};
