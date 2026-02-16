📌 7. Frontend архітектура
7.1 Роутинг

/

/login

/register

/chat

/wizard

/history

/history/:id

/admin

7.2 Основні feature-модулі
auth/

login-form

register-form

useAuth

chat/

chat-page

message-list

composer

useChatStream

wizard/

category-picker

dynamic-form

wizard-result

history/

history-page

session-view

admin/

dashboard

users-table

sessions-table

wizard-manager

system-config

logs

📌 8. UI/UX концепція
Кольорова схема

Primary: темно-синій (navy)

Background: світлий (off-white)

Text: graphite

Accent: латунь (brass)

Дизайн-концепція

Відповідь виглядає як “інформаційна довідка”

Латунні розділювачі

Сайдбар “Картка звернення”

Badge з номером консультації

📌 9. Безпека

JWT + refresh

RoleGuard

Перевірка isBlocked

DTO validation

Обмеження довжини повідомлень

CORS

Helmet

Rate limit

📌 10. Логування

Логуються:

login

створення сесії

запит до LLM

час відповіді

помилки LLM

Формат — JSON structured logs.

📌 11. Розгортання
Docker Compose:

api

web

postgres

ENV:

DATABASE_URL

JWT_SECRET

LLM_API_KEY

LLM_PROVIDER

📌 12. Повна схема взаємодії
React (ukrPoliceMind Web)
        │
        ▼
NestJS API
        │
        ├── Auth
        ├── Chat
        ├── Wizard
        ├── Admin
        │
        ▼
PostgreSQL
        │
        ▼
LLM API

📌 13. Переваги архітектури

Модульність

Масштабованість

Рольова модель

Централізоване керування сценаріями

Потокова генерація відповіді

Чітка типізація через shared пакет