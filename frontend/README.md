# Recipe Decipher

Recipe Decipher is an AI-native recipe parsing and normalization platform.

The core concept is turning messy, inconsistent recipe content into structured, reusable cooking data.

Input can eventually include:
- copied recipe text
- screenshots
- PDFs
- recipe URLs
- handwritten notes
- cookbook scans

The system parses recipes into a consistent schema that can later power:
- intelligent recipe search
- substitutions
- pantry-aware recommendations
- meal planning
- recipe comparisons
- AI cooking assistance
- structured cooking knowledge graphs

---

# Current MVP

Current functionality includes:
- Next.js App Router frontend
- dynamic recipe pages
- AI-powered recipe parsing
- structured recipe normalization
- local pseudo-database storage
- recipe browsing

Current flow:

```txt
Paste recipe
    ↓
Parse with OpenAI
    ↓
Normalize into structured JSON
    ↓
Save into recipe database
    ↓
Render as structured recipe page
```

---

# Planned Architecture

## Frontend / App
- Next.js
- Tailwind CSS

## Authentication
- Supabase Auth

## Database
- Supabase Postgres

## File Storage
- Supabase Storage

## AI
- OpenAI API

## Hosting
- Vercel

---

# Project Structure

```txt
src/
  app/
    page.tsx
    recipes/
      page.tsx
      [slug]/
        page.tsx
    parse/
      page.tsx
    api/
      parse-recipe/
        route.ts
      save-recipe/
        route.ts

  data/
    recipes.json
```

---

# Important Next.js Conventions

This project uses the Next.js App Router.

Special filenames have framework meaning:

```txt
page.tsx        -> route/page
layout.tsx      -> shared layout
loading.tsx     -> loading UI
error.tsx       -> error boundary
not-found.tsx   -> 404 handling
route.ts        -> API endpoint
```

Dynamic routes use bracket syntax:

```txt
recipes/[slug]
```

Which maps to URLs like:

```txt
/recipes/carbonara
/recipes/burger
```

---

# Development

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# Environment Variables

Create:

```txt
.env.local
```

Example:

```env
OPENAI_API_KEY=your_key_here
```

---

# Vision

Recipes are fundamentally structured data pretending to be blog posts.

Recipe Decipher aims to build a normalized cooking intelligence layer on top of recipe content rather than simply hosting recipe articles.