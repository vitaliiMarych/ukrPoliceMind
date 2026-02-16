📌 3. Архітектура серверної частини
3.1 Модульна структура NestJS
Core модулі

ConfigModule

DatabaseModule (Prisma)

LoggingModule

Бізнес-модулі

AuthModule

UsersModule

SessionsModule

MessagesModule

WizardModule

AdminModule

LlmModule

HealthModule

📌 4. Модель даних (ER-структура)
4.1 User
Поле	Тип
id	UUID
email	string (unique)
passwordHash	string
role	USER / ADMIN
isBlocked	boolean
createdAt	datetime
4.2 RefreshToken
Поле	Тип
id	UUID
userId	FK(User)
tokenHash	string
expiresAt	datetime
revokedAt	datetime?
4.3 ConsultationSession
Поле	Тип
id	UUID
userId	FK(User)
mode	chat / wizard
topic	string?
title	string?
createdAt	datetime
updatedAt	datetime
4.4 Message
Поле	Тип
id	UUID
sessionId	FK(Session)
role	user / assistant / system
content	text
status	pending / streaming / done / error
createdAt	datetime
4.5 WizardCategory
Поле	Тип
id	UUID
title	string
description	string
icon	string
schemaJson	JSON
isActive	boolean
createdAt	datetime
4.6 SystemConfig
Поле	Тип
id	UUID
key	string
value	text
updatedAt	datetime
4.7 LlmLog
Поле	Тип
id	UUID
sessionId	FK(Session)
model	string
status	success / error
latencyMs	number
errorMessage	text?
createdAt	datetime
📌 5. API Специфікація

Базовий префікс:

/api/v1

🔐 5.1 Auth
POST /auth/register

Створення користувача.

POST /auth/login

Повертає accessToken + встановлює refresh cookie.

POST /auth/refresh

Оновлює accessToken.

POST /auth/logout

Ревокація refresh токена.

👤 5.2 Users
GET /users/me

Отримати дані поточного користувача.

💬 5.3 Sessions
POST /sessions

Створити консультаційну сесію.

Body:

{
  mode: "chat" | "wizard",
  topic?: string
}

GET /sessions

Список сесій користувача.

GET /sessions/:id

Деталі сесії.

📨 5.4 Messages
POST /sessions/:id/messages

Створює user message та assistant placeholder.

Response:

{
  userMessageId,
  assistantMessageId,
  streamUrl
}

GET (SSE)

/messages/:assistantMessageId/stream

Події:

meta

token

done

error

🧭 5.5 Wizard
GET /wizard/categories

Список активних категорій.

GET /wizard/categories/:id

Отримати schemaJson.

POST /wizard/submit

Body:

{
  categoryId,
  answers: {}
}


Response:

{
  sessionId,
  assistantMessageId,
  streamUrl
}

🛠 5.6 Admin
Users

GET /admin/users

PATCH /admin/users/:id/block

PATCH /admin/users/:id/unblock

Sessions

GET /admin/sessions

GET /admin/sessions/:id

DELETE /admin/sessions/:id

Wizard

GET /admin/wizard/categories

POST /admin/wizard/categories

PATCH /admin/wizard/categories/:id

DELETE /admin/wizard/categories/:id

System Config

GET /admin/system-config

PATCH /admin/system-config/:key

Stats

GET /admin/stats

Logs

GET /admin/llm-logs

📌 6. Логіка роботи LLM
6.1 Chat режим

Користувач надсилає повідомлення.

Створюється assistant placeholder.

Формується prompt:

SystemPrompt (з БД)

Історія сесії

UserMessage

Викликається LLM API.

Токени передаються через SSE.

Повний текст зберігається в БД.

6.2 Wizard режим

Користувач заповнює форму.

Answers додаються в prompt як JSON.

Модель формує структуровану відповідь.

Стрімінг аналогічний chat режиму



Приклад ПР підключення для підключення ллм від геміні(але в нас у проекті не треба тестів):
Skip to content
HqOapp
work-orders-service
Repository navigation
Code
Issues
Pull requests
4
 (4)
Agents
Actions
Security
45
 (45)
