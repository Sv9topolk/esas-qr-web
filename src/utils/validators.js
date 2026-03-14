/**
 * Проверяет, является ли строка валидным URL
 * @param {string} text - Проверяемая строка
 * @returns {boolean} true, если строка является валидным URL с http/https схемой
 */
export function isValidUrl(text) {
	try {
		const url = new URL(text);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}
