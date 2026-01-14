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
  const mockSchema = {
    pre: jest.fn(),
    method: jest.fn(),
  };

  const mockModel = jest.fn(() => ({
    findOne: jest.fn(),
    save: jest.fn().mockResolvedValue(true),
  }));

  return {
    connect: jest.fn(),
    disconnect: jest.fn(),
    model: mockModel,
    models: {},
    Schema: jest.fn(() => mockSchema),
    Types: {
      ObjectId: jest.fn().mockImplementation(() => "mocked-object-id"),
    },
  };
});

// Mock de bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn().mockResolvedValue(true),
}));
