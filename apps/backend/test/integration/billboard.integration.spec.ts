import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createBillboardMock } from './helpers/mock-factories';
import {
  mockBillboardMessage,
  validMarkBillboardReadPayload,
} from './fixtures/fixtures';

describe('Billboard (integration)', () => {
  let app: INestApplication;
  let billboardMock: ReturnType<typeof createBillboardMock>;

  beforeAll(async () => {
    billboardMock = createBillboardMock();
    app = await createTestApp({ billboard: billboardMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /billboard/unread', () => {
    it('returns 200 + unread messages', async () => {
      billboardMock.getUnreadMessages.mockResolvedValue([
        mockBillboardMessage(),
      ]);

      const response = await request(app.getHttpServer())
        .get('/billboard/unread')
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            body: expect.any(String),
            tag: expect.any(String),
            createdAt: expect.any(String),
          }),
        ]),
      );
      expect(billboardMock.getUnreadMessages).toHaveBeenCalledWith(
        expect.any(String),
      );
    });

    it('returns 200 + empty array when no unread messages', async () => {
      billboardMock.getUnreadMessages.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/billboard/unread')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('POST /billboard/read', () => {
    it('returns 201 + markedCount on valid payload', async () => {
      billboardMock.markAsRead.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .post('/billboard/read')
        .send(validMarkBillboardReadPayload())
        .expect(201);

      expect(response.body).toHaveProperty('markedCount', 1);
      expect(billboardMock.markAsRead).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['clbillbmsg000000000000000']),
      );
    });

    it('returns 201 when marking all as read (empty messageIds)', async () => {
      billboardMock.markAsRead.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .post('/billboard/read')
        .send({})
        .expect(201);

      expect(response.body).toHaveProperty('markedCount', 1);
      expect(billboardMock.markAsRead).toHaveBeenCalledWith(
        expect.any(String),
        undefined,
      );
    });

    it('returns 400 on invalid messageIds type', async () => {
      await request(app.getHttpServer())
        .post('/billboard/read')
        .send({ messageIds: 'not-an-array' })
        .expect(400);
    });
  });
});