Insights
Settings
MAIN-50725: Implement AI integration for work orders parsing#144
Merged
LobaiRoman
merged 7 commits into
master
from
MAIN-50725-implement-ai-integration-for-work-orders-parsing
on Nov 17, 2025
+1,790
-13
Lines changed: 1790 additions & 13 deletions
Conversation22 (22)
Commits7 (7)
Checks2 (2)
Files changed29 (29)
Pull Request Toolbar
Merged
MAIN-50725: Implement AI integration for work orders parsing
#144
LobaiRoman
merged 7 commits into
master
from
MAIN-50725-implement-ai-integration-for-work-orders-parsing
0 / 29 viewed
Filter files…
File tree
docs/swagger
api.json
packages/@hqo
work-orders-client/src/work-orders-client
tests
parse-work-order.spec.ts
index.ts
parse-work-order.ts
work-orders-types/src/work-orders/dtos
index.ts
parse-work-order.types.ts
services/work-orders-service/src
ai
tests
ai-error.filter.spec.ts
gemini.service.spec.ts
ai-error.filter.ts
ai-error.ts
ai.module.ts
gemini.service.ts
gemini.types.ts
index.ts
system-prompt.ts
attachments
tests
attachments.service.spec.ts
attachments.service.ts
config
config.service.ts
work-orders-users
tests
work-orders-users.controller.spec.ts
work-orders-users.service.spec.ts
work-orders-users.controller.ts
work-orders-users.module.ts
work-orders-users.service.ts
work-orders
dtos
parse-work-order-request.dto.ts
parse-work-order-response.dto.ts
work-orders.module.ts
package-lock.json
package.json
tsconfig.json
‎docs/swagger/api.json‎
+86
Lines changed: 86 additions & 0 deletions
Original file line number	Diff line number	Diff line change
        ]
      }
    },
    "/work-orders/v1/users/current/work-orders/parse": {
      "post": {
        "operationId": "WorkOrdersUsersController_parseWorkOrder_v1",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ParseWorkOrderRequestDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Parses user input into the JSON for work order creation",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ParseWorkOrderResponseDto"
                }
              }
            }
          }
        },
        "tags": [
          "WorkOrdersUsers"
        ]
      }
    },
    "/work-orders/v1/users/current/work-orders": {
      "post": {
        "operationId": "WorkOrdersUsersController_createWorkOrder_v1",
          "data"
        ]
      },
      "ParseWorkOrderAttachmentDto": {
        "type": "object",
        "properties": {
          "fileName": {
            "type": "string"
          },
          "filePath": {
            "type": "string"
          },
          "fileSizeBytes": {
            "type": "number"
          }
        },
        "required": [
          "fileName",
          "filePath",
          "fileSizeBytes"
        ]
      },
      "ParseWorkOrderRequestDto": {
        "type": "object",
        "properties": {
          "buildingUuid": {
            "type": "string",
            "format": "uuid"
          },
          "prompt": {
            "type": "string"
          },
          "attachments": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ParseWorkOrderAttachmentDto"
            }
          }
        },
        "required": [
          "buildingUuid"
        ]
      },
      "ParseWorkOrderResponseDto": {
        "type": "object",
        "properties": {
          "typeUuid": {
            "type": "string",
            "format": "uuid"
          },
          "description": {
            "type": "string"
          },
          "location": {
            "type": "string"
          }
        }
      },
      "CreateWorkOrderAttachmentDto": {
        "type": "object",
        "properties": {
‎packages/@hqo/work-orders-client/src/work-orders-client/tests/parse-work-order.spec.ts‎
+220
Lines changed: 220 additions & 0 deletions
Original file line number	Diff line number	Diff line change
import { faker } from '@faker-js/faker';
import { Result } from '@hqo/shared-modules/dist/result';
import { ParseWorkOrderRequestBody, ParseWorkOrderResponseBody } from '@hqo/work-orders-types';
import fetchMock from 'fetch-mock';
import { parseWorkOrder } from '../parse-work-order';
describe('parseWorkOrder', () => {
  let baseUrl: string;
  let authToken: string;
  let body: ParseWorkOrderRequestBody;
  beforeEach(() => {
    fetchMock.clearHistory();
    fetchMock.removeRoutes();
    baseUrl = faker.internet.url({ appendSlash: false });
    authToken = faker.string.uuid();
    body = {
      buildingUuid: faker.string.uuid(),
      prompt: faker.lorem.sentence(),
    };
  });
  it('should post data and return success result with null', async () => {
    const mockResponse: ParseWorkOrderResponseBody | null = null;
    const expectedUrl = `${baseUrl}/work-orders/v1/users/current/work-orders/parse`;
    fetchMock.mockGlobal().postOnce(
      expectedUrl,
      {
        body: JSON.stringify(mockResponse),
        status: 200,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );
    await expect(parseWorkOrder({ baseUrl, body }, { authToken })).resolves.toEqual(Result.success(mockResponse));
  });
  it('should post data and return success result with parsed data', async () => {
    const mockResponse: ParseWorkOrderResponseBody = {
      typeUuid: faker.string.uuid(),
      description: faker.lorem.sentence(),
      location: faker.location.streetAddress(),
    };
    const expectedUrl = `${baseUrl}/work-orders/v1/users/current/work-orders/parse`;
    fetchMock.mockGlobal().postOnce(expectedUrl, mockResponse, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    await expect(parseWorkOrder({ baseUrl, body }, { authToken })).resolves.toEqual(Result.success(mockResponse));
  });
  it('should work with minimal body (only buildingUuid)', async () => {
    const minimalBody: ParseWorkOrderRequestBody = {
      buildingUuid: faker.string.uuid(),
    };
    const mockResponse: ParseWorkOrderResponseBody | null = null;
    const expectedUrl = `${baseUrl}/work-orders/v1/users/current/work-orders/parse`;
    fetchMock.mockGlobal().postOnce(
      expectedUrl,
      {
        body: JSON.stringify(mockResponse),
        status: 200,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );
    await expect(parseWorkOrder({ baseUrl, body: minimalBody }, { authToken })).resolves.toEqual(
      Result.success(mockResponse),
    );
  });
  it('should work with attachments', async () => {
    const bodyWithAttachments: ParseWorkOrderRequestBody = {
      buildingUuid: faker.string.uuid(),
      prompt: faker.lorem.sentence(),
      attachments: [
        {
          fileName: faker.system.fileName(),
          filePath: faker.system.filePath(),
          fileSizeBytes: faker.number.int({ min: 1000, max: 1000000 }),
        },
        {
          fileName: faker.system.fileName(),
          filePath: faker.system.filePath(),
          fileSizeBytes: faker.number.int({ min: 1000, max: 1000000 }),
        },
      ],
    };
    const mockResponse: ParseWorkOrderResponseBody | null = null;
    const expectedUrl = `${baseUrl}/work-orders/v1/users/current/work-orders/parse`;
    fetchMock.mockGlobal().postOnce(
      expectedUrl,
      {
        body: JSON.stringify(mockResponse),
        status: 200,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );
    await expect(parseWorkOrder({ baseUrl, body: bodyWithAttachments }, { authToken })).resolves.toEqual(
      Result.success(mockResponse),
    );
  });
  it('should return failure on 400 (bad request)', async () => {
    const expectedUrl = `${baseUrl}/work-orders/v1/users/current/work-orders/parse`;
    fetchMock.mockGlobal().postOnce(expectedUrl, { status: 400 });
    await expect(parseWorkOrder({ baseUrl, body }, { authToken })).resolves.toEqual(Result.failure(expect.anything()));
  });
  it('should return failure on 401 (unauthorized)', async () => {
    const expectedUrl = `${baseUrl}/work-orders/v1/users/current/work-orders/parse`;
    fetchMock.mockGlobal().postOnce(expectedUrl, { status: 401 });
    await expect(parseWorkOrder({ baseUrl, body }, { authToken })).resolves.toEqual(Result.failure(expect.anything()));
  });
  it('should return failure on 403 (forbidden)', async () => {
    const expectedUrl = `${baseUrl}/work-orders/v1/users/current/work-orders/parse`;
    fetchMock.mockGlobal().postOnce(expectedUrl, { status: 403 });
    await expect(parseWorkOrder({ baseUrl, body }, { authToken })).resolves.toEqual(Result.failure(expect.anything()));
  });
  it('should return failure on 404 (not found)', async () => {
    const expectedUrl = `${baseUrl}/work-orders/v1/users/current/work-orders/parse`;
    fetchMock.mockGlobal().postOnce(expectedUrl, { status: 404 });
    await expect(parseWorkOrder({ baseUrl, body }, { authToken })).resolves.toEqual(Result.failure(expect.anything()));
  });
  it('should return failure on 500 (server error)', async () => {
    const expectedUrl = `${baseUrl}/work-orders/v1/users/current/work-orders/parse`;
    fetchMock.mockGlobal().postOnce(expectedUrl, { status: 500 });
    await expect(parseWorkOrder({ baseUrl, body }, { authToken })).resolves.toEqual(Result.failure(expect.anything()));
  });
  it('should return failure on network error', async () => {
    const expectedUrl = `${baseUrl}/work-orders/v1/users/current/work-orders/parse`;
    fetchMock.mockGlobal().postOnce(expectedUrl, () => {
      throw new Error('Network error');
    });
    await expect(parseWorkOrder({ baseUrl, body }, { authToken })).resolves.toEqual(Result.failure(expect.anything()));
  });
  it('should work with internal token authorization', async () => {
    const internalToken = faker.string.uuid();
    const mockResponse: ParseWorkOrderResponseBody | null = null;
    const expectedUrl = `${baseUrl}/work-orders/v1/users/current/work-orders/parse`;
    fetchMock.mockGlobal().postOnce(
      expectedUrl,
      {
        body: JSON.stringify(mockResponse),
        status: 200,
      },
      {
        headers: { 'hqo-authorization': internalToken },
      },
    );
    await expect(parseWorkOrder({ baseUrl, body }, { internalToken })).resolves.toEqual(Result.success(mockResponse));
  });
  it('should handle partial response (only typeUuid)', async () => {
    const mockResponse: ParseWorkOrderResponseBody = {
      typeUuid: faker.string.uuid(),
    };
    const expectedUrl = `${baseUrl}/work-orders/v1/users/current/work-orders/parse`;
    fetchMock.mockGlobal().postOnce(expectedUrl, mockResponse, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    await expect(parseWorkOrder({ baseUrl, body }, { authToken })).resolves.toEqual(Result.success(mockResponse));
  });
  it('should handle partial response (only description)', async () => {
    const mockResponse: ParseWorkOrderResponseBody = {
      description: faker.lorem.sentence(),
    };
    const expectedUrl = `${baseUrl}/work-orders/v1/users/current/work-orders/parse`;
    fetchMock.mockGlobal().postOnce(expectedUrl, mockResponse, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    await expect(parseWorkOrder({ baseUrl, body }, { authToken })).resolves.toEqual(Result.success(mockResponse));
  });
});
‎packages/@hqo/work-orders-client/src/work-orders-client/index.ts‎
+1
Lines changed: 1 addition & 0 deletions
Original file line number	Diff line number	Diff line change
export * from './delete-team';
export * from './update-category';
export * from './update-team';
export * from './parse-work-order';
‎packages/@hqo/work-orders-client/src/work-orders-client/parse-work-order.ts‎
+25
Lines changed: 25 additions & 0 deletions
Original file line number	Diff line number	Diff line change
import { HttpMethod } from '@hqo/shared-modules/dist/api-request';
import { Result } from '@hqo/shared-modules/dist/result';
import { ParseWorkOrderRequestBody, ParseWorkOrderResponseBody } from '@hqo/work-orders-types';
import { AuthorizationOptions, sendRequest } from '../shared/send-request.util';
interface ParseWorkOrderParams {
  baseUrl: string;
  body: ParseWorkOrderRequestBody;
}
export const parseWorkOrder = async (
  { baseUrl, body }: ParseWorkOrderParams,
  authorizationOptions: AuthorizationOptions,
): Promise<Result<ParseWorkOrderResponseBody | null, Error>> => {
  return await sendRequest<ParseWorkOrderResponseBody | null, ParseWorkOrderRequestBody, void>(
    {
      baseUrl,
      url: `/v1/users/current/work-orders/parse`,
      method: HttpMethod.POST,
      body,
    },
    authorizationOptions,
  );
};
‎packages/@hqo/work-orders-types/src/work-orders/dtos/index.ts‎
+1
Lines changed: 1 addition & 0 deletions
Original file line number	Diff line number	Diff line change
export * from './work-order-category.types';
export * from './update-work-order-category.types';
export * from './update-work-order-team.types';
export * from './parse-work-order.types';
export * from './create-user-work-order.types';
export * from './get-user-work-order-details.types';
‎packages/@hqo/work-orders-types/src/work-orders/dtos/parse-work-order.types.ts‎
+15
Lines changed: 15 additions & 0 deletions
Original file line number	Diff line number	Diff line change
import { CreateWorkOrderAttachmentBody } from './create-work-order.types';
export type ParseWorkOrderAttachment = CreateWorkOrderAttachmentBody;
export interface ParseWorkOrderRequestBody {
  buildingUuid: string;
  prompt?: string;
  attachments?: ParseWorkOrderAttachment[];
}
export interface ParseWorkOrderResponseBody {
  typeUuid?: string;
  description?: string;
  location?: string;
}
‎services/work-orders-service/src/ai/tests/ai-error.filter.spec.ts‎
+143
Lines changed: 143 additions & 0 deletions
Original file line number	Diff line number	Diff line change
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AiSuggestionsError } from '../ai-error';
import { AiErrorFilter } from '../ai-error.filter';
describe('AiErrorFilter', () => {
  let filter: AiErrorFilter;
  let mockResponse: jest.Mocked<Response>;
  let mockArgumentsHost: ArgumentsHost;
  beforeEach(() => {
    filter = new AiErrorFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => ({}),
        getNext: () => jest.fn(),
      }),
    } as any;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('catch', () => {
    it('should handle AiSuggestionsError correctly', () => {
      const error = new AiSuggestionsError('Test error', HttpStatus.BAD_REQUEST, 'Test details');
      filter.catch(error, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Test error',
        details: 'Test details',
      });
    });
    it('should handle AiSuggestionsError without details', () => {
      const error = new AiSuggestionsError('Test error', HttpStatus.INTERNAL_SERVER_ERROR);
      filter.catch(error, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Test error',
        details: undefined,
      });
    });
    it('should handle HttpException correctly', () => {
      const error = new HttpException('Http error', HttpStatus.NOT_FOUND);
      filter.catch(error, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(error.getResponse());
    });
    it('should handle generic Error correctly', () => {
      const error = new Error('Generic error');
      filter.catch(error, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'An unexpected error occurred',
        message: 'Generic error',
      });
    });
    it('should handle Error without message', () => {
      const error = new Error();
      filter.catch(error, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'An unexpected error occurred',
        message: '',
      });
    });
    it('should handle non-Error objects', () => {
      const error = 'String error' as any;
      filter.catch(error, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'An unexpected error occurred',
        message: undefined,
      });
    });
    it('should handle different HttpStatus codes for AiSuggestionsError', () => {
      const statuses = [
        HttpStatus.BAD_REQUEST,
        HttpStatus.UNAUTHORIZED,
        HttpStatus.FORBIDDEN,
        HttpStatus.NOT_FOUND,
        HttpStatus.INTERNAL_SERVER_ERROR,
        HttpStatus.SERVICE_UNAVAILABLE,
      ];
      statuses.forEach((status) => {
        const error = new AiSuggestionsError('Test error', status);
        mockResponse.status.mockClear();
        mockResponse.json.mockClear();
        filter.catch(error, mockArgumentsHost);
        expect(mockResponse.status).toHaveBeenCalledWith(status);
        expect(mockResponse.json).toHaveBeenCalledWith({
          error: 'Test error',
          details: undefined,
        });
      });
    });
    it('should handle HttpException with custom response', () => {
      const customResponse = {
        message: 'Custom message',
        statusCode: HttpStatus.BAD_REQUEST,
      };
      const error = new HttpException(customResponse, HttpStatus.BAD_REQUEST);
      filter.catch(error, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(customResponse);
    });
  });
});
‎services/work-orders-service/src/ai/tests/gemini.service.spec.ts‎
+331
Lines changed: 331 additions & 0 deletions
Original file line number	Diff line number	Diff line change
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { WinstonLoggerService } from '@hqo/nestjs-winston-logger';
import { createMock, FullMock } from '@hqo/shared-modules/dist/utils/test-utils';
import { AvailableTypeResponse, ParseWorkOrderResponseBody } from '@hqo/work-orders-types';
import { ConfigService } from '../../config/config.service';
import { AiSuggestionsError } from '../ai-error';
import { GeminiService } from '../gemini.service';
import { GeminiImageData } from '../gemini.types';
jest.mock('@google/generative-ai');
describe('GeminiService', () => {
  let service: GeminiService;
  let configService: FullMock<ConfigService>;
  let logger: FullMock<WinstonLoggerService>;
  let mockGenAI: jest.Mocked<GoogleGenerativeAI>;
  let mockModel: jest.Mocked<any>;
  const mockApiKey = faker.string.alphanumeric(32);
  const mockTypes: AvailableTypeResponse[] = [
    {
      uuid: faker.string.uuid(),
      label: 'Plumbing',
      description: 'Plumbing issues',
      cancellable: true,
    },
    {
      uuid: faker.string.uuid(),
      label: 'Electrical',
      description: 'Electrical issues',
      cancellable: false,
    },
  ];
  beforeEach(async () => {
    configService = createMock<ConfigService>();
    logger = createMock<WinstonLoggerService>();
    mockModel = {
      generateContent: jest.fn(),
    };
    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    } as any;
    (GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>).mockImplementation(() => mockGenAI);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: WinstonLoggerService,
          useValue: logger,
        },
      ],
    }).compile();
    service = module.get<GeminiService>(GeminiService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('constructor', () => {
    it('should initialize Gemini AI when API key is provided', () => {
      configService.GEMINI_API_KEY = mockApiKey;
      const testService = new GeminiService(configService, logger);
      expect(GoogleGenerativeAI).toHaveBeenCalledWith(mockApiKey);
      expect(logger.warn).not.toHaveBeenCalled();
      expect(testService).toBeDefined();
    });
    it('should log warning when API key is not provided', () => {
      configService.GEMINI_API_KEY = undefined;
      const testService = new GeminiService(configService, logger);
      expect(logger.warn).toHaveBeenCalledWith('GEMINI_API_KEY is not configured. AI parsing will be disabled.');
      expect(testService).toBeDefined();
    });
  });
  describe('parseWorkOrder', () => {
    beforeEach(() => {
      configService.GEMINI_API_KEY = mockApiKey;
      service = new GeminiService(configService, logger);
    });
    it('should throw error when Gemini API is not configured', async () => {
      configService.GEMINI_API_KEY = undefined;
      service = new GeminiService(configService, logger);
      await expect(service.parseWorkOrder('test', [], mockTypes)).rejects.toThrow(
        new AiSuggestionsError('Gemini API is not configured', HttpStatus.SERVICE_UNAVAILABLE),
      );
    });
    it('should throw error when no prompt and no images provided', async () => {
      await expect(service.parseWorkOrder(undefined, [], mockTypes)).rejects.toThrow(
        new AiSuggestionsError('No prompt or images provided for parsing', HttpStatus.BAD_REQUEST),
      );
    });
    it('should throw error when no available types', async () => {
      await expect(service.parseWorkOrder('test', [], [])).rejects.toThrow(
        new AiSuggestionsError('No available work order types found for this building', HttpStatus.NOT_FOUND),
      );
    });
    it('should parse work order successfully with prompt', async () => {
      const prompt = 'Broken pipe in bathroom';
      const mockResponse: ParseWorkOrderResponseBody = {
        typeUuid: mockTypes[0].uuid,
        description: 'Broken pipe in bathroom needs repair',
        location: 'Bathroom',
      };
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });
      const result = await service.parseWorkOrder(prompt, [], mockTypes);
      expect(result).toEqual(mockResponse);
      expect(mockGenAI.getGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-2.0-flash' });
      expect(mockModel.generateContent).toHaveBeenCalledTimes(1);
    });
    it('should parse work order successfully with images', async () => {
      const images: GeminiImageData[] = [
        {
          mimeType: 'image/jpeg',
          data: Buffer.from('fake image').toString('base64'),
        },
      ];
      const mockResponse: ParseWorkOrderResponseBody = {
        typeUuid: mockTypes[1].uuid,
        description: 'Electrical outlet appears damaged',
        location: 'Room 205',
      };
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });
      const result = await service.parseWorkOrder(undefined, images, mockTypes);
      expect(result).toEqual(mockResponse);
      expect(mockModel.generateContent).toHaveBeenCalledTimes(1);
    });
    it('should parse work order successfully with prompt and images', async () => {
      const prompt = 'Check this issue';
      const images: GeminiImageData[] = [
        {
          mimeType: 'image/png',
          data: Buffer.from('fake image').toString('base64'),
        },
      ];
      const mockResponse: ParseWorkOrderResponseBody = {
        typeUuid: mockTypes[0].uuid,
        description: 'Leaking faucet in kitchen',
        location: 'Kitchen',
      };
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });
      const result = await service.parseWorkOrder(prompt, images, mockTypes);
      expect(result).toEqual(mockResponse);
    });
    it('should validate and filter invalid typeUuid', async () => {
      const prompt = 'Test prompt';
      const invalidUuid = faker.string.uuid();
      const mockResponse: ParseWorkOrderResponseBody = {
        typeUuid: invalidUuid,
        description: 'Test description',
      };
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });
      const result = await service.parseWorkOrder(prompt, [], mockTypes);
      expect(result.typeUuid).toBeUndefined();
      expect(result.description).toBe('Test description');
      expect(logger.warn).toHaveBeenCalledWith(`Invalid typeUuid returned: ${invalidUuid}. Setting to null.`);
    });
    it('should handle JSON parsing errors', async () => {
      const prompt = 'Test prompt';
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => 'invalid json',
        },
      });
      await expect(service.parseWorkOrder(prompt, [], mockTypes)).rejects.toThrow(AiSuggestionsError);
      expect(logger.error).toHaveBeenCalled();
    });
    it('should handle Gemini API errors', async () => {
      const prompt = 'Test prompt';
      const apiError = new Error('API error');
      mockModel.generateContent.mockRejectedValueOnce(apiError);
      await expect(service.parseWorkOrder(prompt, [], mockTypes)).rejects.toThrow(AiSuggestionsError);
      expect(logger.error).toHaveBeenCalledWith('Error parsing work order with Gemini:', apiError);
    });
    it('should propagate AiSuggestionsError without wrapping', async () => {
      const prompt = 'Test prompt';
      const customError = new AiSuggestionsError('Custom error', HttpStatus.BAD_REQUEST);
      mockModel.generateContent.mockRejectedValueOnce(customError);
      await expect(service.parseWorkOrder(prompt, [], mockTypes)).rejects.toThrow(customError);
    });
    it('should retry on rate limit errors', async () => {
      const prompt = 'Test prompt';
      const mockResponse: ParseWorkOrderResponseBody = {
        description: 'Test description',
      };
      const rateLimitError = { status: 429 };
      mockModel.generateContent
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({
          response: {
            text: () => JSON.stringify(mockResponse),
          },
        });
      const result = await service.parseWorkOrder(prompt, [], mockTypes);
      expect(result).toEqual(mockResponse);
      expect(mockModel.generateContent).toHaveBeenCalledTimes(3);
      expect(logger.warn).toHaveBeenCalledWith('Gemini 429. Retry 1/3');
      expect(logger.warn).toHaveBeenCalledWith('Gemini 429. Retry 2/3');
    });
    it('should throw error after max retries', async () => {
      const prompt = 'Test prompt';
      const rateLimitError = { status: 429 };
      mockModel.generateContent.mockRejectedValue(rateLimitError);
      await expect(service.parseWorkOrder(prompt, [], mockTypes)).rejects.toThrow();
      expect(mockModel.generateContent).toHaveBeenCalledTimes(4);
    });
    it('should not retry on non-rate-limit errors', async () => {
      const prompt = 'Test prompt';
      const nonRateLimitError = new Error('Other error');
      mockModel.generateContent.mockRejectedValueOnce(nonRateLimitError);
      await expect(service.parseWorkOrder(prompt, [], mockTypes)).rejects.toThrow();
      expect(mockModel.generateContent).toHaveBeenCalledTimes(1);
    });
    it('should use custom model when provided', async () => {
      const prompt = 'Test prompt';
      const customModel = 'gemini-pro';
      const mockResponse: ParseWorkOrderResponseBody = {
        description: 'Test description',
      };
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });
      await service.parseWorkOrder(prompt, [], mockTypes, customModel);
      expect(mockGenAI.getGenerativeModel).toHaveBeenCalledWith({ model: customModel });
    });
    it('should handle response without typeUuid', async () => {
      const prompt = 'Test prompt';
      const mockResponse: ParseWorkOrderResponseBody = {
        description: 'Test description',
        location: 'Test location',
      };
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });
      const result = await service.parseWorkOrder(prompt, [], mockTypes);
      expect(result.typeUuid).toBeUndefined();
      expect(result.description).toBe('Test description');
      expect(result.location).toBe('Test location');
    });
  });
});
‎services/work-orders-service/src/ai/ai-error.filter.ts‎
+32
Lines changed: 32 additions & 0 deletions
Original file line number	Diff line number	Diff line change
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AiSuggestionsError } from './ai-error';
@Catch(AiSuggestionsError, Error)
export class AiErrorFilter implements ExceptionFilter {
  catch(exception: AiSuggestionsError | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    if (exception instanceof AiSuggestionsError) {
      return response.status(exception.status).json({
        error: exception.message,
        details: exception.details,
      });
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      return response.status(status).json(exceptionResponse);
    }
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'An unexpected error occurred',
      message: exception.message,
    });
  }
}
‎services/work-orders-service/src/ai/ai-error.ts‎
+12
Lines changed: 12 additions & 0 deletions
Original file line number	Diff line number	Diff line change
import { HttpStatus } from '@nestjs/common';
export class AiSuggestionsError extends Error {
  constructor(
    message: string,
    public readonly status: number = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly details?: string,
  ) {
    super(message);
    this.name = 'AiSuggestionsError';
  }
}
‎services/work-orders-service/src/ai/ai.module.ts‎
+11
Lines changed: 11 additions & 0 deletions
Original file line number	Diff line number	Diff line change
import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ConfigModule } from '../config/config.module';
@Module({
  imports: [ConfigModule],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class AiModule {}
‎services/work-orders-service/src/ai/gemini.service.ts‎
+159
Lines changed: 159 additions & 0 deletions
Original file line number	Diff line number	Diff line change
import { Injectable, HttpStatus } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { WinstonLoggerService } from '@hqo/nestjs-winston-logger';
import { AvailableTypeResponse, ParseWorkOrderResponseBody } from '@hqo/work-orders-types';
import { AiSuggestionsError } from './ai-error';
import { GeminiImageData } from './gemini.types';
import { buildWorkOrderSystemPrompt } from './system-prompt';
import { ConfigService } from '../config/config.service';
const WORK_ORDER_SCHEMA = {
  type: 'object',
  properties: {
    typeUuid: {
      type: 'string',
      description:
        'REQUIRED: The UUID of the work order type that best matches the issue. Must be one of the UUIDs from the available types list provided in the prompt.',
    },
    description: {
      type: 'string',
      description:
        'REQUIRED: A clear, professional, and concise description of the issue or problem. This should describe what needs to be fixed or addressed. Always provide a description based on the user input or images.',
    },
    location: {
      type: 'string',
      description:
        'OPTIONAL: The specific location where the issue is located. Only include if clearly mentioned in text or visible in images. Examples: "Room 205", "Main lobby", "Parking lot level 2". If not identifiable, omit this field.',
    },
  },
  required: ['description'],
};
@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    const apiKey = this.configService.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn('GEMINI_API_KEY is not configured. AI parsing will be disabled.');
    }
  }
  async parseWorkOrder(
    prompt: string | undefined,
    images: GeminiImageData[],
    availableTypes: AvailableTypeResponse[],
    model = 'gemini-2.0-flash',
Comment on line R54
Resolved
Comment on line R54
Resolved
Comment on line R54
Resolved
  ): Promise<ParseWorkOrderResponseBody> {
    if (!this.genAI) {
      throw new AiSuggestionsError('Gemini API is not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }
    if (!prompt && images.length === 0) {
      throw new AiSuggestionsError('No prompt or images provided for parsing', HttpStatus.BAD_REQUEST);
    }
    if (availableTypes.length === 0) {
      throw new AiSuggestionsError('No available work order types found for this building', HttpStatus.NOT_FOUND);
    }
    const systemPrompt = this.generateSystemPrompt(availableTypes);
    const userPrompt = this.buildUserPrompt(systemPrompt, prompt, images);
    const modelInstance = this.genAI.getGenerativeModel({ model });
    try {
      const result = await this.retry(() => modelInstance.generateContent(userPrompt));
      const data = JSON.parse(result.response.text()) as ParseWorkOrderResponseBody;
      data.typeUuid = this.validateTypeUuid(data.typeUuid, availableTypes);
      return data;
    } catch (e) {
      this.logger.error('Error parsing work order with Gemini:', e);
      throw e instanceof AiSuggestionsError
        ? e
        : new AiSuggestionsError('Error analyzing work order request', HttpStatus.INTERNAL_SERVER_ERROR, String(e));
    }
  }
  private generateSystemPrompt(types: AvailableTypeResponse[]): string {
    const typesList = types
      .map((t) => `- ${t.uuid}: ${t.label}${t.description ? ` - ${t.description}` : ''}`)
      .join('\n');
    return buildWorkOrderSystemPrompt(typesList);
  }
  private buildUserPrompt(
    systemPrompt: string,
    prompt: string | undefined,
    images: GeminiImageData[],
    // I need to cast the prompt to any to avoid type errors, which seem related
    // to the @google/generative-ai package types not being in line with the documentation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
Comment on line R99
Resolved
Comment on line R99
Resolved
  ): any {
    const parts = [
      { text: systemPrompt },
      ...(prompt ? [{ text: `User input: "${prompt}"` }] : []),
      ...images.map((i) => ({
        inlineData: { mimeType: i.mimeType, data: i.data },
      })),
      {
        text: 'Based on the above extract typeUuid, description and location.',
      },
    ];
    const generationConfig = {
      temperature: 0.2,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      responseSchema: WORK_ORDER_SCHEMA,
    };
    return {
      contents: [{ role: 'user', parts }],
      generationConfig,
    };
  }
  private validateTypeUuid(uuid: string | undefined, types: AvailableTypeResponse[]): string | undefined {
    if (!uuid) return undefined;
    if (!types.some((t) => t.uuid === uuid)) {
      this.logger.warn(`Invalid typeUuid returned: ${uuid}. Setting to null.`);
      return undefined;
    }
    return uuid;
  }
  private async retry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        return await fn();
      } catch (err) {
        const isLast = attempt === maxRetries;
        if (!this.isRateLimitError(err) || isLast) {
          throw err;
        }
        this.logger.warn(`Gemini 429. Retry ${attempt + 1}/${maxRetries}`);
      }
    }
    throw new Error('Retry logic failure');
