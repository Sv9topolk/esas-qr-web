import { useEffect } from 'react';
import './Toast.css';

/**
 * Компонент всплывающего уведомления
 * @param {Object} props - Свойства компонента
 * @param {string} props.message - Текст уведомления
 * @param {boolean} props.visible - Видимость уведомления
 * @param {number} [props.duration=3000] - Время автоматического скрытия в мс
 */
export function Toast({ message, visible, duration = 3000 }) {
	useEffect(() => {
		if (visible && duration > 0) {
			const timer = setTimeout(() => {
				// Родительский компонент должен управлять видимостью
			}, duration);
			return () => clearTimeout(timer);
		}
	}, [visible, duration]);

	if (!visible) {
		return null;
	}

	return (
		<div className="toast toast_visible" role="alert" aria-live="polite">
			{message}
		</div>
	);
}
