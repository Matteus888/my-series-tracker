import { POST } from "@/app/api/test/route";

describe("POST /api/auth/signup", () => {
  it("should create a new user", async () => {
    const mockRequest = {
      json: () =>
        Promise.resolve({
          path: "/api/auth/signup",
          body: {
            username: "testuser",
            email: "test@example.com",
            password: "testpassword123",
          },
        }),
    };

    const response = await POST(mockRequest);
    expect(response.status).toBe(201);
  });

  it("should return an error if required fields are missing", async () => {
    const mockRequest = {
      json: () =>
        Promise.resolve({
          path: "/api/auth/signup",
          body: {
            username: "testuser",
            email: "test@example.com",
          },
        }),
    };

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
  });
});
