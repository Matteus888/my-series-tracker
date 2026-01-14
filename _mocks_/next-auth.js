module.exports = {
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getServerSession: jest.fn(),
  NextAuth: jest.fn(() => ({
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getServerSession: jest.fn(),
  })),
};
