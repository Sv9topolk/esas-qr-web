import { useState, useCallback, useEffect } from 'react';
import { Button, Spin } from 'antd';
import './ResultDialog.css';

/**
 * Константы для имитации API
 */
const API_DELAY = 1500;
const PROBABILITY_NO_PAYMENT = 2 / 3;

/**
 * Тексты результатов
 */
const RESULT_MESSAGES = {
	noPayment: 'Время бесплатной парковки еще не закончилось. Оплата не требуется',
	paymentRequired: 'Время бесплатной парковки превышено на 65 минут. К оплате 1.42 руб.',
};

/**
 * Компонент модального окна с результатом проверки
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.visible - Видимость диалога
 * @param {Function} props.onReturnToForm - Callback при возврате к форме
 */
export function ResultDialog({ visible, onReturnToForm }) {
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState(null); // null | 'noPayment' | 'paymentRequired'

	// Сбрасываем состояние при открытии диалога
	useEffect(() => {
		if (visible) {
			setResult(null);
			setIsLoading(false);
		}
	}, [visible]);

	/**
	 * Обработка нажатия на кнопку "Проверить сумму"
	 */
	const handleCheckAmount = useCallback(() => {
		setIsLoading(true);

		// Имитация API-запроса
		setTimeout(() => {
			setIsLoading(false);

			// Случайный результат с вероятностью 2/3 для "оплата не требуется"
			const isNoPayment = Math.random() < PROBABILITY_NO_PAYMENT;
			setResult(isNoPayment ? 'noPayment' : 'paymentRequired');
		}, API_DELAY);
	}, []);

	/**
	 * Обработка возврата к форме
	 */
	const handleReturnToForm = useCallback(() => {
		onReturnToForm();
	}, [onReturnToForm]);

	if (!visible) {
		return null;
	}

	return (
		<div className="dialog-overlay" role="dialog" aria-modal="true">
			<div className="result-dialog">
				<h2 className="result-dialog__title">Результат проверки</h2>

				{isLoading ? (
					<div className="result-dialog__loading">
						<Spin size="large" />
						<p className="result-dialog__loading-text">Проверка суммы...</p>
					</div>
				) : result ? (
					<>
						<div
							className={`result-dialog__message ${
								result === 'noPayment'
									? 'result-dialog__message_success'
									: 'result-dialog__message_warning'
							}`}
						>
							{RESULT_MESSAGES[result]}
						</div>
						<Button
							type="primary"
							size="large"
							block
							onClick={handleReturnToForm}
							className="result-dialog__button"
						>
							Вернуться к форме
						</Button>
					</>
				) : (
					<Button
						type="primary"
						size="large"
						block
						onClick={handleCheckAmount}
						className="result-dialog__button"
					>
						Проверить сумму
					</Button>
				)}
			</div>
		</div>
	);
}
