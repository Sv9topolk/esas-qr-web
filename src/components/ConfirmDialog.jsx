import './ConfirmDialog.css';

/**
 * Компонент диалога подтверждения перехода по ссылке
 * @param {Object} props - Свойства компонента
 * @param {string} props.url - URL для перехода
 * @param {boolean} props.visible - Видимость диалога
 * @param {Function} props.onConfirm - Callback при нажатии "Перейти"
 * @param {Function} props.onCancel - Callback при нажатии "Отмена"
 */
export function ConfirmDialog({ url, visible, onConfirm, onCancel }) {
	if (!visible) {
		return null;
	}

	return (
		<div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
			<div className="dialog">
				<h2 id="dialog-title" className="dialog__title">
					Перейти по ссылке для оплаты парковки?
				</h2>
				<div className="dialog__url">{url}</div>
				<div className="dialog__actions">
					<button className="dialog__button dialog__button_primary" onClick={onConfirm}>
						Перейти
					</button>
					<button className="dialog__button dialog__button_secondary" onClick={onCancel}>
						Отмена
					</button>
				</div>
			</div>
		</div>
	);
}