Comment on line R152
Resolved
Comment on line R152
Resolved
Comment on line R152
Resolved
  }
  private isRateLimitError(err: unknown): boolean {
    const error = err as { status?: number };
    return error?.status === 429;
  }
}
‎services/work-orders-service/src/ai/gemini.types.ts‎
+4
Lines changed: 4 additions & 0 deletions
Original file line number	Diff line number	Diff line change
export interface GeminiImageData {
  data: string;
  mimeType: string;
}
‎services/work-orders-service/src/ai/index.ts‎
+4
Lines changed: 4 additions & 0 deletions
Original file line number	Diff line number	Diff line change
export * from './gemini.service';
export * from './ai-error';
export * from './ai-error.filter';
export * from './ai.module';
‎services/work-orders-service/src/ai/system-prompt.ts‎
+49
Lines changed: 49 additions & 0 deletions
Original file line number	Diff line number	Diff line change
export const buildWorkOrderSystemPrompt = (typesList: string) =>
  `
You are an AI assistant that extracts structured information from user input (text and/or images) to create work orders in a facility management system.
Your task is to analyze the user's input and extract exactly THREE fields:
1. **typeUuid (REQUIRED)**
   The UUID of the work order type that best matches the issue.
   Must be *exactly one of the UUIDs* from the list below.
   If no confident match exists — you may omit this field.
2. **description (REQUIRED)**
   A clear, concise, and professional description of the issue.
   - If text was provided — rewrite it professionally.
   - If analyzing images — describe only what is actually visible.
   - Be specific and avoid vague wording.
3. **location (OPTIONAL)**
   Only include if it is explicitly mentioned in text or clearly visible in images.
   Examples: “Room 205”, “Main lobby”, “Parking level 2”, “3rd floor restroom”.
   If not identifiable — omit entirely.
---
### Available work order types:
${typesList}
---
### CRITICAL INSTRUCTIONS:
- Always return **all three fields**: \`typeUuid\`, \`description\`, \`location\` (location may be null/empty).
- \`description\` is **mandatory** — always generate it.
- Only include \`location\` when truly clear.
- \`typeUuid\` must **exactly match** a UUID from the list above.
- Be detailed: describe what is broken, how it appears, and the nature of the issue.
- When analyzing images — describe the visible issue precisely.
- Write the description as if reporting the issue to a maintenance technician.
---
### Example response:
{
  "typeUuid": "abc-123-def-456",
  "description": "The ceiling light in the hallway is flickering and likely needs replacement. The fixture also appears loose.",
  "location": "Second floor hallway"
}
Now analyze the user's input and extract the three fields.
`;
‎services/work-orders-service/src/attachments/tests/attachments.service.spec.ts‎
+114
-1
Lines changed: 114 additions & 1 deletion
Original file line number	Diff line number	Diff line change
      destroy: jest.fn(),
      middlewareStack: {} as any,
      config: {} as any,
    } as jest.Mocked<S3Client>;
    } as unknown as jest.Mocked<S3Client>;

    mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;
    mockGetSignedUrl.mockResolvedValue(mockSignedUrl);
    });
  });

  describe('downloadFile', () => {
    const mockFileContent = Buffer.from('test file content');
    const mockStream = {
      async *[Symbol.asyncIterator]() {
        yield Buffer.from('test ');
        yield Buffer.from('file ');
        yield Buffer.from('content');
      },
    } as any;
    it('should download file successfully', async () => {
      (mockS3Client.send as jest.Mock).mockResolvedValueOnce({
        Body: mockStream,
      });
      const result = await service.downloadFile(mockKey);
      expect(result).toEqual(mockFileContent);
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: mockBucket,
            Key: mockKey,
          },
        }),
      );
    });
    it('should handle empty file', async () => {
      const emptyStream = {
        async *[Symbol.asyncIterator]() {
          yield Buffer.alloc(0);
        },
      } as any;
      (mockS3Client.send as jest.Mock).mockResolvedValueOnce({
        Body: emptyStream,
      });
      const result = await service.downloadFile(mockKey);
      expect(result).toEqual(Buffer.alloc(0));
    });
    it('should handle large file with multiple chunks', async () => {
      const largeContent = Buffer.alloc(10000, 'a');
      const chunks = [Buffer.alloc(3000, 'a'), Buffer.alloc(3000, 'a'), Buffer.alloc(4000, 'a')];
      const largeStream = {
        async *[Symbol.asyncIterator]() {
          for (const chunk of chunks) {
            yield chunk;
          }
        },
      } as any;
      (mockS3Client.send as jest.Mock).mockResolvedValueOnce({
        Body: largeStream,
      });
      const result = await service.downloadFile(mockKey);
      expect(result.length).toBe(10000);
      expect(result).toEqual(largeContent);
    });
    it('should throw error when file not found', async () => {
      (mockS3Client.send as jest.Mock).mockResolvedValueOnce({
        Body: null,
      });
      await expect(service.downloadFile(mockKey)).rejects.toThrow(`File not found: ${mockKey}`);
    });
    it('should throw error when Body is undefined', async () => {
      (mockS3Client.send as jest.Mock).mockResolvedValueOnce({
        Body: undefined,
      });
      await expect(service.downloadFile(mockKey)).rejects.toThrow(`File not found: ${mockKey}`);
    });
    it('should handle S3 client errors', async () => {
      const s3Error = new Error('S3 access denied');
      (mockS3Client.send as jest.Mock).mockRejectedValueOnce(s3Error);
      await expect(service.downloadFile(mockKey)).rejects.toThrow('S3 access denied');
    });
    it('should handle different file keys', async () => {
      const testKeys = ['images/photo.jpg', 'documents/report.pdf', 'videos/presentation.mp4'];
      for (const key of testKeys) {
        const stream = {
          async *[Symbol.asyncIterator]() {
            yield Buffer.from(`content for ${key}`);
          },
        } as any;
        (mockS3Client.send as jest.Mock).mockResolvedValueOnce({
          Body: stream,
        });
        // eslint-disable-next-line no-await-in-loop
        const result = await service.downloadFile(key);
        expect(result.toString()).toBe(`content for ${key}`);
      }
      expect(mockS3Client.send).toHaveBeenCalledTimes(testKeys.length);
    });
  });
  describe('error scenarios', () => {
    it('should propagate AWS SDK errors', async () => {
      const awsError = {
‎services/work-orders-service/src/attachments/attachments.service.ts‎
+19
Lines changed: 19 additions & 0 deletions
Original file line number	Diff line number	Diff line change

import { GetObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

import { WORK_ORDER_ATTACHMENTS_S3_BUCKET_INJECT_KEY, WORK_ORDER_ATTACHMENTS_S3_CLIENT_INJECT_KEY } from './constants';

      expiresIn: this.#UPLOAD_URL_EXPIRES_IN,
    });
  }
  async downloadFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const response = await this.s3client.send(command);
    if (!response.Body) {
      throw new Error(`File not found: ${key}`);
    }
    const stream = response.Body as Readable;
    const chunks = await Array.fromAsync(stream);
    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
  }
}
‎services/work-orders-service/src/config/config.service.ts‎
+4
Lines changed: 4 additions & 0 deletions
Original file line number	Diff line number	Diff line change
  get AWS_PROFILE(): string | undefined {
    return this.get('AWS_PROFILE');
  }
  get GEMINI_API_KEY(): string | undefined {
    return this.get('GEMINI_API_KEY');
  }
}
‎services/work-orders-service/src/work-orders-users/tests/work-orders-users.controller.spec.ts‎
+115
Lines changed: 115 additions & 0 deletions
Original file line number	Diff line number	Diff line change
  WorkOrderAttachmentLink,
} from '../../work-orders/dtos/get-work-order-attachment-links-response.dto';
import { GetWorkOrderUserAttachmentUploadLinksRequestDto } from '../../work-orders/dtos/get-work-order-user-attachment-upload-links.dto';
import { ParseWorkOrderRequestDto } from '../../work-orders/dtos/parse-work-order-request.dto';
import { ParseWorkOrderResponseDto } from '../../work-orders/dtos/parse-work-order-response.dto';
import { CreateUserWorkOrderResponseDto } from '../dto/create-user-work-order-response.dto';
import { WorkOrdersUsersController } from '../work-orders-users.controller';
import { WorkOrdersUsersService } from '../work-orders-users.service';
    });
  });

  describe('parseWorkOrder', () => {
    it('should return null when service returns null', async () => {
      const body: ParseWorkOrderRequestDto = {
        buildingUuid: faker.string.uuid(),
        prompt: faker.lorem.sentence(),
      };
      workOrdersUsersService.parseWorkOrder.mockResolvedValue(null);
      const result = await controller.parseWorkOrder(body);
      expect(result).toBeNull();
      expect(workOrdersUsersService.parseWorkOrder).toHaveBeenCalledWith(body);
    });
    it('should return parsed work order data', async () => {
      const body: ParseWorkOrderRequestDto = {
        buildingUuid: faker.string.uuid(),
        prompt: faker.lorem.sentence(),
      };
      const expectedResponse: ParseWorkOrderResponseDto = {
        typeUuid: faker.string.uuid(),
        description: faker.lorem.sentence(),
        location: faker.location.streetAddress(),
      };
      workOrdersUsersService.parseWorkOrder.mockResolvedValue(expectedResponse);
      const result = await controller.parseWorkOrder(body);
      expect(result).toEqual(expectedResponse);
      expect(workOrdersUsersService.parseWorkOrder).toHaveBeenCalledWith(body);
    });
    it('should work with minimal body (only buildingUuid)', async () => {
      const body: ParseWorkOrderRequestDto = {
        buildingUuid: faker.string.uuid(),
      };
      workOrdersUsersService.parseWorkOrder.mockResolvedValue(null);
      const result = await controller.parseWorkOrder(body);
      expect(result).toBeNull();
      expect(workOrdersUsersService.parseWorkOrder).toHaveBeenCalledWith(body);
    });
    it('should work with attachments', async () => {
      const body: ParseWorkOrderRequestDto = {
        buildingUuid: faker.string.uuid(),
        prompt: faker.lorem.sentence(),
        attachments: [
          {
            fileName: faker.system.fileName(),
            filePath: faker.system.filePath(),
            fileSizeBytes: faker.number.int({ min: 1000, max: 1000000 }),
          },
        ],
      };
      workOrdersUsersService.parseWorkOrder.mockResolvedValue(null);
      const result = await controller.parseWorkOrder(body);
      expect(result).toBeNull();
      expect(workOrdersUsersService.parseWorkOrder).toHaveBeenCalledWith(body);
    });
    it('should propagate service errors', async () => {
      const body: ParseWorkOrderRequestDto = {
        buildingUuid: faker.string.uuid(),
      };
      const error = new Error(faker.lorem.sentence());
      workOrdersUsersService.parseWorkOrder.mockRejectedValue(error);
      await expect(controller.parseWorkOrder(body)).rejects.toThrow('An error occurred while processing your request');
      expect(workOrdersUsersService.parseWorkOrder).toHaveBeenCalledWith(body);
    });
    it('should handle partial response (only typeUuid)', async () => {
      const body: ParseWorkOrderRequestDto = {
        buildingUuid: faker.string.uuid(),
      };
      const expectedResponse: ParseWorkOrderResponseDto = {
        typeUuid: faker.string.uuid(),
      };
      workOrdersUsersService.parseWorkOrder.mockResolvedValue(expectedResponse);
      const result = await controller.parseWorkOrder(body);
      expect(result).toEqual(expectedResponse);
      expect(workOrdersUsersService.parseWorkOrder).toHaveBeenCalledWith(body);
    });
    it('should handle partial response (only description)', async () => {
      const body: ParseWorkOrderRequestDto = {
        buildingUuid: faker.string.uuid(),
      };
      const expectedResponse: ParseWorkOrderResponseDto = {
        description: faker.lorem.sentence(),
      };
      workOrdersUsersService.parseWorkOrder.mockResolvedValue(expectedResponse);
      const result = await controller.parseWorkOrder(body);
      expect(result).toEqual(expectedResponse);
      expect(workOrdersUsersService.parseWorkOrder).toHaveBeenCalledWith(body);
    });
  });
  const makeCreateWorkOrderResponse = (
    overrides?: Partial<CreateUserWorkOrderResponseDto>,
  ): CreateUserWorkOrderResponseDto => {
‎services/work-orders-service/src/work-orders-users/tests/work-orders-users.service.spec.ts‎
+276
-5
Lines changed: 276 additions & 5 deletions
Original file line number	Diff line number	Diff line change
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Test, TestingModule } from '@nestjs/testing';

