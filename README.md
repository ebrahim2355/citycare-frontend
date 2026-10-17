# CityCare Frontend

**City Complaint & Service Request Platform**

CityCare helps the people of a city report problems on public property (potholes, dark street lights, water leaks, missed garbage pickups) and request paid home services (bulk waste pickup, septic tank cleaning, water tanker delivery). Every report gets a tracking code, a deadline and a named staff member. Citizens follow each step, staff members work through their jobs, and city admins assign work, manage the catalog and watch the numbers.

This is the Next.js frontend. It runs on top of the [CityCare backend](https://github.com/ebrahim2355/citycare-backend).

## Links

| Item | Link |
| --- | --- |
| Live site | https://citycare-frontend-azure.vercel.app |
| Live API | https://citycare-backend.vercel.app |
| API docs (Swagger) | https://citycare-backend.vercel.app/api/v1/docs |
| Backend repository | https://github.com/ebrahim2355/citycare-backend |

## Demo Login

The login page has one-click demo buttons for all three roles. You can also type the accounts:

| Role | Email | Password |
| --- | --- | --- |
| City admin | admin@citycare.com | Admin12345 |
| Field staff (Roads & Transport) | roads.staff@citycare.com | Staff12345 |
| Citizen | citizen@citycare.com | Citizen12345 |

Stripe runs in test mode. Pay with the card `4242 4242 4242 4242`, any future date and any CVC.

## Roles

| Role | What they can do |
| --- | --- |
| **Citizen** | Report a problem in a five step wizard with photos and location, pay for home services with Stripe, follow the timeline, edit or cancel before assignment, rate the work, reopen within 7 days, see payment history |
| **Field staff** | See jobs sorted by deadline, start work, resolve with a note and proof photos, see performance charts, pause new jobs while on leave |
| **City admin** | Analytics dashboard, assign by workload or by hand, move reports between departments, reject with an automatic refund, manage users, departments, categories and fees, answer contact messages, read the audit log |

## Pages

| Area | Pages |
| --- | --- |
| Public | Home with live city numbers, About, Services and fees, Track a report, FAQ, Contact |
| Auth | Login with one-click demo login and Google, Register, Forgot password, Reset password |
| Citizen | Overview, My reports, New report wizard, Report details, Payments, Profile |
| Staff | Overview, My tasks, Task details, Performance, Profile and availability |
| Admin | Overview, Complaints, Complaint details, Messages, Users, Staff workload, Departments, Categories and fees, Payments, Audit log, Settings |
| Payment | Payment success, Payment cancelled |
| Shared | Custom 404, error boundaries for every area, a global error page |

## Tech Stack

| Part | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, Partial Prefetching), React 19, TypeScript (strict) |
| UI | Tailwind CSS 4, shadcn/ui on Radix, Lucide icons, next-themes for light and dark mode |
| Data | TanStack Query 5 with server prefetching and hydration |
| Client state | Zustand (sidebar and the saved report draft), React Query cache for the session |
| Forms | React Hook Form with Zod, the same rules as the API |
| Charts | Recharts through the shadcn chart component |
| Feedback | Sonner toasts, skeleton loaders, empty and error states |
| Auth | JWT access token and refresh token in HTTP-only cookies, verified with jose in the proxy |
| Payments | Stripe Checkout (test mode) |
| Images | next/image with a Cloudinary loader |

## How It Works

### Auth and route protection

```
Browser ──cookies──▶ Next.js proxy ──▶ Server Components ──▶ CityCare API
                         │                     ▲
                         └── /api/backend/* ───┘   (route handler that adds the token)
```

- Login, register, Google sign in and password changes go through route handlers in `src/app/api/auth`. The tokens never reach browser JavaScript. They are stored in HTTP-only, SameSite cookies.
- `src/proxy.ts` verifies the access token with `jose` on every request, refreshes it with the refresh token when it is about to expire, and keeps each role inside its own area: `/dashboard` for citizens, `/staff` for staff and `/admin` for admins. A visitor without a session is sent to `/login` and comes back to the same page after signing in.
- Client components call `/api/backend/*`. This route handler adds the token from the cookie and forwards the request to the API. It also sends the real client IP with a shared key, so the API rate limits each visitor and not the frontend server.
- The UI changes with the role: the sidebar, the dashboard and every action button (assign, reject, start work, pay, rate) are shown only to the role that can use them. The API checks the role again on every request.

