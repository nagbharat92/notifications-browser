# Ping Lab

https://nagbharat92.github.io/ping-lab/

A hands-on playground for browser notifications.

Explore what the browser actually gives you before designing a notification experience. Ping Lab was built to try native notifications firsthand, with a focus on macOS and Chromium.

## What you can try

- Request notification permission and see its current status.
- Send four notification types: title only, title with body text, title with body and icon, and title with body and action buttons.
- Explore light, dark and system themes, cursor-tracking 3-D cards and staggered animations.

Notifications require your permission. Action buttons use a service worker and depend on browser and operating-system support; Chromium-based browsers are the intended testing target.

## Run locally

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite, using the `/ping-lab/` path.

```bash
npm run build
npm run preview
```

## Built with

React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui and the Web Notifications API.

## Deployment

GitHub Actions builds and deploys the site to GitHub Pages on pushes to `main`. Vite's base path is `/ping-lab/`; preview images and service-worker registration use that base, and notification clicks open the app at the service worker's scope.

Repository: https://github.com/nagbharat92/ping-lab

See [PROJECT.md](PROJECT.md) for the project structure and implementation details.
