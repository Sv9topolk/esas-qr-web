# CLAUDE.md

## Проект

Демо React-приложение для оплаты парковки через QR-код.

**Функционал:**
- Одна страница с кнопкой "Считать QR-код"
- Сканер использует камеру мобильного устройства
- После сканирования — запрос на переход по ссылке для оплаты

## Rules

### MCP
- Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

### Настройки языка
- Коммуникация: русский
- Комментари в коде: русский
- Документация: русский
- Наименования функций/переменных: английский
- Сообщения коммитов: русский

## Документация
- Пиши комментарии в стиле JSDoc
- Описывай не "что", а "зачем" и "почему"
- Используй полный синтаксис для публичных API

### Форматирование кода
- Максимальная длина строки: 120 символов
- Кавычки: двойные для JSX, HTML, одинарные для JS

#### Отступы
- Используй для отступов только tab с размером табуляции 2 пробела (настройка редактора)
- Не выравнивай код пробелами, не используй пробелы для отступов

#### Наименования
- Переменные: camelCase
- Константы: UPPER_SNAKE_CASE
- Приватные поля: _leadingUnderscore
- Kлассы: PascalCase
- TypeScript interfaces: IPascalCase, где `I` - префикс (от interface), PascalCase - наименование (`IInvoice`)
- TypeScript types: TPascalCase, где `T` - префикс (от type), PascalCase - наименование (`TInvoiceState`)
- TypeScript enums: EPascalCase, где `E` - префикс (от enum), PascalCase - наименование (`EInvoiceType`)
- Компоненты: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase с префиксом `use` (`useUserData.ts`)