import { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScannerView } from './components/ScannerView';
import { InputForm } from './components/InputForm';
import { ResultDialog } from './components/ResultDialog';
import { Toast } from './components/Toast';
import { useQrScanner } from './hooks/useQrScanner';
import { isValidUrl } from './utils/validators';
import './styles/variables.css';
import './index.css';

/**
 * Состояния приложения
 * @enum {string}
 */
const EAppState = {
	FORM: 'form', // Форма ввода
	SCANNING: 'scanning', // Сканирование QR
	RESULT: 'result', // Результат
};

function App() {
	const [appState, setAppState] = useState(EAppState.FORM);
	const [toast, setToast] = useState({
		visible: false,
		message: '',
	});
	const cameraStartedRef = useRef(false);

	/**
	 * Показать toast уведомление
	 * @param {string} message - Текст уведомления
	 */
	const showToast = useCallback((message) => {
		setToast({ visible: true, message });
		setTimeout(() => {
			setToast({ visible: false, message: '' });
		}, 3000);
	}, []);

	/**
	 * Обработка успешного сканирования QR-кода
	 * @param {string} decodedText - Распознанный текст
	 */
	const handleScanSuccess = useCallback(
		(decodedText) => {
			if (isValidUrl(decodedText)) {
				setAppState(EAppState.RESULT);
			} else {
				showToast('QR-код не распознан как ссылка для оплаты');
			}
		},
		[showToast]
	);

	/**
	 * Обработка ошибки сканирования
	 * @param {Error} error - Ошибка сканирования
	 */
	const handleScanFailure = useCallback((error) => {
		// NotFoundException игнорируется в хуке, здесь только реальные ошибки
		const errorStr = String(error || '');
		if (!errorStr.includes('NotFoundException') && !errorStr.includes('No MultiFormat Readers')) {
			console.error('Ошибка сканирования:', error);
		}
	}, []);

	const qrScanner = useQrScanner({
		onScanSuccess: handleScanSuccess,
		onScanFailure: handleScanFailure,
	});

	/**
	 * Обработка отправки формы
	 * @param {Object} data - Данные формы
	 * @param {string} data.type - Тип ввода ('car' | 'ticket')
	 * @param {string} data.value - Введенное значение
	 */
	const handleFormSubmit = useCallback(async (data) => {
		cameraStartedRef.current = false;
		setAppState(EAppState.SCANNING);
	}, []);

	/**
	 * Запуск камеры при переходе в состояние SCANNING
	 */
	useEffect(() => {
		if (appState === EAppState.SCANNING && !cameraStartedRef.current) {
			cameraStartedRef.current = true;
			// Небольшая задержка для уверенности что DOM обновлен
			const timer = setTimeout(() => {
				qrScanner.startScanning();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [appState, qrScanner]);

	/**
	 * Остановить сканирование и вернуться к форме
	 */
	const handleStopScanning = useCallback(async () => {
		cameraStartedRef.current = false;
		await qrScanner.stopScanning();
		setAppState(EAppState.FORM);
	}, [qrScanner]);

	/**
	 * Вернуться к форме из результата
	 */
	const handleReturnToForm = useCallback(() => {
		cameraStartedRef.current = false;
		setAppState(EAppState.FORM);
	}, []);

	return (
		<>
			<Header
				isScanning={appState === EAppState.SCANNING || appState === EAppState.RESULT}
			/>
			<main className="main">
				{appState === EAppState.FORM ? (
					<InputForm onSubmit={handleFormSubmit} />
				) : (
					<ScannerView
						isScanning={true}
						onStop={handleStopScanning}
						torchSupported={qrScanner.torchSupported}
						torchEnabled={qrScanner.torchEnabled}
						onToggleTorch={qrScanner.toggleTorch}
						error={qrScanner.error}
					/>
				)}
			</main>
			<Footer />
			{appState === EAppState.RESULT && (
				<ResultDialog
					visible={true}
					onReturnToForm={handleReturnToForm}
				/>
			)}
			<Toast message={toast.message} visible={toast.visible} />
		</>
	);
}

export default App;