import { faker } from '@faker-js/faker';
import { createMock, FullMock } from '@hqo/shared-modules/dist/utils/test-utils';
import { ParseWorkOrderRequestBody, ParseWorkOrderResponseBody } from '@hqo/work-orders-types';
import { WorkOrdersService as WorkOrdersDataService, WorkOrderTeamsService } from 'work-orders-database';

import { GeminiService } from '../../ai/gemini.service';
import { AttachmentsService } from '../../attachments/attachments.service';
import { CreateUserWorkOrderRequestDto } from '../../work-orders/dtos/create-user-work-order-request';
import { WorkOrdersSearchService } from '../../work-orders/work-orders-search.service';
import { WorkOrdersSingleService } from '../../work-orders/work-orders-single.service';
import { WorkOrdersService } from '../../work-orders/work-orders.service';
import { WorkOrdersUsersService } from '../work-orders-users.service';

  let workOrdersService: FullMock<WorkOrdersService>;
  let workOrdersSearchService: FullMock<WorkOrdersSearchService>;
  let workOrderTeamsService: FullMock<WorkOrderTeamsService>;
  let workOrdersSingleService: FullMock<WorkOrdersSingleService>;
  let module: TestingModule;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
    module = await Test.createTestingModule({
      providers: [WorkOrdersUsersService],
    })
      .useMocker(createMock)
    workOrdersService = module.get(WorkOrdersService);
    workOrdersSearchService = module.get(WorkOrdersSearchService);
    workOrderTeamsService = module.get(WorkOrderTeamsService);
    workOrdersSingleService = module.get(WorkOrdersSingleService);
  });

  afterEach(() => {
        expect(item.key).toMatch(new RegExp(`^attachments/${currentUserUuid}/[a-f0-9-]+$`));
      });

      // Verify all keys are unique
      const keys = result.data.map((item) => item.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(count);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(count);

      // Verify each key has the correct format
      keys.forEach((key) => {
        expect(key).toMatch(new RegExp(`^attachments/${currentUserUuid}/[a-f0-9-]+$`));
      });

      await service.createWorkOrder(body, currentUserUuid);

      // Verify both calls were made (Promise.all ensures both are awaited)
      expect(workOrdersService.requireTypeForBuildingId).toHaveBeenCalledWith(
        typeUuid,
        mockWorkOrderBuilding.id,
    });
  });

  describe('parseWorkOrder', () => {
    const buildingUuid = faker.string.uuid();
    let geminiService: FullMock<GeminiService>;
    beforeEach(() => {
      geminiService = module.get(GeminiService);
    });
    it('should parse work order with prompt and images', async () => {
      const body: ParseWorkOrderRequestBody = {
        buildingUuid,
        prompt: faker.lorem.sentence(),
        attachments: [
          {
            fileName: 'photo.jpg',
            filePath: 'attachments/test/photo.jpg',
            fileSizeBytes: 1024,
          },
          {
            fileName: 'document.pdf',
            filePath: 'attachments/test/document.pdf',
            fileSizeBytes: 2048,
          },
        ],
      };
      const mockTypes = [
        {
          uuid: faker.string.uuid(),
          label: faker.lorem.word(),
          description: faker.lorem.sentence(),
        },
      ];
      const mockResponse: ParseWorkOrderResponseBody = {
        typeUuid: mockTypes[0].uuid,
        description: faker.lorem.sentence(),
        location: faker.location.streetAddress(),
      };
      workOrdersSingleService.getAvailableTypesForBuilding.mockResolvedValueOnce({
        data: mockTypes,
      } as any);
      const mockImageBuffer = Buffer.from('fake image content');
      attachmentsService.downloadFile.mockResolvedValueOnce(mockImageBuffer);
      geminiService.parseWorkOrder.mockResolvedValueOnce(mockResponse);
      const result = await service.parseWorkOrder(body);
      expect(workOrdersSingleService.getAvailableTypesForBuilding).toHaveBeenCalledWith(buildingUuid);
      expect(attachmentsService.downloadFile).toHaveBeenCalledTimes(1);
      expect(attachmentsService.downloadFile).toHaveBeenCalledWith('attachments/test/photo.jpg');
      expect(geminiService.parseWorkOrder).toHaveBeenCalledWith(
        body.prompt,
        [
          {
            mimeType: 'image/jpeg',
            data: mockImageBuffer.toString('base64'),
          },
        ],
        mockTypes,
      );
      expect(result).toEqual(mockResponse);
    });
    it('should filter out non-image attachments', async () => {
      const body: ParseWorkOrderRequestBody = {
        buildingUuid,
        prompt: faker.lorem.sentence(),
        attachments: [
          {
            fileName: 'photo.jpg',
            filePath: 'attachments/test/photo.jpg',
            fileSizeBytes: 1024,
          },
          {
            fileName: 'document.pdf',
            filePath: 'attachments/test/document.pdf',
            fileSizeBytes: 2048,
          },
          {
            fileName: 'image.png',
            filePath: 'attachments/test/image.png',
            fileSizeBytes: 3072,
          },
        ],
      };
      const mockTypes = [
        {
          uuid: faker.string.uuid(),
          label: faker.lorem.word(),
        },
      ];
      workOrdersSingleService.getAvailableTypesForBuilding.mockResolvedValueOnce({
        data: mockTypes,
      } as any);
      const mockImageBuffer = Buffer.from('fake image content');
      attachmentsService.downloadFile.mockResolvedValueOnce(mockImageBuffer);
      attachmentsService.downloadFile.mockResolvedValueOnce(mockImageBuffer);
      geminiService.parseWorkOrder.mockResolvedValueOnce(null as any);
      await service.parseWorkOrder(body);
      expect(attachmentsService.downloadFile).toHaveBeenCalledTimes(2);
      expect(attachmentsService.downloadFile).toHaveBeenCalledWith('attachments/test/photo.jpg');
      expect(attachmentsService.downloadFile).toHaveBeenCalledWith('attachments/test/image.png');
      expect(attachmentsService.downloadFile).not.toHaveBeenCalledWith('attachments/test/document.pdf');
    });
    it('should handle image download errors gracefully', async () => {
      const body: ParseWorkOrderRequestBody = {
        buildingUuid,
        attachments: [
          {
            fileName: 'photo.jpg',
            filePath: 'attachments/test/photo.jpg',
            fileSizeBytes: 1024,
          },
          {
            fileName: 'image.png',
            filePath: 'attachments/test/image.png',
            fileSizeBytes: 2048,
          },
        ],
      };
      const mockTypes = [
        {
          uuid: faker.string.uuid(),
          label: faker.lorem.word(),
        },
      ];
      workOrdersSingleService.getAvailableTypesForBuilding.mockResolvedValueOnce({
        data: mockTypes,
      } as any);
      const mockImageBuffer = Buffer.from('fake image content');
      attachmentsService.downloadFile.mockRejectedValueOnce(new Error('Download failed'));
      attachmentsService.downloadFile.mockResolvedValueOnce(mockImageBuffer);
      geminiService.parseWorkOrder.mockResolvedValueOnce(null as any);
      await service.parseWorkOrder(body);
      expect(attachmentsService.downloadFile).toHaveBeenCalledTimes(2);
      expect(geminiService.parseWorkOrder).toHaveBeenCalledWith(
        undefined,
        [
          {
            mimeType: 'image/png',
            data: mockImageBuffer.toString('base64'),
          },
        ],
        mockTypes,
      );
    });
    it('should handle unsupported image format', async () => {
      const body: ParseWorkOrderRequestBody = {
        buildingUuid,
        attachments: [
          {
            fileName: 'image.unknown',
            filePath: 'attachments/test/image.unknown',
            fileSizeBytes: 1024,
          },
        ],
      };
      const mockTypes = [
        {
          uuid: faker.string.uuid(),
          label: faker.lorem.word(),
        },
      ];
      workOrdersSingleService.getAvailableTypesForBuilding.mockResolvedValueOnce({
        data: mockTypes,
      } as any);
      geminiService.parseWorkOrder.mockResolvedValueOnce(null as any);
      await service.parseWorkOrder(body);
      expect(attachmentsService.downloadFile).not.toHaveBeenCalled();
      expect(geminiService.parseWorkOrder).toHaveBeenCalledWith(undefined, [], mockTypes);
    });
    it('should handle work order without attachments', async () => {
      const body: ParseWorkOrderRequestBody = {
        buildingUuid,
        prompt: faker.lorem.sentence(),
      };
      const mockTypes = [
        {
          uuid: faker.string.uuid(),
          label: faker.lorem.word(),
        },
      ];
      workOrdersSingleService.getAvailableTypesForBuilding.mockResolvedValueOnce({
        data: mockTypes,
      } as any);
      geminiService.parseWorkOrder.mockResolvedValueOnce(null as any);
      await service.parseWorkOrder(body);
      expect(attachmentsService.downloadFile).not.toHaveBeenCalled();
      expect(geminiService.parseWorkOrder).toHaveBeenCalledWith(body.prompt, [], mockTypes);
    });
    it('should handle different image formats', async () => {
      const body: ParseWorkOrderRequestBody = {
        buildingUuid,
        attachments: [
          { fileName: 'photo.jpg', filePath: 'test.jpg', fileSizeBytes: 1024 },
          { fileName: 'photo.jpeg', filePath: 'test.jpeg', fileSizeBytes: 1024 },
          { fileName: 'photo.png', filePath: 'test.png', fileSizeBytes: 1024 },
          { fileName: 'photo.gif', filePath: 'test.gif', fileSizeBytes: 1024 },
          { fileName: 'photo.webp', filePath: 'test.webp', fileSizeBytes: 1024 },
          { fileName: 'photo.bmp', filePath: 'test.bmp', fileSizeBytes: 1024 },
          { fileName: 'photo.svg', filePath: 'test.svg', fileSizeBytes: 1024 },
        ],
      };
      const mockTypes = [
        {
          uuid: faker.string.uuid(),
          label: faker.lorem.word(),
        },
      ];
      workOrdersSingleService.getAvailableTypesForBuilding.mockResolvedValueOnce({
        data: mockTypes,
      } as any);
      const mockImageBuffer = Buffer.from('fake image content');
      attachmentsService.downloadFile.mockResolvedValue(mockImageBuffer);
      geminiService.parseWorkOrder.mockResolvedValueOnce(null as any);
      await service.parseWorkOrder(body);
      expect(attachmentsService.downloadFile).toHaveBeenCalledTimes(7);
      expect(geminiService.parseWorkOrder).toHaveBeenCalledWith(
        undefined,
        expect.arrayContaining([
          { mimeType: 'image/jpeg', data: expect.any(String) },
          { mimeType: 'image/png', data: expect.any(String) },
          { mimeType: 'image/gif', data: expect.any(String) },
          { mimeType: 'image/webp', data: expect.any(String) },
          { mimeType: 'image/bmp', data: expect.any(String) },
          { mimeType: 'image/svg+xml', data: expect.any(String) },
        ]),
        mockTypes,
      );
    });
  });
  describe('getWorkOrderDetails edge cases', () => {
    const workOrderUuid = faker.string.uuid();
    const createdAt = faker.date.past();
‎services/work-orders-service/src/work-orders-users/work-orders-users.controller.ts‎
+25
-1
Lines changed: 25 additions & 1 deletion
Original file line number	Diff line number	Diff line change
import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { Body, Controller, HttpStatus, Post, UnauthorizedException, UseFilters } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { CreateUserWorkOrderResponseDto } from './dto/create-user-work-order-response.dto';
import { WorkOrdersUsersService } from './work-orders-users.service';
import { AiErrorFilter, AiSuggestionsError } from '../ai';
import CurrentUser from '../shared/decorators/current-user.decorator';
import { CreateUserWorkOrderRequestDto } from '../work-orders/dtos/create-user-work-order-request';
import { GetWorkOrderAttachmentLinksResponseDto } from '../work-orders/dtos/get-work-order-attachment-links-response.dto';
import { GetWorkOrderUserAttachmentUploadLinksRequestDto } from '../work-orders/dtos/get-work-order-user-attachment-upload-links.dto';
import { ParseWorkOrderRequestDto } from '../work-orders/dtos/parse-work-order-request.dto';
import { ParseWorkOrderResponseDto } from '../work-orders/dtos/parse-work-order-response.dto';

@Controller({
  version: '1',
    return this.workOrdersUsersService.getUploadLinksForWorkOrderAttachments(currentUserUuid, body.count);
  }

  @ApiOkResponse({
    description: 'Parses user input into the JSON for work order creation',
    type: ParseWorkOrderResponseDto,
  })
  @Post('current/work-orders/parse')
  @UseFilters(AiErrorFilter)
  async parseWorkOrder(@Body() body: ParseWorkOrderRequestDto): Promise<ParseWorkOrderResponseDto | null> {
    try {
      return await this.workOrdersUsersService.parseWorkOrder(body);
    } catch (error) {
      if (error instanceof AiSuggestionsError) {
        throw error;
      }
      throw new AiSuggestionsError(
        'An error occurred while processing your request',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error instanceof Error ? error.message : String(error),
      );
    }
Comment on line R55
Resolved
Comment on line R55
Resolved
Comment on line R55
Resolved
Comment on line R55
Resolved
Comment on line R55
Resolved
  }
  @Post('current/work-orders')
  async createWorkOrder(
    @Body() body: CreateUserWorkOrderRequestDto,
‎services/work-orders-service/src/work-orders-users/work-orders-users.module.ts‎
+2
-1
Lines changed: 2 additions & 1 deletion
Original file line number	Diff line number	Diff line change

import { WorkOrdersUsersController } from './work-orders-users.controller';
import { WorkOrdersUsersService } from './work-orders-users.service';
import { AiModule } from '../ai/ai.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { WorkOrdersModule } from '../work-orders/work-orders.module';

@Module({
  imports: [AttachmentsModule, WorkOrdersDataModule, WorkOrdersModule, WorkOrderTeamsModule],
  imports: [AttachmentsModule, AiModule, WorkOrdersDataModule, WorkOrdersModule, WorkOrderTeamsModule],
  controllers: [WorkOrdersUsersController],
  providers: [WorkOrdersUsersService],
})
‎services/work-orders-service/src/work-orders-users/work-orders-users.service.ts‎
+70
-3
Lines changed: 70 additions & 3 deletions
Original file line number	Diff line number	Diff line change
import { Injectable, NotFoundException } from '@nestjs/common';

import { WorkOrderDetails } from '@hqo/work-orders-types';
import { WinstonLoggerService } from '@hqo/nestjs-winston-logger';
import {
  ParseWorkOrderAttachment,
  ParseWorkOrderRequestBody,
  ParseWorkOrderResponseBody,
  WorkOrderDetails,
} from '@hqo/work-orders-types';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'node:crypto';
import {
  WorkOrderTeamsService,
} from 'work-orders-database';

import { mapWorkOrderToCreateUserWorkOrderResponse } from './work-orders-users.mapper';
import { GeminiService } from '../ai/gemini.service';
import { GeminiImageData } from '../ai/gemini.types';
import { AttachmentsService } from '../attachments/attachments.service';
import { CreateUserWorkOrderResponseDto } from './dto/create-user-work-order-response.dto';
import { CreateUserWorkOrderRequestDto } from '../work-orders/dtos/create-user-work-order-request';
import { GetWorkOrderAttachmentLinksResponseDto } from '../work-orders/dtos/get-work-order-attachment-links-response.dto';
import { WorkOrdersSearchService } from '../work-orders/work-orders-search.service';
import { WorkOrdersSingleService } from '../work-orders/work-orders-single.service';
import { WorkOrdersService } from '../work-orders/work-orders.service';
import { CreateUserWorkOrderResponseDto } from './dto/create-user-work-order-response.dto';
import { mapWorkOrderToCreateUserWorkOrderResponse } from './work-orders-users.mapper';
function getImageMimeType(fileName: string): string | null {
  const lowerFileName = fileName.toLowerCase();
  const extension = lowerFileName.substring(lowerFileName.lastIndexOf('.'));
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
  };
  return mimeTypes[extension] || null;
}
function isImageFile(fileName: string): boolean {
  return getImageMimeType(fileName) !== null;
}

@Injectable()
export class WorkOrdersUsersService {
  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly geminiService: GeminiService,
    private readonly workOrdersSingleService: WorkOrdersSingleService,
    private readonly logger: WinstonLoggerService,
Comment on line R56
Resolved
Comment on line R56
Resolved
    private readonly workOrdersDataService: WorkOrdersDataService,
    private readonly workOrdersService: WorkOrdersService,
    private readonly workOrdersSearchService: WorkOrdersSearchService,
    };
  }

  async parseWorkOrder(body: ParseWorkOrderRequestBody): Promise<ParseWorkOrderResponseBody | null> {
    const availableTypes = await this.getAvailableTypes(body.buildingUuid);
    const images = body.attachments ? await this.extractImagesFromAttachments(body.attachments) : [];
    return this.geminiService.parseWorkOrder(body.prompt, images, availableTypes);
Comment on line R89
Resolved
Comment on line R89
Resolved
  }
  private async getAvailableTypes(buildingUuid: string) {
    const response = await this.workOrdersSingleService.getAvailableTypesForBuilding(buildingUuid);
    return response.data;
  }
  private async extractImagesFromAttachments(attachments: ParseWorkOrderAttachment[]): Promise<GeminiImageData[]> {
    const imageFiles = attachments.filter((a) => isImageFile(a.fileName));
    const images = await Promise.all(imageFiles.map((a) => this.loadImage(a)));
    return images.filter((img): img is GeminiImageData => !!img);
  }
  private async loadImage(attachment: ParseWorkOrderAttachment): Promise<GeminiImageData | null> {
    const mime = getImageMimeType(attachment.fileName);
    if (!mime) return null;
    try {
      // Download files from S3 and convert to base64 for Gemini API
      // Gemini API requires inline data (base64) instead of fileUri for S3 files
      // because fileUri only works with Google Cloud Storage, not AWS S3
      const buf = await this.attachmentsService.downloadFile(attachment.filePath);
      return { mimeType: mime, data: buf.toString('base64') };
    } catch (e) {
      this.logger.error(`Image load failed: ${attachment.fileName}`, e);
      return null;
    }
  }
  async getWorkOrderDetails(workOrderUuid: string): Promise<WorkOrderDetails> {
    const workOrder = await this.workOrdersDataService.getFullWorkOrderDetails(workOrderUuid);
    if (!workOrder) {
‎services/work-orders-service/src/work-orders/dtos/parse-work-order-request.dto.ts‎
+38
Lines changed: 38 additions & 0 deletions
Original file line number	Diff line number	Diff line change
import { ApiProperty } from '@nestjs/swagger';
import { ParseWorkOrderAttachment, ParseWorkOrderRequestBody } from '@hqo/work-orders-types';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
export class ParseWorkOrderAttachmentDto implements ParseWorkOrderAttachment {
  @ApiProperty()
  @IsString()
  fileName!: string;
  @ApiProperty()
  @IsString()
  filePath!: string;
  @ApiProperty()
  @IsInt()
  @Min(0)
  fileSizeBytes!: number;
}
export class ParseWorkOrderRequestDto implements ParseWorkOrderRequestBody {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  buildingUuid!: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  prompt?: string;
  @ApiProperty({ required: false, isArray: true, type: ParseWorkOrderAttachmentDto })
  @IsOptional()
  @IsArray()
  @Type(() => ParseWorkOrderAttachmentDto)
  @ValidateNested({ each: true })
  attachments?: ParseWorkOrderAttachmentDto[];
}
‎services/work-orders-service/src/work-orders/dtos/parse-work-order-response.dto.ts‎
+21
Lines changed: 21 additions & 0 deletions
Original file line number	Diff line number	Diff line change
import { ApiProperty } from '@nestjs/swagger';
import { ParseWorkOrderResponseBody } from '@hqo/work-orders-types';
import { IsOptional, IsString, IsUUID } from 'class-validator';
export class ParseWorkOrderResponseDto implements ParseWorkOrderResponseBody {
  @ApiProperty({ format: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  typeUuid?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;
}
‎services/work-orders-service/src/work-orders/work-orders.module.ts‎
+1
-1
Lines changed: 1 addition & 1 deletion
Original file line number	Diff line number	Diff line change
    WorkOrdersSingleService,
    WorkOrdersBuildingConfigsService,
  ],
  exports: [WorkOrdersService, WorkOrdersSearchService],
  exports: [WorkOrdersService, WorkOrdersSingleService, WorkOrdersSearchService],
})
export class WorkOrdersModule {}
‎package-lock.json‎
+10
Lines changed: 10 additions & 0 deletions


Some generated files are not rendered by default. Learn more about customizing how changed files appear on GitHub.
‎package.json‎
+1
Lines changed: 1 addition & 0 deletions


Original file line number	Diff line number	Diff line change
    "@aws-sdk/client-s3": "3.825.0",
    "@aws-sdk/credential-providers": "3.859.0",
    "@aws-sdk/s3-request-presigner": "3.825.0",
    "@google/generative-ai": "0.24.0",
    "@hqo/cache-service": "1.0.17",
    "@hqo/config-service": "0.0.13",
    "@hqo/hqo-service-client-sdk": "1.0.67",
‎tsconfig.json‎
+1
-1
Lines changed: 1 addition & 1 deletion
Original file line number	Diff line number	Diff line change
    "resolveJsonModule": true,
    "target": "es2024",
    "strict": true,
    "lib": ["es2024"],
    "lib": ["es2024", "esnext"],
    "sourceMap": true,
    "skipLibCheck": true,
    "composite": true,
GIF of two octocats high fiving each otherTwo octocats
You made it to the end!

