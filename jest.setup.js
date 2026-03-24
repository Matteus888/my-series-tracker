import "@testing-library/jest-dom";

// Mock de NextResponse
jest.mock("next/server", () => {
  const mockNextResponse = {
    json: jest.fn((body, options) => ({
      status: options?.status || 200,
      json: () => ({ body, status: options?.status || 200 }),
    })),
    redirect: jest.fn((url) => ({
      status: 302,
      headers: { location: url },
    })),
  };
  return { NextResponse: mockNextResponse };
});

// Mock de Request
global.Request = class {
  constructor(input, init) {
    this.input = input;
    this.init = init;
  }

  json() {
    return Promise.resolve(this.init?.body || {});
  }
};

// Mock de mongoose
jest.mock("mongoose", () => {
  const mockObjectId = {
    toString: jest.fn(() => "mocked-object-id"),
  };

  return {
    connect: jest.fn(),
    disconnect: jest.fn(),
    model: jest.fn(),
    models: {},
    Schema: jest.fn(() => ({})),
    Types: {
      ObjectId: jest.fn(() => mockObjectId),
    },
  };
});

// Mock de bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock de dbConnect
jest.mock("@/lib/db/db.connect", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    connection: {
      readyState: 1,
      db: {
        databaseName: "test_db",
      },
    },
  }),
}));
