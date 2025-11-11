# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Fuwari**, a modern personal blog theme built with Astro 4.0+, focused on technical sharing and practice. It's a Chinese-language blog with extensive customization options, featuring dark/light theme support, responsive design, and a rich plugin ecosystem.

## Essential Commands

### Development
```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
```

### Content Management
```bash
pnpm new-post <filename>    # Create new blog post with frontmatter template
pnpm clean                  # Remove unused images from src/content/assets
```

### Code Quality
```bash
pnpm format           # Format code with Biome
pnpm lint             # Lint and fix code with Biome
pnpm type-check       # TypeScript type checking with isolated declarations
```

## Architecture Overview

### Content Collections
The project uses Astro's content collections with three main types:
- **posts**: Main blog posts (`src/content/posts/`) with full metadata (title, published date, tags, description, image, draft status, pinned status)
- **spec**: Special pages with minimal frontmatter
- **assets**: Data collection for images and media files

### Key Configuration Files
- **`src/config.ts`**: Central configuration hub containing:
  - `siteConfig`: Site metadata, theme colors, banner, background, TOC settings, favicon
  - `navBarConfig`: Navigation links
  - `profileConfig`: Author profile and social links
  - `licenseConfig`: Content license settings
  - `imageFallbackConfig`: R2/CDN fallback domains for images
  - `umamiConfig`: Analytics configuration
  - `expressiveCodeConfig`: Code syntax highlighting theme
  - `gitHubEditConfig`: GitHub edit button configuration

- **`astro.config.mjs`**: Astro build configuration with extensive markdown processing pipeline

### Markdown Processing Pipeline

The project implements a sophisticated markdown processing chain:

**Remark Plugins (pre-processing):**
1. `remarkMath` - LaTeX math support
2. `remarkReadingTime` - Calculate reading time
3. `remarkExcerpt` - Extract post excerpts
4. `remarkGithubAdmonitionsToDirectives` - Convert GitHub-style admonitions
5. `remarkDirective` - Custom directive syntax
6. `remarkSectionize` - Wrap sections in divs
7. `parseDirectiveNode` - Custom directive parser

**Rehype Plugins (post-processing):**
1. `rehypeKatex` - Render math equations
2. `rehypeSlug` - Add IDs to headings
3. `rehypeImageFallback` - Handle image CDN fallback
4. `rehypeComponents` - Custom components (GitHub cards, admonitions: note, tip, important, caution, warning)
5. `rehypeExternalLinks` - Open external links in new tabs
6. `rehypeAutolinkHeadings` - Add anchor links to headings

### Custom Plugins Architecture

Located in `src/plugins/`:
- **Remark plugins** (`.js`/`.mjs`): Transform markdown AST before HTML conversion
- **Rehype plugins** (`.mjs`): Transform HTML AST after markdown processing
- **Expressive Code plugins** (`expressive-code/`): Enhance code block functionality
  - `custom-copy-button.ts`: Custom copy-to-clipboard implementation
  - `language-badge.ts`: Display language labels on code blocks

### Layout System

Two main layouts with composable structure:
- **`Layout.astro`**: Base layout handling meta tags, theme variables, banner configuration, global styles
- **`MainGridLayout.astro`**: Grid-based layout with sidebar, TOC (table of contents), and content area

### Component Organization

```
src/components/
├── control/         # Interactive controls (Pagination, BackToTop, ButtonLink, ButtonTag)
├── misc/           # Utility components (ImageWrapper, License, Markdown renderer)
└── widget/         # Sidebar widgets (Profile, Tags, TOC, NavMenuPanel, SideBar)
```

### Utility Modules

Critical utilities in `src/utils/`:
- **`content-utils.ts`**: Post fetching, sorting, filtering (drafts, pagination)
- **`url-utils.ts`**: URL generation and path manipulation
- **`date-utils.ts`**: Date formatting for Chinese locale
- **`setting-utils.ts`**: Theme and display settings management

### Page Generation

Dynamic routes using Astro's file-based routing:
- `src/pages/posts/[...slug].astro` - Individual post pages (static generation via `getStaticPaths`)
- `src/pages/[...page].astro` - Paginated post listing
- `src/pages/archive/` - Archive views with tag filtering

## Important Development Notes

### Post Frontmatter Structure
All posts require this frontmatter format:
```yaml
---
title: Post Title
published: YYYY-MM-DDTHH:MM:SS
description: Post description
image: ./relative/path/to/image.jpg
tags: [tag1, tag2]
draft: false
lang: ''           # Optional: language override
pinned: false      # Optional: pin to top
updated: YYYY-MM-DDTHH:MM:SS  # Optional: last update date
---
```

### Image Management
- Post images should be stored in `src/content/assets/images/`
- Use relative paths in markdown: `![alt](../assets/images/image.jpg)`
- The `pnpm clean` script automatically removes unreferenced images
- Image fallback system automatically switches between primary and fallback CDN domains

### Theme Customization
Theme hue is controlled globally via `siteConfig.themeColor.hue` (0-360):
- Red: 0
- Teal: 200
- Cyan: 250
- Pink: 345
- Current: 361 (wraps to red)

### Code Block Features
Powered by Expressive Code with:
- Collapsible sections
- Line numbers (except shellsession)
- Custom copy button
- Syntax highlighting via `github-dark` theme
- Custom CSS variables for theming: `--codeblock-bg`, `--codeblock-topbar-bg`, `--primary`

### Astro Patching
The project includes a custom patch for Astro (see `patches/astro.patch`) applied via pnpm's `patchedDependencies`. This patch must be maintained when upgrading Astro.

### Styling Approach
- **Tailwind CSS**: Utility-first styling with custom configuration
- **Stylus**: Used for complex style logic (see `src/styles/variables.styl`)
- **CSS Variables**: Theme colors injected dynamically based on `siteConfig.themeColor.hue`

### Analytics Integration
Umami analytics with custom stats display:
- Config: `umamiConfig` in `src/config.ts`
- Stats text: Configured via `statsConfig` (Chinese labels: "浏览", "访客")

### Build Configuration
- **Output**: Static site generation (SSG)
- **Site URL**: `https://blog.2b2x.cn`
- **Base path**: `/`
- **Trailing slash**: Always enforced
- **Image service**: Passthrough (no optimization)
- **Redirects**: `/donate` → `/sponsors`

## TypeScript Configuration

Use `--isolatedDeclarations` flag for type checking to ensure proper type exports. This is stricter than standard TypeScript checking.

## Testing Workflow

No formal test suite exists. Manual testing workflow:
1. Run `pnpm dev` to start dev server
2. Create a test post with `pnpm new-post test-post`
3. Verify post appears on homepage
4. Check post rendering at `/posts/test-post/`
5. Run `pnpm build` to ensure production build succeeds
6. Use `pnpm preview` to test production build locally

## Deployment

The project is configured for static deployment with Vercel adapter (`@astrojs/vercel`). Build output goes to `dist/` directory. EdgeOne configuration exists in `edgeone.json`.
