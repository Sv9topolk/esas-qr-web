import hutkigroshLogo from '../assets/hutkigrosh_gorizont.png';
import './Header.css';

/**
 * Компонент хидера приложения с логотипом и названием
 */
export function Header() {
	return (
		<header className="header">
			<img
				src={hutkigroshLogo}
				alt="Hutkigrosh Gorizont"
				className="header__logo"
			/>
			<h1 className="header__title">Оплата парковки через QR-код</h1>
		</header>
	);
}
