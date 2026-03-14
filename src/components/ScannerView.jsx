import { useRef, useEffect } from 'react';
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

	// Активируем камеру после того как элемент появился в DOM
	useEffect(() => {
		if (isScanning && !cameraActivatedRef.current) {
			cameraActivatedRef.current = true;
			// Небольшая задержка чтобы убедиться что DOM обновлен
			const timer = setTimeout(() => {
				onActivateCamera();
			}, 100);
			return () => clearTimeout(timer);
		}
		if (!isScanning) {
			cameraActivatedRef.current = false;
		}
	}, [isScanning, onActivateCamera]);

	return (
		<div className="scanner-view" ref={containerRef}>
			{!isScanning ? (
				<div className="scanner-view__idle">
					<button className="scanner-view__button" onClick={onStart}>
						Сканировать QR
					</button>
				</div>
			) : (
				<div className="scanner-view__scanning">
					<div id="qr-reader" className="scanner-view__reader"></div>
					<div className="scanner-view__overlay">
						<div className="scanner-view__reticle"></div>
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
				</div>
			)}
		</div>
	);
}
