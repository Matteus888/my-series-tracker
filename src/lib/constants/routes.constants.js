export const PROTECTED_ROUTES = [
  "/watching",
  "/dashboard",
  "/favorites",
  "/settings",
  "/lists",
  "/history",
  "/calendar",
  "/admin",
];

export const PUBLIC_ROUTES = ["/verify-email", "/series"];

export const ADMIN_ROUTES = ["/admin"];

export const AUTH_ROUTES = ["/login", "/signup"];

export const isProtectedRoute = (pathname) => PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

export const isPublicRoute = (pathname) => PUBLIC_ROUTES.includes(pathname);

export const isAdminRoute = (pathname) => ADMIN_ROUTES.some((route) => pathname.startsWith(route));
