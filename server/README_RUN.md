# ukrPoliceMind - Backend

## 🚀 Швидкий старт

### 1. Встановлення залежностей

```bash
npm install
```

### 2. Налаштування бази даних

Переконайтеся, що PostgreSQL запущений. Якщо потрібно, встановіть його:

```bash
# macOS (через Homebrew)
brew install postgresql@15
brew services start postgresql@15

# або використовуйте Docker
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

### 3. Налаштування змінних середовища

Скопіюйте `.env.example` в `.env` та налаштуйте:

```bash
cp .env.example .env
```

Відредагуйте `.env` файл:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ukrpolicemind?schema=public"

# JWT
JWT_SECRET="ваш-секретний-ключ-тут"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Gemini API
GEMINI_API_KEY="ваш-gemini-api-ключ"

# Server
PORT=3000
NODE_ENV="development"
```

### 4. Створення бази даних

```bash
# Створення бази даних
createdb ukrpolicemind

# Або через psql
psql -U postgres -c "CREATE DATABASE ukrpolicemind;"
```

### 5. Застосування міграцій

```bash
npx prisma migrate dev --name init
```

### 6. Генерація Prisma Client

```bash
npx prisma generate
```

### 7. (Опціонально) Seed бази даних

Створіть файл `prisma/seed.ts` для початкових даних:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Створення admin користувача
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ukrpolicemind.com' },
    update: {},
    create: {
      email: 'admin@ukrpolicemind.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // Створення system prompt
  await prisma.systemConfig.upsert({
    where: { key: 'system_prompt' },
    update: {},
    create: {
      key: 'system_prompt',
      value: 'Ти - експертний асистент з питань правоохоронної діяльності в Україні. Надавай точні, структуровані та професійні відповіді на запитання користувачів.',
    },
  });

  console.log('✅ Seed completed', { admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Запустіть seed:

```bash
npx ts-node prisma/seed.ts
```

### 8. Запуск сервера

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

Сервер запуститься на `http://localhost:3000`

## 📋 API Endpoints

### Auth
- `POST /api/v1/auth/register` - Реєстрація
- `POST /api/v1/auth/login` - Логін
- `POST /api/v1/auth/refresh` - Оновлення токена
- `POST /api/v1/auth/logout` - Вихід

### Sessions
- `POST /api/v1/sessions` - Створити сесію
- `GET /api/v1/sessions` - Список сесій
- `GET /api/v1/sessions/:id` - Деталі сесії
- `DELETE /api/v1/sessions/:id` - Видалити сесію

### Messages
- `POST /api/v1/sessions/:sessionId/messages` - Створити повідомлення
- `GET /api/v1/sessions/:sessionId/messages` - Отримати повідомлення
- `GET /api/v1/messages/:messageId/stream` (SSE) - Стрім відповіді

### Wizard
- `GET /api/v1/wizard/categories` - Категорії wizard
- `GET /api/v1/wizard/categories/:id` - Деталі категорії
- `POST /api/v1/wizard/submit` - Надіслати wizard форму

### Admin (потрібна роль ADMIN)
- `GET /api/v1/admin/users` - Список користувачів
- `PATCH /api/v1/admin/users/:id/block` - Заблокувати
- `PATCH /api/v1/admin/users/:id/unblock` - Розблокувати
- `GET /api/v1/admin/sessions` - Всі сесії
- `GET /api/v1/admin/stats` - Статистика
- `GET /api/v1/admin/llm-logs` - Логи LLM
- `GET /api/v1/admin/wizard/categories` - Wizard категорії
- `POST /api/v1/admin/wizard/categories` - Створити категорію
- `GET /api/v1/admin/system-config` - Системні налаштування

## 🛠 Корисні команди

```bash
# Перегляд бази даних через Prisma Studio
npx prisma studio

# Створення нової міграції
npx prisma migrate dev --name your_migration_name

# Відкат останньої міграції
npx prisma migrate reset

# Перевірка статусу міграцій
npx prisma migrate status

# Форматування Prisma схеми
npx prisma format
```

## 🔍 Перевірка роботи

### 1. Перевірка здоров'я сервера
```bash
curl http://localhost:3000/
```

### 2. Реєстрація користувача
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "password123"}'
```

### 3. Логін
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "password123"}'
```

## 📚 Документація Gemini API

Для отримання API ключа Gemini:
1. Перейдіть на https://makersuite.google.com/app/apikey
2. Створіть новий API ключ
3. Додайте його в `.env` файл

## ⚠️ Важливо

- **НЕ** комітьте `.env` файл з секретами в git
- Змініть `JWT_SECRET` на унікальне значення в production
- Використовуйте сильні паролі для БД в production
- Налаштуйте CORS правильно для вашого frontend

## 🐛 Troubleshooting

### Помилка підключення до БД
```bash
# Перевірте чи запущений PostgreSQL
pg_isready

# Перевірте чи існує БД
psql -U postgres -l
```

### Помилка міграції
```bash
# Скиньте БД і створіть знову
npx prisma migrate reset
```

### Помилка Gemini API
- Перевірте чи правильний API ключ
- Перевірте чи є інтернет-з'єднання
- Перевірте квоти API на Google Cloud Console
