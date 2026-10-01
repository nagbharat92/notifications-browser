// Service worker for handling notification actions

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action !== "deny") {
    event.waitUntil(clients.openWindow(self.registration.scope));
  }
});