### Server and Client Components

- Pages are Server Components. Public pages read the catalog and the city numbers with `"use cache"`, so they are prerendered and served from the edge. When an admin changes a department or a category, the cache tag is revalidated and the services page updates within seconds.
- Dashboard pages prefetch their data on the server with the user's cookie and pass it to TanStack Query with `HydrationBoundary`. The first paint already has the data, and later filter changes are fetched in the browser.
- Client Components are used only for interactive parts: tables with filters, forms, dialogs, charts and the sidebar.
- Every data page has a `loading.tsx` skeleton, every area has an `error.tsx` boundary, and there is a custom `not-found.tsx`.

### Data, caching and URL state

- Filters, search, sorting and pagination live in the URL (`?status=SUBMITTED&page=2`) through `useSearchParams` and a small `useUrlFilters` hook. A filtered view can be bookmarked or shared, and the back button works.
- TanStack Query caches every list and detail view, keeps the previous page while the next one loads and refetches after every change.
- Optimistic updates: starting a job, changing a priority, blocking a user, turning a category on or off, staff availability and closing a message change the UI at once and roll back if the API refuses.

### Forms

- All forms use React Hook Form and Zod. The rules (lengths, phone format, password strength, fees, SLA hours) match the backend validation, and field errors from the API are shown on the right input.
- The report wizard has five steps (what, details, where, photos, review). The draft is kept in a Zustand store backed by sessionStorage, so a reload does not lose the answers.
- Photos are checked for type and size before upload, shown as previews and uploaded with a progress bar.

### Payments

A paid service request is created, then the frontend asks the API for a Stripe Checkout session and redirects to Stripe. Stripe sends the citizen back to `/payment/success` or `/payment/cancel`. The success page confirms the payment with the API, and the cancel page closes the checkout and offers a new try. If an admin rejects a paid request, the API refunds it automatically.

### Performance and SEO

- Charts are loaded with `next/dynamic`, so their code is only downloaded on the pages that use them.
- Fonts come from `next/font`, images use `next/image`, and photos are resized by Cloudinary for each screen size.
- Every public page has its own title, description and canonical link. The site has a generated Open Graph image, a sitemap, robots rules and a web manifest.

## Project Structure

```
src
├── app
│   ├── (public)          home, about, services, track, faq, contact
│   ├── (auth)            login, register, forgot and reset password
│   ├── (app)             dashboard shell
│   │   ├── dashboard     citizen pages
│   │   ├── staff         staff pages
│   │   └── admin         admin pages
│   ├── payment           Stripe success and cancel
│   └── api               auth route handlers and the backend proxy route
├── components            ui (shadcn), shared, forms, charts, complaints, dashboard, layout
├── hooks                 session, url filters, debounce, mutations, uploads, checkout
├── lib                   api client, server fetcher, query options, validations, filters
├── stores                Zustand stores
├── types                 API response types
└── proxy.ts              route protection and token refresh
```

## Run It Locally

You need Node.js 22 or newer and the [CityCare backend](https://github.com/ebrahim2355/citycare-backend) running.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

| Variable | Description |
| --- | --- |
| `API_URL` | Base URL of the CityCare API, for example `http://localhost:5000/api/v1` |
| `JWT_ACCESS_SECRET` | The same secret as the API. The proxy uses it to verify the access token |
| `INTERNAL_API_KEY` | The same key as the API. Lets the API rate limit by the real client IP |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this site, used for links, metadata and the payment return pages |

The API must list the frontend URL in its `CLIENT_URL` or `CORS_ORIGINS`, so payment and Google sign in can return to it.

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the development server |
| `npm run build` | Builds for production |
| `npm run start` | Runs the production build |
| `npm run lint` | Runs ESLint |

## Deployment

The site is deployed on Vercel. Set the four variables above in the Vercel project, then deploy:

```bash
vercel --prod
```
