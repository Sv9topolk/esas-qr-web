import hutkigroshLogo from '../assets/hutkigrosh_gorizont.png';
import './Header.css';

/**
 * Компонент хидера приложения с логотипом и названием
 * @param {Object} props - Свойства компонента
 * @param {boolean} [props.isScanning=false] - Идет ли сканирование QR-кода
 */
export function Header({ isScanning = false }) {
	return (
		<header className="header">
			<img
				src={hutkigroshLogo}
				alt="Hutkigrosh Gorizont"
				className="header__logo"
			/>
			<div className="header__content">
				{isScanning ? (
					<>
						<span className="header__spinner"></span>
						<h1 className="header__title">Поиск QR-кода</h1>
					</>
				) : (
					<h1 className="header__title">Оплата парковки через QR-код</h1>
				)}
			</div>
		</header>
	);
}
