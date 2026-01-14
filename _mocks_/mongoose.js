module.exports = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  model: jest.fn(),
  models: {},
  Schema: jest.fn().mockImplementation(() => ({
    pre: jest.fn(),
    method: jest.fn(),
  })),
  Types: {
    ObjectId: jest.fn().mockImplementation(() => "mocked-object-id"),
  },
};
