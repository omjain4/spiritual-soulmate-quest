# Jain Jodi

A modern matrimonial platform for the Jain community, built with React, TypeScript, and Supabase.

## Features

- **Discover** — Swipe-based profile discovery with match scoring
- **Chat** — Real-time messaging with media sharing
- **Video/Audio Calls** — WebRTC-based calling
- **Hinge-style Prompts** — Rich profile prompts to showcase personality
- **Jain Rating** — Spirituality-based compatibility scoring
- **Admin Dashboard** — User management and moderation

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Storage)
- **UI**: Radix UI + shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:8080`.

### Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth)
├── hooks/          # Custom hooks (chat, profiles, etc.)
├── integrations/   # Supabase client & types
├── lib/            # Utilities, validations, prompt options
├── pages/          # Route pages
└── main.tsx        # App entry point
```
