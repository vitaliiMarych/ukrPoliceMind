# ukrPoliceMind API Documentation

Базовий URL: `http://localhost:3000/api/v1`

## 🔐 Аутентифікація

Для більшості ендпоінтів потрібна аутентифікація через JWT токен.

**Формат заголовка:**
```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### POST /auth/register
Реєстрація нового користувача

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

**Note:** Refresh token встановлюється в httpOnly cookie

---

### POST /auth/login
Вхід користувача

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

---

### POST /auth/refresh
Оновлення access токена

**Headers:**
```
Cookie: refreshToken=<refresh_token>
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc..."
}
```

---

### POST /auth/logout
Вихід (ревокація refresh токена)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204):** No Content

---

## Sessions Endpoints

### POST /sessions
Створити нову консультаційну сесію

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "mode": "chat",  // "chat" | "wizard"
  "topic": "Консультація щодо..."  // optional
}
```

**Response (201):**
```json
{
  "id": "session-uuid",
  "userId": "user-uuid",
  "mode": "chat",
  "topic": "Консультація щодо...",
  "title": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /sessions
Отримати список сесій користувача

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "id": "session-uuid",
    "mode": "chat",
    "topic": "Консультація щодо...",
    "title": "Моя консультація",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### GET /sessions/:id
Отримати деталі сесії з повідомленнями

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "session-uuid",
  "mode": "chat",
  "topic": "Консультація щодо...",
  "title": "Моя консультація",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "messages": [
    {
      "id": "message-uuid",
      "role": "user",
      "content": "Привіт!",
      "status": "done",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### DELETE /sessions/:id
Видалити сесію

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204):** No Content

---

## Messages Endpoints

### POST /sessions/:sessionId/messages
Створити повідомлення та отримати URL для streaming відповіді

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "content": "Які мої права при затриманні?"
}
```

**Response (201):**
```json
{
  "userMessageId": "user-message-uuid",
  "assistantMessageId": "assistant-message-uuid",
  "streamUrl": "/api/v1/messages/assistant-message-uuid/stream"
}
```

---

### GET /sessions/:sessionId/messages
Отримати всі повідомлення сесії

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "id": "message-uuid",
    "sessionId": "session-uuid",
    "role": "user",
    "content": "Привіт!",
    "status": "done",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### GET /messages/:messageId/stream (SSE)
Server-Sent Events стрім відповіді асистента

**Response:** SSE stream

**Events:**
- `meta` - Метадані (початок стріму)
- `token` - Частина тексту відповіді
- `done` - Завершення стріму
- `error` - Помилка

**Example:**
```javascript
const eventSource = new EventSource('/api/v1/messages/message-uuid/stream');

eventSource.addEventListener('meta', (e) => {
  console.log('Meta:', JSON.parse(e.data));
});

eventSource.addEventListener('token', (e) => {
  console.log('Token:', e.data);
});

eventSource.addEventListener('done', (e) => {
  console.log('Done:', JSON.parse(e.data));
  eventSource.close();
});

eventSource.addEventListener('error', (e) => {
  console.error('Error:', JSON.parse(e.data));
  eventSource.close();
});
```

---

## Wizard Endpoints

### GET /wizard/categories
Отримати активні категорії wizard

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "id": "category-uuid",
    "title": "Звернення до поліції",
    "description": "Допомога у складанні заяви",
    "icon": "🚔",
    "schemaJson": "{...}",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### GET /wizard/categories/:id
Отримати деталі категорії wizard

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "category-uuid",
  "title": "Звернення до поліції",
  "description": "Допомога у складанні заяви",
  "icon": "🚔",
  "schemaJson": "{\"fields\": [...]}",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### POST /wizard/submit
Надіслати заповнену форму wizard

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "categoryId": "category-uuid",
  "answers": {
    "incident_type": "Крадіжка",
    "incident_date": "2024-01-01",
    "incident_location": "вул. Хрещатик, 1",
    "incident_description": "Опис події..."
  }
}
```

**Response (201):**
```json
{
  "sessionId": "new-session-uuid",
  "assistantMessageId": "assistant-message-uuid",
  "streamUrl": "/api/v1/messages/assistant-message-uuid/stream"
}
```

---

## Admin Endpoints

**Note:** Всі admin ендпоінти вимагають роль `ADMIN`

### GET /admin/users
Список всіх користувачів

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200):**
```json
[
  {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "USER",
    "isBlocked": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### PATCH /admin/users/:id/block
Заблокувати користувача

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "USER",
  "isBlocked": true
}
```

---

### PATCH /admin/users/:id/unblock
Розблокувати користувача

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200):**
```json
{
  "id": "user-uuid",
  "isBlocked": false
}
```

---

### GET /admin/sessions
Список всіх сесій

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200):**
```json
[
  {
    "id": "session-uuid",
    "userId": "user-uuid",
    "mode": "chat",
    "topic": "Консультація",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com"
    },
    "_count": {
      "messages": 5
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### GET /admin/sessions/:id
Деталі сесії

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200):**
```json
{
  "id": "session-uuid",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  },
  "messages": [...]
}
```

---

### DELETE /admin/sessions/:id
Видалити сесію

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (204):** No Content

---

### GET /admin/wizard/categories
Всі wizard категорії (включно з неактивними)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200):**
```json
[
  {
    "id": "category-uuid",
    "title": "Звернення до поліції",
    "isActive": true,
    ...
  }
]
```

---

### POST /admin/wizard/categories
Створити wizard категорію

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Body:**
```json
{
  "title": "Нова категорія",
  "description": "Опис",
  "icon": "📋",
  "schemaJson": {
    "fields": [...]
  },
  "isActive": true
}
```

**Response (201):**
```json
{
  "id": "new-category-uuid",
  ...
}
```

---

### PATCH /admin/wizard/categories/:id
Оновити wizard категорію

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Body:**
```json
{
  "title": "Оновлена назва",
  "isActive": false
}
```

**Response (200):**
```json
{
  "id": "category-uuid",
  ...
}
```

---

### DELETE /admin/wizard/categories/:id
Видалити wizard категорію

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (204):** No Content

---

### GET /admin/system-config
Системні налаштування

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200):**
```json
[
  {
    "id": "config-uuid",
    "key": "system_prompt",
    "value": "Ти - експертний асистент...",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### PATCH /admin/system-config/:key
Оновити системне налаштування

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Body:**
```json
{
  "value": "Новий system prompt..."
}
```

**Response (200):**
```json
{
  "id": "config-uuid",
  "key": "system_prompt",
  "value": "Новий system prompt...",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /admin/stats
Статистика системи

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200):**
```json
{
  "totalUsers": 150,
  "totalSessions": 450,
  "totalMessages": 2340,
  "activeSessions": 23
}
```

---

### GET /admin/llm-logs
Логи LLM запитів

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query params:**
- `limit` - кількість записів (за замовчуванням 100)

**Response (200):**
```json
[
  {
    "id": "log-uuid",
    "sessionId": "session-uuid",
    "model": "gemini-2.0-flash-exp",
    "status": "success",
    "latencyMs": 1234,
    "errorMessage": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "session": {
      "id": "session-uuid",
      "mode": "chat",
      "topic": "Консультація"
    }
  }
]
```

---

## Error Responses

Всі помилки повертаються в стандартному форматі:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

**Типові коди помилок:**
- `400` - Bad Request (невалідні дані)
- `401` - Unauthorized (не авторизований)
- `403` - Forbidden (недостатньо прав)
- `404` - Not Found (ресурс не знайдено)
- `500` - Internal Server Error (внутрішня помилка сервера)
