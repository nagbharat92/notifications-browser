import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DynamicShadowCard } from "@/components/DynamicShadowCard";

const titles = [
  "Hello!",
  "Hi there!",
  "Hey!",
  "What's up!",
  "Howdy!",
];

function randomTitle() {
  return titles[Math.floor(Math.random() * titles.length)];
}

export function TitleBodyActionsNotificationCard() {
  const [sent, setSent] = useState(false);
  const { resolvedTheme } = useTheme();

  const handleSendNotification = async () => {
    if (Notification.permission !== "granted") return;

    try {
      // Action buttons require ServiceWorkerRegistration.showNotification()
      const registration = await navigator.serviceWorker.getRegistration();

      if (!registration) {
        console.error("No service worker registration found");
        return;
      }

      await registration.showNotification(randomTitle(), {
        body: "You have a new notification.",
        actions: [
          { action: "allow", title: "Allow" },
          { action: "deny", title: "Deny" },
        ],
      } as NotificationOptions);
    } catch (err) {
      console.error("Failed to show notification:", err);
    }

    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  const isGranted = "Notification" in window && Notification.permission === "granted";

  return (
    <DynamicShadowCard className="w-full">
      <CardHeader className="grid-rows-[auto] gap-0 text-center">
        <CardTitle>Title + Body + Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={`${import.meta.env.BASE_URL}creatives/actions-${resolvedTheme === "dark" ? "dark" : "light"}.png`}
          alt="Title + body + actions notification preview"
          className="w-full rounded-lg object-cover"
        />
      </CardContent>
      <CardFooter>
        <Button
          variant="default"
          className="w-full"
          disabled={!isGranted}
          onClick={handleSendNotification}
        >
          {sent ? "✓ Sent" : isGranted ? "Send Notification" : "Permission Required"}
        </Button>
      </CardFooter>
    </DynamicShadowCard>
  );
}
