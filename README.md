# SlotStudy Web

Responsive web client for SlotStudy, built with React, TypeScript, Vite, React Router, TanStack Query, Zustand, and Tailwind-free CSS variables.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

By default, the client connects to `http://localhost:3000/api/v1`. Set `VITE_API_URL` in `.env.local` to use another API base URL. Set `VITE_GOOGLE_CLIENT_ID` to enable Google sign-in. The NestJS API must allow the web origin in its CORS configuration.

## Available scripts

- `npm run dev` — start the local Vite server
- `npm run build` — type-check and create a production build in `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — lint the client with Oxlint

## Implemented areas

- Registration, email OTP verification, sign-in, password recovery, academic setup, and persisted auth with access-token refresh
- Responsive app shell with navigation, synchronized light/dark/system themes, global search shortcut, and mobile navigation
- Official SlotStudy logo and student-study photography reused from the client brand assets; scrollbars are visually hidden while scrolling remains enabled
- Dashboard, course library and details, material upload and processing, AI summaries, and Markdown reading
- Grounded study-room setup and chat with SSE streaming/cancellation, source inspection, speech input, and read-aloud
- Quiz generation, practice/test runner, keyboard controls, submission idempotency, result review, and progress analytics
- Notifications, profile editing and avatar upload, settings, subscription information, and help

API requests use the response envelope returned by the NestJS `ResponseInterceptor`. Authentication state is stored in browser local storage through Zustand persistence.
# SlotStudy-Web
