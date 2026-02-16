# ukrPoliceMind - Frontend

React + TypeScript frontend для системи правових консультацій.

## Технології

- **React 19.2** - UI фреймворк
- **TypeScript 5.9** - типізація
- **Vite 7.3** - збірка та dev-сервер
- **React Router v7** - роутинг
- **Tanstack Query v5** - стейт-менеджмент для API
- **Axios** - HTTP клієнт
- **React Hook Form + Zod** - валідація форм
- **Tailwind CSS v4** - стилізація
- **React Markdown** - рендеринг markdown відповідей

## Структура проєкту

```
src/
├── features/                  # Feature-based модулі
│   ├── auth/                 # Аутентифікація
│   │   ├── api/             # API функції
│   │   ├── components/      # Компоненти (LoginForm, RegisterForm)
│   │   ├── hooks/           # Кастомні хуки (useAuth)
│   │   └── types.ts         # TypeScript типи
│   ├── chat/                # Чат-консультації
│   │   ├── api/             # API функції
│   │   ├── components/      # ChatPage, MessageList, Composer
│   │   ├── hooks/           # useChatStream (SSE)
│   │   └── types.ts
│   ├── wizard/              # Майстер консультацій
│   │   ├── api/
│   │   ├── components/      # WizardPage, CategoryPicker, DynamicForm
│   │   └── types.ts
│   ├── history/             # Історія консультацій
│   │   ├── api/
│   │   ├── components/      # HistoryPage, SessionView
│   │   └── types.ts
│   └── admin/               # Адмін-панель
│       ├── api/
│       ├── components/      # Dashboard, UsersTable, SessionsTable
│       └── types.ts
├── shared/                   # Загальні модулі
│   ├── api/
│   │   ├── client.ts        # Axios інстанс з interceptors
│   │   └── queryClient.ts   # Tanstack Query конфігурація
│   ├── components/
│   │   ├── Layout.tsx       # Загальний layout
│   │   ├── Navbar.tsx       # Навігаційна панель
│   │   ├── Sidebar.tsx      # Бокова панель
│   │   └── ProtectedRoute.tsx # Захист роутів
│   ├── hooks/
│   │   └── useCurrentUser.ts # Отримання поточного користувача
│   └── types/
│       └── index.ts         # Загальні типи
├── App.tsx                   # Головний компонент з роутингом
├── main.tsx                  # Точка входу
└── index.css                 # Tailwind CSS імпорт
```

## Налаштування

### 1. Встановлення залежностей

```bash
npm install
```

### 2. Налаштування змінних оточення

Створіть файл `.env` на основі `.env.example`:

```bash
cp .env.example .env
```

Вкажіть URL бекенду:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 3. Запуск dev-сервера

```bash
npm run dev
```

Додаток буде доступний за адресою `http://localhost:5173`

### 4. Збірка для production

```bash
npm run build
```

## Функціонал

### Аутентифікація

- **Login** - вхід в систему (email + password)
- **Register** - реєстрація нового користувача
- **JWT токени** - автоматичне оновлення через refresh token
- **Protected Routes** - захист роутів від неавторизованих користувачів

### Чат-консультації

- **Real-time streaming** - SSE (Server-Sent Events) для потокової генерації відповідей LLM
- **Markdown підтримка** - форматовані відповіді з підсвічуванням коду
- **Історія повідомлень** - збереження контексту діалогу
- **Нові сесії** - можливість створення нового чату

### Майстер консультацій

- **Покрокова форма** - вибір категорії → вибір шаблону → заповнення динамічної форми
- **Динамічні поля** - генерація форм на основі шаблону з backend
- **Валідація** - React Hook Form + Zod схеми
- **Рекомендації** - отримання персоналізованих правових рекомендацій

### Історія

- **Список сесій** - перегляд всіх минулих консультацій
- **Пагінація** - навігація по сторінках
- **Детальний перегляд** - повна історія чату або wizard сесії
- **Видалення** - можливість видалити сесію

### Адмін-панель (тільки для ADMIN role)

- **Статистика** - загальна інформація про систему
- **Управління користувачами** - блокування/розблокування, видалення
- **Управління сесіями** - перегляд та видалення консультацій
- **Пагінація** - для великих списків

## API інтеграція

### Axios Client

Автоматичні interceptors для:
- Додавання JWT токена до кожного запиту
- Автоматичне оновлення токена при 401 помилці
- Редирект на login при невдалому refresh

### Tanstack Query

Кешування та синхронізація даних:
- Автоматичне оновлення при зміні вікна
- Retry логіка для невдалих запитів
- Оптимістичні оновлення
- Інвалідація кешу після мутацій

## Роутинг

- `/` - Редирект на /chat
- `/login` - Сторінка входу
- `/register` - Сторінка реєстрації
- `/chat` - Чат-консультації (protected)
- `/wizard` - Майстер консультацій (protected)
- `/history` - Історія консультацій (protected)
- `/history/:id` - Деталі сесії (protected)
- `/admin` - Адмін-панель (protected, ADMIN only)

## TypeScript

Повна типізація всього коду:
- Всі API відповіді типізовані
- Form validation з Zod схемами
- Enum для ролей користувачів
- Interface для всіх даних

## Стилізація

Tailwind CSS v4 з утилітами для:
- Responsive дизайн
- Кольорова палітра згідно з UI/UX концепцією
- Компонентні класи для кнопок, input, card
- Dark/light варіанти для різних елементів

## Безпека

- **JWT токени** зберігаються в localStorage
- **Автоматичний logout** при блокуванні користувача
- **Role-based access** - перевірка ролі на Protected Routes
- **CORS** - запити тільки до дозволеного API

## Розробка

### Code style

- ESLint конфігурація для React + TypeScript
- Strict mode для TypeScript
- Verbatim module syntax для type imports

### Команди

```bash
npm run dev      # Запуск dev-сервера
npm run build    # Збірка для production
npm run lint     # Перевірка коду
npm run preview  # Перегляд production збірки
```

## Підтримка браузерів

- Chrome (останні 2 версії)
- Firefox (останні 2 версії)
- Safari (останні 2 версії)
- Edge (останні 2 версії)
