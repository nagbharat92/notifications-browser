// Service worker for handling notification actions

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = event.action;
  if (action === "allow") {
    clients.openWindow("/");
  } else if (action === "deny") {
    // Just close the notification
  } else {
    // Default click — open the app
    clients.openWindow("/");
  }
});
