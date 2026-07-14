/** Capitalizes the first letter of each word — used for city names pulled from lowercase data. */
export function capitalize(s) {
	return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
