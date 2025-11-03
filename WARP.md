# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start Next.js dev server on http://localhost:3000
npm run build      # Build production bundle
npm start          # Start production server
```

### Code Quality
```bash
npm run lint       # Run Biome linter and checker
npm run format     # Format code with Biome
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **React**: v19.2.0 with React Compiler enabled
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 with custom theme variables
- **Code Quality**: Biome for linting and formatting

### Project Structure
- `app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global styles with Tailwind and CSS variables
- TypeScript path alias `@/*` maps to root directory

### Key Configurations

**React Compiler**: Enabled in `next.config.ts` for automatic memoization

**Biome**:
- 2-space indentation
- Automatic import organization
- Next.js and React recommended rules enabled
- Ignores unknown CSS at-rules (for Tailwind v4)

**TypeScript**:
- Target: ES2017
- Strict mode enabled
- JSX configured as `react-jsx` (uses React 19 JSX transform)

**Styling**:
- Tailwind v4 with `@theme inline` directive
- CSS variables for theming (`--background`, `--foreground`)
- Dark mode support via `prefers-color-scheme`
- Custom font variables: `--font-geist-sans` and `--font-geist-mono`
