import { useState, useEffect, useCallback } from 'react';
import { Tabs, Input, Button } from 'antd';
import './InputForm.css';

/**
 * Константы для LocalStorage
 */
const STORAGE_KEY_CAR_NUMBER = 'lastCarNumber';

/**
 * Компонент формы с табами для ввода номера автомобиля или парковочного талона
 * @param {Object} props - Свойства компонента
 * @param {Function} props.onSubmit - Callback при отправке формы (data: { type: 'car'|'ticket', value: string }) => void
 */
export function InputForm({ onSubmit }) {
	const [activeTab, setActiveTab] = useState('car');
	const [carNumber, setCarNumber] = useState('');
	const [ticketNumber, setTicketNumber] = useState('');
	const [errors, setErrors] = useState({ car: '', ticket: '' });
	const [touched, setTouched] = useState({ car: false, ticket: false });

	// Восстанавливаем последний номер автомобиля из localStorage
	useEffect(() => {
		const savedCarNumber = localStorage.getItem(STORAGE_KEY_CAR_NUMBER);
		if (savedCarNumber) {
			setCarNumber(savedCarNumber);
		}
	}, []);

	/**
	 * Валидация номера автомобиля
	 * @param {string} value - Номер автомобиля для проверки
	 * @returns {string} Текст ошибки или пустая строка
	 */
	const validateCarNumber = useCallback((value) => {
		if (!value || !value.trim()) {
			return 'Обязательно для заполнения';
		}
		return '';
	}, []);

	/**
	 * Валидация номера парковочного талона
	 * @param {string} value - Номер талона для проверки
	 * @returns {string} Текст ошибки или пустая строка
	 */
	const validateTicketNumber = useCallback((value) => {
		if (!value || !value.trim()) {
			return 'Обязательно для заполнения';
		}
		return '';
	}, []);

	/**
	 * Обработка изменения номера автомобиля с автопереводом в верхний регистр
	 */
	const handleCarNumberChange = useCallback((e) => {
		const value = e.target.value.toUpperCase();
		setCarNumber(value);

		// Валидация при изменении, если поле уже было затронуто
		if (touched.car) {
			setErrors((prev) => ({ ...prev, car: validateCarNumber(value) }));
		}
	}, [touched.car, validateCarNumber]);

	/**
	 * Обработка изменения номера талона
	 */
	const handleTicketNumberChange = useCallback((e) => {
		const value = e.target.value.replace(/\D/g, ''); // Только цифры
		setTicketNumber(value);

		// Валидация при изменении, если поле уже было затронуто
		if (touched.ticket) {
			setErrors((prev) => ({ ...prev, ticket: validateTicketNumber(value) }));
		}
	}, [touched.ticket, validateTicketNumber]);

	/**
	 * Обработка потери фокуса полем номера автомобиля
	 */
	const handleCarNumberBlur = useCallback(() => {
		setTouched((prev) => ({ ...prev, car: true }));
		setErrors((prev) => ({ ...prev, car: validateCarNumber(carNumber) }));
	}, [carNumber, validateCarNumber]);

	/**
	 * Обработка потери фокуса полем талона
	 */
	const handleTicketNumberBlur = useCallback(() => {
		setTouched((prev) => ({ ...prev, ticket: true }));
		setErrors((prev) => ({ ...prev, ticket: validateTicketNumber(ticketNumber) }));
	}, [ticketNumber, validateTicketNumber]);

	/**
	 * Обработка отправки формы
	 */
	const handleSubmit = useCallback(() => {
		const carError = validateCarNumber(carNumber);
		const ticketError = validateTicketNumber(ticketNumber);

		setErrors({ car: carError, ticket: ticketError });
		setTouched({ car: true, ticket: true });

		if (activeTab === 'car' && !carError) {
			// Сохраняем номер автомобиля в localStorage
			localStorage.setItem(STORAGE_KEY_CAR_NUMBER, carNumber.trim());
			onSubmit({ type: 'car', value: carNumber.trim() });
		} else if (activeTab === 'ticket' && !ticketError) {
			onSubmit({ type: 'ticket', value: ticketNumber.trim() });
		}
	}, [activeTab, carNumber, ticketNumber, validateCarNumber, validateTicketNumber, onSubmit]);

	/**
	 * Проверка, можно ли отправить форму
	 */
	const canSubmit = useCallback(() => {
		if (activeTab === 'car') {
			return !errors.car && carNumber.trim().length > 0;
		}
		return !errors.ticket && ticketNumber.trim().length > 0;
	}, [activeTab, errors, carNumber, ticketNumber]);

	return (
		<div className="input-form">
			<div className="input-form__instructions">
				Для проверки суммы оплаты парковки введите номер автомобиля или парковочного
				талона, после отсканируйте QR-код паркомата. Если время бесплатной парковки
				истекло - приложение покажет сумму к оплате
			</div>

			<Tabs
				activeKey={activeTab}
				onChange={setActiveTab}
				centered
				items={[
					{
						key: 'car',
						label: 'Номер автомобиля',
						children: (
							<div className="input-form__field">
								<Input
									placeholder="0000 AA-7"
									value={carNumber}
									onChange={handleCarNumberChange}
									onBlur={handleCarNumberBlur}
									status={touched.car && errors.car ? 'error' : ''}
									size="large"
									maxLength={10}
								/>
								{touched.car && errors.car && (
									<div className="input-form__error">{errors.car}</div>
								)}
							</div>
						),
					},
					{
						key: 'ticket',
						label: 'Парковочный талон',
						children: (
							<div className="input-form__field">
								<Input
									placeholder="123456789"
									value={ticketNumber}
									onChange={handleTicketNumberChange}
									onBlur={handleTicketNumberBlur}
									status={touched.ticket && errors.ticket ? 'error' : ''}
									size="large"
									maxLength={9}
								/>
								{touched.ticket && errors.ticket && (
									<div className="input-form__error">{errors.ticket}</div>
								)}
							</div>
						),
					},
				]}
			/>

			<Button
				type="primary"
				size="large"
				block
				onClick={handleSubmit}
				disabled={!canSubmit()}
			>
				Проверить сумму
			</Button>
		</div>
	);
}
