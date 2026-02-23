# Notifications Browser

An interactive single-page web app for exploring the **Browser Notifications API**. It lets users request notification permissions and send different types of native browser notifications — all wrapped in a polished, theme-aware UI with 3-D card hover effects.

## Purpose

The app serves as both a learning tool and a visual playground for the [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API). It demonstrates four progressively richer notification types and handles the full permission lifecycle (unset → requested → granted/denied → unsubscribed).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 + custom CSS variables (OKLCH color space) |
| UI components | shadcn/ui (Radix UI primitives) |
| Icons | Lucide React |
| Animations | tw-animate-css + custom keyframe animations |

## Project Structure

```
├── public/
│   └── sw.js                        # Service worker for notification action handling
├── src/
│   ├── main.tsx                     # Entry point; registers the service worker
│   ├── App.tsx                      # Root component (ThemeProvider + TooltipProvider)
│   ├── pages/
│   │   └── HomePage.tsx             # Main page: permission management + notification cards
│   ├── components/
│   │   ├── DynamicShadowCard.tsx    # 3-D perspective card with cursor-tracking tilt
│   │   ├── ThemeToggle.tsx          # Light/dark theme toggle button
│   │   ├── TitleOnlyNotificationCard.tsx
│   │   ├── TitleDescriptionNotificationCard.tsx
│   │   ├── TitleBodyImageNotificationCard.tsx
│   │   ├── TitleBodyActionsNotificationCard.tsx
│   │   └── ui/                      # shadcn/ui primitives (button, card, badge, etc.)
│   ├── context/
│   │   └── ThemeContext.tsx          # Theme provider with system/light/dark + localStorage
│   ├── hooks/
│   │   └── useDynamicShadow.ts      # Zero-re-render mouse-tracking hook for 3-D cards
│   └── styles/
│       └── globals.css              # Design tokens, animations, and tiered hover effects
```

## Features

### Permission Management
- Detects the current browser notification permission state (`default`, `granted`, `denied`).
- Tracks a soft subscription state via `localStorage` with five states: **unset**, **requested**, **subscribed**, **unsubscribed**, **denied**.
- Listens for permission changes via the Permissions API so the UI stays in sync if the user changes settings externally.
- Shows a badge indicating current permission status with contextual styling.

### Notification Types

Once permission is granted, the app reveals four notification cards, each demonstrating a different level of the Notifications API:

| Card | API Used | What it Shows |
|------|----------|---------------|
| **Title Only** | `new Notification(title)` | Minimal notification with just a title |
| **Title + Description** | `new Notification(title, { body })` | Adds a body/description |
| **Title + Body + Icon** | `new Notification(title, { body, icon })` | Adds a custom icon image |
| **Title + Body + Actions** | `ServiceWorkerRegistration.showNotification()` | Adds interactive action buttons (Reply/Dismiss) via the service worker |

### Service Worker

A minimal service worker (`public/sw.js`) is registered at startup. It handles:
- `notificationclick` events — routes action button clicks (`reply` opens the app, `dismiss` closes the notification).
- Immediate activation via `skipWaiting()` and `clients.claim()`.

### 3-D Card Effect (`DynamicShadowCard`)

Every card uses a custom cursor-tracking 3-D tilt effect:
- **Three-layer DOM structure**: perspective container → rotating wrapper → card surface.
- **Ref-based DOM mutations** — all transforms, shadows, and shine gradients update via refs, causing zero React re-renders during mouse movement.
- **Smooth intensity ramping** — a cubic ease-out curve ramps intensity 0→1 on hover entry (~300ms) and 1→0 on leave (~400ms).
- **Tiered parallax on hover** — inner card elements lift at different heights (content < header < footer) for a layered 3-D feel.
- **Dynamic shadow** shifts position opposite to tilt direction with adjustable blur and opacity.
- **Shine overlay** simulates specular light reflection based on cursor position.
- **Border gradient** becomes more prominent as tilt intensity increases.

### Theming

- Supports **system**, **light**, and **dark** themes.
- Theme preference is persisted in `localStorage`.
- Listens for OS-level `prefers-color-scheme` changes when set to system.
- All colors use the **OKLCH** color space for perceptually uniform theming.
- Custom semantic CSS variables (`--surface`, `--card-surface`, `--heading-accent`, etc.) adapt to the active theme.

### Animations

- **Staggered fade-in-up**: Cards animate in sequentially with increasing delays (0ms → 1500ms) using a smooth `cubic-bezier(0.16, 1, 0.3, 1)` easing.
- **Section collapse/expand**: The permission card's action area uses a CSS grid row animation for smooth height transitions.

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Browser Compatibility

The Notifications API is supported in all modern browsers. Action buttons on notifications (`actions` property) require a service worker and are currently supported in Chromium-based browsers (Chrome, Edge, etc.) but not in Safari or Firefox.
