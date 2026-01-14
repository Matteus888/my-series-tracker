export async function POST(request) {
  const { path, body } = await request.json();

  if (path === "/api/auth/signup") {
    if (body.email && body.password && body.username) {
      return { status: 201, json: () => ({ success: true }) };
    } else {
      return { status: 400, json: () => ({ error: "Missing fields" }) };
    }
  } else if (path === "/api/auth/callback/credentials") {
    if (body.email && body.password) {
      return { status: 302, headers: { location: "/" } };
    } else {
      return { status: 401, json: () => ({ error: "Invalid credentials" }) };
    }
  } else {
    return { status: 404, json: () => ({ error: "Route not found" }) };
  }
}
