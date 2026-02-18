import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            const pathname = req.nextUrl.pathname;

            // Allow login page and API routes (except auth check if needed, but usually api is protected by logic)
            // Middleware matcher handles exclusion mostly.
            // Here we just say: if token exists, authorized.
            // But we want to redirect to login if not.

            // If user is accessing login page, let them.
            if (pathname.startsWith('/login')) {
                return true;
            }

            // If user is logged in (token exists), authorized.
            return !!token;
        },
    },
});

export const config = {
    // Protect all routes except public ones
    // Matches: /dashboard, /, /analysis...
    // Excludes: /login, /api/auth, /_next, /favicon.ico
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - login
         * - api/auth (auth endpoints)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api (maybe allow API? No, protect API too? dashboard calls API. If Dashboard is protected, API calls from browser will have cookies.)
         */
        '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
};
