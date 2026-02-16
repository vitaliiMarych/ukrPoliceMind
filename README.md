# ukrPoliceMind 🇺🇦

Веб-інформаційна система інтелектуальної консультації з питань правоохоронної діяльності в Україні.

## 📋 Опис проекту

ukrPoliceMind - це повнофункціональна веб-платформа для надання консультацій з правових питань, що використовує штучний інтелект (Google Gemini) для генерації відповідей. Система підтримує два режими роботи:

- **Chat Mode** - вільний діалог з AI асистентом
- **Wizard Mode** - структуровані сценарії опитування для типових ситуацій

## 🏗 Технології

### Backend
- **NestJS** - Node.js фреймворк
- **PostgreSQL** - Реляційна база даних
- **Prisma ORM** - Type-safe ORM
- **JWT** - Аутентифікація
- **Google Gemini AI** - LLM для генерації відповідей
- **SSE (Server-Sent Events)** - Потоковий стрімінг відповідей

### Frontend
- **React 19** - UI бібліотека
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Маршрутизація
- **Tanstack Query** - API state management
- **React Hook Form + Zod** - Валідація форм
- **Tailwind CSS v4** - Стилізація
- **Axios** - HTTP клієнт

## 🚀 Швидкий старт

### Передумови

Перед запуском переконайтеся, що встановлено:
- Node.js 18+
- npm або yarn
- PostgreSQL 15+
- Git

### 1. Клонування репозиторію

```bash
git clone https://github.com/vitaliiMarych/ukrPoliceMind.git
cd ukrPoliceMind
```

### 2. Налаштування Backend

```bash
cd server

# Встановлення залежностей
npm install

# Створення .env файлу
cp .env.example .env

# Редагування .env (додайте свої дані)
# - DATABASE_URL для PostgreSQL
# - JWT_SECRET для аутентифікації
# - GEMINI_API_KEY для AI (отримати на https://makersuite.google.com/app/apikey)

# Запуск PostgreSQL через Docker (опціонально)
docker-compose up -d

# Застосування міграцій
npx prisma migrate dev

# Seed бази даних тестовими даними
npm run prisma:seed

# Запуск backend
npm run start:dev
```

Backend буде доступний на `http://localhost:3000`

**Тестові облікові дані:**
- Admin: `admin@ukrpolicemind.com` / `admin123`
- User: `user@ukrpolicemind.com` / `user123`

### 3. Налаштування Frontend

```bash
cd ../client

# Встановлення залежностей
npm install

# Створення .env файлу
cp .env.example .env

# Запуск frontend
npm run dev
```

Frontend буде доступний на `http://localhost:5173`

## 📁 Структура проекту

```
ukrPoliceMind/
├── server/               # Backend (NestJS)
│   ├── prisma/          # Prisma схема та міграції
│   ├── src/
│   │   ├── auth/        # Аутентифікація
│   │   ├── sessions/    # Консультаційні сесії
│   │   ├── messages/    # Повідомлення
│   │   ├── llm/         # LLM інтеграція
│   │   ├── wizard/      # Wizard сценарії
│   │   ├── admin/       # Адмін панель
│   │   ├── config/      # Конфігурація
│   │   └── database/    # Prisma сервіс
│   ├── API_DOCS.md      # API документація
│   └── README_RUN.md    # Інструкції по запуску
│
└── client/              # Frontend (React)
    ├── src/
    │   ├── features/    # Feature-модулі
    │   │   ├── auth/    # Аутентифікація
    │   │   ├── chat/    # Чат
    │   │   ├── wizard/  # Wizard
    │   │   ├── history/ # Історія
    │   │   └── admin/   # Адмін панель
    │   └── shared/      # Спільні компоненти
    └── README.md        # Frontend документація
```

## 🎯 Основні функції

### Для користувачів
- ✅ Реєстрація та авторизація
- ✅ Чат-консультація з AI асистентом
- ✅ Структуровані wizard-сценарії
- ✅ Історія консультацій
- ✅ Потоковий стрімінг відповідей (real-time)

### Для адміністраторів
- ✅ Dashboard зі статистикою
- ✅ Управління користувачами (блокування/розблокування)
- ✅ Перегляд всіх консультацій
- ✅ Управління wizard категоріями
- ✅ Системні налаштування
- ✅ Логи LLM запитів

## 🔐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Реєстрація
- `POST /api/v1/auth/login` - Логін
- `POST /api/v1/auth/refresh` - Оновлення токена
- `POST /api/v1/auth/logout` - Вихід

### Sessions
- `POST /api/v1/sessions` - Створити сесію
- `GET /api/v1/sessions` - Список сесій
- `GET /api/v1/sessions/:id` - Деталі сесії

### Messages
- `POST /api/v1/sessions/:sessionId/messages` - Створити повідомлення
- `GET /api/v1/messages/:messageId/stream` (SSE) - Стрім відповіді

### Wizard
- `GET /api/v1/wizard/categories` - Категорії
- `POST /api/v1/wizard/submit` - Надіслати форму

### Admin (потрібна роль ADMIN)
- `GET /api/v1/admin/users` - Користувачі
- `GET /api/v1/admin/sessions` - Всі сесії
- `GET /api/v1/admin/stats` - Статистика

Повна документація API: [server/API_DOCS.md](server/API_DOCS.md)

## 🛠 Розробка

### Backend

```bash
cd server

# Development mode з hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod

# Prisma Studio (GUI для БД)
npm run prisma:studio

# Тести
npm run test
```

### Frontend

```bash
cd client

# Development mode
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## 📦 Розгортання

### Docker (Recommended)

Створіть `docker-compose.yml` для всього стеку:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ukrpolicemind
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./server
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ukrpolicemind
      JWT_SECRET: your-secret-key
      GEMINI_API_KEY: your-api-key
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  frontend:
    build: ./client
    environment:
      VITE_API_URL: http://localhost:3000/api/v1
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## 🔧 Налаштування

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ukrpolicemind"
JWT_SECRET="your-secure-secret-key"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
NODE_ENV="development"
```

### Frontend (.env)

```env
VITE_API_URL="http://localhost:3000/api/v1"
```

## 📚 Документація

- [Backend Documentation](server/README_RUN.md)
- [API Documentation](server/API_DOCS.md)
- [Frontend Documentation](client/README.md)
- [Technical Plan](docs/main.md)

## 🤝 Внесок

1. Fork репозиторій
2. Створіть feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit зміни (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Відкрийте Pull Request

## 📝 Ліцензія

Цей проект є бакалаврською роботою та призначений для освітніх цілей.

## 👨‍💻 Автор

**Марич Віталій**
- GitHub: [@vitaliiMarych](https://github.com/vitaliiMarych)

## 🙏 Подяки

- Google Gemini AI за LLM можливості
- NestJS та React команди за чудові фреймворки
- Всім контриб'юторам Open Source бібліотек

---

**Зроблено з ❤️ для покращення доступності правової інформації в Україні 🇺🇦**
