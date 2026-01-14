import { POST } from "@/app/api/test/route";

describe("POST /api/auth/callback/credentials", () => {
  it("should log in a user with correct credentials", async () => {
    const mockRequest = {
      json: () =>
        Promise.resolve({
          path: "/api/auth/callback/credentials",
          body: {
            email: "test@example.com",
            password: "testpassword123",
            redirect: false,
          },
        }),
    };

    const response = await POST(mockRequest);
    expect(response.status).toBe(302);
  });

  it("should return an error if credentials are incorrect", async () => {
    const mockRequest = {
      json: () =>
        Promise.resolve({
          path: "/api/auth/callback/credentials",
          body: {
            email: "test@example.com",
            password: "wrongpassword",
            redirect: false,
          },
        }),
    };

    const response = await POST(mockRequest);
    expect(response.status).toBe(302);
  });
});
