import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScannerView } from './components/ScannerView';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Toast } from './components/Toast';
import { useQrScanner } from './hooks/useQrScanner';
import { isValidUrl } from './utils/validators';
import './styles/variables.css';
import './index.css';

/**
 * Состояния приложения
 * @enum {string}
 */
const EScanningState = {
	IDLE: 'idle', // Ожидание начала сканирования
	SCANNING: 'scanning', // Идет сканирование
	CONFIRMING: 'confirming', // Подтверждение перехода по ссылке
};

function App() {
	const [scanningState, setScanningState] = useState(EScanningState.IDLE);
	const [confirmedUrl, setConfirmedUrl] = useState(null);
	const [toast, setToast] = useState({
		visible: false,
		message: '',
	});

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
				setConfirmedUrl(decodedText);
				setScanningState(EScanningState.CONFIRMING);
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
	 * Начать сканирование
	 */
	const handleStartScanning = async () => {
		setScanningState(EScanningState.SCANNING);
	};

	/**
	 * Остановить сканирование
	 */
	const handleStopScanning = async () => {
		await qrScanner.stopScanning();
		setScanningState(EScanningState.IDLE);
	};

	/**
	 * Подтвердить переход по ссылке
	 */
	const handleConfirmNavigation = async () => {
		if (confirmedUrl) {
			window.open(confirmedUrl, '_blank', 'noopener noreferrer');
		}
		setConfirmedUrl(null);
		setScanningState(EScanningState.IDLE);
		await qrScanner.stopScanning();
	};

	/**
	 * Отменить переход по ссылке и вернуться к сканированию
	 */
	const handleCancelNavigation = () => {
		setConfirmedUrl(null);
		setScanningState(EScanningState.SCANNING);
	};

	return (
		<>
			<Header />
			<main className="main">
				<ScannerView
					isScanning={
						scanningState === EScanningState.SCANNING ||
						scanningState === EScanningState.CONFIRMING
					}
					onStart={handleStartScanning}
					onStop={handleStopScanning}
					onActivateCamera={qrScanner.startScanning}
					torchSupported={qrScanner.torchSupported}
					torchEnabled={qrScanner.torchEnabled}
					onToggleTorch={qrScanner.toggleTorch}
					error={qrScanner.error}
				/>
			</main>
			<Footer />
			<ConfirmDialog
				url={confirmedUrl || ''}
				visible={scanningState === EScanningState.CONFIRMING}
				onConfirm={handleConfirmNavigation}
				onCancel={handleCancelNavigation}
			/>
			<Toast message={toast.message} visible={toast.visible} />
		</>
	);
}

export default App;
