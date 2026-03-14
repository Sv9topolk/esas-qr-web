import { useRef, useEffect, useState, useCallback } from 'react';
import './ScannerView.css';

/**
 * Компонент представления сканера QR-кодов
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isScanning - Активен ли сканер
 * @param {Function} props.onStart - Callback для начала сканирования (изменение состояния)
 * @param {Function} props.onStop - Callback остановки сканирования
 * @param {Function} props.onActivateCamera - Callback для активации камеры после рендера
 * @param {boolean} props.torchSupported - Поддерживается ли фонарь
 * @param {boolean} props.torchEnabled - Включен ли фонарь
 * @param {Function} props.onToggleTorch - Callback переключения фонаря
 * @param {string|null} props.error - Сообщение об ошибке
 */
export function ScannerView({
	isScanning,
	onStart,
	onStop,
	onActivateCamera,
	torchSupported,
	torchEnabled,
	onToggleTorch,
	error,
}) {
	const containerRef = useRef(null);
	const cameraActivatedRef = useRef(false);

	// Состояние для размера прицела (0.5 - 1.5, где 1.0 = 70% по умолчанию)
	const [reticleScale, setReticleScale] = useState(1.0);

	// Refs для отслеживания жестов
	const pinchRef = useRef({
		isPinching: false,
		initialDistance: 0,
		initialScale: 1.0,
	});

	/**
	 * Вычисляет расстояние между двумя точками касания
	 * @param {Touch} touch1 - Первая точка касания
	 * @param {Touch} touch2 - Вторая точка касания
	 * @returns {number} Расстояние в пикселях
	 */
	const getDistance = useCallback((touch1, touch2) => {
		const dx = touch1.clientX - touch2.clientX;
		const dy = touch1.clientY - touch2.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}, []);

	/**
	 * Обработка начала жеста pinch-to-zoom
	 */
	const handleTouchStart = useCallback((e) => {
		if (e.touches.length === 2) {
			const touch1 = e.touches[0];
			const touch2 = e.touches[1];
			const distance = getDistance(touch1, touch2);

			pinchRef.current = {
				isPinching: true,
				initialDistance: distance,
				initialScale: reticleScale,
			};
		}
	}, [getDistance, reticleScale]);

	/**
	 * Обработка движения при pinch-to-zoom
	 */
	const handleTouchMove = useCallback((e) => {
		if (pinchRef.current.isPinching && e.touches.length === 2) {
			e.preventDefault(); // Предотвращаем зум страницы

			const touch1 = e.touches[0];
			const touch2 = e.touches[1];
			const currentDistance = getDistance(touch1, touch2);

			// Вычисляем новый scale
			const scaleFactor = currentDistance / pinchRef.current.initialDistance;
			let newScale = pinchRef.current.initialScale * scaleFactor;

			// Ограничиваем диапазон от 0.5 до 1.5
			newScale = Math.max(0.5, Math.min(1.5, newScale));

			setReticleScale(newScale);
		}
	}, [getDistance]);

	/**
	 * Обработка окончания жеста pinch-to-zoom
	 */
	const handleTouchEnd = useCallback(() => {
		pinchRef.current.isPinching = false;
	}, []);

	/**
	 * Сброс размера прицела к значению по умолчанию
	 */
	const handleResetReticle = useCallback(() => {
		setReticleScale(1.0);
	}, []);

	// Активируем камеру после того как элемент появился в DOM
	useEffect(() => {
		let timer;

		if (isScanning && !cameraActivatedRef.current) {
			cameraActivatedRef.current = true;
			// Небольшая задержка чтобы убедиться что DOM обновлен
			timer = setTimeout(() => {
				onActivateCamera();
			}, 100);
		}

		if (!isScanning) {
			cameraActivatedRef.current = false;
			// Сбрасываем размер прицела при остановке сканирования (асинхронно)
			timer = setTimeout(() => {
				setReticleScale(1.0);
			}, 0);
		}

		return () => {
			if (timer) {
				clearTimeout(timer);
			}
		};
	}, [isScanning, onActivateCamera]);

	// Вычисляем размер прицела в процентах
	const reticleSizePercent = Math.round(50 * reticleScale); // 50% при scale=1.0

	return (
		<div className="scanner-view" ref={containerRef}>
			{!isScanning ? (
				<div className="scanner-view__idle">
					<button className="scanner-view__button" onClick={onStart}>
						Сканировать QR
					</button>
				</div>
			) : (
				<div
					className="scanner-view__scanning"
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
				>
					<div id="qr-reader" className="scanner-view__reader"></div>
					<div className="scanner-view__overlay">
						<div
							className="scanner-view__reticle"
							style={{
								'--reticle-size': `${reticleSizePercent}%`,
								transform: `scale(${reticleScale})`,
							}}
						></div>
					</div>
					<div className="scanner-view__controls">
						{torchSupported && (
							<button
								className="scanner-view__control-btn"
								onClick={onToggleTorch}
								type="button"
							>
								{torchEnabled ? 'Выключить фонарь' : 'Включить фонарь'}
							</button>
						)}
						<button
							className="scanner-view__control-btn scanner-view__control-btn_cancel"
							onClick={onStop}
							type="button"
						>
							Отмена
						</button>
					</div>
					{error && (
						<div className="scanner-view__error" role="alert">
							{error}
						</div>
					)}
					{/* Индикатор размера прицела */}
					{reticleScale !== 1.0 && (
						<div className="scanner-view__size-indicator">
							<span>Размер: {Math.round(reticleScale * 100)}%</span>
							<button
								className="scanner-view__reset-btn"
								onClick={handleResetReticle}
								type="button"
							>
								Сбросить
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
