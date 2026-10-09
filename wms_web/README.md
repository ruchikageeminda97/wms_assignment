# Gather Workshop Desk

Gather is the Next.js frontend for the workshop registration system. It provides staff sign-in, a workshop catalogue, attendee registration and history, manager workshop tools, admin user management, and audit history.

## Run locally

The NestJS API runs on port `3000`; the web application runs on port `3200`.

1. Start the API from `wms_api` using its setup instructions.
2. Copy `.env.example` to `.env.local` and set `API_BASE_URL` to the API origin followed by `/api`.
3. Install dependencies with `npm install` if needed.
4. Run `npm run dev` and open `http://localhost:3200`.

The API URL is read only by Next.js server routes. Staff access tokens are kept in an HttpOnly session cookie and are never exposed to browser JavaScript or local storage. Backend authorization remains authoritative.

## Project documents

- `architecture.md` describes the full system and frontend routes.
- `API.md` documents the backend API and frontend integration.

The frontend uses Next.js App Router, TypeScript, and Tailwind CSS. It intentionally does not implement public registration, attendee accounts, password resets, waitlists, or token refresh because those are outside the documented API.
