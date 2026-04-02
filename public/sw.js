/* eslint-disable no-restricted-globals */

self.addEventListener("push", function (event) {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "New issue found!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/dashboard",
    },
    actions: [
      {
        action: "view",
        title: "View Issue",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title || "IssuePulse", options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes("/dashboard") && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});
