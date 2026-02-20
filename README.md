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
