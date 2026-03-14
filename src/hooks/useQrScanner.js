import { useState, useRef, useCallback, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

/**
 * Hook для управления QR-сканером
 * @param {Object} params - Параметры хука
 * @param {Function} params.onScanSuccess - Callback при успешном сканировании
 * @param {Function} params.onScanFailure - Callback при ошибке сканирования
 * @returns {Object} API сканера
 */
export function useQrScanner({ onScanSuccess, onScanFailure }) {
	const [isScanning, setIsScanning] = useState(false);
	const [error, setError] = useState(null);
	const [torchSupported, setTorchSupported] = useState(false);
	const [torchEnabled, setTorchEnabled] = useState(false);

	const scannerRef = useRef(null);
	const cameraIdRef = useRef(null);

	// Проверка поддержки фонарика
	useEffect(() => {
		const checkTorchSupport = async () => {
			try {
				// Проверяем наличие камер
				const cameras = await Html5Qrcode.getCameras();
				if (!cameras || cameras.length === 0) {
					setTorchSupported(false);
					return;
				}

				cameraIdRef.current = cameras[0].id;
				setTorchSupported(true);
			} catch {
				setTorchSupported(false);
			}
		};

		checkTorchSupport();
	}, []);

	// Очистка при размонтировании
	useEffect(() => {
		return () => {
			if (scannerRef.current) {
				scannerRef.current.stop().catch(() => {});
				scannerRef.current.clear().catch(() => {});
			}
		};
	}, []);

	/**
	 * Начать сканирование
	 */
	const startScanning = useCallback(async () => {
		try {
			setError(null);

			// Проверяем, что элемент существует в DOM
			const element = document.getElementById('qr-reader');
			if (!element) {
				throw new Error('Элемент для камеры не найден');
			}

			// Если сканер уже запущен, останавливаем его
			if (scannerRef.current) {
				const state = scannerRef.current.getState();
				if (state === 2) { // Html5QrcodeScannerState.SCANNING = 2
					await scannerRef.current.stop();
				}
				// Очищаем предыдущий экземпляр
				await scannerRef.current.clear();
				scannerRef.current = null;
			}

			// Создаем новый экземпляр сканера
			scannerRef.current = new Html5Qrcode('qr-reader');

			await scannerRef.current.start(
				{ facingMode: 'environment' },
				{
					fps: 10,
					qrbox: { width: 250, height: 250 },
				},
				(decodedText) => {
					// Тактильный отклик при сканировании
					if (navigator.vibrate) {
						navigator.vibrate(200);
					}
					onScanSuccess(decodedText);
				},
				(scanError) => {
					// Игнорируем все ошибки сканирования - они нормальны при работе QR-сканера
					// Библиотека постоянно вызывает этот callback когда QR-код не найден в кадре
					// Ошибки UI показываем только для критичных проблем (при запуске/остановке камеры)
				}
			);

			setIsScanning(true);
		} catch (err) {
			const errorMessage = err?.message || 'Не удалось запустить камеру';
			setError(errorMessage);
			setIsScanning(false);

			// Дополнительная информация для отладки
			console.error('Ошибка запуска камеры:', err);
			console.error('Details:', {
				hasElement: !!document.getElementById('qr-reader'),
				isSecureContext: window.isSecureContext,
				userAgent: navigator.userAgent,
			});

			onScanFailure(err);
		}
	}, [onScanSuccess, onScanFailure]);

	/**
	 * Остановить сканирование
	 */
	const stopScanning = useCallback(async () => {
		if (scannerRef.current) {
			try {
				await scannerRef.current.stop();
				await scannerRef.current.clear();
			} catch (err) {
				// Игнорируем ошибки при остановке
				console.error('Ошибка остановки сканера:', err);
			}
			scannerRef.current = null;
		}
		setIsScanning(false);
		setTorchEnabled(false);
	}, []);

	/**
	 * Переключить фонарик
	 */
	const toggleTorch = useCallback(async () => {
		if (!scannerRef.current || !torchSupported) {
			return;
		}

		try {
			const newState = !torchEnabled;
			await scannerRef.current.applyVideoConstraints({
				advanced: [{ torch: newState }],
			});
			setTorchEnabled(newState);
		} catch (err) {
			console.error('Ошибка переключения фонарика:', err);
		}
	}, [torchEnabled, torchSupported]);

	return {
		isScanning,
		error,
		startScanning,
		stopScanning,
		torchSupported,
		torchEnabled,
		toggleTorch,
	};
}
