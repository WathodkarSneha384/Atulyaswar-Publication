# Atulyaswar Publication

A modern publishing house website built with [Next.js](https://nextjs.org), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com).

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Contact Form Backend (Resend)

The Contact Us page submits to a built-in API route at `POST /api/contact`.

1. Create `.env.local` from `.env.example`.

2. Add your [Resend](https://resend.com) API key in `.env.local`.
3. Set recipient email in `CONTACT_TO_EMAIL`.
4. Run dev server and test `/journal/contact-us`.

For Vercel deployment, add the same env variables in the project settings.

### Manuscript Workflow (Submit + Admin Approval)

- Public submit page: `/journal/submit-manuscript`
- Admin login page: `/admin/login`
- Admin review page: `/admin/manuscripts`
- Public approved list: `/journal/manuscripts`

Required env vars:

- `MANUSCRIPT_TO_EMAIL` (fallbacks to `CONTACT_TO_EMAIL`)
- `MANUSCRIPT_ADMIN_KEY` (required for admin review API)
- `KV_REST_API_URL` and `KV_REST_API_TOKEN` (for persistent Vercel storage)

When a manuscript is submitted:

1. The submission is stored with `pending` status.
2. Admin notification email is sent (with uploaded files attached).
3. Admin approves from `/admin/manuscripts`.
4. Approved record appears on `/journal/manuscripts`.

Admin access flow:

1. Open `/admin/login`.
2. Enter `MANUSCRIPT_ADMIN_KEY`.
3. Session cookie is created.
4. Approve manuscripts from `/admin/manuscripts`.

Storage behavior:

- With KV env vars: submissions persist on Vercel.
- Without KV env vars: local file fallback is used (`data/manuscripts.json`).

### Issue + Archive Workflow

- Current Issue page (`/journal/current-issue`) now reads dynamic issue entries.
- Archive page (`/journal/archive`) shows previous issues with index tables.
- Admin issue manager is available inside `/admin/manuscripts`.

Rules implemented:

1. Create a new issue as `current`.
2. Previous `current` issue automatically moves to `archive`.
3. Add issue entries in format: Sr. No., Title, Author, Page No., Read.

User submission flow for issue entries:

1. User submits entry from `/journal/current-issue`.
2. Admin gets email notification.
3. Submission appears in Admin Issue panel as pending.
4. Admin approves and entry is published in Current Issue table.

### Production Build

```bash
npm run build
npm start
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Fonts:** Playfair Display & Lora (Google Fonts)

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles & CSS variables
│   ├── layout.tsx       # Root layout with fonts & metadata
│   └── page.tsx         # Home page
└── components/
    ├── Header.tsx       # Navigation header
    ├── Hero.tsx         # Hero/landing section
    ├── About.tsx        # About the publication
    ├── FeaturedBooks.tsx # Book showcase
    ├── Services.tsx     # Publishing services
    ├── Testimonials.tsx # Author testimonials
    ├── Contact.tsx      # Contact form
    └── Footer.tsx       # Site footer
```
