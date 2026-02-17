# ukrPoliceMind

Веб-система правових консультацій з AI. Користувач задає питання — штучний інтелект (Google Gemini) відповідає в реальному часі.

Два режими:
- **Чат** — вільний діалог з AI
- **Майстер** — покрокова анкета по конкретній ситуації (трудове право, житлові питання, сімейне право)

## Стек

| Backend                 | Frontend       
|-------------------------|----------------------
| Node.js + NestJS        | React 19 + TypeScript 
| PostgreSQL + Prisma ORM | Vite 
| JWT авторизація         | Tailwind CSS 
| Google Gemini AI        | React Query + Axios 
| SSE стрімінг            | React Hook Form + Zod 

## Що потрібно встановити

1. **Node.js** (версія 18 або новіша) — [nodejs.org](https://nodejs.org/)
2. **Docker Desktop** — [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) (для бази даних PostgreSQL)
3. **Git** — [git-scm.com](https://git-scm.com/)
4. **Google Gemini API ключ** — отримати безкоштовно на [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

## Встановлення та запуск

### 1. Скачати проект

```bash
git clone https://github.com/vitaliiMarych/ukrPoliceMind.git
cd ukrPoliceMind
```

### 2. Запустити базу даних

```bash
cd server
docker-compose up -d
```

Це запустить PostgreSQL в Docker-контейнері.

### 3. Налаштувати backend

```bash
npm install
cp .env.example .env
```

Відкрити файл `server/.env` і вставити свій Gemini API ключ:

```
GEMINI_API_KEY="ваш-ключ-сюди"
```

Решту залишити як є.

### 4. Створити таблиці та тестові дані

```bash
npx prisma migrate dev
npm run prisma:seed
```

### 5. Запустити backend

```bash
npm run start:dev
```

Сервер запуститься на `http://localhost:3000`

### 6. Запустити frontend (в новому терміналі)

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Сайт відкриється на `http://localhost:5173`

## Тестові акаунти

| Роль | Email | Пароль |
|------|-------|--------|
| Адмін | admin@ukrpolicemind.com | admin123 |
| Користувач | user@ukrpolicemind.com | user123 |

## Структура проекту

```
ukrPoliceMind/
├── server/                # Backend (NestJS)
│   ├── prisma/            # Схема БД, міграції, seed
│   └── src/
│       ├── auth/          # Реєстрація, логін, JWT
│       ├── chat/          # Чат-режим
│       ├── wizard/        # Майстер-режим
│       ├── messages/      # Повідомлення + SSE стрімінг
│       ├── llm/           # Інтеграція з Google Gemini
│       ├── admin/         # Адмін-панель
│       ├── history/       # Історія сесій
│       └── common/        # Guards, decorators
│
└── client/                # Frontend (React)
    └── src/
        ├── features/      # Модулі (auth, chat, wizard, history, admin)
        └── shared/        # Спільні компоненти, хуки, типи
```

## Корисні команди

### Backend (з папки `server/`)

```bash
npm run start:dev          # Запуск з hot-reload
npm run build              # Production збірка
npm run prisma:studio      # GUI для перегляду БД (localhost:5555)
npm run prisma:seed        # Заповнити БД тестовими даними
```

### Frontend (з папки `client/`)

```bash
npm run dev                # Запуск dev сервера
npm run build              # Production збірка
```

